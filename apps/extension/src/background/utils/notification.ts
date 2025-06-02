import browser from "webextension-polyfill";

export function showNotification(data: { title: string; message: string }) {
  return browser.notifications.create(undefined, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon-dark-128x128.png"),
    ...data,
  });
}
