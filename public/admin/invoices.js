/* Standalone local invoice workspace. Public website code is never loaded here. */
(() => {
  "use strict";
  const config = JSON.parse(
    document.getElementById("admin-config").textContent,
  );
  const root = document.getElementById("app-content");
  const query = new URLSearchParams(location.search);
  const api = "/api/admin/invoices";
  const e = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const money = (amount) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  const dateLabel = (date) =>
    new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const plusDays = (days) => {
    const value = new Date(`${today}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  };
  let current = null;
  let currentHtml = "";
  let invoices = [];
  let isSaving = false;
  let currentLink;
  let sendRequestId;
  let previewTimer;
  let previewSequence = 0;
  let toastTimer;
  const icon = (name) => {
    const paths = {
      calendar:
        '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
      edit: '<path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
      link: '<path d="m9 15 6-6M8 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1"/>',
      file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8m-8 4h6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      refresh:
        '<path d="M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3"/>',
      search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
      download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  };
  function toast(message, error = false) {
    const node = document.getElementById("toast");
    node.textContent = message;
    node.classList.toggle("error", error);
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 6000);
  }
  async function request(payload, id) {
    const response = await fetch(
      id ? `${api}?id=${encodeURIComponent(id)}` : api,
      payload
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        : { cache: "no-store" },
    );
    if (response.status === 401) {
      // This standalone admin HTML controller has no Next.js client router.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      throw new Error("Your session has expired. Please sign in again.");
    }
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
  }
  function header(kicker, title, subtitle, action = "") {
    return `<div class="page-heading"><div><span class="kicker">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
  }
  const notice = `<div class="mode-banner"><span class="mode-icon">i</span><span><strong>${config.online ? "Your secure invoice workspace." : "Your local invoice workspace."}</strong> ${config.stripeTestReady ? "Thrive4 Stripe test mode. Use test cards only; no real money is collected." : "Stripe is not connected. Links are previews."} Autopay is not active.</span><span class="mode-tag">${config.stripeTestReady ? "STRIPE TEST MODE" : "PREVIEW MODE"}</span></div>`;
  const displayDate = (value) =>
    value ? value.split("-").reverse().join("/") : "dd/mm/yyyy";
  const calculateTotal = (hours, rate) =>
    Math.round((Math.round(hours * 100) * Math.round(rate * 100)) / 100) / 100;
  function field(label, name, value, options = {}) {
    const {
      type = "text",
      required = true,
      wide = false,
      max = 120,
      extra = "",
    } = options;
    if (type === "date")
      return `<div class="field ${wide ? "full" : ""}"><span id="label-${name}">${label}<i aria-hidden="true">*</i></span><input type="hidden" name="${name}" value="${e(value)}"><button type="button" class="date-trigger" data-date-field="${name}" aria-haspopup="dialog" aria-expanded="false" aria-controls="invoice-calendar" aria-labelledby="label-${name} value-${name}"><span id="value-${name}">${displayDate(value)}</span>${icon("calendar")}</button></div>`;
    return `<label class="field ${wide ? "full" : ""}"><span>${label}${required ? '<i aria-hidden="true">*</i>' : ""}</span><input name="${name}" type="${type}" value="${e(value)}" ${required ? "required" : ""} maxlength="${max}" ${extra}></label>`;
  }
  function setupCalendar(form) {
    document.getElementById("invoice-calendar")?.remove();
    const calendar = document.createElement("div");
    calendar.id = "invoice-calendar";
    calendar.className = "invoice-calendar";
    calendar.setAttribute("popover", "auto");
    calendar.setAttribute("role", "dialog");
    calendar.setAttribute("aria-label", "Choose invoice date");
    document.body.append(calendar);
    let trigger, fieldName, shown, focused;
    const months = Array.from({ length: 12 }, (_, index) =>
      new Intl.DateTimeFormat("en-AU", {
        month: "long",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(2026, index, 1))),
    );
    const iso = (date) => date.toISOString().slice(0, 10);
    function position() {
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(302, innerWidth - 24);
      calendar.style.width = width + "px";
      calendar.style.left =
        Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + "px";
      const height = calendar.offsetHeight;
      calendar.style.top =
        Math.max(12, Math.min(rect.bottom + 7, innerHeight - height - 12)) +
        "px";
    }
    function close() {
      if (calendar.matches(":popover-open")) calendar.hidePopover();
      trigger?.setAttribute("aria-expanded", "false");
    }
    function render(focusDay) {
      const year = shown.getUTCFullYear(),
        month = shown.getUTCMonth();
      const selected = form.elements[fieldName].value;
      const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
      const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const startYear = Math.min(2000, year - 10),
        endYear = Math.max(2100, year + 10);
      const active =
        focusDay ||
        (selected.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
          ? Number(selected.slice(8))
          : 1);
      calendar.innerHTML = `<div class="calendar-label">${e(document.getElementById(`label-${fieldName}`).textContent.replace("*", ""))}</div><div class="calendar-header"><button type="button" data-month-step="-1" aria-label="Previous month">‹</button><div><select aria-label="Calendar month">${months.map((name, index) => `<option value="${index}" ${index === month ? "selected" : ""}>${name}</option>`).join("")}</select><select aria-label="Calendar year">${Array.from(
        { length: endYear - startYear + 1 },
        (_, index) => index + startYear,
      )
        .map(
          (value) =>
            `<option value="${value}" ${value === year ? "selected" : ""}>${value}</option>`,
        )
        .join(
          "",
        )}</select></div><button type="button" data-month-step="1" aria-label="Next month">›</button></div><div class="calendar-weekdays" aria-hidden="true">${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((value) => `<span>${value}</span>`).join("")}</div><div class="calendar-days" role="group" aria-label="Days in ${months[month]} ${year}">${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from(
        { length: count },
        (_, index) => index + 1,
      )
        .map((day) => {
          const value = iso(new Date(Date.UTC(year, month, day)));
          const label = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${value}T12:00:00Z`));
          return `<button type="button" data-day="${value}" aria-label="${label}" aria-pressed="${value === selected}" ${value === today ? 'aria-current="date"' : ""} tabindex="${day === active ? 0 : -1}">${day}</button>`;
        })
        .join(
          "",
        )}</div><div class="calendar-footer"><button type="button" data-today>Today</button><span>${displayDate(selected)}</span><button type="button" data-close-calendar>Done</button></div>`;
      calendar.querySelectorAll("[data-month-step]").forEach((button) =>
        button.addEventListener("click", () => {
          shown = new Date(
            Date.UTC(year, month + Number(button.dataset.monthStep), 1),
          );
          render();
          calendar
            .querySelector(`[data-month-step="${button.dataset.monthStep}"]`)
            .focus();
        }),
      );
      calendar
        .querySelector('[aria-label="Calendar month"]')
        .addEventListener("change", (event) => {
          shown = new Date(Date.UTC(year, Number(event.target.value), 1));
          render();
          calendar.querySelector('[aria-label="Calendar month"]').focus();
        });
      calendar
        .querySelector('[aria-label="Calendar year"]')
        .addEventListener("change", (event) => {
          shown = new Date(Date.UTC(Number(event.target.value), month, 1));
          render();
          calendar.querySelector('[aria-label="Calendar year"]').focus();
        });
      calendar
        .querySelectorAll("[data-day]")
        .forEach((button) =>
          button.addEventListener("click", () => select(button.dataset.day)),
        );
      calendar
        .querySelector("[data-today]")
        .addEventListener("click", () => select(today));
      calendar
        .querySelector("[data-close-calendar]")
        .addEventListener("click", () => {
          close();
          trigger.focus();
        });
      position();
      if (focusDay)
        calendar
          .querySelector(
            `[data-day="${iso(new Date(Date.UTC(year, month, focusDay)))}"]`,
          )
          ?.focus();
    }
    function select(value) {
      form.elements[fieldName].value = value;
      document.getElementById(`value-${fieldName}`).textContent =
        displayDate(value);
      form.elements[fieldName].dispatchEvent(
        new Event("input", { bubbles: true }),
      );
      close();
      trigger.focus();
    }
    calendar.addEventListener("toggle", (event) => {
      if (event.newState === "closed")
        trigger?.setAttribute("aria-expanded", "false");
    });
    calendar.addEventListener("keydown", (event) => {
      const button = event.target.closest("[data-day]");
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        trigger.focus();
        return;
      }
      if (!button) return;
      focused = new Date(`${button.dataset.day}T12:00:00Z`);
      const shifts = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };
      if (event.key in shifts)
        focused.setUTCDate(focused.getUTCDate() + shifts[event.key]);
      else if (event.key === "Home")
        focused.setUTCDate(
          focused.getUTCDate() - ((focused.getUTCDay() + 6) % 7),
        );
      else if (event.key === "End")
        focused.setUTCDate(
          focused.getUTCDate() + 6 - ((focused.getUTCDay() + 6) % 7),
        );
      else if (event.key === "PageUp" || event.key === "PageDown") {
        const targetMonth =
            focused.getUTCMonth() + (event.key === "PageUp" ? -1 : 1),
          originalDay = focused.getUTCDate();
        focused = new Date(Date.UTC(focused.getUTCFullYear(), targetMonth, 1));
        focused.setUTCDate(
          Math.min(
            originalDay,
            new Date(
              Date.UTC(focused.getUTCFullYear(), focused.getUTCMonth() + 1, 0),
            ).getUTCDate(),
          ),
        );
      } else return;
      event.preventDefault();
      shown = new Date(
        Date.UTC(focused.getUTCFullYear(), focused.getUTCMonth(), 1),
      );
      render(focused.getUTCDate());
    });
    form.querySelectorAll("[data-date-field]").forEach((button) =>
      button.addEventListener("click", () => {
        close();
        trigger = button;
        fieldName = button.dataset.dateField;
        const value = form.elements[fieldName].value || today;
        shown = new Date(`${value.slice(0, 7)}-01T12:00:00Z`);
        render();
        calendar.showPopover();
        position();
        trigger.setAttribute("aria-expanded", "true");
        calendar.querySelector('[aria-pressed="true"]')?.focus();
      }),
    );
    addEventListener("resize", position);
    addEventListener(
      "scroll",
      () => {
        if (calendar.matches(":popover-open")) position();
      },
      { passive: true },
    );
  }
  function previewPanel() {
    return `<section class="preview-panel" aria-label="Invoice email preview"><div class="preview-heading"><div><span class="preview-dot"></span><strong>Email preview</strong></div><span>THRIVE4 BRANDED</span></div><div class="email-subject"><span>SUBJECT</span><strong id="preview-subject">Your Thrive4 Cleaning invoice</strong></div><iframe id="email-preview" title="Branded invoice email preview" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe><div class="preview-footnote">The customer receives this HTML design in their inbox.</div></section>`;
  }
  function resizeEmailPreview() {
    const frame = document.getElementById("email-preview");
    if (!frame?.contentDocument?.body) return;
    frame.style.height = "1px";
    frame.style.height =
      Math.max(
        400,
        frame.contentDocument.body.scrollHeight,
        frame.contentDocument.documentElement.scrollHeight,
      ) +
      2 +
      "px";
  }
  function setEmailPreview(html) {
    const frame = document.getElementById("email-preview");
    frame.onload = resizeEmailPreview;
    frame.srcdoc = html;
  }
  addEventListener("resize", () => requestAnimationFrame(resizeEmailPreview));
  function createView(existing) {
    current = existing || null;
    const data = existing || {
      number: `T4-${today.replaceAll("-", "").slice(0, 6)}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      invoiceDate: today,
      issuedDate: today,
      dueDate: plusDays(7),
      validUntil: plusDays(14),
      name: "",
      email: "",
      phone: "",
      address: "",
      service: "house-cleaning",
      plan: "One-off",
      autopay: false,
      description: "House Cleaning",
      hours: 1,
      hourlyRate: 70,
      amount: 70,
      notes:
        "Thank you for choosing Thrive4 Cleaning. Please contact our team if you have any questions about this invoice.",
    };
    if (
      existing &&
      (existing.hours === undefined || existing.hourlyRate === undefined)
    ) {
      data.hours = "";
      data.hourlyRate = 60;
    }
    root.innerHTML =
      header(
        "INVOICES / CREATE",
        existing ? "Edit your invoice." : "A fresh invoice. In minutes.",
        existing
          ? "Update the details, then review your invoice before sending."
          : "Create, preview and send a thoughtfully branded invoice.",
        `<a class="btn secondary" href="/admin/review">Review invoices ${icon("arrow")}</a>`,
      ) +
      notice +
      `<div class="create-grid"><form id="invoice-form"><section class="form-card"><div class="card-heading"><span class="step-number">01</span><div><h2>Choose an invoice type</h2><p>A one-off visit or an ongoing cleaning plan.</p></div></div><div class="plan-options" role="group" aria-label="Invoice type">${["Weekly", "Fortnightly", "One-off", "Onboarding fees"].map((plan) => `<button type="button" data-plan="${plan}" aria-pressed="${data.plan === plan}">${plan}</button>`).join("")}</div></section>
    <section class="form-card"><div class="card-heading"><span class="step-number">02</span><div><h2>Invoice details</h2><p>Keep your dates and invoice reference in one place.</p></div></div><div class="field-grid invoice-dates-grid">${field("Invoice number", "number", data.number, { max: 40, extra: 'pattern="[A-Za-z0-9-]+"' })}${field("Invoice date", "invoiceDate", data.invoiceDate, { type: "date" })}${field("Issued date", "issuedDate", data.issuedDate, { type: "date" })}${field("Due date", "dueDate", data.dueDate, { type: "date" })}${field("Valid until", "validUntil", data.validUntil, { type: "date" })}</div></section>
    <section class="form-card"><div class="card-heading"><span class="step-number">03</span><div><h2>Who are we billing?</h2><p>The invoice will be sent to this email address.</p></div></div><div class="field-grid">${field("Client name", "name", data.name)}${field("Client email", "email", data.email, { type: "email", max: 254 })}${field("Phone number", "phone", data.phone, { type: "tel", required: false, max: 40 })}${field("Billing address", "address", data.address, { required: false, max: 400 })}</div></section>
    <section class="form-card"><div class="card-heading"><span class="step-number">04</span><div><h2>The cleaning details</h2><p>Bill for the total hours worked across your team.</p></div></div><div class="field-grid work-grid"><label class="field full"><span>Cleaning service<i aria-hidden="true">*</i></span><select name="service">${config.services.map((service) => `<option value="${e(service.slug)}" ${service.slug === data.service ? "selected" : ""}>${e(service.name)}</option>`).join("")}</select></label>${field("Hours worked", "hours", data.hours ?? "", { type: "number", extra: 'min="0.01" max="10000" step="0.01" placeholder="e.g. 2.5"' })}${field("Hourly rate (AUD)", "hourlyRate", data.hourlyRate ?? 70, { type: "number", extra: 'min="0.01" max="100000" step="0.01"' })}${field("Total amount (AUD)", "amount", data.amount, { type: "number", extra: 'readonly aria-readonly="true"' })}<div class="billing-hint full" id="billing-calculation">Enter the total staff-hours worked. 1.5 hours = 1 hr 30 min.</div>${field("Line item description", "description", data.description, { max: 300, wide: true })}<details class="invoice-message full"><summary>Message to your client <span>Optional</span></summary><textarea aria-label="Message to your client" name="notes" rows="2" maxlength="2000">${e(data.notes)}</textarea></details></div><div class="autopay-row" id="autopay-row"><div><strong>Autopay preference</strong><small>Preference only. Recurring billing is not connected.</small></div><label class="toggle"><input name="autopay" type="checkbox" ${data.autopay ? "checked" : ""}><span></span><b class="sr-only">Autopay preference</b></label></div></section>
    <div class="form-summary"><div>${icon("file")}<div><strong id="summary-title">${e(data.plan)} invoice</strong><p id="summary-copy">Save your invoice, review the preview, then generate a payment link.</p></div></div><strong id="summary-amount">${money(data.amount)}<small>AUD · Total due</small></strong></div><div id="form-error" class="form-error" role="alert" hidden></div><div class="form-actions"><button type="submit" class="btn primary" id="save-invoice">${existing ? "Save changes" : "Create Invoice"} ${icon("arrow")}</button><a class="cancel-link" href="/admin/review">Cancel</a><span>${config.online ? "Saved securely" : "Saved privately on this computer"}</span></div></form>${previewPanel()}</div>`;
    let plan = data.plan;
    const form = document.getElementById("invoice-form");
    function collect(preview = false) {
      const values = Object.fromEntries(new FormData(form));
      const result = {
        ...values,
        plan,
        hours: Number(values.hours),
        hourlyRate: Number(values.hourlyRate),
        amount: calculateTotal(Number(values.hours), Number(values.hourlyRate)),
        autopay:
          form.elements.autopay.checked &&
          ["Weekly", "Fortnightly"].includes(plan),
      };
      if (preview) {
        result.name ||= "Your client";
        result.email ||= "client@example.com";
        result.number ||= "T4-DRAFT";

        result.description ||= "Cleaning service";
        for (const key of [
          "invoiceDate",
          "issuedDate",
          "dueDate",
          "validUntil",
        ])
          result[key] ||= today;
      }
      return result;
    }
    async function refreshPreview() {
      const sequence = ++previewSequence;
      try {
        const response = await request({
          action: "preview",
          data: collect(true),
        });
        if (sequence !== previewSequence) return;
        setEmailPreview(response.html);
        document.getElementById("preview-subject").textContent =
          "Your cleaning invoice | Thrive4 Cleaning";
      } catch {
        /* Incomplete date or amount fields keep the last valid preview. */
      }
    }
    function update() {
      const hours = Number(form.elements.hours.value);
      const rate = Number(form.elements.hourlyRate.value);
      const total =
        Number.isFinite(hours) && Number.isFinite(rate)
          ? calculateTotal(hours, rate)
          : 0;
      form.elements.amount.value = total.toFixed(2);
      document.getElementById("billing-calculation").textContent =
        `${hours || 0} hrs × ${money(rate || 0)} / hr = ${money(total)} · 1.5 hrs = 1 hr 30 min`;

      const recurring = ["Weekly", "Fortnightly"].includes(plan);
      document.getElementById("autopay-row").hidden = !recurring;
      if (!recurring) form.elements.autopay.checked = false;
      document.getElementById("summary-title").textContent = `${plan} invoice`;
      document.getElementById("summary-amount").innerHTML =
        `${money(Number(form.elements.amount.value) || 0)}<small>AUD · Total due</small>`;
      document.getElementById("summary-copy").textContent =
        recurring && form.elements.autopay.checked
          ? `${plan} autopay preference saved. No automatic payments will be started.`
          : "Review your invoice, generate a preview link, then send via email.";
      clearTimeout(previewTimer);
      previewTimer = setTimeout(refreshPreview, 250);
    }
    form.querySelectorAll("[data-plan]").forEach((button) =>
      button.addEventListener("click", () => {
        plan = button.dataset.plan;
        form.dataset.dirty = "true";
        form
          .querySelectorAll("[data-plan]")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        update();
      }),
    );
    form.elements.service.addEventListener("change", () => {
      form.elements.description.value = config.services.find(
        (service) => service.slug === form.elements.service.value,
      ).name;
      update();
    });
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSaving) return;
      const error = document.getElementById("form-error");
      error.hidden = true;
      isSaving = true;
      const button = document.getElementById("save-invoice");
      button.disabled = true;
      button.textContent = "Saving invoice…";
      try {
        const response = await request({
          action: "save",
          data: collect(),
          ...(existing ? { id: existing.id, revision: existing.revision } : {}),
        });
        // Standalone HTML route: there is no Next.js client router on this page.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        location.href = `/admin/review?id=${encodeURIComponent(response.invoice.id)}`;
      } catch (failure) {
        error.textContent = failure.message;
        error.hidden = false;
        error.scrollIntoView({ block: "center", behavior: "smooth" });
        isSaving = false;
        button.disabled = false;
        button.innerHTML = `${existing ? "Save changes" : "Create Invoice"} ${icon("arrow")}`;
      }
    });
    setupCalendar(form);
    update();
    form.addEventListener("input", () => {
      form.dataset.dirty = "true";
    });
    addEventListener("beforeunload", (event) => {
      if (form.dataset.dirty && !isSaving) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }
  const status = (invoice) =>
    invoice.checkout?.paymentStatus === "paid" ? "Paid (test)" : invoice.emailedRevision === invoice.revision
      ? "Email sent"
      : invoice.paymentToken || invoice.checkout?.status === "open"
        ? "Link ready"
        : "Draft";
  function listView() {
    root.innerHTML =
      header(
        "INVOICES / REVIEW",
        "Your invoices, at a glance.",
        "A clear view of every draft, payment preview and sent invoice.",
        `<a class="btn primary" href="/admin">${icon("plus")} Create Invoice</a>`,
      ) +
      notice +
      `<div class="stats-grid"><div class="stat-card"><span>Total invoices</span><strong>${invoices.length.toString().padStart(2, "0")}</strong><small>${config.online ? "Saved in your secure workspace" : "Saved in your local workspace"}</small></div><div class="stat-card"><span>Draft invoices</span><strong>${invoices
        .filter((invoice) => status(invoice) === "Draft")
        .length.toString()
        .padStart(
          2,
          "0",
        )}</strong><small>Ready for your finishing touches</small></div><div class="stat-card"><span>Emails sent</span><strong>${invoices
        .filter((invoice) => status(invoice) === "Email sent")
        .length.toString()
        .padStart(
          2,
          "0",
        )}</strong><small>Accepted by the mail server</small></div><div class="stat-card stat-green"><span>Total invoiced · AUD</span><strong>${money(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}</strong><small>${config.stripeTestReady ? "Stripe sandbox · no real payments" : "No payments collected in preview mode"}</small></div></div><section class="invoice-list-card"><div class="list-toolbar"><div><h2>All invoices <span class="count-badge">${invoices.length}</span></h2><p>Your next great clean starts with a little clarity.</p></div><label class="search-field">${icon("search")}<input id="invoice-search" placeholder="Search client or invoice…" aria-label="Search invoices"></label></div><div class="list-filters" role="group" aria-label="Filter invoice status">${["All invoices", "Draft", "Link ready", "Email sent", "Paid (test)"].map((value, index) => `<button type="button" data-filter="${value}" aria-pressed="${index === 0}">${value}</button>`).join("")}</div><div id="invoice-table"></div></section>`;
    let selected = "All invoices";
    function draw() {
      const search = document
        .getElementById("invoice-search")
        .value.trim()
        .toLowerCase();
      const visible = invoices.filter(
        (invoice) =>
          (selected === "All invoices" || status(invoice) === selected) &&
          `${invoice.number} ${invoice.name} ${invoice.email}`
            .toLowerCase()
            .includes(search),
      );
      document.getElementById("invoice-table").innerHTML = visible.length
        ? `<div class="table-scroll"><table class="invoice-table"><thead><tr><th>Invoice / client</th><th>Service</th><th>Due date</th><th>Amount</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${visible.map((invoice) => `<tr><td><a class="invoice-number" href="/admin/review?id=${e(invoice.id)}">${e(invoice.number)}</a><span class="client-name">${e(invoice.name)}</span><small>${e(invoice.email)}</small></td><td>${e(config.services.find((service) => service.slug === invoice.service)?.name || invoice.description)}<small>${e(invoice.plan)}</small></td><td>${dateLabel(invoice.dueDate)}</td><td class="table-amount">${money(invoice.amount)}<small>AUD</small></td><td><span class="invoice-status ${status(invoice) === "Draft" ? "draft" : status(invoice) === "Email sent" ? "sent" : "ready"}">${status(invoice)}</span></td><td><div class="invoice-row-actions"><a class="row-open" href="/admin/review?id=${e(invoice.id)}" aria-label="Review ${e(invoice.number)}">${icon("arrow")}</a><a class="btn secondary small" href="/admin?edit=${e(invoice.id)}" aria-label="Edit ${e(invoice.number)}">Edit</a><button type="button" class="btn secondary small" data-delete="${e(invoice.id)}" aria-label="Delete ${e(invoice.number)}">Delete</button></div></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty-state"><span>${icon("file")}</span><h3>${invoices.length ? "No matching invoices." : "A clean slate."}</h3><p>${invoices.length ? "Try another search or status filter." : "Create your first invoice and give your clients a beautifully clear way to pay."}</p>${!invoices.length ? '<a href="/admin" class="btn primary">Create your first invoice ↗</a>' : ""}</div>`;
    }
    root.querySelectorAll("[data-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        selected = button.dataset.filter;
        root
          .querySelectorAll("[data-filter]")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        draw();
      }),
    );
    document.getElementById("invoice-table").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button || button.disabled) return;
      const invoice = invoices.find((item) => item.id === button.dataset.delete);
      if (!invoice || !window.confirm(`Delete invoice ${invoice.number}? This removes its saved record and expires any unpaid Stripe test checkout. Sent emails cannot be recalled.`)) return;
      button.disabled = true;
      try {
        await request({ action: "delete", id: invoice.id, revision: invoice.revision, confirm: true });
        invoices = invoices.filter((item) => item.id !== invoice.id);
        listView();
        toast("Invoice deleted.");
      } catch (error) {
        button.disabled = false;
        toast(error.message);
      }
    });
    document.getElementById("invoice-search").addEventListener("input", draw);
    draw();
  }
  function reviewView(response) {
    current = response.invoice;
    currentHtml = response.html;
    currentLink = response.link;
    const invoice = current;
    const alreadySent = invoice.emailedRevision === invoice.revision;
    const paid = invoice.checkout?.paymentStatus === "paid";
    root.innerHTML =
      `<a class="back-link" href="/admin/review" aria-label="All invoices">← All invoices</a>` +
      header(
        "INVOICE OVERVIEW",
        e(invoice.number),
        `Created ${dateLabel(invoice.createdAt.slice(0, 10))} <span class="heading-status">${status(invoice)}</span>`,
        paid ? "" : `<a class="btn secondary" href="/admin?edit=${e(invoice.id)}">${icon("edit")} Edit invoice</a>`,
      ) +
      notice +
      `<div class="review-actions"><button class="btn primary" id="generate-link" ${paid ? "disabled" : ""}>${icon("link")} ${currentLink ? "Payment link ready" : "Generate Payment Link"}</button><button class="btn dark" id="send-invoice" ${!currentLink ? "disabled" : ""}>${icon("mail")} ${alreadySent ? "Resend via Email" : "Send via Email"}</button><button class="btn secondary" id="refresh-preview">${icon("refresh")} Regenerate Preview</button><button class="btn icon-button secondary" id="download-html" title="Download HTML invoice" aria-label="Download HTML invoice">${icon("download")}</button><button class="btn secondary" id="print-invoice">Print / Save PDF</button></div><div id="action-error" class="form-error" role="alert" hidden></div><div class="review-grid"><div class="review-details">
    ${paid ? `<section class="detail-card"><h2>Paid · Stripe test mode</h2><p>Stripe verified this invoice payment. No real money was collected.</p><p>${e(invoice.checkout.paymentIntentId || "")}</p></section>` : ""}
    ${currentLink ? `<section class="detail-card payment-link-card"><div class="detail-title">${icon("link")}<h2>Payment Link</h2><span class="mini-badge">${invoice.checkout ? "STRIPE TEST" : "PREVIEW"}</span></div><p>${invoice.checkout ? "Thrive4 Stripe test checkout is ready." : "Your local preview link is ready."}</p><div class="link-value"><input id="payment-link" aria-label="Payment preview link" readonly value="${e(currentLink)}"></div><div class="link-actions"><button type="button" class="btn secondary small" id="copy-link">Copy Link</button><a class="btn secondary small" href="${e(currentLink)}" target="_blank" rel="noopener">Open Link ↗</a></div><small>${invoice.checkout ? "Thrive4 sandbox only. Use test cards; no real money." : "Localhost preview only. No Stripe checkout or charges."}</small></section>` : paid ? "" : `<section class="detail-card next-step"><span class="detail-step">NEXT STEP</span><h2>Ready for a final look?</h2><p>Check the details, then generate a payment preview link before sending.</p><div class="mini-flow"><span class="done">✓ Invoice created</span><span>02 Generate link</span><span>03 Send invoice</span></div></section>`}
    <section class="detail-card"><div class="detail-title">${icon("file")}<h2>Billed To</h2></div><div class="client-avatar">${e(invoice.name.slice(0, 2).toUpperCase())}</div><h3>${e(invoice.name)}</h3><dl><div><dt>Email address</dt><dd>${e(invoice.email)}</dd></div>${invoice.phone ? `<div><dt>Phone number</dt><dd>${e(invoice.phone)}</dd></div>` : ""}${invoice.address ? `<div><dt>Billing address</dt><dd>${e(invoice.address)}</dd></div>` : ""}</dl></section>
    <section class="detail-card"><div class="detail-title">${icon("file")}<h2>Invoice Details</h2></div><dl><div><dt>Description</dt><dd>${e(invoice.description)}</dd></div><div><dt>Plan</dt><dd>${e(invoice.plan)}</dd></div>${invoice.hours !== undefined && invoice.hourlyRate !== undefined ? `<div class="hours-breakdown"><div><dt>Hours worked</dt><dd>${e(invoice.hours)} hrs</dd></div><div><dt>Hourly rate</dt><dd>${money(invoice.hourlyRate)} / hr</dd></div></div>` : `<div><dt>Hours worked</dt><dd>Not recorded on this earlier invoice</dd></div>`}<div><dt>Invoice date</dt><dd>${dateLabel(invoice.invoiceDate)}</dd></div><div><dt>Issued date</dt><dd>${dateLabel(invoice.issuedDate)}</dd></div><div><dt>Due date</dt><dd>${dateLabel(invoice.dueDate)}</dd></div><div><dt>Valid until</dt><dd>${dateLabel(invoice.validUntil)}</dd></div><div><dt>Autopay</dt><dd>${invoice.autopay ? "Requested · not active" : "Off"}</dd></div></dl><div class="total-row"><span>Total due <small>AUD</small></span><strong>${money(invoice.amount)}</strong></div></section>
    ${alreadySent ? `<div class="sent-notice">${icon("check")}<span>Email accepted by the mail server on ${e(new Date(invoice.emailAcceptedAt).toLocaleString("en-AU"))} for ${e(invoice.emailRecipient || invoice.email)}. Inbox delivery is not confirmed. Check Spam / All Mail. ${invoice.emailMessageId ? `<small class="email-receipt">Message ID: ${e(invoice.emailMessageId)}</small>` : ""}</span></div>` : ""}${!response.mailReady ? '<div class="notice"><strong>Email setup needed.</strong><br>Add CONTACT_SMTP_USER and CONTACT_SMTP_PASSWORD to .env.local, then restart your local server. Preview and download work now.</div>' : ""}</div>${previewPanel()}</div>`;
    setEmailPreview(currentHtml);
    document.getElementById("preview-subject").textContent =
      "Your cleaning invoice | Thrive4 Cleaning";
    const errorNode = document.getElementById("action-error");
    async function action(button, work) {
      if (isSaving) return;
      isSaving = true;
      button.disabled = true;
      const label = button.innerHTML;
      button.textContent = "Please wait…";
      errorNode.hidden = true;
      try {
        await work();
      } catch (error) {
        errorNode.textContent = error.message;
        errorNode.hidden = false;
        toast(error.message, true);
      } finally {
        isSaving = false;
        if (button.isConnected) {
          button.disabled = false;
          button.innerHTML = label;
        }
      }
    }
    document
      .getElementById("generate-link")
      .addEventListener("click", (event) =>
        action(event.currentTarget, async () => {
          const result = await request({
            action: "generate",
            id: invoice.id,
            revision: invoice.revision,
          });
          reviewView(result);
          toast("Payment link is ready.");
        }),
      );
    document
      .getElementById("refresh-preview")
      .addEventListener("click", (event) =>
        action(event.currentTarget, async () => {
          reviewView(await request(null, invoice.id));
          toast("Invoice preview refreshed.");
        }),
      );
    document
      .getElementById("copy-link")
      ?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(currentLink);
          toast("Payment link copied.");
        } catch {
          document.getElementById("payment-link").select();
          toast("Select and copy the payment link.");
        }
      });
    document.getElementById("download-html").addEventListener("click", () => {
      const url = URL.createObjectURL(
        new Blob([currentHtml], { type: "text/html" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.number}.html`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.getElementById("print-invoice").addEventListener("click", () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast("Allow pop-ups to print this invoice.", true);
        return;
      }
      printWindow.document.write(currentHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    });
    document.getElementById("send-invoice").addEventListener("click", () => {
      sendRequestId = crypto.randomUUID();
      document.getElementById("send-title").textContent = alreadySent
        ? "Resend this invoice?"
        : "Send this invoice?";
      document.getElementById("confirm-send").innerHTML =
        `${alreadySent ? "Resend invoice email" : "Send invoice email"} <span>↗</span>`;
      document.getElementById("send-recipient").textContent = invoice.email;
      document.getElementById("send-error").hidden = true;
      document.getElementById("send-dialog").showModal();
    });
  }
  document
    .getElementById("confirm-send")
    .addEventListener("click", async () => {
      if (isSaving || !current) return;
      isSaving = true;
      const button = document.getElementById("confirm-send");
      button.disabled = true;
      button.textContent = "Sending…";
      try {
        const response = await request({
          action: "send",
          id: current.id,
          revision: current.revision,
          confirm: true,
          resend: current.emailedRevision === current.revision,
          requestId: sendRequestId,
        });
        document.getElementById("send-dialog").close();
        reviewView(response);
        toast(
          `Email accepted for ${response.invoice.emailRecipient || response.invoice.email}. Check the client inbox and Spam.`,
        );
      } catch (error) {
        const node = document.getElementById("send-error");
        node.textContent = error.message;
        node.hidden = false;
      } finally {
        isSaving = false;
        button.disabled = false;
        button.innerHTML = "Send invoice email <span>↗</span>";
      }
    });
  async function downloadPaymentDocuments(invoice, reference) {
    const status = document.getElementById("payment-download-status");
    const key = `thrive4-documents-${invoice.checkout.sessionId}`;
    try { if (sessionStorage.getItem(key)) { status.textContent = "Your PDFs are ready. Download another copy above."; return; } sessionStorage.setItem(key, "started"); } catch { /* Browser storage may be restricted. */ }
    status.textContent = "Preparing your invoice and receipt PDFs…";
    try {
      const files = await Promise.all(["invoice", "receipt"].map(async (kind) => {
        const response = await fetch(`/api/payments/documents?${reference}&type=${kind}`);
        if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) throw new Error("Document unavailable");
        return response.blob();
      }));
      files.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Thrive4-${index === 0 ? "Invoice" : "Receipt"}-${invoice.number}.pdf`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      });
      status.textContent = "Downloads started. If your browser blocked them, use the buttons above.";
    } catch {
      try { sessionStorage.removeItem(key); } catch { /* Manual links remain available. */ }
      status.textContent = "Use the download buttons above to get your invoice and receipt.";
    }
  }
  function showPaymentResult(invoice) {
    const paid = invoice?.checkout?.paymentStatus === "paid" && invoice?.checkout?.status === "complete";
    document.getElementById("payment-result-dialog").className = paid ? "payment-confirmed" : "";
    document.getElementById("payment-result-title").textContent = paid ? "Payment successful" : "Payment verification pending";
    document.getElementById("payment-result-symbol").textContent = paid ? "✓" : "i";
    document.getElementById("payment-result-message").textContent = paid
      ? `${money(invoice.amount)} AUD payment verified for ${invoice.number}. Stripe test mode — no real money was collected.`
      : "Stripe verification is not available yet. Refresh this invoice to check again. Please do not pay again while verification is pending.";
    const actions = document.getElementById("payment-document-actions");
    actions.hidden = !paid;
    if (paid) {
      const reference = `invoice_id=${encodeURIComponent(invoice.id)}`;
      document.getElementById("payment-invoice-download").href = `/api/payments/documents?${reference}&type=invoice`;
      document.getElementById("payment-receipt-download").href = `/api/payments/documents?${reference}&type=receipt`;
      document.getElementById("payment-view-receipt").href = `/payments/receipt?${reference}`;
      void downloadPaymentDocuments(invoice, reference);
    }
    document.getElementById("payment-result-dialog").showModal();
  }
  async function start() {
    try {
      if (config.view === "create") {
        if (query.get("edit")) {
          const response = await request(null, query.get("edit"));
          createView(response.invoice);
        } else createView();
      } else if (query.get("id")) {
        let response = await request(null, query.get("id"));
        if (query.get("checkout") === "success") {
          for (let attempt = 0; attempt < 3 && response.invoice.checkout?.paymentStatus !== "paid"; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            response = await request(null, query.get("id"));
          }
        }
        reviewView(response);
        if (response.paymentSyncWarning) toast(response.paymentSyncWarning);
        if (query.get("checkout") === "success") {
          showPaymentResult(response.invoice);
          const cleaned = new URL(location.href);
          cleaned.searchParams.delete("checkout");
          history.replaceState(null, "", cleaned);
        }
      } else {
        const response = await request();
        invoices = response.invoices;
        listView();
        if (response.paymentSyncWarning) toast(response.paymentSyncWarning);
      }
    } catch (error) {
      root.innerHTML =
        header(
          "INVOICE WORKSPACE",
          "We couldn't open this page.",
          e(error.message),
        ) + `<a class="btn primary" href="/admin/review">Back to invoices</a>`;
      if (query.get("checkout") === "success") showPaymentResult(null);
    }
  }
  start();
})();
