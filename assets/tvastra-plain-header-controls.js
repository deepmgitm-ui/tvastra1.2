/* Tvastra header controls.
   Keeps search/account/wishlist behavior intact, fixes the mobile menu,
   and prevents the theme cart link from navigating away when Magic Cart owns it. */
(function () {
  if (window.__tvastraPlainHeaderControls) return;
  window.__tvastraPlainHeaderControls = true;

  function isMobileNav() {
    return window.matchMedia('(max-width: 1199.98px)').matches;
  }

  function clearOpenSubmenus(panel) {
    if (!panel) return;
    panel.querySelectorAll('.sub-menu.open, .child-submenu.open').forEach(function (submenu) {
      submenu.classList.remove('open');
    });
    panel.querySelectorAll('.subopen').forEach(function (item) {
      item.classList.remove('subopen');
    });
    panel.querySelectorAll('.navbar-nav.child-sub-open, .vertical-navbar-list.child-sub-open').forEach(function (list) {
      list.classList.remove('child-sub-open');
    });
    panel.querySelectorAll('.mobile-language-currency.menu-open').forEach(function (element) {
      element.classList.remove('menu-open');
    });
  }

  function setMenu(open) {
    var panel = document.getElementById('navbarNav');
    if (!panel) return;

    panel.classList.toggle('show', open);
    document.body.classList.toggle('navbar-collapse-show', open);
    document.body.classList.toggle('navbar-open', open);

    if (!open) {
      clearOpenSubmenus(panel);
    }

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

  function openSubmenuFromArrow(arrow) {
    if (!isMobileNav()) return false;

    var item = arrow.closest('li');
    if (!item) return false;

    var submenu = Array.from(item.children).find(function (child) {
      return child.matches('.sub-menu, .child-submenu');
    });

    if (!submenu) {
      submenu = arrow.closest('.nav-item') &&
        Array.from(arrow.closest('.nav-item').children).find(function (child) {
          return child.matches('.sub-menu, .child-submenu');
        });
    }

    if (!submenu) return false;

    submenu.classList.add('open');
    item.classList.add('subopen');

    document.querySelectorAll('#navbarNav .navbar-nav, #navbarNav .vertical-navbar-list').forEach(function (list) {
      list.classList.add('child-sub-open');
    });
    document.querySelectorAll('#navbarNav .mobile-language-currency').forEach(function (element) {
      element.classList.add('menu-open');
    });

    return true;
  }

  function closeSubmenuFromBack(backButton) {
    var submenu = backButton.closest('.sub-menu, .child-submenu');
    if (!submenu) return false;

    submenu.classList.remove('open');

    var item = submenu.parentElement;
    if (item) {
      item.classList.remove('subopen');
    }

    if (!document.querySelector('#navbarNav .sub-menu.open, #navbarNav .child-submenu.open')) {
      document.querySelectorAll('#navbarNav .navbar-nav, #navbarNav .vertical-navbar-list').forEach(function (list) {
        list.classList.remove('child-sub-open');
      });
      document.querySelectorAll('#navbarNav .mobile-language-currency').forEach(function (element) {
        element.classList.remove('menu-open');
      });
    }

    return true;
  }

  /* Capture phase: own the mobile menu controls so Bootstrap/theme handlers
     cannot make the drawer toggle twice or navigate away on arrow taps. */
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

    var parentArrow = target.closest('#navbarNav .parent');
    if (parentArrow && isMobileNav()) {
      if (openSubmenuFromArrow(parentArrow)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      return;
    }

    var backButton = target.closest('#navbarNav .back-wrapper');
    if (backButton && isMobileNav()) {
      if (closeSubmenuFromBack(backButton)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
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

  /* Bubble phase: let Razorpay/Magic Cart receive the same click, but stop
     the theme's <a href="/cart"> default navigation so /cart does not open
     alongside Magic Cart. This does not stop propagation to the Magic Cart
     handler and does not affect normal "View cart" links. */
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var cartTrigger = target.closest('a.cart-icon-bubble');
    if (!cartTrigger) return;

    event.preventDefault();
  }, false);

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    setMenu(false);
    setSearch(false);
  });
})();