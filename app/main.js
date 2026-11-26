'use strict';
/* Hearth & Ledger — router, boot, and the one delegated click handler. */

const HLRouter = {
  routes: {
    '': 'dashboard',
    'transactions': 'transactions',
    'budgets': 'budgets',
    'goals': 'goals',
    'bills': 'bills',
    'reports': 'reports'
  },

  current: function () {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    return this.routes[hash] || 'dashboard';
  },

  render: function () {
    const route = this.current();
    const app = document.getElementById('app');
    app.innerHTML = HLViews[route]();
    const bind = HLViews[route + 'Bind'];
    if (typeof bind === 'function') bind.call(HLViews);
    document.querySelectorAll('#nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === (route === 'dashboard' ? '' : route));
    });
    window.scrollTo(0, 0);
  }
};

function HL_handleAction(ev) {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  if (action === 'delete-tx') {
    HL.deleteTransaction(btn.getAttribute('data-id'));
    HLRouter.render();
  } else if (action === 'toggle-bill') {
    HL.toggleBill(btn.getAttribute('data-id'));
    HLRouter.render();
  } else if (action === 'add-funds') {
    const id = btn.getAttribute('data-id');
    const input = document.getElementById('g-' + id);
    const amt = input ? parseFloat(input.value) : NaN;
    if (amt && amt > 0) {
      HL.addToGoal(id, amt);
      HLRouter.render();
    } else if (input) {
      input.focus();
    }
  } else if (action === 'save-budget') {
    const cat = btn.getAttribute('data-cat');
    const input = document.getElementById('b-' + cat);
    const amt = input ? parseFloat(input.value) : NaN;
    if (!isNaN(amt) && amt >= 0) {
      HL.setBudget(cat, amt);
      HLRouter.render();
    } else if (input) {
      input.focus();
    }
  }
}

document.addEventListener('click', HL_handleAction);
window.addEventListener('hashchange', function () { HLRouter.render(); });

HL.load();
HLRouter.render();
