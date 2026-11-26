# Hearth & Ledger — Household Budget Site

A warm, honest household budget site: one family, one ledger. Track income and
spending, set monthly budgets per category, save toward goals, keep recurring
bills in view, and read a plain-English report of what the numbers mean.

![make.fun badge](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)
![make.fun rank](https://make.fun/badge/best-household-budget-site-20261126-1457/verrydimah-cpu/household-budget-site/rank.svg)
![make.fun reward](https://make.fun/badge/best-household-budget-site-20261126-1457/verrydimah-cpu/household-budget-site/reward.svg)

Competition: https://make.fun/c/best-household-budget-site-20261126-1457

## What it does

- **Dashboard** — month selector, income / spending / saved cards, a spending-by-category donut, budget watch, upcoming bills, recent transactions, savings-goal progress.
- **Transactions** — full table with an add form, delete, filter by category and text search. Saved in localStorage.
- **Budgets** — per-category monthly limits with progress bars and editable amounts.
- **Goals** — emergency fund, family holiday and new fridge, with add-funds controls.
- **Bills** — recurring bills in due-date order with mark-paid toggles.
- **Reports** — October vs November comparison charts, category breakdown, and written insights computed from the real figures.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/ — no build step, no network calls, no
dependencies. All data stays in your browser (localStorage).

## Build the dossier

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` there.
