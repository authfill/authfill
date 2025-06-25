import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.tabs.create({
      url: browser.runtime.getURL("index.html#/setup"),
    });
  }
});
