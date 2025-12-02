function showLoader() {
  const overlay = document.createElement("div");
  overlay.id = "loaderOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "360px";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.3)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const loader = document.createElement("img");
  loader.src =
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWFyM243YTR1bjlvbDJtOWQwaHRjZTJsNml1bm9hNTJ6bW4yNzVveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EoH4Wpu8suiNTLpI6j/giphy.gif";
  loader.style.width = "360px";
  loader.style.height = "200px";
  overlay.appendChild(loader);

  document.body.appendChild(overlay);
}

function hideLoader() {
  const overlay = document.getElementById("loaderOverlay");
  if (overlay) overlay.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  const MAX_DAYS = 5;

  const daysWrapper = document.getElementById("daysWrapper");
  const desksWrapper = document.getElementById("desksWrapper");
  const addDayBtn = document.getElementById("addDayBtn");
  const addDeskBtn = document.getElementById("addDeskBtn");

  // --- Add Day dynamically ---
  function addDay(value = "") {
    const count = daysWrapper.querySelectorAll(".day-container").length;
    if (count >= MAX_DAYS) return;

    const div = document.createElement("div");
    div.className = "day-container";
    div.innerHTML = `<input type="date" value="${value}">`;
    daysWrapper.appendChild(div);

    if (daysWrapper.querySelectorAll(".day-container").length >= MAX_DAYS) {
      addDayBtn.style.display = "none";
    }
  }
  addDayBtn.onclick = () => addDay();

  // --- Add Desk dynamically ---
  function addDesk(value = "") {
    const div = document.createElement("div");
    div.className = "desk-container";
    div.innerHTML = `<input type="text" placeholder="Desk code" value="${value}">`;
    desksWrapper.appendChild(div);
  }
  addDeskBtn.onclick = () => addDesk();

  // --- Save all settings ---
  document.getElementById("saveBtn").onclick = () => {
    const PREFERRED_DESKS = [];
    document.querySelectorAll(".desk-container input").forEach((input) => {
      const val = input.value.trim();
      if (val) PREFERRED_DESKS.push(val);
    });

    // Πίνακας με τις ημερομηνίες
    const DATES = [];
    document.querySelectorAll(".day-container input").forEach((input) => {
      const val = input.value;
      if (val) DATES.push(val); // format YYYY-MM-DD από type="date"
    });

    if (DATES.length === 0) return alert("⚠️ Add at least one date");

    chrome.runtime.sendMessage({action: "getJSession"}, ({jsession}) => {
      if (!jsession) return alert("⚠️ JSESSIONID not found, log in first");

      const payload = {
        clientCookies: `JSESSIONID=${jsession}`,
        sector: document.getElementById("sector")?.value || "",
        floorIndex: parseInt(document.getElementById("floor")?.value, 10) || 0,
        dates: DATES,
        preferredDesks: PREFERRED_DESKS,
      };
      showLoader();
      fetch(
        "https://completedmyplannercheat.onrender.com/secret/updateConfig",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        }
      )
        .then((res) => res.json())
        .then((resp) => {
          hideLoader();
          if (resp.status === "ok") {
            alert(`🎉 Config saved for ${resp.email}`);
            chrome.storage.local.set({
              DATES,
              PREFERRED_DESKS,
              sector: payload.sector,
              floorIndex: payload.floorIndex,
            });
          } else {
            alert(`⚠ Error: ${resp.message}`);
          }
        })
        .catch((err) => console.error("Error sending config:", err));
    });
  };

  // --- Initialize default 1 day + 1 desk ---
  addDay();
  addDesk();
});
document.getElementById("runBtn").addEventListener("click", () => {
  chrome.cookies.getAll(
    {domain: "myplanner.netcompany-intrasoft.com"},
    (cookies) => {
      const jsession = cookies.find((c) => c.name === "JSESSIONID");
      if (!jsession) return console.warn("⚠ Cookie not found");

      console.log("🔥 Sending manual JSESSIONID:", jsession.value);
      showLoader();
      fetch(
        "https://completedmyplannercheat.onrender.com/secret/updateConfig",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            clientCookies: `JSESSIONID=${jsession.value}`,
          }),
        }
      )
        .then((res) => res.json())
        .then((resp) => {
          alert("✅ JSESSIONID manually updated:", resp);
          hideLoader();
        })
        .catch((err) =>
          console.error("❌ Error sending manual JSESSIONID:", err)
        );
    }
  );
});
