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
    fulfillmentPickup: document.getElementById("fulfillment-pickup"),
    fulfillmentDelivery: document.getElementById("fulfillment-delivery"),
  };

  const fulfillmentNoticeGroup = document.getElementById("fulfillment-notice-group");
  const fulfillmentNoticePickup = document.getElementById("fulfillment-notice-pickup");
  const fulfillmentNoticeDelivery = document.getElementById("fulfillment-notice-delivery");
  const addressGroup = document.getElementById("address-group");
  const fulfillmentFieldset = document.getElementById("fulfillment-fieldset");

  const errors = {
    name: document.getElementById("error-name"),
    phone: document.getElementById("error-phone"),
    items: document.getElementById("error-items"),
    address: document.getElementById("error-address"),
    payment: document.getElementById("error-payment"),
    fulfillment: document.getElementById("error-fulfillment"),
    pickupTime: document.getElementById("error-pickup-time"),
  };

  const paymentInfoEl = document.getElementById("payment-info");

  function updatePaymentInfo() {
    if (!fields.paymentMethod) return;

    const method = fields.paymentMethod.value;
    const details = SITE_CONFIG.paymentDetails?.[method];

    if (paymentInfoEl) {
      if (!details) {
        paymentInfoEl.hidden = true;
        paymentInfoEl.innerHTML = "";
      } else {
        paymentInfoEl.hidden = false;
        paymentInfoEl.innerHTML = `
      <p class="payment-info-label">${details.label}</p>
      <p class="payment-info-value">${details.value}</p>
    `;
      }
    }
  }

  function getFulfillmentType() {
    if (fields.fulfillmentPickup?.checked) return "pickup";
    if (fields.fulfillmentDelivery?.checked) return "delivery";
    return "";
  }

  function getPickupTime() {
    const selected = form.querySelector('input[name="pickupTime"]:checked');
    return selected?.value || "";
  }

  function clearPickupTime() {
    form.querySelectorAll('input[name="pickupTime"]').forEach((el) => {
      el.checked = false;
      el.required = false;
    });
    if (errors.pickupTime) errors.pickupTime.textContent = "";
    document.getElementById("pickup-time-options")?.classList.remove("pickup-time-options--invalid");
  }

  function setPickupTimeRequired(isRequired) {
    const radios = form.querySelectorAll('input[name="pickupTime"]');
    radios.forEach((el, index) => {
      el.required = isRequired && index === 0;
    });
  }

  function updateFulfillmentUI() {
    const type = getFulfillmentType();

    if (fulfillmentNoticeGroup) {
      fulfillmentNoticeGroup.hidden = !type;
    }

    if (fulfillmentNoticePickup) {
      fulfillmentNoticePickup.hidden = type !== "pickup";
    }

    if (fulfillmentNoticeDelivery) {
      fulfillmentNoticeDelivery.hidden = type !== "delivery";
    }

    if (addressGroup) {
      addressGroup.hidden = type !== "delivery";
    }

    if (fields.address) {
      fields.address.required = type === "delivery";
      if (type !== "delivery") {
        fields.address.value = "";
      }
    }

    if (type !== "pickup") {
      clearPickupTime();
    } else {
      setPickupTimeRequired(true);
    }
  }

  function clearErrors() {
    Object.values(errors).forEach((el) => {
      if (el) el.textContent = "";
    });
    form.querySelectorAll(".form-group--invalid, .form-fieldset--invalid").forEach((el) => {
      el.classList.remove("form-group--invalid", "form-fieldset--invalid");
    });
    form.querySelectorAll(".pickup-time-options--invalid").forEach((el) => {
      el.classList.remove("pickup-time-options--invalid");
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
    if (key === "fulfillment") {
      fulfillmentFieldset?.closest(".form-group")?.classList.add("form-group--invalid");
    }
    if (key === "pickupTime") {
      document.getElementById("pickup-time-options")?.classList.add("pickup-time-options--invalid");
      fulfillmentNoticeGroup?.closest(".form-group")?.classList.add("form-group--invalid");
    }
    if (key === "items") {
      document.getElementById("cart-section")?.classList.add("form-fieldset--invalid");
    }
  }

  function focusFirstError() {
    const firstError = form.querySelector(
      ".form-group--invalid, .pickup-time-options--invalid, .form-fieldset--invalid, #cart-section.form-fieldset--invalid"
    );
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function buildItemsOrdered() {
    return Cart.buildItemsOrdered("");
  }

  function validate() {
    clearErrors();
    let valid = true;

    const name = fields.name?.value.trim() || "";
    const phone = fields.phone?.value.trim() || "";
    const address = fields.address?.value.trim() || "";
    const payment = fields.paymentMethod?.value || "";
    const fulfillmentType = getFulfillmentType();
    const pickupTime = getPickupTime();
    const itemsOrdered = buildItemsOrdered();

    if (!name) {
      setError("name", "Please enter your name.");
      valid = false;
    }

    if (!phone) {
      setError("phone", "Please enter your phone number.");
      valid = false;
    } else if (phone.replace(/\D/g, "").length !== 10) {
      setError("phone", "Please enter a valid 10-digit phone number.");
      valid = false;
    }

    if (!itemsOrdered) {
      setError("items", "Please add at least one item from the menu or describe a custom order.");
      valid = false;
    }

    if (!fulfillmentType) {
      setError("fulfillment", "Please choose pick up or delivery.");
      valid = false;
    }

    if (fulfillmentType === "delivery" && !address) {
      setError("address", "Please enter your delivery address.");
      valid = false;
    }

    if (fulfillmentType === "pickup" && !pickupTime) {
      setError("pickupTime", "Please choose a pick up time.");
      valid = false;
    }

    if (!payment) {
      setError("payment", "Please select a payment method.");
      valid = false;
    }

    const pickupAddress = "2427 Haider Avenue Naperville";
    const pickupTimeLabels = {
      saturday: "Saturday between 6-8 pm",
      sunday: "Sunday between 8-10 am",
    };
    const pickupDayLabels = {
      saturday: "Saturday",
      sunday: "Sunday",
    };
    const pickupTimeLabel =
      fulfillmentType === "pickup" && pickupTime ? pickupTimeLabels[pickupTime] : "";
    const pickupDayLabel =
      fulfillmentType === "pickup" && pickupTime ? pickupDayLabels[pickupTime] || "" : "";

    return valid
      ? {
          name,
          phone,
          itemsOrdered,
          address: fulfillmentType === "pickup" ? pickupAddress : address,
          fulfillmentType: fulfillmentType === "pickup" ? "Pick up" : "Delivery",
          pickupTime: pickupTimeLabel,
          pickupDay: pickupDayLabel,
          paymentMethod: payment,
          specialRequirements: "",
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
    if (!data) {
      focusFirstError();
      return;
    }

    setLoading(true);

    try {
      await submitToGoogleSheets(data);
      form.reset();
      Cart.clear();
      updatePaymentInfo();
      updateFulfillmentUI();
      showSuccess();
    } catch (err) {
      showError(err.message || "Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  });

  fields.paymentMethod?.addEventListener("change", updatePaymentInfo);
  updatePaymentInfo();

  document.querySelectorAll('input[name="fulfillmentType"]').forEach((el) => {
    el.addEventListener("change", () => {
      updateFulfillmentUI();
      fulfillmentFieldset?.closest(".form-group")?.classList.remove("form-group--invalid");
      if (errors.fulfillment) errors.fulfillment.textContent = "";
    });
  });

  document.querySelectorAll('input[name="pickupTime"]').forEach((el) => {
    el.addEventListener("change", () => {
      document.getElementById("pickup-time-options")?.classList.remove("pickup-time-options--invalid");
      fulfillmentNoticeGroup?.closest(".form-group")?.classList.remove("form-group--invalid");
      if (errors.pickupTime) errors.pickupTime.textContent = "";
    });
  });

  updateFulfillmentUI();

  form.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", () => {
      el.closest(".form-group, .form-fieldset, #cart-section")?.classList.remove(
        "form-group--invalid",
        "form-fieldset--invalid"
      );
    });
  });
})();
