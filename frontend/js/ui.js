/* ============================================================
   SkillSwap — Shared UI utilities
   Loaded on every page BEFORE page scripts.
   Provides:  window.toast(...)   window.confirmDialog(...)
              window.SkillTheme   +  legacy showNotification()
   ============================================================ */
(function () {
  'use strict';

  /* -------- THEME MANAGER -------- */
  var THEME_KEY = 'ss-theme';
  var root = document.documentElement;

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.setAttribute('data-theme', 'light');
    // keep any toggle buttons in sync
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      var ico = btn.querySelector('i');
      if (ico) {
        ico.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
    });
  }

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function set(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    apply(theme);
  }

  function toggle() { set(current() === 'dark' ? 'light' : 'dark'); }

  function init() {
    var saved = 'light';
    try {
      saved = localStorage.getItem(THEME_KEY) ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {}
    apply(saved);
    // wire toggle buttons
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-theme-toggle]');
      if (t) { e.preventDefault(); toggle(); }
    });
    // re-sync icons once DOM has toggle buttons
    apply(current());
  }

  // Apply ASAP to avoid flash (before DOMContentLoaded if possible)
  (function earlyApply() {
    var saved = 'light';
    try {
      saved = localStorage.getItem(THEME_KEY) ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {}
    root.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
  })();

  window.SkillTheme = { set: set, get: current, toggle: toggle };

  /* -------- TOAST -------- */
  function host() {
    var h = document.getElementById('ss-toast-host');
    if (!h) {
      h = document.createElement('div');
      h.id = 'ss-toast-host';
      document.body.appendChild(h);
    }
    return h;
  }

  var ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };
  var TITLES = { success: 'Success', error: 'Something went wrong', warning: 'Heads up', info: 'Notice' };

  function normalizeType(t) {
    if (t === 'danger') return 'error';
    if (['success', 'error', 'warning', 'info'].indexOf(t) === -1) return 'info';
    return t;
  }

  function toast(message, type, opts) {
    type = normalizeType(type || 'info');
    opts = opts || {};
    var el = document.createElement('div');
    el.className = 'ss-toast ' + type;
    el.setAttribute('role', 'status');
    var title = opts.title !== undefined ? opts.title : TITLES[type];
    el.innerHTML =
      '<span class="ss-toast-ico"><i class="fas ' + (ICONS[type]) + '"></i></span>' +
      '<div class="ss-toast-body">' +
        (title ? '<span class="ss-toast-title"></span>' : '') +
        '<span class="ss-toast-msg"></span>' +
      '</div>' +
      '<button class="ss-toast-close" aria-label="Dismiss">&times;</button>';
    if (title) el.querySelector('.ss-toast-title').textContent = title;
    el.querySelector('.ss-toast-msg').textContent = message == null ? '' : String(message);

    host().appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });

    var timer;
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 360);
    }
    el.querySelector('.ss-toast-close').addEventListener('click', dismiss);
    var dur = opts.duration != null ? opts.duration : (type === 'error' ? 6000 : 4200);
    if (dur > 0) timer = setTimeout(dismiss, dur);
    return { dismiss: dismiss };
  }
  window.toast = toast;

  // Legacy shim so existing showNotification(...) calls become premium toasts
  window.showNotification = function (message, type) { return toast(message, type); };

  /* -------- CONFIRM DIALOG (promise-based) -------- */
  function confirmDialog(opts) {
    if (typeof opts === 'string') opts = { message: opts };
    opts = opts || {};
    var kind = opts.kind || 'warning';   // danger | warning | info
    var icoMap = { danger: 'fa-trash-can', warning: 'fa-triangle-exclamation', info: 'fa-circle-question' };

    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'ss-modal-overlay';
      overlay.innerHTML =
        '<div class="ss-modal" role="dialog" aria-modal="true">' +
          '<div class="ss-modal-ico ' + kind + '"><i class="fas ' + (icoMap[kind] || icoMap.warning) + '"></i></div>' +
          '<h4></h4><p></p>' +
          '<div class="ss-modal-actions">' +
            '<button class="btn btn-outline-secondary ss-cancel"></button>' +
            '<button class="btn ss-ok"></button>' +
          '</div>' +
        '</div>';
      overlay.querySelector('h4').textContent = opts.title || (kind === 'danger' ? 'Are you sure?' : 'Please confirm');
      overlay.querySelector('p').textContent = opts.message || '';
      var cancelBtn = overlay.querySelector('.ss-cancel');
      var okBtn = overlay.querySelector('.ss-ok');
      cancelBtn.textContent = opts.cancelText || 'Cancel';
      okBtn.textContent = opts.confirmText || (kind === 'danger' ? 'Delete' : 'Confirm');
      okBtn.classList.add(kind === 'danger' ? 'btn-danger' : 'btn-primary');

      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('show'); });

      function close(result) {
        overlay.classList.remove('show');
        setTimeout(function () { overlay.remove(); }, 220);
        resolve(result);
      }
      okBtn.addEventListener('click', function () { close(true); });
      cancelBtn.addEventListener('click', function () { close(false); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', esc); close(false); }
      });
      setTimeout(function () { okBtn.focus(); }, 60);
    });
  }
  window.confirmDialog = confirmDialog;

  /* -------- init -------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
