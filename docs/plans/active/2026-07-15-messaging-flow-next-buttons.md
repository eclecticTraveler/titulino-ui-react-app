# Messaging Flow — Next Buttons & Stepper

**Created:** 2026-07-15
**Branch:** profile-issues
**Primary file:** `src/components/admin-components/Insights/GlobalAdminToolsLandingDashboard.js`

---

## Problem summary

The compose → audience → review → send workflow lacks forward guidance:

1. **No forward nudge** — a user who fills out the compose form has no signal telling them to proceed to Audience. They must discover the tab order themselves.
2. **No audience confirmation** — after selecting rows in the Audience tab there is no prompt to advance to Review.
3. **Stale audience after send** — `selectedAudienceRows` / `selectedAudienceRowKeys` are not cleared after a successful send; the next message inherits the previous audience silently.
4. **No step context** — nothing communicates that the three left tabs are a sequential flow rather than three independent panels.

---

## Solution

Four additive changes — nothing removed, nothing existing changed:

| # | Where | What |
|---|---|---|
| T1 | Bottom of Redactar tab | "Siguiente: Audiencia →" Button, enabled when category + subject + body are filled |
| T2 | Bottom of Audiencia tab | Success Alert + "Ir a Revisión →" action when rows > 0 |
| T3 | `handleSendAudienceMessage` success block | Clear `selectedAudienceRows`, `selectedAudienceRowKeys`, navigate back to compose |
| T4 | Above `<Tabs>` in the messaging section | Ant Design `Steps` (mini, navigation-style) spanning the 3 workflow tabs only |

---

## Enabling conditions

**T1 Next button enabled:**
- `audienceMessageDraft.categoryId != null`
- `audienceMessageDraft.subject?.trim()` is non-empty
- `hasAudienceMessageDraftContent` (existing derived boolean)

Course Code is intentionally excluded — the Review checklist gates it at send time.

**T2 Alert shown:**
- `selectedAudienceRows.length > 0`

---

## Stepper design (T4)

```
① Redactar  →  ② Audiencia  →  ③ Revisión
```

- Ant Design `Steps` with `size="small"` and `type="navigation"`
- `current` = 0 / 1 / 2 based on `messagingInnerTabKey`
- Clicking a step navigates to the corresponding tab via `setMessagingInnerTabKey`
- Hidden when active tab is outside the workflow group (history, certifications, setup)
- Each step can also show `status="finish"` when its gate condition is met:
  - Step 0 finish: category + subject + body filled
  - Step 1 finish: `selectedAudienceRows.length > 0`

---

## New locale keys

| Key | en_US | es_US | pt_BR |
|---|---|---|---|
| `admin.tools.messaging.nextAudience` | Next: Audience → | Siguiente: Audiencia → | Próximo: Audiência → |
| `admin.tools.messaging.audienceReadyForReview` | {count} recipient(s) selected — ready to review | {count} destinatario(s) seleccionado(s) — listo para revisar | {count} destinatário(s) selecionado(s) — pronto para revisar |
| `admin.tools.messaging.goToReview` | Go to Review → | Ir a Revisión → | Ir para Revisão → |

---

## Progress

- [x] **T1** — "Siguiente: Audiencia →" button at bottom of Redactar tab
- [x] **T2** — Success Alert + "Ir a Revisión →" at bottom of Audiencia tab
- [x] **T3** — Post-send reset: clear selectedAudienceRows + rowKeys + navigate to compose
- [x] **T4** — Ant Design Steps mini stepper above workflow tabs
- [x] **Locale** — 3 new keys added to en/es/pt

---

## Regression checklist

- [ ] "Next: Audience" button disabled when compose fields are empty
- [ ] Button enables after filling category + subject + body
- [ ] Clicking Next navigates to Audience tab without losing draft
- [ ] Audience alert absent when no rows selected
- [ ] Audience alert appears with correct count when rows selected
- [ ] "Go to Review" button in alert navigates to Review tab
- [ ] After successful send: compose draft reset, rows cleared, tab returns to compose
- [ ] Stepper shows step 0 active on compose, step 1 on audience, step 2 on review
- [ ] Stepper hidden when on history / certifications / setup
- [ ] Clicking stepper step navigates to that tab
- [ ] All new strings appear in Spanish (es_US) and Portuguese (pt_BR)
