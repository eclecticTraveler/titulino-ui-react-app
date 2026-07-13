# Patterns — Titulino

Reusable implementation recipes for recurring feature types. Each pattern includes the full chain from data to UI, the rule, and the failure mode it prevents.

Check this file before building anything that looks like something already built before.

---

## Pattern 1 — Spine JSON config chain

**When to use:** Any runtime-configurable UI behavior (feature flags per user, dynamic menus, Facebook URL mappings, floating action config, message templates, scheduled posts).

**Rule:** Never hardcode what can live in a spine JSON. Never fetch spine JSON client-side directly — always go through the API layer for consistency, caching, and future auth control.

### Full chain (always in this order)

```
1. GCP bucket JSON file
   titulino-spine-data/<feature>.json

2. GcpBucketAdapter method (titulino-net-api)
   HTTP GET via _httpClient only — NO _storageClient, NO GCP auth needed.
   Same pattern as GetWelcomeMessageConfigsAsync() and GetMessageTemplateVariablesAsync().

3. IRepositoryClient passthrough
   Thin delegation — no logic here.

4. REST endpoint in titulino-net-api
   GET /api/<feature-config>
   Returns the deserialized JSON.

5. Redux action + TitulinoRestService call in titulino-ui
   Dispatches on mount of the consuming component.

6. LOB function that processes the data (titulino-ui)
   Pure function, no HTTP, no Redux, fully testable.
   Examples: resolveFacebookUrl(), resolveVisibleActions(), filterMessageTemplateVariableCatalog()

7. Component reads resolved data from Redux store
```

### Spine JSON conventions

- Always include `"version": 1` at the top — bump when the shape changes
- Each configurable item gets `"enabled": true/false` so individual entries can be toggled without removing them
- Items that have auth-dependent visibility get `"showUnauthenticated"` + `"showAuthenticated"` boolean fields
- URL lookups (like Facebook page per language pair) go in a separate `"<entityType>Mappings"` array in the same file — keeps config and lookup data together

### Existing spine files (reference)

| File | Purpose |
|---|---|
| `welcome-messages.json` | Welcome email templates |
| `scheduled_posts.json` | Weekly social media posts |
| `weekly-messages.json` | Weekly email templates |
| `messaging/template-variables.json` | Audience message variable catalog |
| `floating-actions.json` | Floating icon menu config + Facebook URL mappings |

---

## Pattern 2 — Queue-based email flow

**When to use:** Every email send in Titulino — inbound (contact form) or outbound (audience, welcome, birthday), one recipient or a thousand.

**Rule:** No email is ever sent inline from an API endpoint. Always: insert to DB → cron reads → send → mark processed.

### Why

Direct send (`await emailService.SendAsync(...)` inside the API handler) silently drops the message if the email service is down at that exact moment. The user sees "Message sent!" and you never receive it. The queue keeps the message safe regardless of downstream availability.

### Full chain

```
1. API endpoint (titulino-net-api)
   Validates captcha (if applicable).
   Calls upsert_<entity> RPC to insert the row.
   Returns 200 — does NOT send email.

2. TitulinoMissive subcommand (titulino-communication)
   Cron-triggered (every 30–60 min depending on urgency).
   Reads unprocessed rows via get_pending_<entity>().
   Sends one email per row via email service.
   Calls upsert_<entity> with Id to stamp ProcessedAt + IsProcessed = true.
   Logs to /var/log/<entity>-messages.log with === START/END $(date) === wrappers.

3. Warehouse table
   Follows all DB conventions (see docs/Architecture.md warehouse section).
   Always has: Id, CreatedAt, ProcessedAt (nullable), IsProcessed (bool default false).
```

### Existing queue subcommands (reference)

| Subcommand | Table | Cron |
|---|---|---|
| `audiencemessages` | audience queue | hourly |
| `welcomemessages` | welcome queue | frequent |
| `birthdaymessages` | — (date-filtered) | daily at 08:00 UTC |
| `contactmessages` | ContactMessages | every 30 min |

### Never do this

```csharp
// ❌ WRONG — silent drop if email service is down
await emailService.SendAsync(to, subject, body);
return Ok();

// ✅ RIGHT — message is safe even if email service is down
await repository.UpsertContactMessageAsync(payload);
return Ok();
// Missive cron handles sending
```

---

## Pattern 3 — Feature flag placement rule

**When to use:** Any `IS_X_ON` flag in `EnvironmentConfig.js` that changes routing or UI structure.

**Rule:** A feature flag controls **entry points only** — never the rendering logic inside a component that is reached by explicit navigation.

