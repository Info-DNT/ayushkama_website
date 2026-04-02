/**
 * cart.js — Refactored for Enquire Now functionality
 */

(function () {
  'use strict';

  /**
   * Initialize "Enquire Now" button behavior.
   * Redirects users to the contact page instead of adding to a cart.
   */
  function initEnquireButtons() {
    document.addEventListener('click', function (e) {
      // Check if the clicked element or its parent has the 'btn-add-cart' class
      var target = e.target.closest('.btn-add-cart');
      if (target) {
        e.preventDefault();
        window.location.href = 'contact.html';
      }
    });
  }

  /* ── Init ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initEnquireButtons();
    
    // Clear any existing cart data to prevent old badges from appearing
    localStorage.removeItem('ayushkama_cart');
    
    // Ensure all cart badges are hidden
    var badges = document.querySelectorAll('#cart-count, .cart-count-badge');
    if (badges) {
      badges.forEach(function (badge) {
        badge.style.display = 'none';
      });
    }
  });

})();
