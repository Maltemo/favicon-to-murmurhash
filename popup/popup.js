document
  .getElementById("lbl-reload-hashes")
  .addEventListener("click", reloadHashes);

/**
 * Sends a message to the content-scripts to request to compute murmurhashes of 
 * favicons
 */
async function reloadHashes() {
  const active_tab = await getActiveTab();
  await browser.tabs.sendMessage(active_tab.id, {
    murmurhash_favicon: "reload_hashes",
  });
}

browser.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  //Message is not for this extension, exiting
  if (!message.hasOwnProperty("murmurhash_favicon")) return;

  if (message.hasOwnProperty("hashes_list")) {
    if (!message.hashes_list.every((x) => typeof x === "undefined")) {
      document.getElementById("hashes-display").replaceChildren();
    }
    const unique_hashes_list = uniqueHashesAndMergesUrls(message.hashes_list);
    unique_hashes_list.map(addHashInTable);
    await setIconBadge(unique_hashes_list.length);
  }
});

/**
 * Adds dynamically hash_data in the tbody of the table if it's not undefined
 */
function addHashInTable(hash_data) {
  if (typeof hash_data === "undefined") return;
  const tr = document.createElement("tr");
  tr.appendChild(createShodanLinkInTd(hash_data.murmurhash));
  tr.appendChild(createTextTd(hash_data.href.split("/").pop()));
  tr.appendChild(createURLCopyLink(hash_data.href));
  const tbody = document.getElementById("hashes-display");
  tbody.appendChild(tr);
}

/**
 * Filters out duplicate murmurhashes from the list.
 * Transfers URL of duplicates in the original one.
 *
 * @param {Array.<Object>} hashes_list List of objects that can have duplicated
 *                         murmurhash property and undefined objects
 * @return {Array.<Object>} List of objects having unique murmurhashes property
 */
function uniqueHashesAndMergesUrls(hashes_list) {
  const unique_murmurhashes = [];
  const filtered_hashes_list = [];
  const duplicated_hashes_list = [];

  hashes_list.forEach(function (data) {
    // Filters out undefined data
    if (typeof data === "undefined") return;
    // Current murmurhash is unique for the moment
    else if (!unique_murmurhashes.includes(data.murmurhash)) {
      unique_murmurhashes.push(data.murmurhash);
      filtered_hashes_list.push(data);
    }
    // Murmurhash is already in the unique list
    else {
      duplicated_hashes_list.push(data);
    }
  });

  // For duplicates, concatenate the url to the first occurence of this murmurhash
  duplicated_hashes_list.forEach(function (data) {
    const index = filtered_hashes_list.findIndex(
      (object) => object.murmurhash === data.murmurhash
    );
    // If the url isn't already present in href, then concatenate it to the href
    if (!filtered_hashes_list[index].href.includes(data.href)) {
      filtered_hashes_list[
        index
      ].href = `${filtered_hashes_list[index].href} - ${data.href}`;
    }
  });
  return filtered_hashes_list;
}

/**
 * Creates a td element and attaches to it a TextNode containing the given 
 * string in parameter
 *
 * @param {string} text Text that will be added in the TextNode inside the td tag
 * @return {Element} Td element with a TextNode attached to it
 */
function createTextTd(text) {
  const td = document.createElement("td");
  if (text.length > 0) {
    const text_node = document.createTextNode(text);
    td.appendChild(text_node);
  }
  return td;
}

/**
 * Creates a td element and attaches to it a link referring to shodan
 * murmurhash favicon search
 *
 * @param {string} murmurhash String containing the murmurhash of an element,
 *                            in our case of a favicon
 * @return {Element} Td element with a link attached to it, referring to shodan
 *                   search based on favicon murmurhash
 */
function createShodanLinkInTd(murmurhash) {
  const td = document.createElement("td");
  const a = document.createElement("a");
  const text_node = document.createTextNode(murmurhash);
  a.appendChild(text_node);
  a.href = `https://www.shodan.io/search?query=http.favicon.hash%3A${murmurhash}`;
  a.classList.add("murmur");
  td.appendChild(a);
  return td;
}

/**
 * Creates a td containing the clipboard icon to copy urls of favicons
 *
 * @param {string} url Url that will be copied on click and stored in title 
 *                     parameter of the image
 * @return {Element} Td element with an svg image attached to it
 */
function createURLCopyLink(url) {
  const td = document.createElement("td");
  const img = document.createElement("img");
  img.src = "assets/images/copy-regular.svg";
  img.classList.add("icon-size");
  img.classList.add("icon-copy");
  img.title = url;
  img.addEventListener("click", async function () {
    await navigator.clipboard.writeText(url);
    toggleVisibility(document.getElementById("tooltip-clipboard"));
    setTimeout(function () {
      toggleVisibility(document.getElementById("tooltip-clipboard"));
    }, 1500);
  });
  td.appendChild(img);
  return td;
}

/**
 * Sets text, color and background color of the notification badge on extension
 * logo in toolbar
 *
 * @param {string} number_of_hashes_found Number of hash found on the page that
 *                                        will be displayed on the badge
 */
async function setIconBadge(number_of_hashes_found) {
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
    text: number_of_hashes_found.toString(),
    tabId: active_tab.id,
  });
}

/**
 * As browser.tabs.getCurrent() is never available in the scope, getting
 * current tab this way
 *
 * @return {tabs.Tab} Active tab
 **/
async function getActiveTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0];
}

/**
 * Toggles visibility of an element of the DOM
 *
 * @param {Element} tag DOM Element having only one of those classes : visible or hidden
 */
function toggleVisibility(tag) {
  // XOR -> if tag has hidden class or visible class but not the two simultaneously
  if (tag.classList.contains("hidden") ^ tag.classList.contains("visible")) {
    tag.classList.toggle("visible");
    tag.classList.toggle("hidden");
  }
}

// Called when the popup is opened
(async () => {
  await reloadHashes();
})();
