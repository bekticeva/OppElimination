const messageEl = document.getElementById("message");

async function init() {
  // Find the tab the user is currently looking at.
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  try {
    const reply = await browser.tabs.sendMessage(tab.id, { type: "GET_USER_ID" });
    if (reply.userId) {
      messageEl.textContent = "Logged in. Your user id: " + reply.userId;
    } else {
      messageEl.textContent = "Open Instagram and log in first.";
    }
  } catch (err) {
    // This happens if the active tab isn't instagram.com
    // (or hasn't been reloaded since you loaded the extension).
    messageEl.textContent = "Open instagram.com in this tab, then click again.";
  }
}

init();