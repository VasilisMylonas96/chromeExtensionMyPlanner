// chrome.cookies.getAll(
//   {domain: "myplanner.netcompany-intrasoft.com"},
//   function (cookies) {
//     console.log("🔥 Cookies returned:", cookies);

//     const jsession = cookies.find((c) => c.name === "JSESSIONID");
// fetch("https://completedmyplannercheat.onrender.com/secret/updateConfig", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       clientCookies:`JSESSIONID=${jsession.value}`,
//       sector: "AMALIAS",              // ή ότι θες
//       dates: ["2025-03-12"],          // ή άστο άδειο
//       floorIndex: 0,
//       preferredDesks: ["D5", "D6"]
//     })
//   });
//     if (jsession) {
//       console.log("🔥🔥 JSESSIONID:", jsession.value);
//     } else {
//       console.log("⚠ Cookie not found");
//     }
//   }
// );

setInterval(() => {
  chrome.cookies.getAll(
    {domain: "myplanner.netcompany-intrasoft.com"},
    function (cookies) {
      const jsession = cookies.find((c) => c.name === "JSESSIONID");
      if (!jsession) return console.warn("⚠ Cookie not found");

      console.log("🔥🔥 JSESSIONID:", jsession.value);

      fetch(
        "https://completedmyplannercheat.onrender.com/secret/updateConfig",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            clientCookies: `JSESSIONID=${jsession.value}`,
            sector: "AMALIAS",
            dates: ["2025-03-12"],
            floorIndex: 0,
            preferredDesks: ["D5", "D6"],
          }),
        }
      ).catch((err) => console.error("Error sending JSESSIONID:", err));
    }
  );
}, 2 * 60 * 60 * 1000); // κάθε 1000ms = 1 δευτερόλεπτο
function sendJSession() {
  chrome.cookies.getAll(
    {domain: "myplanner.netcompany-intrasoft.com"},
    function (cookies) {
      const jsession = cookies.find((c) => c.name === "JSESSIONID");
      if (!jsession) return console.warn("⚠ Cookie not found");

      console.log("🔥🔥 JSESSIONID:", jsession.value);

      fetch(
        "https://completedmyplannercheat.onrender.com/secret/updateConfig",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            clientCookies: `JSESSIONID=${jsession.value}`,
          }),
        }
      ).catch((err) => console.error("Error sending JSESSIONID:", err));
    }
  );
}

// τρέχει άμεσα
sendJSession();

// και μετά κάθε 2 ώρες
setInterval(sendJSession, 2 * 60 * 60 * 1000);
// Κρατάμε πάντα το τελευταίο JSESSIONID
let currentJSession = null;

// Λήψη cookie κάθε 30 δευτερόλεπτα
// function fetchJSession() {
//   chrome.cookies.get(
//     { url: "https://myplanner.netcompany-intrasoft.com", name: "JSESSIONID" },
//     (cookie) => {
//       if (cookie) {
//         currentJSession = cookie.value;
//         console.log("🔥 JSESSIONID updated:", currentJSession);
//       } else {
//         currentJSession = null;
//         console.warn("⚠ JSESSIONID not found");
//       }
//     }
//   );
// }

// fetchJSession();
// setInterval(fetchJSession, 30000);

// Listener για να στείλει JSESSIONID στο popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getJSession") {
    chrome.cookies.getAll(
      {domain: "myplanner.netcompany-intrasoft.com"},
      (cookies) => {
        const jsession = cookies.find((c) => c.name === "JSESSIONID");
        sendResponse({jsession: jsession ? jsession.value : null});
      }
    );
    return true; // keep the message channel open for async response
  }
});
