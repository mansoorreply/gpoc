# Collect page quick skip — design

## Goal

On the Collect page Activity workflow cards, let users mark an activity **Skipped** without opening the detail drawer, so they can unlock **Continue to solutions** faster when an activity is not needed.

## Scope

**In scope**

- Add a compact **Skip** control on each Collect workflow card.
- Immediate status update to `skipped` (no confirmation, no drawer).
- Show Skip only for `not_started` / `in_progress` while Collect is not submitted.
- Preserve existing comments, decisions, and file names when quick-skipping.

**Out of scope**

- Plan page activity workflow.
- Changing drawer status UX.
- Card-level un-skip (users can still change status via the drawer).
- Confirmation dialogs.

## Approach

Nested stroked **Skip** button inside the card footer meta row (next to duration and status chip). Card click still opens the drawer; Skip stops propagation and calls existing `EngagementService.updateActivityProgress`.

## Behavior

| Action | Result |
| --- | --- |
| Click Skip | `status` → `skipped`; drawer does not open |
| Click card body | Drawer opens as today |
| Status already `done` or `skipped` | Skip hidden |
| Collect submitted | Skip hidden |
| Progress / Continue gate | Unchanged — `skipped` already counts as complete |

## UI

- Label: **Skip**
- Placement: card footer meta row; `margin-left: auto` on wider layouts so it sits toward the bottom-right of the card
- Style: compact Material stroked / text button consistent with Collect
- Visibility: `@if (canQuickSkip(item.id))`

## Implementation

**Files**

- `src/app/steps/collect/collect.component.html` — Skip button in `node-meta`
- `src/app/steps/collect/collect.component.ts` — `canQuickSkip`, `skipActivity`
- `src/app/steps/collect/collect.component.scss` — compact footer button alignment

**API**

```ts
canQuickSkip(activityId: string): boolean
// !submitted && status in ('not_started', 'in_progress')

skipActivity(activity: EngagementPlanItem, event: Event): void
// event.stopPropagation(); updateActivityProgress(id, { status: 'skipped' })
```

No model or service API changes; `updateActivityProgress` already accepts a partial status patch.

## Testing

- Skip on a not-started card → status chip becomes Skipped; progress count increments; Skip disappears.
- Skip does not open the drawer.
- Card click still opens the drawer when Skip is present.
- Done / Skipped / submitted cards do not show Skip.
- Skipping all remaining activities unlocks Continue to solutions.
