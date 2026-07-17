# Migration: pd-titulino-lang VM → Serverless (Cloud Run + Cloud Run Jobs)

**Created:** 2026-07-14
**Target:** End of 2026
**Repos affected:** titulino-net-api · titulino-communication · TitulinoWorkerService · titulino-infra · titulino-warehouse
**Goal:** Replace one always-on VM running everything (API + worker + Redis + cron jobs) with a Terraform-driven, pay-per-use architecture that costs as close to $0 as possible at current traffic levels, deployed to `dev` first and promoted to `prod` for every component, without sacrificing reliability or the ability to scale up if traffic grows.

---

## START HERE (for any agent picking this up cold)

1. Read this whole file once before touching anything — it's the single source of truth for this migration.
2. Find the **first unchecked `[ ]` task** in the Phases section below, in order (`D01` → `D02` → ... → `R01` → ... → `A01` → ... → `M01` → ... → `W01` → ... → `P01` → ... → `X01`). That's where to resume. Do not skip ahead to a later phase's tasks even if they look easier — later phases assume earlier ones are done (e.g., Phase 2 assumes the Terraform module scaffold from Phase 0 exists). **Exception: Phase S (`titulino-warehouse`/Sqitch) is independent** — it can be worked any time after Phase 0, in parallel with everything else, since it doesn't touch or depend on Redis/API/cron/worker.
3. **Phases 1–4 are dev-only builds — prod stays on the VM untouched until Phase 5.** Do not promote any single component to prod early, even if it's fully validated in dev and "ready" — Phase 5's whole point is a deliberate, sequential, back-to-back cutover of all four once everything's proven, not a rolling cutover as each one finishes dev validation. See "Dev-first, prod-promotion pattern" below for why.
4. Related plans this one depends on or intersects with:
   - `docs/plans/active/nuget-shared-libraries.md` — not required, but do it first if there's time (see Phase 0).
   - `docs/plans/active/2026-07-05-missive-content-platform.md` — Phase 8's `MISSIVE_USE_VARIABLE_REGISTRY` flag must carry over correctly when Missive moves to Cloud Run Jobs (Phase 3, task M06).
   - `titulino-infra/ARCHITECTURE.md` — current-state infra inventory; keep it updated as resources move into Terraform.
5. Memory entries for context (if you're a Claude Code agent with access to this project's memory): `project_serverless_migration`, `reference_linux_service_commands`, `project_missive_content_platform`.

---

## Why this exists

On 2026-07-14, `pd-titulino-lang` (an `f1-micro`, 0.6 GB RAM, no swap) was found to have been killed by `SIGBUS` and auto-restarted by systemd **74 times**, because it was running 4 concurrent .NET processes (prod + dev API, prod + dev worker) plus Redis plus periodic cron .NET spawns, all on a box sized for a single tiny service. Immediate remediation (swap file, stopping dev services, resizing to `e2-small`, reserving the static IP) is done and documented in `titulino-infra/ARCHITECTURE.md`. This plan is the follow-up: instead of continuing to grow one VM to fit more processes, split each piece onto the hosting model that actually fits its usage pattern — and manage all of it as code instead of hand-run `gcloud`/SSH commands.

---

## Current state (baseline)

| Component | Where it runs today | Usage pattern |
|---|---|---|
| `titulino-net-api` (prod) | `pd-titulino-lang`, always-on | HTTP API — traffic is bursty, not sustained |
| `titulino-net-api` (dev) | Same VM, always-on | Low/occasional, dev-only |
| `titulino-communication` (Missive) | Same VM, crontab | ~10 scheduled jobs, most finish in single-digit seconds, several times/hour at most |
| `TitulinoWorkerService` (`KnowMeEssayWorker`) | Same VM, always-on `BackgroundService` | Polls every 30s; actual work happens roughly **once a week** |
| `TitulinoWorkerService` (dev) | Same VM, always-on | Same pattern, dev-only |
| Redis | Same VM | Backs welcome/purchase/audience-message queues; lightweight (~55 MB RSS observed) |
| Caddy reverse proxy — dev Supabase workaround | Same VM, added 2026-07-16 | `dev.sb.titulino.com` → dev Supabase project. Unrelated to the 4 components above — routes around a corporate network policy blocking direct access to the dev Supabase domain from Alberto's machine. Not part of the original architecture this plan was written against. |

