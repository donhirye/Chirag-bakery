(function () {
  "use strict";

  function formatPrice(price) {
    return "$" + price.toFixed(0);
  }

  function renderProducts() {
    const grid = document.getElementById("product-grid");
    const orderItems = document.getElementById("order-items");
    if (!grid || !orderItems || !SITE_CONFIG.products) return;

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
            <button type="button" class="product-select-btn" data-select="${product.id}" aria-label="Select ${product.name}">
              Add to order
            </button>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    orderItems.innerHTML = SITE_CONFIG.products
      .map(
        (product) => `
      <label class="checkbox-card">
        <input type="checkbox" name="items" value="${product.id}" data-label="${product.name} (${formatPrice(product.price)})">
        <span class="checkbox-card-content">
          <span class="checkbox-card-emoji" aria-hidden="true">${product.emoji}</span>
          <span class="checkbox-card-text">
            <span class="checkbox-card-name">${product.name}</span>
            <span class="checkbox-card-price">${formatPrice(product.price)}</span>
          </span>
        </span>
      </label>
    `
      )
      .join("");

    grid.querySelectorAll(".product-select-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.select;
        const checkbox = orderItems.querySelector(`input[value="${id}"]`);
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
          checkbox.closest(".checkbox-card")?.classList.add("checkbox-card--highlight");
          setTimeout(() => {
            checkbox.closest(".checkbox-card")?.classList.remove("checkbox-card--highlight");
          }, 1200);
        }
      });
    });
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

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  document.addEventListener("DOMContentLoaded", () => {
    applySiteConfig();
    renderProducts();
    renderPaymentMethods();
    initSmoothScroll();
    initRevealOnScroll();
    initHeaderScroll();
  });
})();
