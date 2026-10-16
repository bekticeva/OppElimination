const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scan");

async function getInstagramTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

// Put an array of usernames into a list.
function fillList(listId, titleId, title, names) {
  document.getElementById(titleId).textContent = `${title} (${names.length})`;
  const list = document.getElementById(listId);
  list.textContent = "";
  for (const name of names) {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  }
}

// Read saved snapshots and show the results.
async function render() {
  const stored = await browser.storage.local.get("snapshots");
  const snapshots = stored.snapshots || [];

  if (snapshots.length === 0) {
    statusEl.textContent = "No scans yet. Click 'Scan now'.";
    return;
  }

  const latest = snapshots[snapshots.length - 1];
  statusEl.textContent = "Last scan: " + new Date(latest.timestamp).toLocaleString();

  // People I follow who don't follow me back.
  const followerSet = new Set(latest.followers);
  const notBack = latest.following.filter((name) => !followerSet.has(name));
  fillList("notBack", "notBackTitle", "fucking losers", notBack);

}

async function init() {
  const tab = await getInstagramTab();

  try {
    const reply = await browser.tabs.sendMessage(tab.id, { type: "GET_USER_ID" });
    messageEl.textContent = reply.userId
      ? "Logged in. User id: " + reply.userId
      : "Open Instagram and log in first.";
  } catch (err) {
    messageEl.textContent = "Open instagram.com in this tab, then click again.";
    scanButton.disabled = true;
  }

  await render();
}

scanButton.addEventListener("click", async () => {
  scanButton.disabled = true;
  statusEl.textContent = "Scanning... this can take a minute or two. You can close this popup.";

  const tab = await getInstagramTab();
  try {
    const reply = await browser.tabs.sendMessage(tab.id, { type: "SCAN" });
    if (reply.ok) {
      await render();
    } else {
      statusEl.textContent = "Error: " + reply.error;
    }
  } catch (err) {
    statusEl.textContent = "Could not reach the Instagram tab.";
  }
  scanButton.disabled = false;
});

init();