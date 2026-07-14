# Plan: Floating Action Menu

**Status:** CODE COMPLETE — pending user: sqitch deploy, GCS upload, crontab (T11)  
**Branch:** TBD  
**Flag:** `IS_FLOATING_ACTIONS_ON` in `src/configs/EnvironmentConfig.js`

---

## Goal

A fixed-position vertical stack of circular icon buttons on the bottom-right of the screen, sitting above the Buy Me a Coffee widget. Configured entirely from a spine JSON file — no deployment required to add, remove, or reorder buttons. Master on/off flag in `EnvironmentConfig.js`.

Initial buttons: Facebook (resolves correct page from user's native + target language) and Contact Form (in-app form → queued in DB → Missive sends email). Extensible with `type: "link"` slots for future icons.

---

## Repos touched

| Repo | Work |
|---|---|
| `titulino-ui-react-app-1` | UI components, LOB functions, Redux action, LESS |
| `titulino-net-api` | Spine fetch endpoint, contact form insert endpoint |
| `titulino-warehouse` | Sqitch migration — `ContactMessages` table + functions |
| `titulino-communication` | New `contactmessages` Missive subcommand |
| GCP bucket | New `floating-actions.json` spine file |

---

## Spine JSON contract

File: `titulino-spine-data/floating-actions.json`  
Fetch: HTTP GET from public GCS bucket URI — same pattern as `welcome-messages.json`, no GCP auth needed.

```json
{
  "version": 1,
  "actions": [
    {
      "id": "facebook",
      "enabled": true,
      "type": "facebook-resolver",
      "showUnauthenticated": true,
      "showAuthenticated": true,
      "defaultUrl": "https://www.facebook.com/titulinoingles",
      "label": "Facebook"
    },
    {
      "id": "contact",
      "enabled": true,
      "type": "contact-form",
      "showUnauthenticated": false,
      "showAuthenticated": true,
      "label": "Contact"
    },
    {
      "id": "custom-slot",
      "enabled": false,
      "type": "link",
      "showUnauthenticated": true,
      "showAuthenticated": true,
      "imageUrl": "https://...",
      "url": "https://...",
      "label": "Custom"
    }
  ],
  "facebookMappings": [
    { "targetLanguage": "en",                         "url": "https://www.facebook.com/titulinoingles" },
    { "nativeLanguage": "pt", "targetLanguage": "es", "url": "https://www.facebook.com/titulinoespanhol/" },
    { "nativeLanguage": "en", "targetLanguage": "es", "url": "https://www.facebook.com/titulinospanish/" },
    { "targetLanguage": "es",                         "url": "https://www.facebook.com/titulinospanish/" },
    { "targetLanguage": "pt",                         "url": "https://www.facebook.com/titulinoportugues/" }
  ]
}
```

**Facebook URL resolution rules:**
1. Match `nativeLanguage` + `targetLanguage` (most specific)
2. Fall back to `targetLanguage` only
3. Fall back to `defaultUrl` (used when unauthenticated or no match found)

**Visibility rules per action:**
- `enabled: false` → never shown regardless of auth state
- `showUnauthenticated: false` + user not logged in → hidden
- `showAuthenticated: false` + user logged in → hidden (future use)

---

## Contact form flow (queued)

User submits form → `POST /api/contact` → API validates captcha → API inserts row into `"ContactMessages"` (via `submit_contact_message` wrapper) → returns 200.

TitulinoMissive `contactmessages` subcommand (cron, every 30 min) → reads unprocessed rows via `get_pending_contact_messages()` → sends one email per row to `titulinoenglish@gmail.com` → calls `upsert_contact_message` with Id to mark `"IsProcessed" = true` and stamp `"ProcessedAt"`.

**Why queue instead of direct send:** if the email service is down when the user submits, direct send silently drops the message. The queue keeps it safe and sends it on the next cron run. Also provides an audit trail for future Admin Tools view.

---

## Positioning (LESS)

Buy Me a Coffee widget is fixed at ~`bottom: 20px; right: 20px`, ~60px tall.  
Measure exact height in browser before setting `@bmc-button-height`.

```less
@bmc-button-height:     60px;
@bmc-button-bottom:     20px;
@floating-icon-size:    48px;
@floating-icon-gap:     8px;
@floating-stack-bottom: (@bmc-button-height + @bmc-button-bottom + 12px); // ~92px

.floating-action-stack {
  position: fixed;
  bottom: @floating-stack-bottom;
  right: @bmc-button-bottom;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: @floating-icon-gap;
  z-index: 999;
}

.floating-action-btn {
  width:  @floating-icon-size;
  height: @floating-icon-size;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
```

To reposition, change `@bmc-button-height` and run `compile-less.sh`. No component changes needed.

---

## Backend work needed

### titulino-net-api (2 additions)

**1. Spine fetch (T7)**  
Add `GetFloatingActionsAsync()` to `GcpBucketAdapter` — HTTP GET from public bucket URI, `_httpClient` only, no GCP auth. Same 10-line pattern as `GetWelcomeMessageConfigsAsync()`. Expose via a REST endpoint.

**2. Contact form insert (T8)**  
New `POST /api/contact` endpoint. Receives `{ name, email, subject, message, captchaToken }`. Validates captcha, calls `submit_contact_message` Supabase RPC to insert the row. Returns 200 on success, 400 on captcha failure. No email sent here — Missive handles that.

### titulino-warehouse (1 Sqitch migration)

Following all existing conventions:

**Table `"ContactMessages"`** — PascalCase double-quoted columns, comments on each:
```
"Id"          SERIAL PRIMARY KEY
"Name"        TEXT NOT NULL
"Email"       TEXT NOT NULL
"Subject"     TEXT NOT NULL
"Message"     TEXT NOT NULL
"CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
"ProcessedAt" TIMESTAMPTZ              -- null until Missive sends it
"IsProcessed" BOOLEAN NOT NULL DEFAULT false
```

**Inner functions** (postgres + service_role only):
- `upsert_contact_message(p_payload JSONB)` — INSERT when no Id; UPDATE ProcessedAt+IsProcessed when Id present
- `get_pending_contact_messages()` — returns rows where IsProcessed = false

**Outer wrapper functions:**
- `submit_contact_message(p_payload JSONB)` — all `titulino_*` roles (API inserts from authenticated session)
- `admin_get_pending_contact_messages()` — `titulino_administrator` + `super_admin` only (future Admin Tools)

Both wrappers return the full `"ContactMessages"` composite type, not a scalar field.

### titulino-communication (1 new subcommand)

New `contactmessages` subcommand in TitulinoMissive — reads unprocessed rows via `get_pending_contact_messages()`, sends one email per row to `titulinoenglish@gmail.com`, calls `upsert_contact_message` with Id to mark processed. Add to crontab on `pd-titulino-lang` with log redirect to `/var/log/contact-messages.log`.

---

## Tasks (18 total)

### Phase 1 — Spine data & models
- [x] T1: Create `floating-actions.json` in local spine folder (`C:\Users\AlbertoArellano\t-bucket\titulino-bucket-spine\titulino-bucket\titulino-spine-data\`) and sync to GCP bucket
- [x] T2: `IFloatingAction` model in `titulino-ui` LOB (id, enabled, type, showUnauthenticated, showAuthenticated, imageUrl?, url?, label?, defaultUrl?)
- [x] T3: `IFacebookMapping` model in LOB (nativeLanguage?, targetLanguage, url)

### Phase 2 — LOB functions (pure, testable)
- [x] T4: `resolveFacebookUrl(nativeLangId, targetLangId, mappings[], defaultUrl)` — most-specific match wins; returns `defaultUrl` for unauthenticated
- [x] T5: `resolveVisibleActions(actions[], isAuthenticated)` — filters by `enabled` + correct auth visibility flag
- [x] T6: Tests for T4 + T5 in `src/lob/__tests__/` (19 tests, all passing)

### Phase 3 — Backend (titulino-net-api)
- [x] T7: `GetFloatingActionsAsync()` in `GcpBucketAdapter` + `IRepositoryClient`; REST endpoint `GET /api/v1/lrn/floating-actions`
- [x] T8: `POST /api/contact` endpoint — captcha validation + call `SubmitContactMessage` RPC; `ContactMessageRequest` DTO; no email sent here

### Phase 4 — Warehouse migration (titulino-warehouse)
- [x] T9: Sqitch — `13_create_contact_messages_table` (table + `contact_message_type` composite); `13_add_contact_message_engine` (inner fns take composite type — per pattern); `13_add_contact_message_wrappers` (API wrappers — wrapper owns JSONB deserialization → ROW() cast → inner fn). **Pending: user runs `sqitch deploy`.**

### Phase 5 — TitulinoMissive subcommand (titulino-communication)
- [x] T10: `contactmessages` subcommand — reads pending rows via `AdminGetPendingContactMessages`, sends email, marks processed via `SubmitContactMessage` with `Id + IsProcessed=true`
- [ ] T11: Add crontab entry on `pd-titulino-lang` — entry documented in `TitulinoMissive/Program.cs` comment. **Pending: user adds manually.**

### Phase 6 — titulino-ui fetch
- [x] T12: Redux action + service call to fetch floating actions config from API (stubs 404 until T7)
- [x] T13: `IS_FLOATING_ACTIONS_ON` flag in `EnvironmentConfig.js` (false in prod/commonConfig, true in dev+local)

### Phase 7 — UI components
- [x] T14: LESS variables for stack positioning (`_floating-action-menu.less`; @bmc-button-height: 52px, @bmc-button-bottom: 18px)
- [x] T15: `FloatingActionMenu` component — `src/components/layout-components/FloatingActionMenu/index.js`; mounted in app-layout + auth-layout
- [x] T16: `FacebookActionButton` — inline in FloatingActionMenu; `resolveFacebookUrl` with `lrn.baseLanguage.localeCode` + `theme.contentLanguage`
- [x] T17: `ContactFormModal` — `ContactFormModal.js`; name/subject/message + captcha; `POST /api/v1/lrn/contact`
- [x] T18: `LinkActionButton` — inline in FloatingActionMenu; `imageUrl` + `url` + `label`

---

## Activation checklist (when ready to go live)

1. Sync `floating-actions.json` from local spine folder to GCP bucket (T1 — file already created)
2. Run Sqitch migration on warehouse (T9)
3. Deploy `titulino-net-api` with contact endpoint (T8)
4. Deploy `TitulinoMissive` with `contactmessages` subcommand (T10)
5. Add crontab entry on `pd-titulino-lang` (T11)
6. Set `IS_FLOATING_ACTIONS_ON: true` in `EnvironmentConfig.js` and deploy UI

---

## Notes

- Facebook URL resolution is a pure LOB function — no HTTP, fully unit-testable
- `type: "link"` slot needs only `imageUrl` + `url` + `label` in the spine JSON — no code changes to add a future icon
- `@bmc-button-height` LESS variable is the only knob to adjust stack position if the pizza button moves
- Contact form hidden for unauthenticated users (`showUnauthenticated: false`) — reduces spam risk
- Warehouse migration follows all conventions: PascalCase double-quoted columns, column comments, inner fns postgres+service_role only, jsonb wrapper pattern, wrappers return full composite type, permissions tiered by role
- Missive subcommand follows same pattern as `audiencemessages` — read queue, send, mark processed
- `titulino-net-api` and `TitulinoWorkerService` still need the `GcpBucketAdapter` lazy-init mirror from the Missive fix (tracked separately)
