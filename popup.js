// ======================= LOADER =======================
function showLoader() {
  const overlay = document.createElement("div");
  overlay.id = "loaderOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 360px; height: 100vh;
    background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  `;

  const loader = document.createElement("img");
  loader.src = "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWFyM243YTR1bjlvbDJtOWQwaHRjZTJsNml1bm9hNTJ6bW4yNzVveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EoH4Wpu8suiNTLpI6j/giphy.gif";
  loader.style.width = "320px";

  overlay.appendChild(loader);
  document.body.appendChild(overlay);
}

function hideLoader() {
  const overlay = document.getElementById("loaderOverlay");
  if (overlay) overlay.remove();
}


// ======================= SETTINGS TAB =======================
document.addEventListener("DOMContentLoaded", () => {
  const MAX_DAYS = 5;

  const daysWrapper = document.getElementById("daysWrapper");
  const desksWrapper = document.getElementById("desksWrapper");
  const addDayBtn = document.getElementById("addDayBtn");
  const addDeskBtn = document.getElementById("addDeskBtn");

  // ----- Add Day -----
  function addDay(value = "") {
    if (daysWrapper.children.length >= MAX_DAYS) return;
    const div = document.createElement("div");
    div.className = "day-container";
    div.innerHTML = `<input type="date" value="${value}">`;
    daysWrapper.appendChild(div);

    if (daysWrapper.children.length >= MAX_DAYS)
      addDayBtn.style.display = "none";
  }
  addDayBtn.onclick = () => addDay();


  // ----- Add Desk -----
  function addDesk(value = "") {
    const div = document.createElement("div");
    div.className = "desk-container";
    div.innerHTML = `<input type="text" placeholder="Desk code" value="${value}">`;
    desksWrapper.appendChild(div);
  }
  addDeskBtn.onclick = () => addDesk();


  // ======================= SAVE SETTINGS =======================
  document.getElementById("saveBtn").onclick = () => {
    const desks = [...document.querySelectorAll(".desk-container input")]
      .map(e => e.value.trim())
      .filter(v => v);

    const dates = [...document.querySelectorAll(".day-container input")]
      .map(e => e.value)
      .filter(v => v);

    if (!dates.length) return alert("⚠️ Add at least one date");

    chrome.runtime.sendMessage({ action: "getJSession" }, ({ jsession }) => {
      if (!jsession) return alert("⚠️ Login first!");

      const payload = {
        clientCookies: `JSESSIONID=${jsession}`,
        sector: document.getElementById("sector").value,
        floorIndex: Number(document.getElementById("floor").value) || 0,
        dates,
        preferredDesks: desks,
      };

      showLoader();

      fetch("https://completedmyplannercheat.onrender.com/secret/updateConfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(resp => {
          hideLoader();
          if (resp.status === "ok") {
            alert(`🎉 Config saved for ${resp.email}`);
            chrome.storage.local.set(payload);
          } else {
            alert(`⚠ Error: ${resp.message}`);
          }
        })
        .catch(err => console.error("Error sending config:", err));
    });
  };


  // ======================= MANUAL JSESSION UPDATE =======================
  document.getElementById("runBtn").addEventListener("click", () => {
    chrome.cookies.getAll(
      { domain: "myplanner.netcompany-intrasoft.com" },
      cookies => {
        const jsession = cookies.find(c => c.name === "JSESSIONID");
        if (!jsession) return alert("⚠️ Cookie not found");

        showLoader();

        fetch("https://completedmyplannercheat.onrender.com/secret/updateConfig", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientCookies: `JSESSIONID=${jsession.value}`
          })
        })
          .then(res => res.json())
          .then(resp => {
            hideLoader();
            alert("✅ JSESSIONID manually updated");
          })
          .catch(err => console.error("Error:", err));
      }
    );
  });


  // Default: 1 day & 1 desk
  addDay();
  addDesk();
});
