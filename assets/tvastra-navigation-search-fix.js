/*
 * TVASTRA - isolated mobile navigation/search fix.
 * Keeps the existing Razorpay Magic Cart/cart implementation untouched.
 */
(function () {
  if (window.__tvastraNavigationSearchFix) return;
  window.__tvastraNavigationSearchFix = true;

  function closeMobileMenu() {
    var nav = document.querySelector('#navbarNav');
    var body = document.body;
    if (nav) nav.classList.remove('show');
    body.classList.remove('navbar-collapse-show', 'navbar-open');
    var togglers = document.querySelectorAll('.navbar-toggler.toggle-mobile');
    togglers.forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleMobileMenu(button) {
    var selector = button.getAttribute('data-bs-target') || '#navbarNav';
    var nav = document.querySelector(selector);
    if (!nav) return;

    var isOpen = nav.classList.contains('show');

    // Prefer Bootstrap's real collapse API so its state/events stay in sync.
    try {
      if (window.bootstrap && window.bootstrap.Collapse) {
        var collapse = window.bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
        if (isOpen) {
          collapse.hide();
        } else {
          collapse.show();
        }
        button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        return;
      }
    } catch (error) {
      // Fall back to the theme's class-based mobile drawer below.
    }

    if (isOpen) {
      closeMobileMenu();
      return;
    }

    nav.classList.add('show');
    document.body.classList.add('navbar-collapse-show', 'navbar-open');
    button.setAttribute('aria-expanded', 'true');
  }

  function toggleSearch() {
    var body = document.body;
    var opening = !body.classList.contains('active-search');

    if (opening) {
      closeMobileMenu();
      body.classList.add('active-search');
      window.setTimeout(function () {
        var input = document.querySelector('#minisearch-popup [data-search-input], #minisearch-popup input[name="q"]');
        if (input) input.focus();
      }, 80);
    } else {
      body.classList.remove('active-search');
    }
  }

  function closeSearch() {
    document.body.classList.remove('active-search');
  }

  function init() {
    document.addEventListener('click', function (event) {
      var menuButton = event.target.closest('.navbar-toggler.toggle-mobile');
      if (menuButton) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleMobileMenu(menuButton);
        return;
      }

      var menuClose = event.target.closest('.menu-close, .menu-overlay');
      if (menuClose) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        closeMobileMenu();
        return;
      }

      var searchTrigger = event.target.closest('[data-minisearch-trigger]');
      if (searchTrigger) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleSearch();
        return;
      }

      var searchClose = event.target.closest('.search-close, .search-overlay');
      if (searchClose) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        closeSearch();
      }
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeMobileMenu();
      closeSearch();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
