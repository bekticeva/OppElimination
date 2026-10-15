   console.log("IG Unfollowers content script loaded");
function getMyUserId(){
    const match = document.cookie.match(/ds_user_id=(\d+)/);
    return match ? match[1] : null;
}

browser.runtime.onMessage.addListener((message) => {
    if(message.type === "GET_USER_ID"){
        return Promise.resolve({userId: getMyUserId()});
    }
});