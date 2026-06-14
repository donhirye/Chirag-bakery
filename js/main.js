(function () {
  "use strict";

  const SCROLL_TARGETS = {
    menu: () => document.getElementById("menu"),
    cart: () => document.getElementById("cart-section"),
    delivery: () => document.getElementById("checkout-details"),
  };

  function formatPrice(price) {
    return Cart.formatPrice(price);
  }

  function getScrollOffset() {
    const header = document.querySelector(".site-header");
    return (header?.offsetHeight || 64) + 16;
  }

  function scrollToTarget(element) {
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function scrollToMenu() {
    scrollToTarget(SCROLL_TARGETS.menu());
  }

  function scrollToCart() {
    scrollToTarget(SCROLL_TARGETS.cart());
  }

  function scrollToDeliveryDetails() {
    const heading = SCROLL_TARGETS.delivery();
    scrollToTarget(heading);
    if (heading) {
      heading.classList.add("checkout-details--highlight");
      setTimeout(() => heading.classList.remove("checkout-details--highlight"), 1200);
    }
    setTimeout(() => {
      document.getElementById("customer-name")?.focus({ preventScroll: true });
    }, 450);
  }

  function updateProductBadges() {
    document.querySelectorAll("[data-product-id]").forEach((card) => {
      const id = card.dataset.productId;
      const qty = Cart.getQuantity(id);
      let badge = card.querySelector(".product-qty-badge");

      if (qty > 0) {
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "product-qty-badge";
          badge.setAttribute("aria-label", "Quantity in order");
          card.querySelector(".product-visual")?.appendChild(badge);
        }
        badge.textContent = qty;
        badge.hidden = false;
      } else if (badge) {
        badge.hidden = true;
      }
    });
  }

  function updateCartActions(hasItems) {
    const cartActions = document.getElementById("cart-actions");
    if (cartActions) {
      cartActions.hidden = !hasItems;
    }
  }

  function updateNavCartLabel() {
    const navCart = document.getElementById("nav-cart");
    if (!navCart) return;
    const itemCount = Cart.getItems().reduce((sum, { quantity }) => sum + quantity, 0);
    navCart.textContent = itemCount > 0 ? `Cart (${itemCount})` : "Cart";
  }

  function renderCart() {
    const cartEl = document.getElementById("order-cart");
    if (!cartEl) return;

    const items = Cart.getItems();

    if (!items.length) {
      cartEl.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <a href="#menu" class="cart-empty-link">Browse the menu</a>
        </div>
      `;
      updateCartActions(false);
      return;
    }

    const rows = items
      .map(
        ({ product, quantity }) => `
      <div class="cart-row" data-cart-id="${product.id}">
        <div class="cart-row-info">
          <span class="cart-row-emoji" aria-hidden="true">${product.emoji}</span>
          <div class="cart-row-text">
            <span class="cart-row-name">${product.name}</span>
            <span class="cart-row-unit">${formatPrice(product.price)} each</span>
          </div>
        </div>
        <div class="cart-row-controls">
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-qty-action="decrease" data-product-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
            <span class="qty-value" aria-live="polite">${quantity}</span>
            <button type="button" class="qty-btn" data-qty-action="increase" data-product-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
          </div>
          <span class="cart-row-total">${formatPrice(product.price * quantity)}</span>
          <button type="button" class="cart-remove-btn" data-remove="${product.id}" aria-label="Remove ${product.name}">Remove</button>
        </div>
      </div>
    `
      )
      .join("");

    cartEl.innerHTML = `
      <div class="cart-items">${rows}</div>
      <div class="cart-footer">
        <span class="cart-total-label">Order total</span>
        <span class="cart-total-value">${formatPrice(Cart.getTotal())}</span>
      </div>
    `;

    updateCartActions(true);

    cartEl.querySelectorAll("[data-qty-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.productId;
        const current = Cart.getQuantity(id);
        if (btn.dataset.qtyAction === "increase") {
          Cart.setQuantity(id, current + 1);
        } else {
          Cart.setQuantity(id, current - 1);
        }
      });
    });

    cartEl.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Cart.remove(btn.dataset.remove);
      });
    });
  }

  function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid || !SITE_CONFIG.products) return;

    grid.innerHTML = SITE_CONFIG.products
      .map(
        (product) => `
      <article class="product-card reveal" role="listitem" data-product-id="${product.id}">
        <div class="product-visual" aria-hidden="true">${product.emoji}</div>
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">${formatPrice(product.price)}</span>
            <button type="button" class="product-select-btn" data-select="${product.id}" aria-label="Add ${product.name} to order">
              Add to order
            </button>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    grid.querySelectorAll(".product-select-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        Cart.add(btn.dataset.select);
      });
    });

    updateProductBadges();
  }

  function renderPaymentMethods() {
    const select = document.getElementById("payment-method");
    if (!select || !SITE_CONFIG.paymentMethods) return;

    SITE_CONFIG.paymentMethods.forEach((method) => {
      const option = document.createElement("option");
      option.value = method;
      option.textContent = method;
      select.appendChild(option);
    });
  }

  function applySiteConfig() {
    const brandName = document.getElementById("brand-name");
    const heroHeadline = document.getElementById("hero-headline");
    const heroSubheadline = document.getElementById("hero-subheadline");
    const heroDescription = document.getElementById("hero-description");
    const footerBrand = document.getElementById("footer-brand");
    const footerNote = document.getElementById("footer-note");
    const year = document.getElementById("year");

    if (brandName) brandName.textContent = SITE_CONFIG.brandName;
    if (heroHeadline) heroHeadline.textContent = SITE_CONFIG.heroHeadline;
    if (heroSubheadline) heroSubheadline.textContent = SITE_CONFIG.heroSubheadline;
    if (heroDescription) heroDescription.textContent = SITE_CONFIG.heroDescription;
    if (footerBrand) footerBrand.textContent = SITE_CONFIG.brandName;
    if (footerNote) footerNote.textContent = SITE_CONFIG.footerNote;
    if (year) year.textContent = new Date().getFullYear();

    document.title = SITE_CONFIG.brandName + " — Father's Day Orders";
  }

  function resolveScrollTarget(hash) {
    const map = {
      "#menu": SCROLL_TARGETS.menu(),
      "#products": SCROLL_TARGETS.menu(),
      "#cart-section": SCROLL_TARGETS.cart(),
      "#order": SCROLL_TARGETS.cart(),
      "#checkout-details": SCROLL_TARGETS.delivery(),
    };
    return map[hash] || document.querySelector(hash);
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = resolveScrollTarget(targetId);
        if (target) {
          e.preventDefault();
          scrollToTarget(target);
        }
      });
    });

    document.querySelector("[data-scroll-top]")?.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initRevealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle("site-header--scrolled", window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initCartNavigation() {
    document.getElementById("cart-add-more")?.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToMenu();
    });

    document.getElementById("cart-checkout")?.addEventListener("click", scrollToDeliveryDetails);

    document.getElementById("cart-bar-checkout")?.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToCart();
    });
  }

  function initCartBar() {
    const bar = document.getElementById("cart-bar");
    const countEl = document.getElementById("cart-bar-count");
    const totalEl = document.getElementById("cart-bar-total");
    const cartSection = document.getElementById("cart-section");
    if (!bar || !countEl || !totalEl) return;

    function updateCartBar() {
      const itemCount = Cart.getItems().reduce((sum, { quantity }) => sum + quantity, 0);

      if (itemCount === 0) {
        bar.hidden = true;
        document.body.classList.remove("has-cart-bar");
        return;
      }

      bar.hidden = false;
      document.body.classList.add("has-cart-bar");
      countEl.textContent = itemCount === 1 ? "1 item" : itemCount + " items";
      totalEl.textContent = formatPrice(Cart.getTotal());
    }

    if (cartSection) {
      let cartInView = false;
      let deliveryInView = false;

      function syncBarVisibility() {
        bar.classList.toggle("cart-bar--at-checkout", cartInView || deliveryInView);
      }

      const observerOptions = {
        threshold: 0.2,
        rootMargin: `-${getScrollOffset()}px 0px 0px 0px`,
      };

      const cartObserver = new IntersectionObserver(([entry]) => {
        cartInView = entry.isIntersecting;
        syncBarVisibility();
      }, observerOptions);
      cartObserver.observe(cartSection);

      const deliverySection = document.getElementById("checkout-details");
      if (deliverySection) {
        const deliveryObserver = new IntersectionObserver(([entry]) => {
          deliveryInView = entry.isIntersecting;
          syncBarVisibility();
        }, observerOptions);
        deliveryObserver.observe(deliverySection);
      }
    }

    Cart.onChange(updateCartBar);
    updateCartBar();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applySiteConfig();
    renderProducts();
    renderCart();
    renderPaymentMethods();
    initCartNavigation();
    initCartBar();
    Cart.onChange(() => {
      renderCart();
      updateProductBadges();
      updateNavCartLabel();
    });
    updateNavCartLabel();
    initSmoothScroll();
    initRevealOnScroll();
    initHeaderScroll();
  });
})();
