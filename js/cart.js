/**
 * cart.js — Shared cart logic for Ayushkama
 * Uses localStorage to persist cart across pages.
 */

(function () {
  'use strict';

  var CART_KEY = 'ayushkama_cart';

  /* ── Read / Write ───────────────────────────────── */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ── CRUD operations ────────────────────────────── */
  function addToCart(id, name, image, moq) {
    var cart = getCart();
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: id, name: name, image: image, moq: moq, qty: 1 });
    }
    saveCart(cart);
    updateCartBadge();
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function (item) { return item.id !== id; });
    saveCart(cart);
    updateCartBadge();
  }

  function updateQty(id, delta) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === id; });
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      saveCart(cart);
      updateCartBadge();
    }
  }

  function getCartCount() {
    return getCart().reduce(function (total, item) { return total + item.qty; }, 0);
  }

  /* ── Badge update (runs on every page) ─────────── */
  function updateCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  /* ── Qty stepper builder ────────────────────────── */
  function buildQtyStepper(wrapper, id, name, image, moq, qty) {
    wrapper.innerHTML =
      '<div class="cart-inline-stepper" data-id="' + id + '">' +
      '<button class="stepper-btn stepper-minus">−</button>' +
      '<span class="stepper-qty">' + qty + '</span>' +
      '<button class="stepper-btn stepper-plus">+</button>' +
      '</div>';

    var stepper = wrapper.querySelector('.cart-inline-stepper');
    var qtySpan = stepper.querySelector('.stepper-qty');
    var btnMinus = stepper.querySelector('.stepper-minus');
    var btnPlus = stepper.querySelector('.stepper-plus');

    btnPlus.addEventListener('click', function () {
      addToCart(id, name, image, moq);
      var item = getCart().find(function (i) { return i.id === id; });
      qtySpan.textContent = item ? item.qty : 1;
    });

    btnMinus.addEventListener('click', function () {
      var cart = getCart();
      var item = cart.find(function (i) { return i.id === id; });
      if (!item) return;

      if (item.qty <= 1) {
        /* Remove from cart → restore original Add to Cart button */
        removeFromCart(id);
        wrapper.innerHTML =
          '<button class="btn btn-primary w-100 rounded-pill btn-add-cart"' +
          ' data-id="' + id + '"' +
          ' data-name="' + name + '"' +
          ' data-image="' + image + '"' +
          ' data-moq="' + moq + '">+ Add to Cart</button>';
        wireAddToCartBtn(wrapper.querySelector('.btn-add-cart'));
      } else {
        item.qty -= 1;
        saveCart(cart);
        updateCartBadge();
        qtySpan.textContent = item.qty;
      }
    });
  }

  /* ── Wire a single Add-to-Cart button ──────────── */
  function wireAddToCartBtn(btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var name = btn.getAttribute('data-name');
      var image = btn.getAttribute('data-image');
      var moq = btn.getAttribute('data-moq');

      addToCart(id, name, image, moq);

      /* Replace button with stepper */
      var wrapper = btn.parentNode;
      buildQtyStepper(wrapper, id, name, image, moq, 1);
    });
  }

  /* ── Wire up Add-to-Cart buttons (index.html) ───── */
  function initAddToCartButtons() {
    var buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(function (btn) {
      var id = btn.getAttribute('data-id');

      /* If product already in cart, show stepper right away */
      var existing = getCart().find(function (i) { return i.id === id; });
      if (existing) {
        var wrapper = btn.parentNode;
        buildQtyStepper(wrapper,
          btn.getAttribute('data-id'),
          btn.getAttribute('data-name'),
          btn.getAttribute('data-image'),
          btn.getAttribute('data-moq'),
          existing.qty);
        return;
      }

      wireAddToCartBtn(btn);
    });
  }


  /* ── Cart page renderer ─────────────────────────── */
  function renderCartPage() {
    var container = document.getElementById('cart-items-container');
    var emptyMsg = document.getElementById('cart-empty-msg');
    var cartTable = document.getElementById('cart-table-wrapper');
    var totalEl = document.getElementById('cart-total-count');
    if (!container) return;

    var cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (cartTable) cartTable.style.display = 'none';
      if (totalEl) totalEl.textContent = '0';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (cartTable) cartTable.style.display = 'block';

    var totalItems = 0;
    cart.forEach(function (item) {
      totalItems += item.qty;
      var row = document.createElement('tr');
      row.innerHTML =
        '<td class="align-middle">' +
        '<div class="d-flex align-items-center gap-3">' +
        '<img src="' + item.image + '" alt="' + item.name + '" class="cart-product-img rounded-3">' +
        '<div>' +
        '<p class="fw-bold mb-0 fs-6">' + item.name + '</p>' +
        '<small class="text-muted">MOQ: ' + item.moq + '</small>' +
        '</div>' +
        '</div>' +
        '</td>' +
        '<td class="align-middle">' +
        '<div class="d-flex align-items-center gap-2">' +
        '<button class="btn btn-outline-secondary btn-sm cart-qty-btn" data-id="' + item.id + '" data-delta="-1">−</button>' +
        '<span class="fw-bold px-2 cart-qty-display" data-id="' + item.id + '">' + item.qty + '</span>' +
        '<button class="btn btn-outline-secondary btn-sm cart-qty-btn" data-id="' + item.id + '" data-delta="1">+</button>' +
        '</div>' +
        '</td>' +
        '<td class="align-middle text-center">' +
        '<button class="btn btn-sm btn-danger cart-remove-btn" data-id="' + item.id + '">Remove</button>' +
        '</td>';
      container.appendChild(row);
    });

    if (totalEl) totalEl.textContent = totalItems;

    /* Wire qty and remove buttons */
    document.querySelectorAll('.cart-qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var delta = parseInt(btn.getAttribute('data-delta'), 10);
        updateQty(id, delta);
        renderCartPage();
      });
    });
    document.querySelectorAll('.cart-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(btn.getAttribute('data-id'));
        renderCartPage();
      });
    });
  }

  /* ── Init ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    initAddToCartButtons();
    renderCartPage();
  });

})();
