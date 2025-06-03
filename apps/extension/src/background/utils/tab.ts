import browser from "webextension-polyfill";

export async function getActiveTab() {
  const tabs = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (tabs.length === 0) {
    console.warn("No active tab found");
    return undefined;
  }

  return tabs[0];
}

export function hasValidUrl(tab: browser.Tabs.Tab) {
  if (!tab.url) return false;
  const url = new URL(tab?.url || "");
  return ["http:", "https:"].includes(url.protocol);
}