Everything above shares one VM's CPU/RAM, which is what caused this week's incident.

---

## Target architecture

| Component | Target | Why |
|---|---|---|
| `titulino-net-api` | **Cloud Run service** (containerized), one per environment | Pay-per-request; generous free tier (2M requests, 360K GB-seconds, 180K vCPU-seconds/month); scales to zero between bursts |
| `titulino-communication` cron jobs | **Cloud Run Jobs + Cloud Scheduler**, one job image, per-environment Scheduler triggers | Jobs run for seconds — billed only for actual execution time instead of a VM idling 24/7 to be ready for them |
| `TitulinoWorkerService` (`KnowMeEssayWorker`) | **Cloud Run service** (not a Job — see Phase 4 design note) receiving Pub/Sub push messages, polling loop removed | At ~weekly usage, a 30s poller is awake ~99.98% of the time for nothing; event-driven means it only runs (and is billed) when there's an actual submission |
| Redis | **Dedicated `e2-micro` VM, isolated from everything else, one per environment (or a shared dev/prod instance — see D02)** | Redis is stateful — can't scale to zero. GCP's Always Free tier includes 1 `e2-micro`/month in `us-west1` (already our region) — likely **$0/month** for one instance; a second (dev) instance would be a real small cost, hence D02 |
| Dev variants (api-dev, worker-dev) | **Cloud Run with `min-instances=0`**, same container image as prod, separate service/revision + separate env vars | Costs ~nothing when not actively being tested against; promotion path (see below) means dev and prod always run the exact same image |
| Caddy reverse proxy — dev Supabase workaround | **Open — either retired (if the underlying network block is resolved another way, e.g. an allowlist exception or a Supabase custom domain) or moved to a minimal Cloud Run service before Phase 6** | Not one of the 4 core components, but still a live dependency — can't be silently dropped when the VM goes, or local dev breaks again. See Phase 6 note and Open questions. |
| `pd-titulino-lang` VM | **Decommissioned** once everything above is migrated and verified in both environments | No reason to keep paying for it once nothing depends on it |

---

## Dev-first, prod-promotion pattern (applies to every phase below)

**Cutover model (decided 2026-07-14):** build and validate all four components against **dev only** in Phases 1–4 — prod stays entirely on the VM the whole time. Once all four are proven in dev, **Phase 5 cuts each one over to prod in sequence, back-to-back** (Redis → API → cron jobs → worker), not simultaneously. This gets most of the "test everything once, then switch" simplicity while still isolating which component caused a problem if something breaks right after its specific cutover — if issue appears right after the API cutover, it's the API, not "everything that changed today."

For every component:

