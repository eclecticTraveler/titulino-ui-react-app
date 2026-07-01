# Plan: titulino-infra — Terraform for GCS infrastructure

**Goal:** Manage all Titulino GCP infrastructure as code. Start with the new `docs.titulino.com` static site bucket (greenfield — no import). Import existing static site buckets as a second pass. Skip VMs for now. Supabase stays out of Terraform entirely.

**Repo:** `C:\Users\AlbertoArellano\source\repos\titulino-infra` (new)

---

## Progress

### P1 — Bootstrap: install Terraform + create repo

- [x] T01 — Install Terraform on Windows + create `titulino-infra` repo scaffold
- [ ] T02 — Configure GCP provider: authenticate with `gcloud auth application-default login`, set project ID

### P2 — Docs bucket (new resource — no import)

- [x] T03 — Write `docs-bucket.tf`: `google_storage_bucket` + IAM public read + website config
- [x] T04 — `terraform init` → `terraform plan` → `terraform apply` — verify bucket is live at `storage.googleapis.com/docs.titulino.com/`
- [x] T05 — DNS: `docs` A record already existed in Namecheap → `34.8.75.161` (Load Balancer IP)

### P2b — Load Balancer import + docs routing (discovered: LB sits in front of all buckets)

- [x] T05b — Discover full LB topology via gcloud describe commands; write `ARCHITECTURE.md`
- [x] T05c — Write `load-balancer.tf` with import blocks for all 9 existing resources + docs additions
- [x] T05d — Run `terraform plan` — review: 9 imports + docs additions (backend bucket, URL map host rule, new SSL cert)
- [x] T05e — Run `terraform apply` — imports existing + creates docs backend + new cert + updates proxy
- [x] T05f — Remove `import{}` blocks from `load-balancer.tf`; `terraform plan` confirmed clean; orphaned `cdn-titulino-bucket-pd` deleted to free quota slot for `docs-titulino`
- [x] T05g — `titulino-all-pd-domains` cert ACTIVE for all 3 domains (confirmed 2026-06-30)
- [x] T05h — Removed old cert from proxy `ssl_certificates`; `terraform apply`; `titulino-dev-pd-domains` deleted from GCP

### P3 — Aggregator repo `titulino-docs`

- [ ] T06 — Create `titulino-docs` repo with folder structure mirroring each source repo's `docs/` folder
- [ ] T07 — GitHub Action in `titulino-ui`: on push to main, sync `docs/**/*.md` → `titulino-docs/titulino-ui/`
- [ ] T08 — Repeat T07 for: `titulino-net-api`, `TitulinoWorkerService`, `titulino-communication`, `titulino-warehouse`

### P4 — Docsify site

- [ ] T09 — Write `titulino-docs/docs/index.html`: Docsify config with sidebar + Titulino theme
- [ ] T10 — Write `_sidebar.md` generation script (runs in CI, walks all `.md` files → builds sidebar tree)
- [ ] T11 — GitHub Action in `titulino-docs`: on push → `gsutil rsync -r docs/ gs://docs.titulino.com`

### P5 — Supabase SSO gate

- [ ] T12 — Inject Supabase JS client into `index.html`: check for valid session before Docsify init; redirect to `titulino.com/lrn/login?redirect=docs.titulino.com` if no session
- [ ] T13 — Test end-to-end: unauthenticated → redirect, authenticated → docs render

### P6 — Import existing buckets (second pass)

- [ ] T14 — For each existing manually-created GCS bucket: write HCL, run `terraform import`, verify `terraform plan` shows 0 changes
- [ ] T15 — Add existing bucket names to `variables.tf` so they're documented

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Docs renderer | Docsify | No build step; single HTML file on GCS; familiar JS |
| Auth | Supabase client-side JS check | No server needed; reuses existing Supabase project |
| VMs | Skip Terraform for now | Compute Engine HCL is verbose; low ROI at this stage |
| Supabase config | Out of Terraform | Limited provider; just a URL + anon key in app config |
| Existing buckets | Import in P6 | New bucket proves the pattern first; imports are reversible |

---

## Prerequisites (manual, one-time)

1. Install Terraform on Windows:
   ```
   winget install HashiCorp.Terraform
   ```
   Or download from https://developer.hashicorp.com/terraform/install

2. Install gcloud CLI (if not already):
   ```
   winget install Google.CloudSDK
   ```

3. Authenticate:
   ```
   gcloud auth application-default login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```

4. Find your GCP project ID (needed for `terraform.tfvars`):
   ```
   gcloud projects list
   ```
