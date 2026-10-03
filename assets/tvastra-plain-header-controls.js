/* Tvastra plain header controls. Intentionally independent of Bootstrap/jQuery.
   Does not touch cart or checkout behavior. */
(function () {
  if (window.__tvastraPlainHeaderControls) return;
  window.__tvastraPlainHeaderControls = true;

  function setMenu(open) {
    var panel = document.getElementById('navbarNav');
    if (!panel) return;
    panel.classList.toggle('show', open);
    document.body.classList.toggle('navbar-collapse-show', open);
    document.body.classList.toggle('navbar-open', open);
    document.querySelectorAll('.navbar-toggler.toggle-mobile').forEach(function (button) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setSearch(open) {
    document.body.classList.toggle('active-search', open);
    if (open) {
      window.setTimeout(function () {
        var input = document.querySelector('#minisearch-popup input[name="q"]');
        if (input) input.focus();
      }, 100);
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var menuButton = target.closest('.navbar-toggler.toggle-mobile');
    if (menuButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var panel = document.getElementById('navbarNav');
      setMenu(!(panel && panel.classList.contains('show')));
      return;
    }

    if (target.closest('.menu-close, .menu-overlay')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setMenu(false);
      return;
    }

    if (target.closest('[data-minisearch-trigger]')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setSearch(!document.body.classList.contains('active-search'));
      return;
    }

    if (target.closest('.search-close, .search-overlay')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setSearch(false);
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenu(false);
      setSearch(false);
    }
  });
})();