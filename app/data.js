'use strict';
/* Hearth & Ledger — seed data and the little local store.
   Everything lives in localStorage; the seed below is the first-run household. */

const HL_KEY = 'hearth-ledger-v1';

const HL_CATEGORIES = [
  'Groceries', 'Rent & Housing', 'Utilities', 'Transport',
  'Dining Out', 'School & Kids', 'Health', 'Entertainment', 'Shopping'
];
const HL_INCOME_CATS = ['Salary', 'Freelance', 'Refund', 'Other income'];

const HL_CAT_COLORS = {
  'Groceries': '#2f5d3a', 'Rent & Housing': '#8a5a2b', 'Utilities': '#d9a441',
  'Transport': '#4a7a96', 'Dining Out': '#c05621', 'School & Kids': '#7a5a9e',
  'Health': '#4a9e8a', 'Entertainment': '#b3372a', 'Shopping': '#96704a',
  'Salary': '#2f5d3a', 'Freelance': '#4a7a96', 'Refund': '#7fa88a', 'Other income': '#6b6257'
};

const HL_BUDGETS_SEED = {
  'Groceries': 700, 'Dining Out': 150, 'Transport': 220, 'Entertainment': 80,
  'Shopping': 200, 'School & Kids': 250, 'Health': 150, 'Utilities': 250
};

const HL_GOALS_SEED = [
  { id: 'g1', name: 'Emergency fund', target: 5000, saved: 3250, note: 'Six months of essentials, one deposit at a time.' },
  { id: 'g2', name: 'Family holiday', target: 2400, saved: 1150, note: 'A week by the coast next summer — ferry, cottage, ice cream.' },
  { id: 'g3', name: 'New fridge', target: 1200, saved: 640, note: 'The old one hums like a lawnmower and eats power.' }
];

const HL_BILLS_SEED = [
  { id: 'b1', name: 'Rent — Maple Street', amount: 1450.00, due: 1, paid: true },
  { id: 'b2', name: 'Electric — City Power', amount: 92.15, due: 5, paid: true },
  { id: 'b3', name: 'Internet — Fiber 300', amount: 65.00, due: 12, paid: true },
  { id: 'b4', name: 'Piano lessons — Mia', amount: 120.00, due: 17, paid: false },
  { id: 'b5', name: 'Mobile — two lines', amount: 85.00, due: 18, paid: false },
  { id: 'b6', name: 'Streaming bundle', amount: 15.99, due: 18, paid: false },
  { id: 'b7', name: 'Water — City Water', amount: 54.60, due: 22, paid: false }
];

/* Amounts: negative = money out, positive = money in. */
const HL_TX_SEED = [
  /* November 2026 */
  { id: 't01', date: '2026-11-01', desc: 'Paycheck — Acme Corp', cat: 'Salary', amount: 4200.00 },
  { id: 't02', date: '2026-11-01', desc: 'Rent — Maple Street', cat: 'Rent & Housing', amount: -1450.00 },
  { id: 't03', date: '2026-11-02', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -186.40 },
  { id: 't04', date: '2026-11-03', desc: 'Electric bill — City Power', cat: 'Utilities', amount: -92.15 },
  { id: 't05', date: '2026-11-04', desc: 'Gas — Shell on 5th', cat: 'Transport', amount: -45.00 },
  { id: 't06', date: '2026-11-05', desc: 'Pizza night — Tony\u2019s', cat: 'Dining Out', amount: -38.50 },
  { id: 't07', date: '2026-11-06', desc: 'Farmers market', cat: 'Groceries', amount: -64.20 },
  { id: 't08', date: '2026-11-07', desc: 'Movie tickets — family of four', cat: 'Entertainment', amount: -32.00 },
  { id: 't09', date: '2026-11-08', desc: 'School supplies — Mia', cat: 'School & Kids', amount: -57.80 },
  { id: 't10', date: '2026-11-09', desc: 'Monthly bus pass', cat: 'Transport', amount: -60.00 },
  { id: 't11', date: '2026-11-10', desc: 'Pharmacy — cold medicine', cat: 'Health', amount: -28.90 },
  { id: 't12', date: '2026-11-11', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -172.35 },
  { id: 't13', date: '2026-11-12', desc: 'Internet — Fiber 300', cat: 'Utilities', amount: -65.00 },
  { id: 't14', date: '2026-11-13', desc: 'Lunch with friends', cat: 'Dining Out', amount: -24.75 },
  { id: 't15', date: '2026-11-14', desc: 'Freelance — logo design', cat: 'Freelance', amount: 650.00 },
  { id: 't16', date: '2026-11-14', desc: 'Winter coats — two kids', cat: 'Shopping', amount: -129.99 },
  { id: 't17', date: '2026-11-15', desc: 'Bulk pantry — Costco run', cat: 'Groceries', amount: -98.45 },
  { id: 't18', date: '2026-11-16', desc: 'Gas — Shell on 5th', cat: 'Transport', amount: -42.30 },
  { id: 't19', date: '2026-11-17', desc: 'Piano lessons — Mia', cat: 'School & Kids', amount: -120.00 },
  { id: 't20', date: '2026-11-18', desc: 'Streaming bundle', cat: 'Entertainment', amount: -15.99 },
  { id: 't21', date: '2026-11-19', desc: 'Takeout Thai — Pad Thai x2', cat: 'Dining Out', amount: -41.20 },
  { id: 't22', date: '2026-11-20', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -158.90 },
  { id: 't23', date: '2026-11-21', desc: 'Dentist copay — checkup', cat: 'Health', amount: -75.00 },
  { id: 't24', date: '2026-11-21', desc: 'Refund — returned jacket', cat: 'Refund', amount: 48.00 },
  { id: 't25', date: '2026-11-22', desc: 'Water bill — City Water', cat: 'Utilities', amount: -54.60 },
  { id: 't26', date: '2026-11-23', desc: 'Kids\u2019 shoes — sale', cat: 'Shopping', amount: -68.40 },
  { id: 't27', date: '2026-11-24', desc: 'Gas — Shell on 5th', cat: 'Transport', amount: -48.10 },
  { id: 't28', date: '2026-11-25', desc: 'Thanksgiving prep — GreenMart', cat: 'Groceries', amount: -142.75 },
  /* October 2026 */
  { id: 't29', date: '2026-10-01', desc: 'Paycheck — Acme Corp', cat: 'Salary', amount: 4200.00 },
  { id: 't30', date: '2026-10-01', desc: 'Rent — Maple Street', cat: 'Rent & Housing', amount: -1450.00 },
  { id: 't31', date: '2026-10-03', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -178.20 },
  { id: 't32', date: '2026-10-05', desc: 'Electric bill — City Power', cat: 'Utilities', amount: -88.40 },
  { id: 't33', date: '2026-10-07', desc: 'Gas — Shell on 5th', cat: 'Transport', amount: -52.00 },
  { id: 't34', date: '2026-10-09', desc: 'Dinner out — Bistro Verde', cat: 'Dining Out', amount: -44.60 },
  { id: 't35', date: '2026-10-10', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -165.75 },
  { id: 't36', date: '2026-10-12', desc: 'School field trip — Mia', cat: 'School & Kids', amount: -89.00 },
  { id: 't37', date: '2026-10-15', desc: 'Freelance — flyer design', cat: 'Freelance', amount: 420.00 },
  { id: 't38', date: '2026-10-16', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -151.30 },
  { id: 't39', date: '2026-10-18', desc: 'Concert tickets — local band', cat: 'Entertainment', amount: -58.00 },
  { id: 't40', date: '2026-10-20', desc: 'Pharmacy — vitamins', cat: 'Health', amount: -35.50 },
  { id: 't41', date: '2026-10-22', desc: 'Internet — Fiber 300', cat: 'Utilities', amount: -61.25 },
  { id: 't42', date: '2026-10-24', desc: 'Weekly shop — GreenMart', cat: 'Groceries', amount: -169.80 },
  { id: 't43', date: '2026-10-26', desc: 'Gas — Shell on 5th', cat: 'Transport', amount: -47.60 },
  { id: 't44', date: '2026-10-28', desc: 'Lunch — work canteen', cat: 'Dining Out', amount: -36.90 },
  { id: 't45', date: '2026-10-30', desc: 'Winter boots — sale', cat: 'Shopping', amount: -94.25 },
  { id: 't46', date: '2026-10-31', desc: 'Halloween groceries', cat: 'Groceries', amount: -122.40 }
];

