/* Tvastra header controls.
   Keeps search/account/wishlist behavior intact, fixes the mobile menu,
   and prevents the theme cart link from navigating away when Magic Cart owns it. */
(function () {
  if (window.__tvastraPlainHeaderControls) return;
  window.__tvastraPlainHeaderControls = true;

  function isMobileNav() {
    return window.matchMedia('(max-width: 1199.98px)').matches;
  }

  function closeDesktopSubmenus() {
    document.querySelectorAll('#navbarNav .nav-item.tvastra-desktop-open').forEach(function (item) {
      item.classList.remove('tvastra-desktop-open');
    });
  }

  function openDesktopMenu(navItem) {
    if (!navItem) return false;

    document.querySelectorAll('#navbarNav .nav-item.tvastra-desktop-open').forEach(function (item) {
      if (item !== navItem) item.classList.remove('tvastra-desktop-open');
    });

    navItem.classList.toggle('tvastra-desktop-open');
    return navItem.classList.contains('tvastra-desktop-open');
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

    if (!open) {
      /* Close through Bootstrap when available, then force the final state so
         the header X always closes the drawer even if the theme is mid-toggle. */
      try {
        if (window.bootstrap && window.bootstrap.Collapse) {
          var collapse = window.bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false });
          collapse.hide();
        }
      } catch (error) {
        /* Class cleanup below is the fallback. */
      }

      panel.classList.remove('show', 'collapsing');
      panel.style.height = '';
      document.body.classList.remove('navbar-collapse-show', 'navbar-open');
      clearOpenSubmenus(panel);
    } else {
      panel.classList.add('show');
      document.body.classList.add('navbar-collapse-show', 'navbar-open');
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

  function initInsertedMenuWidgets(scope) {
    if (!scope || typeof window.Swiper === 'undefined') return;

    scope.querySelectorAll('.swiper[data-slider-options]').forEach(function (swiperElement) {
      if (swiperElement.swiper) return;

      try {
        var rawOptions = swiperElement.getAttribute('data-slider-options');
        if (!rawOptions) return;
        var options = JSON.parse(rawOptions);
        new Swiper(swiperElement, options);
      } catch (error) {
        console.warn('Tvastra mobile menu slider init failed', error);
      }
    });
  }

  function loadAjaxSubmenu(navItem) {
    return new Promise(function (resolve) {
      var wrapper = navItem && navItem.querySelector(':scope > .dropdown-menu > .sub-menu-wrapper');
      var searchUrl = navItem && navItem.getAttribute('data-searchUrl');

      if (!wrapper || !searchUrl) {
        resolve(false);
        return;
      }

      if (wrapper.children.length > 0 || wrapper.innerHTML.trim() !== '') {
        resolve(true);
        return;
      }

      var loader = navItem.querySelector(':scope > .dropdown-menu .show-loader');
      if (loader) loader.style.display = '';

      fetch(searchUrl, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Menu request failed: ' + response.status);
          return response.text();
        })
        .then(function (html) {
          wrapper.innerHTML = html;
          if (loader) loader.style.display = 'none';
          initInsertedMenuWidgets(wrapper);
          resolve(true);
        })
        .catch(function (error) {
          if (loader) loader.style.display = 'none';
          console.error('Tvastra mobile menu load failed', error);
          resolve(false);
        });
    });
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

    var navItem = arrow.closest('#navbarNav > .navbar-nav > .nav-item, #navbarNav .navbar-nav > .nav-item');
    var ajaxWrapper = navItem && navItem.querySelector(':scope > .dropdown-menu > .sub-menu-wrapper');
    var shouldWaitForAjax = !!ajaxWrapper && ajaxWrapper.children.length === 0 && ajaxWrapper.innerHTML.trim() === '';

    var open = function () {
      submenu.classList.add('open');
      item.classList.add('subopen');

      if (navItem) navItem.classList.add('active');

      document.querySelectorAll('#navbarNav .navbar-nav, #navbarNav .vertical-navbar-list').forEach(function (list) {
        list.classList.add('child-sub-open');
      });
      document.querySelectorAll('#navbarNav .mobile-language-currency').forEach(function (element) {
        element.classList.add('menu-open');
      });
    };

    if (shouldWaitForAjax) {
      open();
      loadAjaxSubmenu(navItem);
    } else {
      open();
    }

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
    if (parentArrow) {
      if (isMobileNav()) {
        if (openSubmenuFromArrow(parentArrow)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      } else if (parentArrow.classList.contains('nav-parent-arrow')) {
        var desktopItem = parentArrow.closest('.nav-item');

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (desktopItem) {
          var desktopAjaxWrapper = desktopItem.querySelector(':scope > .dropdown-menu > .sub-menu-wrapper');
          var desktopNeedsAjax = !!desktopAjaxWrapper &&
            desktopAjaxWrapper.children.length === 0 &&
            desktopAjaxWrapper.innerHTML.trim() === '';

          openDesktopMenu(desktopItem);

          if (desktopNeedsAjax) {
            loadAjaxSubmenu(desktopItem);
          }
        }
      }
      return;
    }

    var headerClose = target.closest('#navbarNav .navbar-collapse-header .menu-close');
    if (headerClose && isMobileNav()) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setMenu(false);
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

  document.addEventListener('click', function (event) {
    if (isMobileNav()) return;
    var target = event.target;
    if (!target || !target.closest) return;

    if (!target.closest('#navbarNav .nav-item.tvastra-desktop-open')) {
      closeDesktopSubmenus();
    }
  }, false);

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    setMenu(false);
    setSearch(false);
    closeDesktopSubmenus();
  });
})();