# NuGet: Consolidate Shared .NET Libraries

**Status:** Planned — not started  
**Priority:** High (sustainability / consistency risk)  
**Repos affected:** titulino-net-api · TitulinoWorkerService · titulino-communication

---

## Problem

Five .NET projects are physically copy-pasted into three separate solutions because there is no private NuGet feed:

| Library | Purpose |
|---|---|
| `Models` | Domain types (Enrollment, Lrn, Insight, Shop, …) |
| `Repository` | `IRepositoryClient`, `RepositoryClient`, `SupabaseAdapter` |
| `AuthManager` | JWT / auth helpers |
| `Hub` | SignalR hub shared types |
| `Logger` | `ILogClient` + logging infrastructure |

**Current state:** Every time a new model or method is added to one solution, it must be manually copied to the other two. This is already causing drift:
- 2026-06-30: `IKnowMeAiJob` / `KnowMeAiJob` added to `TitulinoWorkerService` but not to the other two (sync done manually post-sprint)
- `ChurchMemberRecordDto` / `GetChurchMemberBirthdatesAsync` existed in net-api + communication but was missing from Worker Service (synced 2026-06-30)

**Known inconsistency in `IRepositoryClient`:** Because each solution exposes different DB operations, the interface methods differ per solution. The `NotImplementedException` stubs added on 2026-06-30 are a short-term bridge to keep the interface declarations identical. This is the main design tension to resolve in the NuGet migration.

---

## Goal

Replace the 5 copy-pasted projects with a single private NuGet package (or packages) published from a shared source repo. All three solutions reference the package instead of a local project.

---

## Options evaluated

### Option A — GitHub Packages (recommended)
GitHub Packages hosts private NuGet feeds for free on private repos. Publish is `dotnet nuget push`. Auth is a GitHub Personal Access Token.

**Pros:** Free, already in GitHub ecosystem, CI-friendly.  
**Cons:** Requires PAT management; slightly more ceremony than local project refs.

### Option B — Azure Artifacts
Azure DevOps Artifacts provides a private NuGet feed. Free tier: 2 GiB.

**Pros:** Rich access control, integrates with Azure DevOps pipelines.  
**Cons:** Adds a service dependency (Azure DevOps account needed).

### Option C — Local NuGet source on dev machines
Pack each project to a `.nupkg` and point all solutions at a local folder feed.

**Pros:** Zero infrastructure, works offline.  
**Cons:** Manual per-machine setup; blocks other devs; breaks CI.

**Recommendation: Option A (GitHub Packages).** Free, fits existing CI setup.

---

## Tasks

### Phase 1 — Create the shared library source repo

- [ ] **S01** — Create new repo `titulino-shared-libs` (private, GitHub)  
  Move these five projects into it: `Models`, `Repository`, `AuthManager`, `Hub`, `Logger`

- [ ] **S02** — Decide on versioning strategy  
  Recommended: single version number across all 5 projects (they always move together)

- [ ] **S03** — Configure `Directory.Build.props` for shared version + NuGet metadata  
  Set `PackageId`, `Version`, `Authors`, `RepositoryUrl`

- [ ] **S04** — Resolve the `IRepositoryClient` divergence  
  The current interface has `NotImplementedException` stubs for methods only used in some solutions.  
  Options:
  - Keep one monolithic interface with stubs (simple, current state)
  - Split into `IRepositoryClient` (common) + `IWorkerRepositoryClient` + `IApiRepositoryClient` (clean, more refactoring)  
  **Decide before S05 — this shapes the package structure.**

### Phase 2 — Publish to GitHub Packages

- [ ] **S05** — Create a GitHub Actions workflow in `titulino-shared-libs`  
  On push to `main`: `dotnet pack` → `dotnet nuget push` to GitHub Packages feed

- [ ] **S06** — Generate a GitHub PAT with `read:packages` scope  
  Store as repo secret `NUGET_PACKAGES_TOKEN` in all three consuming repos

- [ ] **S07** — Add `nuget.config` to all three consuming repos pointing to the GitHub Packages feed  
  ```xml
  <packageSource key="github" value="https://nuget.pkg.github.com/OWNER/index.json" />
  ```

### Phase 3 — Migrate consuming repos

- [ ] **S08** — In each solution, replace `<ProjectReference>` with `<PackageReference>`  
  Order: titulino-net-api → TitulinoWorkerService → titulino-communication

- [ ] **S09** — Remove the local library project copies from each solution  
  Confirm builds pass before deleting

- [ ] **S10** — Update CI workflows in all 3 repos to restore from GitHub Packages  
  Add the PAT secret to `dotnet restore` step

- [ ] **S11** — Tag the shared library repo with `v1.0.0` and verify all three solutions consume it end-to-end

---

## Interim rule (until NuGet is live)

> **Any change to the shared libraries in one solution MUST be applied to all three before the PR is merged.**

Checklist to add to PR descriptions for `TitulinoWorkerService`, `titulino-net-api`, `titulino-communication`:

```
## Shared library sync
- [ ] Models — changes applied to all 3 solutions
- [ ] Repository (IRepositoryClient / RepositoryClient / SupabaseAdapter) — changes applied to all 3
- [ ] AuthManager / Hub / Logger — changes applied to all 3 (if modified)
```

---

## Effort estimate

| Phase | Tasks | Est. hours |
|---|---|---|
| P1 Source repo | S01–S04 | 3–4 h |
| P2 Publish | S05–S07 | 2–3 h |
| P3 Migrate | S08–S11 | 4–6 h |
| **Total** | **11** | **~10 h** |
