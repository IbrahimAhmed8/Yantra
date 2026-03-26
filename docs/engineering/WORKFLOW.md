# Workflow

## Working Rules For Contributors

- keep runtime changes separate from cleanup changes
- do not delete root assets or legacy files without explicit approval
- update docs when routes, setup, or architecture changes
- prefer small focused commits

## Safe Change Categories

### Safe now

- add docs
- improve active routes
- add features under `app/`, `lib/`, and `src/`
- refine the dashboard and landing page
- add backend routes that fit the current architecture

### Requires explicit approval

- deleting root-level artifacts
- moving design-reference assets
- removing legacy folders
- large-scale folder moves
- replacing major frameworks or providers

## Recommended Contribution Flow

1. Identify whether the task belongs to marketing, dashboard, chat, or platform foundation work.
2. Read the relevant docs file first.
3. Make the smallest clean change that advances the product.
4. Run validation when code changes are involved.
5. Update docs if the behavior or structure changed.

## Documentation Minimum

Any meaningful change should update at least one of these if relevant:

- `handoff/CURRENT_STATE.md`
- `product/OPEN_WORK.md`
- `engineering/CODEBASE_MAP.md`
- the relevant file inside `features/`

## Validation

For code changes, use:

```bash
npm run lint
npm run build
```

For docs-only changes, a full build is optional but still safe to run before a release push.
