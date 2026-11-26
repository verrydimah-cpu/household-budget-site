'use strict';
/* Hearth & Ledger — the six pages. Each view returns HTML; bind() wires
   its controls and draws its charts after the HTML is in the page. */

const HLViews = {
  /* ---------- shared bits ---------- */
  budgetRows: function (month, limit) {
    const spent = HL.byCategory(month);
    const rows = HL_CATEGORIES.filter(function (c) { return HL.state.budgets[c] !== undefined; })
      .map(function (c) {
        const budget = HL.state.budgets[c];
        const used = spent[c] || 0;
        return { cat: c, budget: budget, spent: used, pct: budget > 0 ? used / budget : 0 };
      })
      .sort(function (a, b) { return b.pct - a.pct; });
    return limit ? rows.slice(0, limit) : rows;
  },

  progressBar: function (pct) {
    const cls = pct >= 1 ? 'over' : (pct >= 0.8 ? 'warn' : '');
    const w = Math.min(100, Math.round(pct * 100));
    return '<div class="bar"><span class="' + cls + '" style="width:' + w + '%"></span></div>';
  },

  /* ---------- Dashboard ---------- */
  dashboard: function () {
    const m = HL.state.month;
    const t = HL.totals(m);
    const rate = t.income > 0 ? Math.round((t.saved / t.income) * 100) : 0;
    const byCat = HL.byCategory(m);
    const donutEntries = Object.keys(byCat)
      .map(function (c) { return { label: c, value: byCat[c], color: HL_CAT_COLORS[c] || '#6b6257' }; })
      .sort(function (a, b) { return b.value - a.value; });
    const recent = HL.monthTx(m).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 6);
    const unpaid = HL.state.bills.filter(function (b) { return !b.paid; }).slice().sort(function (a, b) { return a.due - b.due; });
    const budgets = this.budgetRows(m, 4);

    const legend = donutEntries.map(function (e) {
      return '<li><span class="swatch" style="background:' + e.color + '"></span>' + HL_esc(e.label) + ' — ' + HL_money(e.value) + '</li>';
    }).join('');

    const budgetHtml = budgets.map(function (r) {
      const left = r.budget - r.spent;
      const tag = left < 0
        ? '<span class="pill over">' + HL_money(-left) + ' over</span>'
        : '<span class="pill under">' + HL_money(left) + ' left</span>';
      return '<div style="margin-bottom:12px"><div class="bar-row"><b>' + HL_esc(r.cat) + '</b><span>' + HL_money(r.spent) + ' of ' + HL_money(r.budget) + ' ' + tag + '</span></div>'
        + this.progressBar(r.pct) + '</div>';
    }.bind(this)).join('');

    const billHtml = unpaid.length ? unpaid.map(function (b) {
      return '<li><div class="who"><b>' + HL_esc(b.name) + '</b><span>Due Nov ' + b.due + '</span></div><span class="amt">' + HL_money(b.amount) + '</span></li>';
    }).join('') : '<li>No unpaid bills — everything is settled for November.</li>';

    const txHtml = recent.map(function (x) {
      const cls = x.amount >= 0 ? 'pos' : 'neg';
      return '<li><div class="who"><b>' + HL_esc(x.desc) + '</b><span>' + x.date + ' · ' + HL_esc(x.cat) + '</span></div><span class="amt ' + cls + '">' + HL_money(x.amount) + '</span></li>';
    }).join('');

    const goalHtml = HL.state.goals.map(function (g) {
      const pct = Math.round((g.saved / g.target) * 100);
      return '<div style="margin-bottom:12px"><div class="bar-row"><b>' + HL_esc(g.name) + '</b><span>' + HL_money(g.saved) + ' of ' + HL_money(g.target) + ' (' + pct + '%)</span></div>'
        + this.progressBar(g.saved / g.target) + '</div>';
    }.bind(this)).join('');

    return '' +
      '<div class="page-head"><div><h1>Good evening, Harper household</h1>' +
      '<p class="lede">November is tracking well — you have saved ' + HL_money(t.saved) + ' so far this month.</p></div>' +
      '<div class="month-pick"><label for="monthPick">Month</label>' +
      '<select id="monthPick"><option value="2026-10"' + (m === '2026-10' ? ' selected' : '') + '>October 2026</option>' +
      '<option value="2026-11"' + (m === '2026-11' ? ' selected' : '') + '>November 2026</option></select></div></div>' +

      '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card"><h2>Income</h2><div class="big pos">' + HL_money(t.income) + '</div><p class="muted">Paycheck, freelance and refunds in ' + HL_monthLabel(m) + '.</p></div>' +
      '<div class="card"><h2>Spending</h2><div class="big neg">' + HL_money(t.spending) + '</div><p class="muted">Across ' + donutEntries.length + ' categories in ' + HL_monthLabel(m) + '.</p></div>' +
      '<div class="card"><h2>Saved</h2><div class="big">' + HL_money(t.saved) + ' <small>· ' + rate + '% of income</small></div><p class="muted">On pace for a ' + HL_money(t.saved * 12) + ' year at this rate.</p></div>' +
      '</div>' +

      '<div class="grid grid-2" style="margin-bottom:16px">' +
      '<div class="card"><h2>Where the money went <span class="muted">' + HL_monthLabel(m) + '</span></h2>' +
      '<div class="donut-wrap"><canvas id="donut" width="260" height="260"></canvas>' +
      '<ul class="legend">' + legend + '</ul></div></div>' +
      '<div class="card"><h2>Budget watch</h2>' + budgetHtml +
      '<p><a href="#/budgets">See all budgets &rarr;</a></p></div>' +
      '</div>' +

      '<div class="grid grid-3">' +
      '<div class="card"><h2>Upcoming bills</h2><ul class="list">' + billHtml + '</ul><p><a href="#/bills">Manage bills &rarr;</a></p></div>' +
      '<div class="card"><h2>Recent transactions</h2><ul class="list">' + txHtml + '</ul><p><a href="#/transactions">All transactions &rarr;</a></p></div>' +
      '<div class="card"><h2>Savings goals</h2>' + goalHtml + '<p><a href="#/goals">Add funds &rarr;</a></p></div>' +
      '</div>';
  },

  dashboardBind: function () {
    const m = HL.state.month;
    const byCat = HL.byCategory(m);
    const entries = Object.keys(byCat)
      .map(function (c) { return { label: c, value: byCat[c], color: HL_CAT_COLORS[c] || '#6b6257' }; })
      .sort(function (a, b) { return b.value - a.value; });
    const t = HL.totals(m);
    HLCharts.donut(document.getElementById('donut'), entries, 'spent', HL_money(t.spending));
    const pick = document.getElementById('monthPick');
    if (pick) pick.addEventListener('change', function () {
      HL.state.month = pick.value;
      HL.save();
      HLRouter.render();
    });
  },

  /* ---------- Transactions ---------- */
  _txFilter: { cat: 'all', q: '' },

  transactions: function () {
    const f = this._txFilter;
    const catOptions = ['<option value="all">All categories</option>']
      .concat(HL_CATEGORIES.concat(HL_INCOME_CATS).map(function (c) {
        return '<option value="' + HL_esc(c) + '"' + (f.cat === c ? ' selected' : '') + '>' + HL_esc(c) + '</option>';
      })).join('');
    const allCats = HL_CATEGORIES.concat(HL_INCOME_CATS).map(function (c) {
      return '<option value="' + HL_esc(c) + '">' + HL_esc(c) + '</option>';
    }).join('');

    const q = f.q.trim().toLowerCase();
    const rows = HL.state.transactions.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .filter(function (t) {
        if (f.cat !== 'all' && t.cat !== f.cat) return false;
        if (q && (t.desc.toLowerCase().indexOf(q) === -1 && t.cat.toLowerCase().indexOf(q) === -1)) return false;
        return true;
      });
    const shownOut = rows.reduce(function (s, t) { return s + (t.amount < 0 ? -t.amount : 0); }, 0);
    const shownIn = rows.reduce(function (s, t) { return s + (t.amount > 0 ? t.amount : 0); }, 0);

    const body = rows.length ? rows.map(function (t) {
      const cls = t.amount >= 0 ? 'pos' : 'neg';
      return '<tr><td>' + t.date + '</td><td>' + HL_esc(t.desc) + '</td>' +
        '<td><span class="cat-dot" style="background:' + (HL_CAT_COLORS[t.cat] || '#6b6257') + '"></span>' + HL_esc(t.cat) + '</td>' +
        '<td class="num ' + cls + '">' + HL_money(t.amount) + '</td>' +
        '<td class="num"><button class="ghost small" data-action="delete-tx" data-id="' + t.id + '">Delete</button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="empty">No transactions match this filter.</td></tr>';

    return '' +
      '<div class="page-head"><div><h1>Transactions</h1><p class="lede">Every dollar in and out, October and November 2026. Add your own below — it saves in this browser.</p></div></div>' +
      '<div class="card" style="margin-bottom:16px"><h2>Add a transaction</h2>' +
      '<form class="add" id="addTx">' +
      '<div><label for="fDate">Date</label><input id="fDate" type="date" value="2026-11-26" required></div>' +
      '<div class="span2"><label for="fDesc">Description</label><input id="fDesc" type="text" placeholder="e.g. Weekly shop — GreenMart" maxlength="80" required></div>' +
      '<div><label for="fCat">Category</label><select id="fCat">' + allCats + '</select></div>' +
      '<div><label for="fType">Type</label><select id="fType"><option value="expense">Expense</option><option value="income">Income</option></select></div>' +
      '<div><label for="fAmt">Amount (USD)</label><input id="fAmt" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>' +
      '<div><button type="submit">Add</button></div>' +
      '</form></div>' +
      '<div class="card"><h2>All transactions <span class="muted">' + rows.length + ' shown · in ' + HL_money(shownIn) + ' · out ' + HL_money(shownOut) + '</span></h2>' +
      '<div class="filters"><div><label for="fFilterCat">Category</label><select id="fFilterCat">' + catOptions + '</select></div>' +
      '<div><label for="fSearch">Search</label><input id="fSearch" type="search" placeholder="Search description or category" value="' + HL_esc(f.q) + '"></div></div>' +
      '<div style="overflow-x:auto"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th class="num">Action</th></tr></thead><tbody>' + body + '</tbody></table></div></div>';
  },

  transactionsBind: function () {
    const self = this;
    const form = document.getElementById('addTx');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const amt = parseFloat(document.getElementById('fAmt').value);
      const type = document.getElementById('fType').value;
      if (!amt || amt <= 0) return;
      HL.addTransaction({
        date: document.getElementById('fDate').value,
        desc: document.getElementById('fDesc').value.trim(),
        cat: document.getElementById('fCat').value,
        amount: type === 'income' ? Math.abs(amt) : -Math.abs(amt)
      });
      HLRouter.render();
    });
    const fc = document.getElementById('fFilterCat');
    if (fc) fc.addEventListener('change', function () { self._txFilter.cat = fc.value; HLRouter.render(); });
    const fs = document.getElementById('fSearch');
    if (fs) fs.addEventListener('input', function () { self._txFilter.q = fs.value; HLRouter.render(); });
  },

  /* ---------- Budgets ---------- */
  budgets: function () {
    const m = HL.state.month;
    const rows = this.budgetRows(m);
    const totalBudget = rows.reduce(function (s, r) { return s + r.budget; }, 0);
    const totalSpent = rows.reduce(function (s, r) { return s + r.spent; }, 0);
    const html = rows.map(function (r) {
      const left = r.budget - r.spent;
      const tag = left < 0
        ? '<span class="pill over">' + HL_money(-left) + ' over budget</span>'
        : '<span class="pill under">' + HL_money(left) + ' remaining</span>';
      return '<div class="card"><h2>' + HL_esc(r.cat) + ' ' + tag + '</h2>' +
        '<div class="bar-row"><span>Spent <b>' + HL_money(r.spent) + '</b></span><span>Budget <b>' + HL_money(r.budget) + '</b> · ' + Math.round(r.pct * 100) + '%</span></div>' +
        this.progressBar(r.pct) +
        '<div class="inline-form" style="margin-top:10px"><label for="b-' + HL_esc(r.cat) + '" style="margin:0">Monthly budget</label>' +
        '<input id="b-' + HL_esc(r.cat) + '" type="number" min="0" step="1" value="' + r.budget + '">' +
        '<button class="ghost small" data-action="save-budget" data-cat="' + HL_esc(r.cat) + '">Save</button></div></div>';
    }.bind(this)).join('');

    return '' +
      '<div class="page-head"><div><h1>Budgets — ' + HL_monthLabel(m) + '</h1>' +
      '<p class="lede">Monthly limits for the categories you control. Rent is fixed, so it is tracked in bills instead.</p></div></div>' +
      '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card"><h2>Total budgeted</h2><div class="big">' + HL_money(totalBudget) + '</div><p class="muted">Across ' + rows.length + ' categories.</p></div>' +
      '<div class="card"><h2>Total spent</h2><div class="big neg">' + HL_money(totalSpent) + '</div><p class="muted">' + Math.round((totalSpent / totalBudget) * 100) + '% of the plan used.</p></div>' +
      '<div class="card"><h2>Still available</h2><div class="big pos">' + HL_money(totalBudget - totalSpent) + '</div><p class="muted">' + (totalBudget - totalSpent >= 0 ? 'Room to breathe this month.' : 'Over the plan — see the red flags above.') + '</p></div>' +
      '</div>' +
      '<div class="grid grid-2">' + html + '</div>';
  },

  budgetsBind: function () { /* save buttons handled by the global action handler */ },

  /* ---------- Goals ---------- */
  goals: function () {
    const totalSaved = HL.state.goals.reduce(function (s, g) { return s + g.saved; }, 0);
    const totalTarget = HL.state.goals.reduce(function (s, g) { return s + g.target; }, 0);
    const html = HL.state.goals.map(function (g) {
      const pct = Math.round((g.saved / g.target) * 100);
      const toGo = g.target - g.saved;
      return '<div class="card"><h2>' + HL_esc(g.name) + '</h2>' +
        '<p class="muted">' + HL_esc(g.note) + '</p>' +
        '<div class="big">' + HL_money(g.saved) + ' <small>of ' + HL_money(g.target) + ' · ' + pct + '%</small></div>' +
        this.progressBar(g.saved / g.target) +
        '<p class="muted">' + (toGo > 0 ? HL_money(toGo) + ' to go.' : 'Goal reached — nicely done.') + '</p>' +
        '<div class="inline-form"><label for="g-' + g.id + '" style="margin:0">Add funds</label>' +
        '<input id="g-' + g.id + '" type="number" min="1" step="1" placeholder="50">' +
        '<button data-action="add-funds" data-id="' + g.id + '">Add</button></div></div>';
    }.bind(this)).join('');

    return '' +
      '<div class="page-head"><div><h1>Savings goals</h1><p class="lede">Three things the household is saving for, with real money already set aside.</p></div></div>' +
      '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card"><h2>Total saved</h2><div class="big pos">' + HL_money(totalSaved) + '</div><p class="muted">Across all three goals.</p></div>' +
      '<div class="card"><h2>Combined target</h2><div class="big">' + HL_money(totalTarget) + '</div><p class="muted">' + Math.round((totalSaved / totalTarget) * 100) + '% of the way there.</p></div>' +
      '<div class="card"><h2>Emergency fund</h2><div class="big">' + HL_money(HL.state.goals[0].saved) + '</div><p class="muted">Covers about two months of rent and groceries.</p></div>' +
      '</div>' +
      '<div class="grid grid-2">' + html + '</div>';
  },

  goalsBind: function () { /* add-funds handled by the global action handler */ },

  /* ---------- Bills ---------- */
  bills: function () {
    const unpaid = HL.state.bills.filter(function (b) { return !b.paid; });
    const dueTotal = unpaid.reduce(function (s, b) { return s + b.amount; }, 0);
    const paidTotal = HL.state.bills.filter(function (b) { return b.paid; }).reduce(function (s, b) { return s + b.amount; }, 0);
    const sorted = HL.state.bills.slice().sort(function (a, b) { return a.due - b.due; });
    const html = sorted.map(function (b) {
      const tag = b.paid ? '<span class="pill paid">Paid</span>' : '<span class="pill due">Due Nov ' + b.due + '</span>';
      const btn = b.paid
        ? '<button class="ghost small" data-action="toggle-bill" data-id="' + b.id + '">Mark unpaid</button>'
        : '<button class="small" data-action="toggle-bill" data-id="' + b.id + '">Mark paid</button>';
      return '<li><div class="who"><b>' + HL_esc(b.name) + ' ' + tag + '</b><span>Due the ' + b.due + 'th of each month</span></div>' +
        '<span style="display:flex;gap:10px;align-items:center"><span class="amt">' + HL_money(b.amount) + '</span>' + btn + '</span></li>';
    }).join('');

    return '' +
      '<div class="page-head"><div><h1>Bills — November 2026</h1><p class="lede">The recurring bills, in due-date order. Tap “Mark paid” when the money leaves the account.</p></div></div>' +
      '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card"><h2>Still to pay</h2><div class="big neg">' + HL_money(dueTotal) + '</div><p class="muted">' + unpaid.length + ' of ' + HL.state.bills.length + ' bills unpaid.</p></div>' +
      '<div class="card"><h2>Already paid</h2><div class="big pos">' + HL_money(paidTotal) + '</div><p class="muted">Rent, power and internet are settled.</p></div>' +
      '<div class="card"><h2>Monthly total</h2><div class="big">' + HL_money(dueTotal + paidTotal) + '</div><p class="muted">Recurring bills, every month.</p></div>' +
      '</div>' +
      '<div class="card"><h2>All recurring bills</h2><ul class="list">' + html + '</ul></div>';
  },

  billsBind: function () { /* toggles handled by the global action handler */ },

  /* ---------- Reports ---------- */
  reports: function () {
    const oct = HL.totals('2026-10');
    const nov = HL.totals('2026-11');
    const byCat = HL.byCategory('2026-11');
    const catEntries = Object.keys(byCat)
      .map(function (c) { return { label: c, value: byCat[c], color: HL_CAT_COLORS[c] || '#6b6257' }; })
      .sort(function (a, b) { return b.value - a.value; });
    const top = catEntries[0] || { label: '—', value: 0 };
    const biggest = HL.state.transactions.slice()
      .filter(function (t) { return t.amount < 0; })
      .sort(function (a, b) { return a.amount - b.amount; })[0];
    const rateOct = oct.income > 0 ? Math.round((oct.saved / oct.income) * 100) : 0;
    const rateNov = nov.income > 0 ? Math.round((nov.saved / nov.income) * 100) : 0;
    const dining = (HL.byCategory('2026-11')['Dining Out'] || 0);
    const diningBudget = HL.state.budgets['Dining Out'] || 0;
    const groceries = (HL.byCategory('2026-11')['Groceries'] || 0);

    const insights = [
      '<b>Groceries dominate November.</b> ' + HL_money(groceries) + ' on food — ' + Math.round((groceries / nov.spending) * 100) + '% of all spending, and the Thanksgiving shop on the 25th is the month\u2019s biggest food bill.',
      '<b>Savings improved.</b> The household saved ' + rateNov + '% of income in November, up from ' + rateOct + '% in October — an extra ' + HL_money(nov.saved - oct.saved) + ' kept.',
      '<b>Biggest single expense.</b> ' + HL_esc(biggest.desc) + ' at ' + HL_money(-biggest.amount) + ' on ' + biggest.date + '. Rent is the fixed anchor; everything else is adjustable.',
      '<b>Dining out is under control.</b> ' + HL_money(dining) + ' against a ' + HL_money(diningBudget) + ' budget — ' + (dining <= diningBudget ? 'inside the plan with room to spare.' : 'over the plan; one fewer takeout a week would fix it.'),
      '<b>Top category overall.</b> ' + HL_esc(top.label) + ' at ' + HL_money(top.value) + ' in November. Watch it first if December needs trimming.'
    ].map(function (s) { return '<p class="insight">' + s + '</p>'; }).join('');

    const catRows = catEntries.map(function (e) {
      const pct = Math.round((e.value / catEntries[0].value) * 100);
      return '<div style="margin-bottom:12px"><div class="bar-row"><b>' + HL_esc(e.label) + '</b><span>' + HL_money(e.value) + '</span></div>' +
        '<div class="bar"><span style="width:' + pct + '%;background:' + e.color + '"></span></div></div>';
    }).join('');

    return '' +
      '<div class="page-head"><div><h1>Reports</h1><p class="lede">October vs November 2026, side by side, with what the numbers actually mean.</p></div></div>' +
      '<div class="grid grid-2" style="margin-bottom:16px">' +
      '<div class="card"><h2>October vs November</h2><canvas id="compare" width="480" height="300"></canvas></div>' +
      '<div class="card"><h2>November by category</h2>' + catRows + '</div>' +
      '</div>' +
      '<div class="card"><h2>What the numbers say</h2>' + insights + '</div>';
  },

  reportsBind: function () {
    const oct = HL.totals('2026-10');
    const nov = HL.totals('2026-11');
    HLCharts.compare(
      document.getElementById('compare'),
      [
        { label: 'Income', a: oct.income, b: nov.income },
        { label: 'Spending', a: oct.spending, b: nov.spending },
        { label: 'Saved', a: oct.saved, b: nov.saved }
      ],
      ['October 2026', 'November 2026'],
      ['#4a7a96', '#c05621']
    );
  }
};
