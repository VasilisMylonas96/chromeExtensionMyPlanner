// ========================= CALENDAR =========================

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
});


// Load calendar ONLY when clicking the tab
function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tab).classList.add("active");

      if (tab === "calendar") loadCalendar();
    });
  });
}


function loadCalendar() {
  chrome.runtime.sendMessage({ action: "getJSession" }, ({ jsession }) => {
    if (!jsession) return;

    fetch("https://completedmyplannercheat.onrender.com/secret/getReservedDays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientCookies: `JSESSIONID=${jsession}` })
    })
      .then(res => res.json())
      .then(data => {
        // 1) Ημερομηνίες από config
        const configDates = data.datesConfigured || [];

        // 2) Ημερομηνίες από πραγματικό calendar
        const bookedDates = (data.calendar || [])
          .filter(d => d.status === "BOOKED")
          .map(d => d.date);

        // 3) Συνδυασμός μοναδικών ημερών
        const reserved = Array.from(new Set([...configDates, ...bookedDates]));

        renderCalendar(reserved);
      });
  });
}



function renderCalendar(reservedDays) {
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const totalDays = last.getDate();

  // Empty slots before the 1st
  for (let i = 0; i < first.getDay(); i++) {
    container.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    cell.className = "dayCell";
    cell.textContent = d;

    const iso = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    if (reservedDays.includes(iso)) {
      cell.classList.add("reserved");
      // make it circular
      cell.style.borderRadius = "50%";
      cell.style.width = "30px";
      cell.style.height = "30px";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.margin = "0 auto";
    }

    if (iso === today.toISOString().split("T")[0]) cell.classList.add("today");

    container.appendChild(cell);
  }
}