1. **Build one container image.** Tag it with the git commit SHA (or a version tag), push to Artifact Registry once.
2. **Deploy that exact image to the `dev` Cloud Run resource** (service or job) via Terraform, with `dev`-scoped env vars/secrets (dev Supabase project or dev schema, dev Redis, etc. — whatever "dev" already means in the current setup). *(Phases 1–4, below.)*
3. **Validate in dev** — smoke test, compare output against the current VM-hosted dev instance, watch logs for a real validation window (hours to a few days depending on the component's traffic/schedule frequency). *(Phases 1–4.)*
4. **Once all four components are validated in dev, promote the *same image* (not a rebuild) to the `prod` Cloud Run resource** via Terraform, one component at a time, in sequence — only the target resource and its env vars/secrets change, the image digest stays identical between dev and prod. *(Phase 5, not interleaved into Phases 1–4 anymore.)*
5. **Run prod's new path alongside the old VM-hosted path** for a validation window before cutting traffic/schedules over.
6. **Cut over, then decommission the VM-hosted copy of *that specific component*** (not the whole VM — other components may still be mid-migration).

This is the same "new path proven safe before the old path is removed" discipline already used for the `MISSIVE_USE_VARIABLE_REGISTRY` flag in the Content Platform plan — just applied at the infrastructure level instead of a code-level env-var flag.

---

## Terraform strategy — what's driven by Terraform, and what isn't

**Driven by Terraform (in `titulino-infra`):**
- Every GCP resource: Cloud Run services/jobs, Artifact Registry repos, Pub/Sub topics/subscriptions, Cloud Scheduler jobs, the Redis VM(s), firewall rules, service accounts, IAM bindings, Secret Manager grants.
- Structured as **reusable modules**, one per resource type that repeats across environments, instantiated twice (dev/prod) with a `terraform.tfvars` (or workspace) distinguishing them:
  ```
  titulino-infra/
    modules/
      cloud-run-service/     # used by titulino-net-api and the worker's new HTTP service
      cloud-run-job/         # used by each Missive cron job
      compute-vm/            # used by the Redis VM(s)
    environments/
      dev/
        main.tf              # instantiates modules with dev-scoped vars
      prod/
        main.tf              # instantiates modules with prod-scoped vars
  ```
  This is a deliberate departure from `titulino-infra`'s current single-`main.tf`-for-everything layout (fine for the LB/bucket work it's done so far) — worth restructuring as part of Phase 0 rather than bolting environments on awkwardly later.
- The Redis VM's initial setup (installing Redis, config) can be driven by Terraform's `metadata_startup_script` on the `google_compute_instance` resource — runs automatically on first boot, no manual SSH step needed.

**NOT driven by Terraform (stays manual, same as today):**
- **DNS** — `titulino-infra/ARCHITECTURE.md` already notes DNS lives in Namecheap, explicitly out of Terraform's scope. Cutting `api.titulino.com`/`dev.api.titulino.com` over to Cloud Run endpoints (Phase 2) means manually updating Namecheap A/CNAME records, same as every DNS change in this project so far.
- **Docker image build & push** — Terraform manages *what Cloud Run points at* (an image URI/tag), not the `docker build`/`docker push` step itself. That's a CI/CD (GitHub Actions) job, matching the existing pattern in `titulino-communication/docs/Deployment.md`. Terraform apply can either run inside the same CI pipeline right after a successful push, or be a manual step a person runs — decide this in Phase 0 (D04 already touches Artifact Registry layout; add the CI-vs-manual-apply decision there too).

---

## CI/CD pipeline design — PR → dev, merge → prod

Each service repo (`titulino-net-api`, `titulino-communication`, `TitulinoWorkerService`) gets its own GitHub Actions workflow — matching the existing convention (`titulino-communication` already has `.github/workflows/deploy-titulino-missive.yml`, which this replaces/extends rather than duplicates). Shape, identical across all three:

1. **Build once.** Every workflow run (whether from a PR or a merge) builds the Docker image exactly once and tags it with `github.sha` — never rebuilt between dev and prod, so what's validated in dev is byte-for-byte what ships to prod.
2. **`pull_request` targeting `main`** → after build+push, checks out `titulino-infra` in the same job and runs `terraform apply` against `environments/dev`, passing the new image tag as a `-var`. No approval gate — dev deploys immediately on every push to the PR branch.
3. **`push` to `main` (i.e., a merge landed)** → same build+push, then `terraform apply` against `environments/prod` with the same image tag.
4. **Prod approval gate uses GitHub's built-in "Environments" feature**, not a custom bot: configure a `production` environment in each repo's Settings → Environments with **required reviewers**. A job with `environment: production` pauses and waits for an approval click before running — the `dev` environment has no such rule, so it deploys unattended.
5. **Cross-repo access**: each service repo's workflow needs a token with read access to `titulino-infra` (a fine-grained PAT or a GitHub App token stored as `INFRA_REPO_TOKEN`) to check it out and run Terraform against it — no `repository_dispatch` chain needed, it's a single self-contained job.

This pattern applies to the three **application** repos. `titulino-infra`-only changes (e.g., resizing the Redis VM, changing a firewall rule) aren't triggered by an application PR — those just run on push to `titulino-infra`'s own `main`, same as today.

