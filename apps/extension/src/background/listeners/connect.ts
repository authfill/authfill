import { connectPort, disconnectPort } from "@extension/background/utils/port";
import { id } from "@extension/utils/id";
import browser from "webextension-polyfill";

browser.runtime.onConnect.addListener((port) => {
  const portId = id("port");

  connectPort(portId, port);

  port.onDisconnect.addListener(() => {
    disconnectPort(portId);
  });
});