### Entry points a flag MAY control

- Default route redirect (empty-path `<Navigate>` in AppViews)
- Post-login redirect fallback in `getRedirectPath()`
- Logo link destination (LogoAlt.js)
- Nav icon links (HeaderNav.js)
- Whether a component renders at all (conditional in a layout)

### What a flag must NEVER do

Override what a component renders when the user navigated to it explicitly. If the user clicks "Speeches" in the top nav, they get the speeches page. A flag placed inside `SharedCourseLevel` or `AuthCourseLevel` that redirects them back to a landing page is wrong — it breaks deliberate navigation.

### The failure mode (learned 2026-07-13)

`IS_ENROLLMENT_LANDING_ON` was placed inside `SharedCourseLevel` (lines 110, 148) and `AuthCourseLevel` (line 70). When the flag was on, clicking any course in the top nav silently redirected to `/lrn/landing` instead of the course. The fix: remove every `IS_ENROLLMENT_LANDING_ON` block from those components. The flag now only lives in AppViews (default redirect), login (post-login fallback), LogoAlt (logo link), and HeaderNav (home icon).

### Checklist when adding a new flag

- [ ] Default route in AppViews? → flag belongs here if yes
- [ ] Post-login destination? → flag belongs in `getRedirectPath()`
- [ ] Nav link target? → flag belongs in the nav component
- [ ] Inside a component reachable by explicit URL navigation? → **flag does NOT belong here**

---

## Pattern 4 — GcpBucketAdapter lazy-init rule

**When to use:** Any time a new method is added to `GcpBucketAdapter` in any of the three repos (`titulino-net-api`, `TitulinoWorkerService`, `titulino-communication`).

**Rule:** Never call `GetSecretAsync()` (or any async GCP call) in a constructor. Never use `.GetAwaiter().GetResult()` to block on an async call in a constructor.

### Why

`GcpBucketAdapter` is instantiated during DI resolution at process startup. If the GCP Secret Manager call times out or fails at that moment, DI resolution throws, and the entire process crashes before doing any work. For long-running services (titulino-net-api, TitulinoWorkerService) this means one bad startup. For cron processes (TitulinoMissive) that start fresh every run, it means the job **never completes** — emails stay stuck in the queue indefinitely.

This exact failure caused 300 audience emails to be undelivered (2026-07-13).

### Correct pattern

```csharp
// Fields declared as non-nullable with null! — initialized lazily, not in constructor
private GoogleCredential _googleCredential = null!;
private StorageClient _storageClient = null!;
private readonly SemaphoreSlim _initLock = new(1, 1);
private bool _initialized;

public GcpBucketAdapter(HttpClient httpClient, SecretManagerService secretManagerService)
{
    _httpClient = httpClient;
    _secretManagerService = secretManagerService;
    // Nothing else — no async calls here
}

private async Task EnsureInitializedAsync()
{
    if (_initialized) return;
    await _initLock.WaitAsync();
    try
    {
        if (_initialized) return;
        var jsonKey = await _secretManagerService.GetSecretAsync("GCP_AUTH_MASTER_TOKEN");
        _googleCredential = GoogleCredential.FromJson(jsonKey);
        _storageClient = StorageClient.Create(_googleCredential);
        _initialized = true;
    }
    finally
    {
        _initLock.Release();
    }
}
```

### Which methods call EnsureInitializedAsync

Call it at the top of every method that uses `_storageClient` or `_googleCredential`. Methods that only use `_httpClient` (public bucket HTTP fetches) skip it entirely — they never need GCP auth.

```csharp
// ✅ Needs init — uses _storageClient
public async Task<string> UpsertKnowMeProfilePictureAsync(IKnowMeFile file)
{
    await EnsureInitializedAsync();
    // ...
}

// ✅ No init needed — uses _httpClient only
public async Task<IEnumerable<IMessageConfig>> GetWelcomeMessageConfigsAsync()
{
    var response = await _httpClient.SendAsync(...);
    // ...
}
```

### Mirror rule

`GcpBucketAdapter` is copy-pasted across all three repos. Any change to it (new method, bug fix, pattern change) must be applied to all three:
- `C:\Users\AlbertoArellano\source\repos\titulino-communication\Repository\Provider\GcpBucketAdapter.cs`
- `C:\Users\AlbertoArellano\source\repos\titulino-net-api\Repository\Provider\GcpBucketAdapter.cs`
- `C:\Users\AlbertoArellano\source\repos\TitulinoWorkerService\Repository\Provider\GcpBucketAdapter.cs`
