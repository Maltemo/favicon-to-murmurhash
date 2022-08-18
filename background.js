browser.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  // Message is not for this extension, exiting
  if (!message.hasOwnProperty("murmurhash_favicon")) return;

  // Manages requests to update icon
  if (message.murmurhash_favicon === "update_icon_number") {
    await setIconBadge(message.favicon_number);
  }
});

/**
 * Sets badge text and color on the icon in personal toolbar based on provided number.
 *
 * @param {number} number Positive Number that will appear on extension badge
 */
async function setIconBadge(number) {
  const active_tab = await getActiveTab();
  // Setting color of text and background first
  await browser.browserAction.setBadgeTextColor({
    color: "white",
    tabId: active_tab.id,
  });
  await browser.browserAction.setBadgeBackgroundColor({
    color: "gray",
    tabId: active_tab.id,
  });
  // To avoid displaying the change in front of the user
  await browser.browserAction.setBadgeText({
    text: number.toString(),
    tabId: active_tab.id,
  });
}

/**
 * As browser.tabs.getCurrent() is never available in the scope, getting current tab this way
 *
 * @return {tabs.Tab} Active tab
 **/
async function getActiveTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0];
}