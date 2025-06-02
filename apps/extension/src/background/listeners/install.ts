import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.tabs.create({
      url: chrome.runtime.getURL("index.html#/setup"),
    });
  }
});