**Skeleton workflow** (`titulino-net-api` — the other two mirror this shape, swapping the Dockerfile/image name and which Terraform module they target):

```yaml
name: Deploy titulino-net-api

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - run: gcloud auth configure-docker us-west1-docker.pkg.dev
      - run: docker build -t us-west1-docker.pkg.dev/$PROJECT/titulino/net-api:${{ github.sha }} .
      - run: docker push us-west1-docker.pkg.dev/$PROJECT/titulino/net-api:${{ github.sha }}

  deploy-dev:
    if: github.event_name == 'pull_request'
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: dev   # no required reviewers configured — deploys immediately
    steps:
      - uses: actions/checkout@v4
        with: { repository: OWNER/titulino-infra, token: ${{ secrets.INFRA_REPO_TOKEN }}, path: titulino-infra }
      - uses: hashicorp/setup-terraform@v3
      - working-directory: titulino-infra/environments/dev
        run: |
          terraform init
          terraform apply -auto-approve -var="net_api_image_tag=${{ needs.build-and-push.outputs.image_tag }}"

  deploy-prod:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production   # required reviewers configured in repo Settings — pauses for approval
    steps:
      - uses: actions/checkout@v4
        with: { repository: OWNER/titulino-infra, token: ${{ secrets.INFRA_REPO_TOKEN }}, path: titulino-infra }
      - uses: hashicorp/setup-terraform@v3
      - working-directory: titulino-infra/environments/prod
        run: |
          terraform init
          terraform apply -auto-approve -var="net_api_image_tag=${{ needs.build-and-push.outputs.image_tag }}"
```

---

## Effort estimate

