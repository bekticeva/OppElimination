   
const APP_ID = "936619743392459"; // Instagram's public web app id
let scanning = false;

function getMyUserId(){
    const match = document.cookie.match(/ds_user_id=(\d+)/);
    return match ? match[1] : null;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve,ms));
} 

async function fetchAll(userId, type){
    const users = [];
    let maxId = "";

    do{
        const url =
        `https://www.instagram.com/api/v1/friendships/${userId}/${type}/` +
        `?count=50&max_id=${maxId}`;

        const response = await fetch(url, {
            credentials: "include",
            headers: {"X-IG-App-ID": APP_ID}
        })

        if (!response.ok) {
            throw new Error(`Instagram answered ${response.status} for ${type}`)
        }

        const data = await response.json();
        for (const user of data.users) {
            users.push(user.username);}

        maxId = data.next_max_id || "";
        console.log(`${type}: ${users.length} so far`);

        await sleep(2000 + Math.random() * 2000);

    }while (maxId);

    return users;
}

async function scan() {
  const userId = getMyUserId();
  if (!userId) throw new Error("Not logged in");

  const followers = await fetchAll(userId, "followers");
  const following = await fetchAll(userId, "following");

  const stored = await browser.storage.local.get("snapshots");
  const snapshots = stored.snapshots || [];
  snapshots.push({ timestamp: Date.now(), followers, following });
  await browser.storage.local.set({ snapshots: snapshots.slice(-30) });
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "GET_USER_ID") {
    return Promise.resolve({ userId: getMyUserId() });
  }

  if (message.type === "SCAN") {
    if (scanning) {
      return Promise.resolve({ ok: false, error: "A scan is already running." });
    }
    scanning = true;
    return scan()
      .then(() => ({ ok: true }))
      .catch((err) => ({ ok: false, error: err.message }))
      .finally(() => { scanning = false; });
  }
});



