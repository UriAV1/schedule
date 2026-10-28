(function () {
  "use strict";

  const STORAGE_KEY = "uri_mom_schedule_state_v2";
  const TOPIC = "uri_aviram_schedule_sync_9c1c2e95525d7ca3_v3";
  const NTFY_URL = "https://ntfy.sh/" + TOPIC;
  const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];
  const TYPE_NAMES = {
    school: "בית ספר",
    uni: "אקדמיה",
    travel: "נסיעה",
    scouts: "צופים",
    free: "זמן פנוי"
  };
  const DEFAULT_SCHEDULE = [
    { name: "ראשון", slots: [
      ["s1","08:00 - 10:30","פיזיקה D (5 יח״ל)","מעבדה 1 (3 שיעורים רצופים)","school"],
      ["s2","10:30 - 11:15","חינוך גופני","אינשטט גל","school"],
      ["s3","11:30 - 12:15","ספרות","בנג'ו רות • סיום בי״ס ב-12:15","school"],
      ["s4","12:15 - 13:30","🍱 ארוחת צהריים והתארגנות","מנוחה לפני נסיעה","free"],
      ["s5","13:30 - 15:00","🚗 נסיעה לאוניברסיטה","שעה וחצי נסיעה","travel"],
      ["s6","15:00 - 19:30","🎓 אוניברסיטה (פרונטלי)","סשן אקדמי מלא (4.5 שעות)","uni"],
      ["s7","19:30 - 21:00","🚗 נסיעה חזרה הביתה","הגעה הביתה ב-21:00","travel"]
    ]},
    { name: "שני", slots: [
      ["m1","08:30 - 10:00","🚗 נסיעה לאוניברסיטה (בוקר)","יציאה ב-08:30","travel"],
      ["m2","10:00 - 12:00","🎓 אוניברסיטה (סבב בוקר)","לימודים פרונטליים","uni"],
      ["m3","12:00 - 13:30","🚗 נסיעה מאוניברסיטה לבי״ס","הגעה מדויקת ב-13:30","travel"],
      ["m4","13:30 - 14:10","אזרחות","לופו-שפיר קרן","school"],
      ["m5","14:10 - 14:55","היסטוריה (2 יח״ל)","גוסקין ברוך | חדר יא 7","school"],
      ["m6","15:05 - 15:30","לשון","דלית גלי","school"],
      ["m7","15:30 - 17:00","🚗 נסיעה לאוניברסיטה (ערב)","יציאה ב-15:30","travel"],
      ["m8","17:00 - 19:00","🎓 אוניברסיטה (סבב ערב)","לימודים פרונטליים","uni"],
      ["m9","19:00 - 20:30","🚗 נסיעה חזרה הביתה","הגעה הביתה ב-20:30","travel"]
    ]},
    { name: "שלישי", slots: [
      ["t1","08:00 - 09:30","לשון (2 יח״ל)","דלית גלי (2 שיעורים ברצף)","school"],
      ["t2","09:45 - 10:30","אזרחות","לופו-שפיר קרן","school"],
      ["t3","10:30 - 12:15","☕ חלון פנוי בביה״ס","שעתיים מנוחה/לימוד","free"],
      ["t4","12:15 - 14:10","אנגלית 5 יח״ל","דרי צוק רוית","school"],
      ["t5","14:10 - 14:55","חינוך","אברהם רון","school"],
      ["t6","14:55 - 16:30","☕ מנוחה והתארגנות לצופים","שעה וחצי בבית לארוחה והכנה","free"],
      ["t7","16:30 - 20:30","⚜️ פעילות בצופים","פעילות שבועית מלאה","scouts"]
    ]},
    { name: "רביעי", slots: [
      ["w1","08:00 - 10:30","☕ בוקר פנוי","התחלה מאוחרת בביה״ס","free"],
      ["w2","10:30 - 13:00","פיזיקה D (5 יח״ל)","מעבדה 2 (3 שיעורים רצופים)","school"],
      ["w3","13:30 - 15:00","🚗 נסיעה לאוניברסיטה","יציאה מבי״ס ב-13:30","travel"],
      ["w4","15:00 - 19:30","🎓 אוניברסיטה (פרונטלי)","לימודים אקדמיים מלאים","uni"],
      ["w5","19:30 - 21:00","🚗 נסיעה חזרה הביתה","הגעה הביתה ב-21:00","travel"]
    ]},
    { name: "חמישי", slots: [
      ["th1","06:30 - 08:00","🚗 נסיעה מוקדמת לאוניברסיטה","יציאה ב-06:30","travel"],
      ["th2","08:00 - 10:00","🎓 אוניברסיטה (פרונטלי)","שעתיים אקדמיות","uni"],
      ["th3","10:00 - 11:30","🚗 נסיעה מאוניברסיטה לבי״ס","הגעה ב-11:30","travel"],
      ["th4","11:30 - 13:00","היסטוריה (2 יח״ל)","גוסקין ברוך | חדר יא 7","school"],
      ["th5","13:25 - 14:10","חינוך גופני","אינשטט גל","school"],
      ["th6","14:10 - 15:50","אזרחות","לופו-שפיר קרן","school"],
      ["th7","15:50 - 21:15","☕ אחה״צ וערב פנוי","סיום מוקדם של יום הלימודים","free"]
    ]}
  ].map(day => Object.assign({}, day, {
    slots: day.slots.map(([id, time, title, sub, type]) => ({ id, time, title, sub, type }))
  }));

  function weekId(date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    value.setDate(value.getDate() - value.getDay());
    return value.toISOString().split("T")[0];
  }

  function readState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (state.currentWeekId !== weekId(new Date())) {
        return {
          currentWeekId: weekId(new Date()),
          days: {},
          recurringSchedule: state.recurringSchedule || {}
        };
      }
      return state;
    } catch (error) {
      console.error("Failed to read schedule state", error);
      return { currentWeekId: weekId(new Date()), days: {}, recurringSchedule: {} };
    }
  }

  function effectiveSlot(dayIdx, slot, state) {
    const recurring = (state.recurringSchedule && state.recurringSchedule[dayIdx] || {})[slot.id] || {};
    const weekly = (state.days && state.days[dayIdx] && state.days[dayIdx].slotOverrides || {})[slot.id] || {};
    return Object.assign({}, slot, recurring, weekly);
  }

  window.scheduleEditorEffectiveSlots = function (dayIdx, slots, state) {
    const current = state || (window.storeData || readState());
    return slots.map(slot => effectiveSlot(dayIdx, slot, current));
  };

  function ensureStyles() {
    if (document.getElementById("schedule-editor-styles")) return;
    const style = document.createElement("style");
    style.id = "schedule-editor-styles";
    style.textContent = `
      .schedule-editor-toolbar{display:flex;justify-content:flex-start;margin:0 0 16px}
      .schedule-editor-btn{border:0;border-radius:10px;background:#1e3a8a;color:#fff;padding:10px 16px;font-weight:800;cursor:pointer}
      .schedule-editor-panel{background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:14px;margin-bottom:18px}
      .schedule-editor-panel h2{font-size:16px;margin-bottom:12px}
      .schedule-editor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
      .schedule-editor-day{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px}
      .schedule-editor-day h3{font-size:14px;margin-bottom:7px}
      .schedule-editor-item{font-size:12px;padding:7px 0;border-top:1px solid #f1f5f9}
      .schedule-editor-item strong{display:block}
      .schedule-editor-item span{color:#64748b}
      .schedule-editor-modal{position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;padding:16px;z-index:1000}
      .schedule-editor-modal.open{display:flex}
      .schedule-editor-dialog{background:#fff;border-radius:16px;width:min(620px,100%);max-height:92vh;overflow:auto;padding:20px;direction:rtl}
      .schedule-editor-dialog h2{font-size:20px;margin-bottom:14px}
      .schedule-editor-field{display:block;margin:10px 0;font-weight:700;font-size:13px}
      .schedule-editor-field input,.schedule-editor-field select{display:block;width:100%;margin-top:5px;border:1px solid #cbd5e1;border-radius:8px;padding:9px;font:inherit}
      .schedule-editor-choice{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      .schedule-editor-choice label{border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;cursor:pointer;font-size:13px}
      .schedule-editor-actions{display:flex;gap:8px;justify-content:flex-start;margin-top:16px}
      .schedule-editor-actions button{border:0;border-radius:8px;padding:9px 14px;font-weight:800;cursor:pointer}
      .schedule-editor-save{background:#1e3a8a;color:#fff}.schedule-editor-cancel{background:#e2e8f0;color:#0f172a}
    `;
    document.head.appendChild(style);
  }

  function effectiveScheduleFromPage() {
    const state = readState();
    const source = window.baseSchedule || DEFAULT_SCHEDULE;
    return DAY_NAMES.map((name, dayIdx) => ({
      name,
      slots: scheduleEditorEffectiveSlots(dayIdx, source[dayIdx].slots, state)
    }));
  }

  function renderPanel(panel) {
    const schedule = effectiveScheduleFromPage();
    if (!schedule) return;
    panel.innerHTML = `<h2>📝 המערכת המעודכנת</h2><div class="schedule-editor-grid">${
      schedule.map(day => `<section class="schedule-editor-day"><h3>יום ${day.name}</h3>${
        day.slots.map(slot => `<div class="schedule-editor-item"><strong>${escapeHtml(slot.time)} · ${escapeHtml(slot.title)}</strong><span>${escapeHtml(slot.sub)} · ${escapeHtml(TYPE_NAMES[slot.type] || slot.type)}</span></div>`).join("")
      }</section>`).join("")
    }</div>`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function openEditor(dayIdx, slot) {
    const state = readState();
    const current = effectiveSlot(dayIdx, slot, state);
    const modal = document.getElementById("schedule-editor-modal");
    modal.querySelector("[name=day]").value = dayIdx;
    modal.querySelector("[name=slot]").value = slot.id;
    modal.querySelector("[name=title]").value = current.title;
    modal.querySelector("[name=sub]").value = current.sub;
    modal.querySelector("[name=time]").value = current.time;
    modal.querySelector("[name=type]").value = current.type;
    modal.querySelectorAll("[name=scope]").forEach(input => {
      input.checked = input.value === "week";
    });
    modal.classList.add("open");
  }

  function createModal() {
    if (document.getElementById("schedule-editor-modal")) return;
    const modal = document.createElement("div");
    modal.id = "schedule-editor-modal";
    modal.className = "schedule-editor-modal";
    modal.innerHTML = `
      <form class="schedule-editor-dialog">
        <h2>✏️ עריכת אירוע במערכת הגדולה</h2>
        <input type="hidden" name="day"><input type="hidden" name="slot">
        <label class="schedule-editor-field">כותרת<input name="title" required></label>
        <label class="schedule-editor-field">תיאור<input name="sub"></label>
        <label class="schedule-editor-field">שעות (לדוגמה 08:00 - 09:30)<input name="time" required pattern="^\\d{2}:\\d{2} - \\d{2}:\\d{2}$"></label>
        <label class="schedule-editor-field">סוג האירוע<select name="type">${
          Object.entries(TYPE_NAMES).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")
        }</select></label>
        <div class="schedule-editor-choice">
          <label><input type="radio" name="scope" value="week" checked> השבוע בלבד</label>
          <label><input type="radio" name="scope" value="recurring"> בכל שבוע</label>
        </div>
        <div class="schedule-editor-actions">
          <button type="submit" class="schedule-editor-save">שמור וסנכרן</button>
          <button type="button" class="schedule-editor-cancel">ביטול</button>
        </div>
      </form>`;
    document.body.appendChild(modal);
    modal.querySelector(".schedule-editor-cancel").onclick = () => modal.classList.remove("open");
    modal.onclick = event => {
      if (event.target === modal) modal.classList.remove("open");
    };
    modal.querySelector("form").onsubmit = event => {
      event.preventDefault();
      const form = event.currentTarget;
      const state = readState();
      const dayIdx = Number(form.day.value);
      const slotId = form.slot.value;
      const target = form.scope.value === "recurring"
        ? (state.recurringSchedule || (state.recurringSchedule = {}))
        : (state.days[dayIdx] || (state.days[dayIdx] = {})).slotOverrides || (state.days[dayIdx].slotOverrides = {});
      if (form.scope.value === "recurring" && !target[dayIdx]) target[dayIdx] = {};
      const bucket = form.scope.value === "recurring" ? target[dayIdx] : target;
      bucket[slotId] = {
        title: form.title.value.trim(),
        sub: form.sub.value.trim(),
        time: form.time.value.trim(),
        type: form.type.value
      };
      state.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      fetch(NTFY_URL, {
        method: "POST",
        body: JSON.stringify(state)
      }).catch(error => console.error("Failed to sync schedule edit", error));
      modal.classList.remove("open");
      window.location.reload();
    };
  }

  function setupWeeklyPage() {
    if (!document.querySelector(".timetable")) return;
    ensureStyles();
    createModal();
    const toolbar = document.createElement("div");
    toolbar.className = "schedule-editor-toolbar";
    toolbar.innerHTML = `<button class="schedule-editor-btn" type="button">✏️ עריכת המערכת הגדולה</button>`;
    const table = document.querySelector(".table-wrapper");
    table.parentNode.insertBefore(toolbar, table);

    const panel = document.createElement("section");
    panel.className = "schedule-editor-panel";
    table.parentNode.insertBefore(panel, table);
    renderPanel(panel);

    const button = toolbar.querySelector("button");
    button.onclick = () => {
      const schedule = effectiveScheduleFromPage();
      const modal = document.getElementById("schedule-editor-modal");
      const dialog = modal.querySelector("form");
      const picker = document.createElement("div");
      picker.className = "schedule-editor-choice";
      picker.innerHTML = schedule.map((day, dayIdx) => day.slots.map(slot =>
        `<button type="button" data-day="${dayIdx}" data-slot="${slot.id}" style="border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px;cursor:pointer">${day.name}: ${escapeHtml(slot.title)}</button>`
      ).join("")).join("");
      dialog.querySelector(".schedule-editor-picker")?.remove();
      picker.classList.add("schedule-editor-picker");
      dialog.insertBefore(picker, dialog.querySelector(".schedule-editor-field"));
      picker.querySelectorAll("button").forEach(item => item.onclick = () => {
        const dayIdx = Number(item.dataset.day);
        const source = window.baseSchedule || DEFAULT_SCHEDULE;
        const slot = source[dayIdx].slots.find(value => value.id === item.dataset.slot);
        openEditor(dayIdx, slot);
      });
      modal.classList.add("open");
    };

    try {
      const stream = new EventSource(NTFY_URL + "/sse");
      stream.onmessage = event => {
        try {
          const message = JSON.parse(JSON.parse(event.data).message);
          if (message.currentWeekId === weekId(new Date()) &&
              message.updatedAt > (readState().updatedAt || 0)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
            window.location.reload();
          }
        } catch (error) {
          console.error("Failed to apply schedule update", error);
        }
      };
    } catch (error) {
      console.error("Failed to start schedule sync", error);
    }
  }

  ensureStyles();
  window.addEventListener("load", setupWeeklyPage);
})();