function HL_seedState() {
  return {
    month: '2026-11',
    transactions: HL_TX_SEED.slice(),
    budgets: Object.assign({}, HL_BUDGETS_SEED),
    goals: HL_GOALS_SEED.map(function (g) { return Object.assign({}, g); }),
    bills: HL_BILLS_SEED.map(function (b) { return Object.assign({}, b); })
  };
}

const HL = {
  state: null,

  load: function () {
    try {
      const raw = window.localStorage.getItem(HL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions)) { this.state = parsed; return this.state; }
      }
    } catch (e) { /* corrupted storage: fall through to seed */ }
    this.state = HL_seedState();
    this.save();
    return this.state;
  },

  save: function () {
    try { window.localStorage.setItem(HL_KEY, JSON.stringify(this.state)); } catch (e) { /* storage full or blocked */ }
  },

  reset: function () { this.state = HL_seedState(); this.save(); },

  monthOf: function (dateStr) { return dateStr.slice(0, 7); },

  monthTx: function (month) {
    return this.state.transactions.filter(function (t) { return HL.monthOf(t.date) === month; });
  },

  totals: function (month) {
    let income = 0, spending = 0;
    this.monthTx(month).forEach(function (t) {
      if (t.amount >= 0) income += t.amount; else spending += -t.amount;
    });
    return { income: income, spending: spending, saved: income - spending };
  },

  byCategory: function (month) {
    const out = {};
    this.monthTx(month).forEach(function (t) {
      if (t.amount < 0 && HL_CATEGORIES.indexOf(t.cat) !== -1) {
        out[t.cat] = (out[t.cat] || 0) + -t.amount;
      }
    });
    return out;
  },

  addTransaction: function (tx) {
    tx.id = 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    this.state.transactions.push(tx);
    this.state.transactions.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    this.save();
    return tx;
  },

  deleteTransaction: function (id) {
    this.state.transactions = this.state.transactions.filter(function (t) { return t.id !== id; });
    this.save();
  },

  setBudget: function (cat, amount) {
    this.state.budgets[cat] = Math.max(0, amount);
    this.save();
  },

  addToGoal: function (id, amount) {
    const goal = this.state.goals.find(function (g) { return g.id === id; });
    if (!goal) return;
    goal.saved = Math.min(goal.target, Math.max(0, goal.saved + amount));
    this.save();
  },

  toggleBill: function (id) {
    const bill = this.state.bills.find(function (b) { return b.id === id; });
    if (!bill) return;
    bill.paid = !bill.paid;
    this.save();
  }
};

function HL_money(n) {
  const sign = n < 0 ? '−' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function HL_monthLabel(month) {
  const parts = month.split('-');
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
}

function HL_esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
