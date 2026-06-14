const Cart = (function () {
  "use strict";

  const quantities = {};
  const listeners = new Set();

  function getProduct(id) {
    return SITE_CONFIG.products.find((p) => p.id === id);
  }

  function notify() {
    listeners.forEach((fn) => fn());
  }

  function add(productId) {
    quantities[productId] = (quantities[productId] || 0) + 1;
    notify();
  }

  function setQuantity(productId, qty) {
    if (qty <= 0) {
      delete quantities[productId];
    } else {
      quantities[productId] = qty;
    }
    notify();
  }

  function remove(productId) {
    delete quantities[productId];
    notify();
  }

  function getQuantity(productId) {
    return quantities[productId] || 0;
  }

  function getItems() {
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ product: getProduct(id), quantity: qty }))
      .filter((entry) => entry.product);
  }

  function getTotal() {
    return getItems().reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );
  }

  function isEmpty() {
    return getItems().length === 0;
  }

  function clear() {
    Object.keys(quantities).forEach((id) => delete quantities[id]);
    notify();
  }

  function formatPrice(price) {
    return "$" + price.toFixed(0);
  }

  function buildItemsOrdered(customText) {
    const parts = getItems().map(({ product, quantity }) => {
      const lineTotal = product.price * quantity;
      return `${product.name} x${quantity} (${formatPrice(lineTotal)})`;
    });

    const custom = (customText || "").trim();
    if (custom) {
      parts.push("Custom: " + custom);
    }

    return parts.join("; ");
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    add,
    setQuantity,
    remove,
    getQuantity,
    getItems,
    getTotal,
    isEmpty,
    clear,
    buildItemsOrdered,
    onChange,
    formatPrice,
  };
})();
