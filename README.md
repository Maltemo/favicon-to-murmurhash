# Favicon to Murmurhash <img src="icons/favicon2murmurhash-48.png" width="35" alt="Extension logo">

Extracts favicon of the current page and calculates their murmurhash.
Shows links to shodan search based on favicon murmurhashes.
Aims to ease OSINT investigations.

## Install

Search on the mozilla webstore "Favicon to Murmurhash" or just click on the link to the extension :
https://addons.mozilla.org/fr/firefox/addon/favicon-to-murmurhash/

Alternatively, you can clone the git repository on your computer :
```
git clone https://github.com/Maltemo/favicon-to-murmurhash.git
```
Then go to `Extension and Themes`, click on the setting wheel on this page and choose `Install module from files`.
From this file browser, go to the cloned repository and select the `manifest.json` file.

## Main usage

During an OSINT investigation, if you find a website of your target, you can try to search for other websites using the same favicon.
Click on the extension icon in your toolbar.
From this page, you can choose the favicon, click on the murmurhash and get redirected directly to Shodan with the following query:
```
http.favicon.hash:{murmurhash}
```
In order to see results of those queries, you will need to have a Shodan account.

## Details about features

Detects the number of favicon in the current page and update extension badge consequently.
Every hashes are listed in the menu, you can click on them to get directly to the related shodan search.
You can also copy the url of the favicon.
When you open the extension menu, the following actions are made: 
- Searches for every favicon in the page
- Tries to download them (CORS policy might block the download infortunately)
- Transform them in base64 then in murmurhash (same process as Shodan).

## Privacy

No analytics. No data sent to third parties. No bullsh\*t.
You can read the code if you don't trust my words.

## Known problems

Some favicons can't be downloaded because of CORS (Cross-Origin Resource Sharing).
I don't want to go through a proxy (mine or a third party one) because it would disclose the navigation path of users of this extension.
If you have other ideas to find a workaround or to at least help the user when this happens, I'm open to some suggestions or some pull requests.

## Road-Map

- Implement this extension for google chrome, I will be using session storage instead of fetching images every time the popup opens (firefox, why don't you support this type of storage…).
- Improve the interface (still some overlapping between some elements).

## Licencing

[MIT](LICENSE)

## Developemnt team

### Author

<a href="https://github.com/Maltemo">@Maltemo</a>

### Direct help

Big thanks to <a href="https://github.com/boberle">@boberle</a> that helped me with the debugging on the base64 part and to <a href="https://github.com/M3lanight">@M3lanight</a> that helped me for the design of the popup.

### Contributors

Maybe you ?
