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
    // Nav cart removed; kept as no-op for cart update hook.
  }

  function getProductImages(product) {
    if (product.images && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }

  function productVisualHtml(product) {
    const images = getProductImages(product);
    if (!images.length) return product.emoji || "";

    if (product.items && product.items.length) {
      return `<button type="button" class="product-image-btn product-image-btn--open-menu" aria-label="View ${product.name} options">
        <img class="product-image" src="${images[0]}" alt="${product.name}" loading="lazy">
      </button>`;
    }

    if (images.length === 1) {
      const set = JSON.stringify(images);
      return `<button type="button" class="product-image-btn" data-lightbox-set='${set}' data-lightbox-index="0" aria-label="Enlarge ${product.name}">
        <img class="product-image" src="${images[0]}" alt="${product.name}" loading="lazy">
      </button>`;
    }

    const set = JSON.stringify(images);
    const slides = images
      .map(
        (src, i) => `
      <div class="product-carousel-slide${i === 0 ? " product-carousel-slide--active" : ""}" data-slide="${i}">
        <button type="button" class="product-image-btn" data-lightbox-set='${set}' data-lightbox-index="${i}" aria-label="Enlarge ${product.name} photo ${i + 1}">
          <img class="product-image" src="${src}" alt="${product.name} — photo ${i + 1}" loading="lazy">
        </button>
      </div>
    `
      )
      .join("");

    const dots = images
      .map(
        (_, i) => `
      <button type="button" class="product-carousel-dot${i === 0 ? " product-carousel-dot--active" : ""}" data-slide-to="${i}" aria-label="Show photo ${i + 1}"></button>
    `
      )
      .join("");

    return `
      <div class="product-carousel">
        <div class="product-carousel-slides">${slides}</div>
        <button type="button" class="product-carousel-arrow product-carousel-arrow--prev" aria-label="Previous photo">&#8249;</button>
        <button type="button" class="product-carousel-arrow product-carousel-arrow--next" aria-label="Next photo">&#8250;</button>
        <div class="product-carousel-dots">${dots}</div>
      </div>
    `;
  }

  function cartItemVisualHtml(product) {
    const images = getProductImages(product);
    const src = images[0];
    if (src) {
      return `<img class="cart-row-image" src="${src}" alt="" loading="lazy">`;
    }
    return `<span class="cart-row-emoji" aria-hidden="true">${product.emoji || ""}</span>`;
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
          ${cartItemVisualHtml(product)}
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

  function ingredientsAllergensPanelsHtml() {
    const data = SITE_CONFIG.ingredientsAllergens;
    if (!data) return "";

    const ingredientsHtml = (data.ingredients || [])
      .map(
        (item) => `
        <div class="ia-panel-item">
          <h4 class="ia-panel-item-title">${item.name}</h4>
          <p class="ia-panel-item-text">${item.list}</p>
        </div>
      `
      )
      .join("");

    const containsHtml = (data.contains || [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    const mayContainHtml = (data.mayContain || [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    const disclosureHtml = (data.allergenDisclosure || [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    return `
      <div class="ia-panels">
        <section class="ia-panel ia-panel--ingredients" aria-labelledby="ia-ingredients-heading">
          <h3 class="ia-panel-title" id="ia-ingredients-heading">Ingredients</h3>
          <div class="ia-panel-body">${ingredientsHtml}</div>
        </section>
        <section class="ia-panel ia-panel--allergens" aria-labelledby="ia-allergens-heading">
          <h3 class="ia-panel-title" id="ia-allergens-heading">Allergens</h3>
          <div class="ia-panel-body">
            <p class="ia-summary">${data.summary || ""}</p>
            <div class="ia-allergen-group">
              <h4 class="ia-allergen-label">Contains</h4>
              <ul class="ia-allergen-list">${containsHtml}</ul>
            </div>
            <div class="ia-allergen-group">
              <h4 class="ia-allergen-label">May contain</h4>
              <ul class="ia-allergen-list">${mayContainHtml}</ul>
            </div>
            <div class="ia-allergen-group">
              <h4 class="ia-allergen-label">Allergen disclosure</h4>
              <ul class="ia-allergen-list ia-allergen-list--disclosure">${disclosureHtml}</ul>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function allergyWarningHtml(expandedId) {
    if (!SITE_CONFIG.allergyWarning) return "";

    const detailsId = expandedId || `allergy-details-${Math.random().toString(36).slice(2, 9)}`;

    return `
      <div class="allergy-warning-block" data-allergy-expand>
        <div class="allergy-warning-row">
          <p class="allergy-warning">${SITE_CONFIG.allergyWarning}</p>
          <button
            type="button"
            class="allergy-info-btn"
            aria-expanded="false"
            aria-controls="${detailsId}"
            aria-label="Show ingredients and allergens"
            title="Ingredients and allergens"
          >
            <span class="allergy-info-star" aria-hidden="true">&#9733;</span>
            <span class="allergy-info-label">more info</span>
          </button>
        </div>
        <div class="allergy-details" id="${detailsId}" hidden>
          ${ingredientsAllergensPanelsHtml()}
        </div>
      </div>
    `;
  }

  function initAllergyExpandToggles(root = document) {
    root.querySelectorAll("[data-allergy-expand]").forEach((block) => {
      const btn = block.querySelector(".allergy-info-btn");
      const details = block.querySelector(".allergy-details");
      if (!btn || !details || btn.dataset.bound === "true") return;

      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        const isOpen = !details.hidden;
        details.hidden = isOpen;
        btn.setAttribute("aria-expanded", String(!isOpen));
        block.classList.toggle("allergy-warning-block--open", !isOpen);
      });
    });
  }

  function initIngredientsAllergensBar() {
    const openBtn = document.getElementById("ingredients-allergens-open");
    const modal = document.getElementById("ingredients-allergens-modal");
    const content = document.getElementById("ingredients-allergens-content");
    if (!openBtn || !modal || !content) return;

    content.innerHTML = ingredientsAllergensPanelsHtml();

    function openModal() {
      modal.hidden = false;
      document.body.classList.add("ingredients-allergens-modal-open");
      modal.querySelector(".ingredients-allergens-close")?.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("ingredients-allergens-modal-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", openModal);

    document.body.classList.add("has-ingredients-bar");

    modal.querySelectorAll("[data-ingredients-allergens-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid || !SITE_CONFIG.products) return;

    grid.innerHTML = SITE_CONFIG.products
      .map(
        (product) => `
      <article class="product-card reveal${product.items ? " product-card--menu" : ""}" role="listitem" data-product-id="${product.id}"${product.items ? ' data-a-la-carte-open tabindex="0"' : ""}>
        <div class="product-visual">${productVisualHtml(product)}</div>
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-description-slot">
            ${product.description ? `<p class="product-description">${product.description}</p>` : ""}
          </div>
          <div class="product-footer${product.orderable === false ? " product-footer--price-only" : ""}">
            <span class="product-price">${formatPrice(product.price)}${product.id === "a-la-carte" ? " each" : ""}</span>
            ${
              product.orderable !== false
                ? `<button type="button" class="product-select-btn" data-select="${product.id}" aria-label="Add ${product.name} to order">
              Add to order
            </button>`
                : ""
            }
          </div>
          ${product.id === "bakery-box" ? allergyWarningHtml("bakery-box-allergy-details") : ""}
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

    initProductCarousels();
    initImageLightbox();
    initALaCarteModal();
    initAllergyExpandToggles(grid);
    updateProductBadges();
  }

  function getALaCarteProduct() {
    return SITE_CONFIG.products.find((product) => product.id === "a-la-carte");
  }

  function renderALaCarteModalContent() {
    const grid = document.getElementById("a-la-carte-grid");
    const product = getALaCarteProduct();
    if (!grid || !product?.items?.length) return;

    grid.innerHTML = product.items
      .map(
        (item) => `
      <article class="a-la-carte-item">
        <button type="button" class="a-la-carte-image-btn" data-lightbox-set='${JSON.stringify([item.image])}' data-lightbox-index="0" aria-label="Enlarge ${item.name}">
          <img class="a-la-carte-image" src="${item.image}" alt="${item.name}" loading="lazy">
        </button>
        <p class="a-la-carte-item-name">${item.name}</p>
        <button type="button" class="btn btn-primary a-la-carte-add-btn" data-select="${item.id}">${formatPrice(item.price)} Add to Order</button>
      </article>
    `
      )
      .join("");

    grid.querySelectorAll(".a-la-carte-add-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        Cart.add(btn.dataset.select);
      });
    });

    initImageLightbox();

    const allergyEl = document.getElementById("a-la-carte-allergy-warning");
    if (allergyEl) {
      if (SITE_CONFIG.allergyWarning) {
        allergyEl.innerHTML = allergyWarningHtml("a-la-carte-allergy-details");
        allergyEl.hidden = false;
        initAllergyExpandToggles(allergyEl);
      } else {
        allergyEl.innerHTML = "";
        allergyEl.hidden = true;
      }
    }
  }

  function initALaCarteModal() {
    const modal = document.getElementById("a-la-carte-modal");
    if (!modal) return;

    renderALaCarteModalContent();

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      modal.querySelector(".a-la-carte-close")?.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-a-la-carte-open]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".product-select-btn")) return;
        e.preventDefault();
        openModal();
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal();
        }
      });
    });

    modal.querySelectorAll("[data-a-la-carte-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function initProductCarousels() {
    document.querySelectorAll(".product-carousel").forEach((carousel) => {
      const slides = carousel.querySelectorAll(".product-carousel-slide");
      const dots = carousel.querySelectorAll(".product-carousel-dot");
      const prevBtn = carousel.querySelector(".product-carousel-arrow--prev");
      const nextBtn = carousel.querySelector(".product-carousel-arrow--next");
      if (!slides.length) return;

      let current = 0;

      function goTo(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.classList.toggle("product-carousel-slide--active", i === current);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle("product-carousel-dot--active", i === current);
        });
      }

      prevBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(current - 1);
      });

      nextBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(current + 1);
      });

      dots.forEach((dot) => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          goTo(Number(dot.dataset.slideTo));
        });
      });
    });
  }

  let lightboxInitialized = false;
  let lightboxImages = [];
  let lightboxIndex = 0;
  let lightboxAlt = "";

  function initImageLightbox() {
    const modal = document.getElementById("image-lightbox");
    const lightboxImg = document.getElementById("image-lightbox-img");
    const prevBtn = document.getElementById("image-lightbox-prev");
    const nextBtn = document.getElementById("image-lightbox-next");
    const dotsEl = document.getElementById("image-lightbox-dots");
    if (!modal || !lightboxImg || !prevBtn || !nextBtn || !dotsEl) return;

    function updateLightboxView() {
      const src = lightboxImages[lightboxIndex];
      if (!src) return;

      lightboxImg.src = src;
      lightboxImg.alt = lightboxAlt
        ? `${lightboxAlt} — photo ${lightboxIndex + 1} of ${lightboxImages.length}`
        : "";

      const hasMultiple = lightboxImages.length > 1;
      prevBtn.hidden = !hasMultiple;
      nextBtn.hidden = !hasMultiple;
      dotsEl.hidden = !hasMultiple;

      if (hasMultiple) {
        dotsEl.innerHTML = lightboxImages
          .map(
            (_, i) => `
          <button type="button" class="image-lightbox-dot${i === lightboxIndex ? " image-lightbox-dot--active" : ""}" data-lightbox-dot="${i}" aria-label="Show photo ${i + 1}"></button>
        `
          )
          .join("");

        dotsEl.querySelectorAll("[data-lightbox-dot]").forEach((dot) => {
          dot.addEventListener("click", (e) => {
            e.stopPropagation();
            lightboxIndex = Number(dot.dataset.lightboxDot);
            updateLightboxView();
          });
        });
      } else {
        dotsEl.innerHTML = "";
      }
    }

    function openLightbox(images, index, alt) {
      lightboxImages = images;
      lightboxIndex = index;
      lightboxAlt = alt || "";
      updateLightboxView();
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      modal.querySelector(".image-lightbox-close")?.focus();
    }

    function closeLightbox() {
      modal.hidden = true;
      lightboxImg.src = "";
      lightboxImages = [];
      lightboxIndex = 0;
      document.body.style.overflow = "";
    }

    function goLightbox(delta) {
      if (lightboxImages.length <= 1) return;
      lightboxIndex = (lightboxIndex + delta + lightboxImages.length) % lightboxImages.length;
      updateLightboxView();
    }

    if (!lightboxInitialized) {
      lightboxInitialized = true;

      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goLightbox(-1);
      });

      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goLightbox(1);
      });

      modal.querySelectorAll("[data-lightbox-close]").forEach((el) => {
        el.addEventListener("click", closeLightbox);
      });

      document.addEventListener("keydown", (e) => {
        if (modal.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") goLightbox(-1);
        if (e.key === "ArrowRight") goLightbox(1);
      });
    }

    document.querySelectorAll("[data-lightbox-set]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        let images = [];
        try {
          images = JSON.parse(btn.dataset.lightboxSet || "[]");
        } catch {
          images = [];
        }
        const index = Number(btn.dataset.lightboxIndex) || 0;
        const img = btn.querySelector("img");
        openLightbox(images, index, img?.alt?.split(" — ")[0] || "");
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
    const heroDeliveryNote = document.getElementById("hero-delivery-note");
    const heroDescription = document.getElementById("hero-description");
    const footerBrand = document.getElementById("footer-brand");
    const footerNote = document.getElementById("footer-note");
    const year = document.getElementById("year");

    if (brandName) brandName.textContent = SITE_CONFIG.brandName;
    if (heroHeadline) heroHeadline.textContent = SITE_CONFIG.heroHeadline;
    if (heroSubheadline) heroSubheadline.textContent = SITE_CONFIG.heroSubheadline;
    if (heroDeliveryNote) {
      heroDeliveryNote.textContent = SITE_CONFIG.heroDeliveryNote || "";
      heroDeliveryNote.hidden = !SITE_CONFIG.heroDeliveryNote;
    }
    const headerYoutube = document.getElementById("header-youtube");
    const headerYoutubeHandle = document.getElementById("header-youtube-handle");
    if (headerYoutube && SITE_CONFIG.youtube?.url) {
      headerYoutube.href = SITE_CONFIG.youtube.url;
      headerYoutube.setAttribute(
        "aria-label",
        `${SITE_CONFIG.youtube.handle || "YouTube"} on YouTube`
      );
    }
    if (headerYoutubeHandle) {
      headerYoutubeHandle.textContent = SITE_CONFIG.youtube?.handle || "";
    }
    if (heroDescription) heroDescription.textContent = SITE_CONFIG.heroDescription;
    if (footerBrand) footerBrand.textContent = SITE_CONFIG.brandName;
    if (footerNote) footerNote.textContent = SITE_CONFIG.footerNote;
    if (year) year.textContent = new Date().getFullYear();

    document.title = SITE_CONFIG.brandName + " — Father's Day Orders";
  }

  function resolveScrollTarget(hash) {
    const map = {
      "#menu": SCROLL_TARGETS.menu(),
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
    initIngredientsAllergensBar();
  });
})();
