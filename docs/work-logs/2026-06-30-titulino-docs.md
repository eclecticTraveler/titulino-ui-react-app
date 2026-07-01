# 2026-06-30 — titulino-docs site · deployment pipeline complete

## Domain: Infrastructure — titulino-docs

### Summary

`docs.titulino.com` is live. The login form shows, GCP deployment pipeline works end-to-end. Auth gate uses Supabase + `.NET API isGlobalAccessUser` matching the main app pattern. Google OAuth is partially working — blocked by one wrong secret value (see pending items).

TitulinoWorkerService GitHub Actions deploy pipeline was also fixed in this session.

---

### What was done

#### titulino-docs auth gate (Root.js)

Rewrote auth gate to match main app auth pattern exactly:
- Step 1: Supabase login (Google OAuth primary, email/password secondary)
- Step 2: Year of birth → POST `/.NET API /v1/enrollment/login` → check `isGlobalAccessUser === true`
- localStorage caching of verified status per `userId`
- `netApiUrl` added to `EnvironmentConfig.js` and `docusaurus.config.js` customFields

CORS for `docs.titulino.com` and `dev.docs.titulino.com` added to `titulino-net-api/Program.cs` and deployed.

#### CI/CD pipeline

Workflow (`deploy-docs.yml`) uses `_DEV`/`_PROD` secret split:
- PR → `dev.docs.titulino.com` bucket, DEV Supabase + API keys
- Push to main → `docs.titulino.com` bucket, PROD Supabase + API keys
- Secrets set via `$GITHUB_ENV` (not step outputs) to avoid logging
- Fixed missing `setup-gcloud@v2` step (was causing 401 anonymous error on GCS deploy)

#### GCP infrastructure

- `dev.docs.titulino.com` GCS bucket created via Terraform
- SSL cert `titulino-all-domains-v2` covering all 4 domains — active 2026-06-30
- Old cert `titulino-all-pd-domains` removed from proxy and deleted
- Namecheap DNS A record `dev.docs` → `34.8.75.161` added

#### TitulinoWorkerService deploy pipeline ✅

Fixed three issues end-to-end:
1. **Wrong SSH key secret** — `PD_SERVER_SSH_KEY` had GCP SA JSON pasted instead of SSH private key. Correct key is `C:\Users\AlbertoArellano\Documents\CIP KEYS\lang-private-key.pem` (RSA PEM, same key as `backend-server_lang-private-key.ppk` in MobaXterm keys). Same secret names and server used by `titulino-net-api`.
2. **Permission denied on scp copy** — `sudo mkdir -p` in "Clean Target Directory" step created the target dir owned by root; scp then failed writing as `admin`. Fixed by adding `sudo chown -R $USER:$USER` after mkdir.
3. **systemd service not found** — `titulino-worker-dev` and `titulino-worker` services did not exist on the server. Created manually via SSH. Files land in `publish/` subdir inside target dir (scp-action behavior); service `ExecStart` points to `net9.0/publish/TitulinoWorkerService`.

Both services created on server at `34.83.204.4`:
- `/etc/systemd/system/titulino-worker-dev.service` — enabled, running ✅
- `/etc/systemd/system/titulino-worker.service` — enabled, starts on prod deploy

Full pipeline confirmed working: build → publish → SSH → copy → restart → running.

---

### Site confirmed working ✅

- `docs.titulino.com` live — user logged in and reached the hub successfully 2026-07-01
- Auth gate: Supabase login → year of birth → `.NET API isGlobalAccessUser` → access granted
- TitulinoWorkerService deploy pipeline working end-to-end

---

### Next session

- **P6** — GitHub sync actions: 5 source repos push `docs/**/*.md` → `titulino-docs` on merge to main
- **P7** — Docusaurus local search plugin + HTML sprint artifacts in `static/`

Plan file: `docs/plans/active/titulino-docs-site.md`
