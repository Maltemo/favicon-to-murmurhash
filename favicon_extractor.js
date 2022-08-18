/**
 * Get a list of all favicons in the current web pages
 *
 * @return {Array.<Object>} List of objects containing href and rel attributes from link tags
 */
function getFavicons() {
  // CSS Selector getting all links with a parameter rel containing icon
  const faviconsNodeList = document.querySelectorAll("link[rel*='icon']");
  const faviconsArray = Array.from(faviconsNodeList);

  // By default, check default favicon file.
  faviconsArray.push({
    href: `${window.location.origin}/favicon.ico`,
    rel: "no link tag specified",
  });

  return faviconsArray;
}

/**
 * From a list of favicon URLs, download them, transform them in base64 format and hash them with MurmurHash.
 *
 * @param {Array.<Object>} faviconsArray
 * @return {Array.<Object>} List of objects containing murmurhash, favicon url and rel data.
 */
async function processFavicons(faviconsArray) {
  const promise_result = await Promise.all(
    faviconsArray.map(async (tag) => {
      if (window.fetch) {
        try {
          const imageBlobs = await downloadImage(tag.href);
          const base64DataRFC2048 = await blobToBase64RFC2048(imageBlobs);
          const murmurhash = murmurhash3_32_gc(base64DataRFC2048);
          return {
            href: tag.href,
            rel: tag.rel,
            murmurhash: murmurhash,
          };
        } catch (err) {
          if (err instanceof TypeError) {
            console.warn(
              `CORS blocking favicon access of ${tag.href}. Sending it to background`
            );
          } else {
            console.error(err);
          }
        }
      } else {
        console.error("Fetch API is not supported by your browser.");
      }
    })
  );
  return promise_result;
}

/**
 * From a URL, download the image from the fetch API
 *
 * @param {string} url Unified Resource Link to the image we want to download
 * @return {Blob} Blob of binary data from the image
 */
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const imageBlob = await response.blob();
  return imageBlob;
}

/**
 * From blob binary data, transform it as base64 based on the RFC 2048
 *
 * @param {Blob} blob Binary data
 * @return {Promise} resolves with the base64 string
 */
function blobToBase64RFC2048(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Base64 data is returned with a header, we get rid of it
      const base64data = reader.result.split(",")[1];
      // Shodan hashes are based on the base64 of favicon using RFC2048
      // This means that we have to insert every 76 characters backslashes and add
      // a backslash at the end.
      const base64dataRFC2048 = base64data.replace(/.{76}/g, "$&\n") + "\n";
      resolve(base64dataRFC2048);
    };
    reader.error = reject;
    reader.readAsDataURL(blob);
  });
}

// Handling reload messages sent from popup
browser.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (
    message.hasOwnProperty("murmurhash_favicon") &&
    message.murmurhash_favicon == "reload_hashes"
  ) {
    await calculateHashesAndSendMessage();
  } else {
    console.log("Not concerning me");
  }
});

/**
 * Main function calculating hashes and sending the message to the popup js file with the hashes
 */
async function calculateHashesAndSendMessage() {
  const favicons = getFavicons();
  const hashes_list = await processFavicons(favicons);
  await browser.runtime.sendMessage({
    murmurhash_favicon: "result",
    hashes_list: hashes_list,
  });
}

/**
 * Function called when the content-script is loaded in the page
 * Only calculates the number of favicons in the page and send it to the background
 * to set the badge on the extension icon
 */
async function onPageLoad() {
  const favicons = getFavicons();
  await browser.runtime.sendMessage({
    murmurhash_favicon: "update_icon_number",
    favicon_number: favicons.length,
  });
}

// Called on new page loading
(async () => {
  await onPageLoad();
})();