Estimates assume working with AI-assisted pairing (this session's pace), not fully autonomous or fully manual. Phases 1–4 are dev-only now (per the cutover model above), so their windows shrank; Phase 5 concentrates all four prod cutovers, done sequentially and back-to-back — which stacks up more calendar time than an interleaved approach would, but that's the deliberate cost of the safety/simplicity trade-off already discussed.

| Phase | Hands-on-keyboard hours | Calendar time (incl. validation windows) |
|---|---|---|
| Phase 0 — Groundwork, decisions, Terraform module scaffold, CI/CD pipeline template | 7–10 h | 2–3 days |
| Phase S — Sqitch migrations → CI-driven (independent, run any time in parallel) | 3–4 h | 2–4 days |
| Phase 1 — Redis extraction (dev only) | 2–3 h | 1–2 days |
| Phase 2 — `titulino-net-api` → Cloud Run (dev only) | 6–8 h | 3–5 days |
| Phase 3 — Missive cron jobs → Cloud Run Jobs + Scheduler (dev only) | 8–10 h | ~1 week (dev validation across several job types) |
| Phase 4 — Worker → event-driven Cloud Run service (dev only) | 8–12 h | 1–2 weeks (real code change, most invasive phase; needs to catch a real or manufactured weekly-cadence submission) |
| Phase 5 — Production cutover (Redis → API → cron → worker, sequential) | 12–16 h | 4–6 weeks (each component gets its own prod soak before the next starts — API's DNS cutover and the cron parallel-run window are the longest of these) |
| Phase 6 — Decommission | 2–3 h | A few days (final confirmation window before deleting anything) |
| **Total** | **~48–66 h** | **~8–12 weeks elapsed**, mostly gated by Phase 5's sequential prod soaks, not raw effort (Phase S runs in parallel, so it doesn't add to the critical path) |

Still comfortably fits an end-of-2026 target — the actual hands-on-keyboard total is under two work-weeks, and the longer calendar spread (vs. the ~6–10 weeks an interleaved cutover would take) is the direct, deliberate cost of the recommended cutover model: safer, simpler to reason about, slightly slower.

---

## Prerequisite worth doing first (not blocking, but helps)

`docs/plans/active/nuget-shared-libraries.md` — consolidating the 5 copy-pasted shared projects (`Models`, `Repository`, `AuthManager`, `Hub`, `Logger`) into a real NuGet package. Not required for this migration, but doing it first means each repo's Dockerfile does a normal `dotnet restore` against a package feed instead of needing all 5 duplicated project folders copied into 3 separate Docker build contexts. Worth sequencing before Phase 2 if there's time; not a blocker if not.

---

## Phases

### Phase 0 — Groundwork, decisions, Terraform module scaffold, CI/CD pipeline template

- [ ] D01 — Confirm GCP Always Free `e2-micro` eligibility/limits still match assumptions above (terms can change) — verify at the current GCP free tier page before relying on it for the Redis VM
- [ ] D02 — Decide: separate dev Redis VM (small recurring cost) vs. one shared dev/prod Redis instance with key-prefixing or separate DBs (free, less isolation) — affects Phase 1 scope
- [ ] D03 — Inventory every secret/config value each service reads today (Secret Manager calls, `Resources.resx` values, connection strings) per component, per environment — Cloud Run's config/secret access pattern differs from a VM reading local instance metadata; this needs mapping before any container is deployed
- [ ] D04 — Decide Artifact Registry repo layout (one repo for all 3 images, or one per service) **and** whether `terraform apply` runs inside CI after image push, or stays a manual step
- [ ] D05 — Restructure `titulino-infra` into the `modules/` + `environments/dev|prod/` layout described above, migrating the existing LB/bucket resources into it (mechanical refactor — `terraform plan` must show zero diff afterward, same bar as any past import in this repo)
- [ ] D06 — Create the GCP service account + credentials for CI (`GCP_SA_KEY` secret) with least-privilege access to push images and run `terraform apply` in both environments
- [ ] D07 — Generate the cross-repo access token (`INFRA_REPO_TOKEN`) each service repo's workflow needs to check out `titulino-infra` — fine-grained PAT or GitHub App, read-only to that one repo
- [ ] D08 — Configure GitHub Environments in each of the 3 service repos: `dev` (no protection rules) and `production` (required reviewers) — see "CI/CD pipeline design" above
- [ ] D09 — Write the shared workflow template (skeleton in "CI/CD pipeline design" above) once against `titulino-net-api` first, prove it end-to-end (a real PR deploys to dev, a real merge deploys to prod behind the approval gate), then copy the pattern to `titulino-communication` and `TitulinoWorkerService` in their respective phases

### Phase S — `titulino-warehouse` (Sqitch) migrations → CI-driven, no VM involved

> Independent of Phases 1–4 — doesn't block them and isn't blocked by them, can happen any time after Phase 0's CI groundwork exists. Today, migrations are deployed by hand: SSH into `pd-titulino-lang`, `git pull`, `sqitch deploy`. The DB itself is Supabase, not the VM — the VM is only used today because that's where someone already has SSH access set up, not because it's technically required. This phase removes the VM (and the manual SSH step) from the loop entirely.
>
> **No instance to create or manage, for deploy or revert.** GitHub Actions runners (`runs-on: ubuntu-latest`) are ephemeral — GitHub automatically boots a fresh, temporary VM for every workflow run and destroys it afterward. You never provision, size, or maintain this yourself; it's the same automatic mechanism whether the workflow is triggered by a push (deploy) or a manual click (revert) — two separate YAML files, each independently getting its own throwaway runner when triggered. `ubuntu-latest` doesn't ship with `sqitch` preinstalled, so each job runs it via the official `sqitch/sqitch` Docker image rather than installing Perl+DBI by hand:
> ```yaml
> - name: Sqitch deploy
>   run: docker run --rm -v "$PWD:/repo" -w /repo sqitch/sqitch deploy "$SQITCH_TARGET"
>   env:
>     SQITCH_TARGET: ${{ secrets.SUPABASE_DEV_URI }}
> ```
> Same image, same pattern, for `sqitch verify` and the revert workflow's `sqitch revert ... --to ...` — just swap the command.

- [ ] S01 — Write a GitHub Actions workflow in `titulino-warehouse`, same PR→dev / merge→prod shape as everything else: on PR, `sqitch verify` then `sqitch deploy` against the **dev** Supabase target (no approval gate); on merge to `main`, `sqitch deploy` against the **prod** Supabase target, gated behind a `production` GitHub Environment with required reviewers (same pattern as D08)
- [ ] S02 — Store dev/prod Supabase connection credentials as environment-scoped GitHub secrets (not repo-wide) so the dev job can never accidentally target prod
- [ ] S03 — Add a separate `workflow_dispatch` workflow for manual revert: `target` (choice: dev/prod) and `revert_to` (required string, no default — the change/tag to revert back to, found via `sqitch log <target>` or `sqitch.plan`) as inputs, running `sqitch revert <target> --to "<revert_to>" -y`. `revert_to` is deliberately required with no default — a bare `sqitch revert` with no `--to` reverts everything back to nothing, which is almost never the intent during an actual incident. Targeting `prod` goes through the same `production` Environment approval gate as a normal deploy.
- [ ] S04 — Run the new dev pipeline for a few real migrations to validate before trusting it for prod
- [ ] S05 — Cut prod over to the new pipeline; the manual SSH+`git pull`+`sqitch deploy` habit is retired at this point, independent of how far along Phases 1–5 are

### Phase 1 — Redis extraction

> Do this first — lowest risk, unblocks nothing else, but proves the "isolate services" pattern and the module structure from Phase 0.

- [ ] R01 — Write the `modules/compute-vm` Terraform module (parameterized: machine type, zone, startup script) — first real VM resource in this repo, not an import
- [ ] R02 — Instantiate it for **dev** — provision the dev Redis `e2-micro`, startup script installs/configures Redis matching current version
- [ ] R03 — Point **dev** `titulino-net-api`, `titulino-communication`, and `TitulinoWorkerService` configs at the new dev Redis host; verify all 3 queue types flow correctly in dev

> Prod Redis provisioning + cutover happens in Phase 5 (P01), not here — see the cutover model above.

### Phase 2 — `titulino-net-api` → Cloud Run

- [ ] A01 — Write `Dockerfile` (multi-stage: SDK image to build/publish, ASP.NET runtime image to run)
- [ ] A02 — Resolve Phase 0/D03's secret-access inventory for this service — Cloud Run's service account needs Secret Manager IAM grants matching what the VM's service account had, for both dev and prod service accounts
- [ ] A03 — Write the GitHub Actions workflow implementing D09's template for this repo (this is the repo the template gets proven against first) — build + push image, PR→dev / merge→prod terraform apply, GitHub Environments gate
- [ ] A04 — Write the `modules/cloud-run-service` Terraform module (parameterized: image, env vars, min/max instances, secrets)
- [ ] A05 — Instantiate for **dev**: `google_cloud_run_v2_service` + IAM + (optional) domain mapping for a dev subdomain — deploy, smoke test directly against the Cloud Run URL
- [ ] A06 — Validate in dev for a real window (does everything the current dev VM instance does — auth, enrollment, admin endpoints, whatever this API's surface covers)

> Prod promotion + DNS cutover happens in Phase 5 (P02), not here — see the cutover model above.

### Phase 3 — `titulino-communication` cron jobs → Cloud Run Jobs + Cloud Scheduler

- [ ] M01 — Write `Dockerfile` for `TitulinoMissive` (console app — simpler than the API's, no web server needed)
- [ ] M02 — Copy D09's GitHub Actions template into this repo (replaces the existing `deploy-titulino-missive.yml`) — build + push image once, PR→dev / merge→prod terraform apply against the `cloud-run-job` module instances
- [ ] M03 — Write the `modules/cloud-run-job` Terraform module (parameterized: image, args/command per job, env vars, secrets)
- [ ] M04 — Write the Cloud Scheduler side of the module (or a paired module): one `google_cloud_scheduler_job` per current crontab line, matching the exact schedules in `titulino-communication/docs/Deployment.md`'s crontab table, targeting the Cloud Run Job via its execution API with the right `--args`
- [ ] M05 — Instantiate both for **dev** first, one job at a time (start with something low-stakes like `testing`, not `birthdays`) — validate output/logs match what the current dev setup produces
- [ ] M06 — This is also the natural point to revisit `MISSIVE_USE_VARIABLE_REGISTRY` (see `2026-07-05-missive-content-platform.md` Phase 8) — if that flag is still mid-validation when this reaches here, make sure the Cloud Run Job's env vars carry it over correctly

> Prod instantiation, the crontab-parallel validation window, and disabling crontab happens in Phase 5 (P03), not here — see the cutover model above.

### Phase 4 — `TitulinoWorkerService` → event-driven Cloud Run service

> **Design note:** use a Cloud Run **service** (HTTP endpoint) receiving a Pub/Sub **push** subscription, not a Cloud Run Job triggered via Eventarc. Pub/Sub push-to-Cloud-Run is the simpler, more standard pattern here (well-documented OIDC-token invoker auth, no Eventarc layer needed) — appropriate since `KnowMeEssayWorker`'s unit of work (process one submission) maps cleanly onto "handle one HTTP POST, return 200 to ack."

- [ ] W01 — In `titulino-net-api` (wherever a KnowMe AI submission actually gets created — the upload endpoint), add a Pub/Sub publish call carrying whatever `KnowMeEssayWorker` currently reads when it claims a pending submission
- [ ] W02 — In `TitulinoWorkerService`, remove `KnowMeEssayWorker`'s polling `BackgroundService` loop; add a minimal ASP.NET Core HTTP endpoint that accepts the Pub/Sub push payload, processes exactly one submission, returns 200 (ack) or a non-200 (nack/retry)
- [ ] W03 — Define failure handling explicitly: Pub/Sub's redelivery + a dead-letter topic needs to replace whatever implicit retry behavior the polling loop had (e.g., if the AI provider call fails, does the message redeliver N times then dead-letter, and who watches the dead-letter topic?)
- [ ] W04 — Write `Dockerfile` for this service
- [ ] W05 — Copy D09's GitHub Actions template into `TitulinoWorkerService` — build + push once, PR→dev / merge→prod terraform apply
- [ ] W06 — Write `modules/pubsub-push-service` (or reuse `cloud-run-service` + a separate Pub/Sub module: `google_pubsub_topic`, `google_pubsub_subscription` with push config + OIDC auth, `google_cloud_run_v2_service_iam_member` granting the Pub/Sub service agent invoker access)
- [ ] W07 — Instantiate for **dev** — publish a test submission from dev `titulino-net-api`, confirm it's processed end-to-end
- [ ] W08 — Run the new dev path *alongside* the dev VM's poller for a validation window (given ~weekly real usage, this window needs to be long enough to catch at least one real submission, or manufacture test ones)

> Prod promotion happens in Phase 5 (P04), not here — see the cutover model above.

### Phase 5 — Production cutover (sequential, back-to-back — only start this once Phases 1–4 are all validated in dev)

> Each component below is promoted, validated in prod, and (where applicable) cut over — one at a time, in this order — before moving to the next. Don't start P02 until P01 is confirmed stable; don't parallelize these.

- [ ] P01 — **Redis:** instantiate `modules/compute-vm` for **prod** (provision the prod Redis `e2-micro`); point prod `titulino-net-api`, `titulino-communication`, `TitulinoWorkerService` configs at it (firewall scoped to only what needs it); verify all 3 queues in prod; remove Redis from `pd-titulino-lang` once stable for a few days
- [ ] P02 — **`titulino-net-api`:** promote the dev-validated image to **prod** via the `cloud-run-service` module, deploy alongside the still-running prod VM (don't cut DNS yet); smoke test directly via the `*.run.app` URL; manually update Namecheap DNS (`api.titulino.com`) once verified — **not Terraform-managed**; keep the VM's copy running for a rollback window; update `titulino-net-api/docs/Deployment.md`
- [ ] P03 — **Missive cron jobs:** instantiate the dev-validated `cloud-run-job` + Cloud Scheduler set for **prod**, running *alongside* the existing crontab (don't disable crontab yet); validation window comparing Cloud Logging output against the parallel crontab output (`/var/log/*`) for each job across a few natural cycles; disable the crontab entries once every job's validated clean; update `titulino-communication/docs/Deployment.md`'s crontab section
- [ ] P04 — **`TitulinoWorkerService`:** promote the dev-validated event-driven service to **prod**; run alongside the prod VM's poller before removing it; remove the prod poller once confident; update `TitulinoWorkerService/docs/Deployment.md`

### Phase 6 — Decommission

- [ ] X00 — Resolve the Caddy dev-Supabase-proxy dependency (`dev.sb.titulino.com`, added 2026-07-16) before touching the VM: either confirm the underlying network block that required it has been resolved another way and the proxy is no longer needed, or stand up a minimal replacement (e.g. a small Cloud Run service running the same reverse-proxy config) so local dev doesn't silently break the moment the VM is deleted. This is not one of the 4 core components tracked elsewhere in this plan — it'll be easy to miss.
- [ ] X01 — Confirm nothing on `pd-titulino-lang` is still in use (API, worker, cron, Redis all migrated and stable in both dev and prod)
- [ ] X02 — Snapshot the disk before deleting, just in case
- [ ] X03 — Delete the instance (via `gcloud`/console — it was never imported into Terraform, so no `terraform destroy` needed); release the reserved static IP if nothing needs it anymore
- [ ] X04 — Update `titulino-infra/ARCHITECTURE.md` to remove the VM section and document the final architecture
- [ ] X05 — Update every repo's `docs/Deployment.md` (net-api, communication, worker) to describe the new deploy path end-to-end — no more "SSH in and run X"
- [ ] X06 — Update `reference_linux_service_commands` memory (or its equivalent doc) to note `pd-titulino-lang` is retired

---

## Rollback strategy (applies to every phase)

Each phase deploys the new thing *alongside* the old one, in dev before prod, and validates before cutting over or decommissioning — never delete the VM's copy of a component until its Cloud Run/Job replacement has run clean for a real validation window in prod specifically (dev validation alone isn't sufficient sign-off). This mirrors the `MISSIVE_USE_VARIABLE_REGISTRY` flag approach from the Content Platform plan: new path proven safe before the old path is removed, not before.

---

## Rough cost shape (verify actual numbers before committing — GCP pricing/free-tier terms can change)

| Item | Rough shape |
|---|---|
| Redis `e2-micro` (prod) | ~$0/month if within Always Free limits |
| Redis `e2-micro` or shared instance (dev) | Depends on D02 — a second always-free-eligible instance may not be available if the free tier is one-per-billing-account, not one-per-environment; verify before assuming a second free instance |
| `titulino-net-api` on Cloud Run (dev + prod) | Likely $0–low single digits/month at current traffic (well within free tier), scales with actual usage if traffic grows |
| Missive cron jobs on Cloud Run Jobs (dev + prod) | Pennies/month — billed only for actual seconds of execution |
| `TitulinoWorkerService` event-driven (dev + prod) | Near $0/month at ~weekly usage |
| `pd-titulino-lang` (decommissioned) | $0 — no longer paying for it at all |

Compare against continuing to pay for an ever-larger VM (`e2-small` now, possibly `e2-medium` later) running 24/7 regardless of actual usage, with a second VM potentially needed for a proper dev environment on the current architecture.

---

## Open questions

- D01–D05 above, plus:
- Does `titulino-net-api` have any WebSocket/SignalR (`Hub` project) usage that needs Cloud Run's WebSocket support considerations, or any long-lived connection assumptions that don't fit a request-scoped serverless model?
- Is GCP's Always Free `e2-micro` allowance one-per-billing-account or one-per-project/region — this determines whether a separate dev Redis VM is actually free or a real (if small) cost (feeds D02).
- Will the Caddy dev-Supabase-proxy workaround (added 2026-07-16, see X00) still be needed by the time Phase 6 arrives, or will the underlying network block be resolved by other means (allowlist exception, Supabase custom domain) before then? Revisit at Phase 6, don't assume either way.
