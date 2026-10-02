/* TVASTRA: Shopify discount bridge for Razorpay Magic Cart
 * Lets the existing Razorpay coupon input accept Shopify discount codes.
 * Shopify remains the source of truth for discount validation and redemption.
 */
(function () {
  'use strict';

  if (window.__tvastraShopifyCouponBridgeV1) return;
  window.__tvastraShopifyCouponBridgeV1 = true;

  var MAX_CODE_LENGTH = 100;

  function rootUrl() {
    return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  }

  function isVisible(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    var style = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0;
  }

  function fieldMeta(input) {
    return [
      input.name || '',
      input.id || '',
      input.placeholder || '',
      input.getAttribute('aria-label') || '',
      input.getAttribute('autocomplete') || ''
    ].join(' ').toLowerCase();
  }

  function isCouponInput(input) {
    if (!input || input.disabled || input.type === 'hidden') return false;
    if (!isVisible(input)) return false;

    var meta = fieldMeta(input);
    if (/coupon|promo|discount|offer/.test(meta)) return true;

    var value = (input.value || '').trim();
    if (!value) return false;

    // Fallback for Razorpay's visually-labelled coupon field when
    // the external widget does not expose a semantic input name.
    var parentText = '';
    var node = input.parentElement;
    for (var i = 0; i < 5 && node; i += 1, node = node.parentElement) {
      parentText += ' ' + (node.innerText || '');
    }
    parentText = parentText.toLowerCase();

    return /coupon|discount|promo|offers/.test(parentText) &&
      !/search|email|phone|mobile|address/.test(meta);
  }

  function findCouponInput(button, eventPath) {
    var path = Array.isArray(eventPath) ? eventPath : [];

    for (var i = 0; i < path.length; i += 1) {
      var item = path[i];
      if (item instanceof HTMLInputElement && isCouponInput(item) && (item.value || '').trim()) {
        return item;
      }
    }

    var node = button;
    for (var depth = 0; depth < 8 && node; depth += 1) {
      if (node.querySelectorAll) {
        var inputs = Array.prototype.slice.call(node.querySelectorAll('input'));
        for (var j = 0; j < inputs.length; j += 1) {
          if (isCouponInput(inputs[j]) && (inputs[j].value || '').trim()) {
            return inputs[j];
          }
        }
      }
      node = node.parentElement;
    }

    return null;
  }

  function getApplyButton(input) {
    var node = input;
    for (var depth = 0; depth < 6 && node; depth += 1) {
      if (node.querySelectorAll) {
        var buttons = Array.prototype.slice.call(
          node.querySelectorAll('button, [role="button"], input[type="submit"], a')
        ).filter(isVisible);

        for (var i = 0; i < buttons.length; i += 1) {
          var text = (buttons[i].innerText || buttons[i].value || '').trim().toLowerCase();
          if (text === 'apply' || text.indexOf('apply') === 0) return buttons[i];
        }
      }
      node = node.parentElement;
    }
    return null;
  }

  function setStatus(input, message, success) {
    if (!input) return;

    var host = input.parentElement;
    if (!host) return;

    var old = host.querySelector('.tvastra-shopify-coupon-status');
    if (old) old.remove();

    var status = document.createElement('div');
    status.className = 'tvastra-shopify-coupon-status';
    status.textContent = message;
    status.style.cssText = [
      'margin-top:6px',
      'font-size:12px',
      'line-height:1.35',
      'font-weight:500',
      'color:' + (success ? '#167a43' : '#b42318')
    ].join(';');

    host.appendChild(status);
  }

  function normalizeCode(value) {
    return String(value || '').trim().slice(0, MAX_CODE_LENGTH);
  }

  function applyShopifyDiscount(code, input, button) {
    var body = JSON.stringify({ discount: code });

    if (button) {
      button.dataset.tvastraShopifyApplying = 'true';
      button.setAttribute('aria-busy', 'true');
    }

    setStatus(input, 'Applying coupon…', true);

    return fetch(rootUrl() + 'cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'same-origin',
      body: body
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('Shopify cart discount request failed');
      }
      return response.json();
    }).then(function (cart) {
      window.tvastraShopifyCouponBridgeLast = {
        code: code,
        appliedAt: Date.now(),
        cart: cart
      };

      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
      document.dispatchEvent(new CustomEvent('tvastra:cart-updated', { detail: cart }));
      window.dispatchEvent(new CustomEvent('tvastra:shopify-discount-applied', {
        detail: { code: code, cart: cart }
      }));

      setStatus(input, 'Coupon applied', true);
      input.setAttribute('data-tvastra-shopify-coupon-applied', code);

      if (button) {
        button.textContent = 'Applied';
        button.disabled = false;
      }

      return cart;
    }).catch(function (error) {
      console.error('[TVASTRA] Shopify coupon bridge:', error);
      setStatus(input, 'Coupon could not be applied', false);
      throw error;
    }).finally(function () {
      if (button) {
        button.dataset.tvastraShopifyApplying = 'false';
        button.removeAttribute('aria-busy');
      }
    });
  }

  document.addEventListener('click', function (event) {
    var path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    var button = null;

    for (var i = 0; i < path.length; i += 1) {
      var item = path[i];
      if (!(item instanceof HTMLElement)) continue;

      var tag = item.tagName;
      if (tag !== 'BUTTON' && tag !== 'A' && tag !== 'INPUT') continue;

      var text = (item.innerText || item.value || '').trim().toLowerCase();
      if (text === 'apply' || text.indexOf('apply') === 0) {
        button = item;
        break;
      }
    }

    if (!button) return;

    var input = findCouponInput(button, path);
    if (!input) return;

    var code = normalizeCode(input.value);
    if (!code) return;

    // Only bridge a manually entered code associated with this Apply button.
    // Listed Razorpay coupon cards have no nearby input, so their native
    // Razorpay flow continues unchanged.
    if (button.dataset.tvastraShopifyBypass === 'true') {
      delete button.dataset.tvastraShopifyBypass;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (button.dataset.tvastraShopifyApplying === 'true') return;

    applyShopifyDiscount(code, input, button).catch(function () {
      // If Shopify rejects the code, hand control back to Razorpay's
      // native validator instead of blocking its normal coupon behaviour.
      button.dataset.tvastraShopifyBypass = 'true';
      window.setTimeout(function () {
        try {
          button.click();
        } catch (error) {}
      }, 0);
    });
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;

    var input = event.target;
    if (!(input instanceof HTMLInputElement) || !isCouponInput(input)) return;

    var button = getApplyButton(input);
    if (!button) return;

    var code = normalizeCode(input.value);
    if (!code || button.dataset.tvastraShopifyApplying === 'true') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    applyShopifyDiscount(code, input, button).catch(function () {
      button.dataset.tvastraShopifyBypass = 'true';
      window.setTimeout(function () {
        try {
          button.click();
        } catch (error) {}
      }, 0);
    });
  }, true);
})();
