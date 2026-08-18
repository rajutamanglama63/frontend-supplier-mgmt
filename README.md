# Supplier Management — Frontend Challenge

Frontend application for creating suppliers and running a four-eyes approval workflow. There is no backend: suppliers are stored in browser `localStorage`.

## Run

```bash
cd frontend-supplier-mgmt
npm install
npm run dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

## Tests

```bash
npm test
```

Watch mode: `npm run test:watch`.

## Users

Switch the active user in the header. No login is implemented.

| User | Role | Can do |
| --- | --- | --- |
| Anna Requester | requester | Create suppliers (Save or Save draft). On a draft detail page, Save moves it to pending. |
| Max Approver | approver | Approve or reject suppliers in `PENDING_APPROVAL` |

Typical flow: stay as Anna, create a supplier with **Save** (status `PENDING_APPROVAL`) or **Save draft** (status `DRAFT`). Click a row to open the detail page. Switch to Max to approve or reject.

## Architecture

- **Pages** (`SupplierList`, `CreateSupplier`, `SupplierDetail`) own loading / empty / error UI.
- **Components** handle presentation and local form state.
- **`src/data/suppliers.ts`** is the data-access layer. Screens call these functions instead of `localStorage` or `fetch`. The same module enforces workflow rules (unique VAT ID, status transitions, four-eyes principle, mandatory rejection reason).
- **Active user** lives in React context (`UserProvider`). Workflow helpers in `src/workflow.ts` decide which actions the UI offers; the data layer still rejects invalid operations.

Data is persisted under the key `frontend-supplier-mgmt.suppliers` and survives a refresh.

## Assumptions

- Anna is the only requester and Max is the only approver, matching the challenge brief.
- **Save** stores the supplier as `PENDING_APPROVAL`. **Save draft** stores it as `DRAFT`.
- On a draft detail page, a requester sees **Save**, which updates the status to `PENDING_APPROVAL`. Approvers see Approve / Reject for pending suppliers. Requesters do not see approve/reject actions.
- VAT IDs are compared case-insensitively after trimming.
- Country is chosen from a small fixed list rather than free text.
- A short delay is applied outside tests so loading states are visible.

## Limitations / with more time

- No edit or delete for drafts.
- No filter or search on the overview table.
- `localStorage` is per-browser and can be cleared by the user; it is not shared across devices.
- Self-approval is blocked in the data layer if an approver created the supplier they are reviewing.
- No end-to-end browser tests (Playwright). Current coverage is component tests plus data-layer tests.
