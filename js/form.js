(function () {
  "use strict";

  const form = document.getElementById("order-form");
  if (!form) return;

  const submitBtn = document.getElementById("submit-btn");
  const successEl = document.getElementById("form-success");
  const errorEl = document.getElementById("form-error");
  const errorTextEl = document.getElementById("form-error-text");

  const fields = {
    name: document.getElementById("customer-name"),
    phone: document.getElementById("customer-phone"),
    address: document.getElementById("customer-address"),
    paymentMethod: document.getElementById("payment-method"),
    customItems: document.getElementById("custom-items"),
    specialRequirements: document.getElementById("special-requirements"),
  };

  const errors = {
    name: document.getElementById("error-name"),
    phone: document.getElementById("error-phone"),
    items: document.getElementById("error-items"),
    address: document.getElementById("error-address"),
    payment: document.getElementById("error-payment"),
  };

  const paymentInfoEl = document.getElementById("payment-info");

  function updatePaymentInfo() {
    if (!paymentInfoEl || !fields.paymentMethod) return;

    const method = fields.paymentMethod.value;
    const details = SITE_CONFIG.paymentDetails?.[method];

    if (!details) {
      paymentInfoEl.hidden = true;
      paymentInfoEl.innerHTML = "";
      return;
    }

    paymentInfoEl.hidden = false;
    paymentInfoEl.innerHTML = `
      <p class="payment-info-label">${details.label}</p>
      <p class="payment-info-value">${details.value}</p>
    `;
  }

  function clearErrors() {
    Object.values(errors).forEach((el) => {
      if (el) el.textContent = "";
    });
    form.querySelectorAll(".form-group--invalid, .form-fieldset--invalid").forEach((el) => {
      el.classList.remove("form-group--invalid", "form-fieldset--invalid");
    });
  }

  function setError(key, message) {
    const errorEl = errors[key];
    if (errorEl) errorEl.textContent = message;

    const fieldMap = {
      name: fields.name,
      phone: fields.phone,
      address: fields.address,
      payment: fields.paymentMethod,
    };

    if (fieldMap[key]) {
      fieldMap[key].closest(".form-group")?.classList.add("form-group--invalid");
    }
    if (key === "items") {
      document.getElementById("cart-section")?.classList.add("form-fieldset--invalid");
    }
  }

  function buildItemsOrdered() {
    return Cart.buildItemsOrdered(fields.customItems?.value || "");
  }

  function validate() {
    clearErrors();
    let valid = true;

    const name = fields.name?.value.trim() || "";
    const phone = fields.phone?.value.trim() || "";
    const address = fields.address?.value.trim() || "";
    const payment = fields.paymentMethod?.value || "";
    const itemsOrdered = buildItemsOrdered();

    if (!name) {
      setError("name", "Please enter your name.");
      valid = false;
    }

    if (!phone) {
      setError("phone", "Please enter your phone number.");
      valid = false;
    } else if (phone.replace(/\D/g, "").length < 7) {
      setError("phone", "Please enter a valid phone number.");
      valid = false;
    }

    if (!itemsOrdered) {
      setError("items", "Please add at least one item from the menu or describe a custom order.");
      valid = false;
    }

    if (!address) {
      setError("address", "Please enter your delivery address.");
      valid = false;
    }

    if (!payment) {
      setError("payment", "Please select a payment method.");
      valid = false;
    }

    return valid
      ? {
          name,
          phone,
          itemsOrdered,
          address,
          paymentMethod: payment,
          specialRequirements: fields.specialRequirements?.value.trim() || "",
        }
      : null;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("btn-submit--loading", loading);
  }

  function showSuccess() {
    successEl.hidden = false;
    errorEl.hidden = true;
    successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showError(message) {
    errorTextEl.textContent = message;
    errorEl.hidden = false;
    successEl.hidden = true;
    errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideMessages() {
    successEl.hidden = true;
    errorEl.hidden = true;
  }

  async function submitToGoogleSheets(data) {
    const url = SITE_CONFIG.googleScriptUrl;

    if (!url) {
      throw new Error(
        "Google Sheets is not configured yet. Please add your script URL to js/config.js (see SETUP.md)."
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        // text/plain avoids a CORS preflight; Google Apps Script does not handle OPTIONS.
        // Body is still JSON — parsed in Code.gs via parseOrderPayload.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to submit order.");
      }

      return result;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      if (err.message === "Failed to fetch") {
        throw new Error(
          "Could not reach the order server. Check your connection and try again."
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessages();

    const data = validate();
    if (!data) return;

    setLoading(true);

    try {
      await submitToGoogleSheets(data);
      form.reset();
      Cart.clear();
      updatePaymentInfo();
      showSuccess();
    } catch (err) {
      showError(err.message || "Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  });

  fields.paymentMethod?.addEventListener("change", updatePaymentInfo);
  updatePaymentInfo();

  form.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", () => {
      el.closest(".form-group, .form-fieldset, #cart-section")?.classList.remove(
        "form-group--invalid",
        "form-fieldset--invalid"
      );
    });
  });
})();
