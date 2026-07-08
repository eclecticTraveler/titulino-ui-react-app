# Server Infrastructure

Reference for debugging and operating the titulino production server.

---

## Server

Host: `pd-titulino-lang`  
SSH: `admin@<host>`

---

## Systemd services (.NET API + Worker)

| Unit | Environment | Description |
|---|---|---|
| `titulino-api.service` | Production | .NET REST API |
| `titulino-api-dev.service` | Development | .NET REST API |
| `titulino-worker.service` | Production | Background worker |
| `titulino-worker-dev.service` | Development | Background worker |

**Binary locations:**
- API prod: `/var/www/html/api/net9.0/publish/TitulinoNet.Api.dll`
- API dev: check with `sudo systemctl status titulino-api-dev -l`

```bash
# Status
sudo systemctl status titulino-api.service -l
sudo systemctl status titulino-api-dev.service -l

# Follow live (open while reproducing in browser)
sudo journalctl -u titulino-api -f
sudo journalctl -u titulino-api-dev -f

# Last 200 lines
sudo journalctl -u titulino-api -n 200 --no-pager
sudo journalctl -u titulino-api-dev -n 200 --no-pager

# Errors only, last hour
sudo journalctl -u titulino-api -p err --since "1 hour ago" --no-pager

# Filter by topic
sudo journalctl -u titulino-api --since today --no-pager | grep -i "enroll"
sudo journalctl -u titulino-api --since "1 hour ago" --no-pager | grep -v ".git"

# Worker
sudo journalctl -u titulino-worker -f
sudo journalctl -u titulino-worker-dev -f
```

---

## TitulinoMissive cron jobs

Binary: `/home/admin/TitulinoMissiveApp/net9.0/publish/TitulinoMissive.dll`  
Source: `titulino-communication` repo → `TitulinoMissive/Program.cs` (subcommands registered there)  
Edit schedule: `crontab -e` on the server as admin

| Schedule (UTC) | Subcommand | Log file |
|---|---|---|
| Daily 08:00 | `birthdays` | cron mail (no redirect) |
| Every 15 min | `welcome` | cron mail (no redirect) |
| Daily 02:00 | `weeklycourses` | `/home/admin/logs/weekly.log` |
| Daily 08:00 | `facebook` | `/home/admin/logs/fbpost.log` |
| Every 30 min | `thankyoupurchasegold` | `/home/admin/logs/goldpurchase.log` |
| Every 30 min | `thankyoupurchasesilver` | `/home/admin/logs/silverpurchase.log` |
| Every 60 min | `audiencemessages` | `/var/log/audience-messages.log` |
| Daily 09:00 | `churchmemberbirthdays` | `/var/log/churchmemberbirthdays.log` |

> `*/60` in the crontab is equivalent to `0 * * * *` — runs at minute 0 of every hour.

### Check last run times

```bash
# See all START/END timestamps for audiencemessages
grep -E "START|END" /var/log/audience-messages.log | tail -30

# Follow live as it runs
tail -f /var/log/audience-messages.log

# Last 50 lines of any log
tail -50 /var/log/audience-messages.log
tail -50 /home/admin/logs/goldpurchase.log
tail -50 /home/admin/logs/silverpurchase.log
```

### Force-run a job manually (for debugging)

```bash
ASPNETCORE_ENVIRONMENT=Production /usr/bin/dotnet /home/admin/TitulinoMissiveApp/net9.0/publish/TitulinoMissive.dll audiencemessages
```

Replace `audiencemessages` with any subcommand.

### Change interval temporarily for debugging

```bash
crontab -e
# Change */60 to */15 for audiencemessages line, save, exit
# Change back when done: */60
```

---

## Serilog rolling log files (if present)

```bash
ls /var/www/html/api/net9.0/publish/logs/
tail -f /var/www/html/api/net9.0/publish/logs/$(ls -t /var/www/html/api/net9.0/publish/logs/ | head -1)
```

---

## Live debugging workflow

1. SSH into server
2. `tail -f /var/log/audience-messages.log` or `sudo journalctl -u titulino-api -f`
3. Reproduce in browser or force-run the job
4. Watch for stack traces in real time
