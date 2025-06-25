import { syncEmailsToPort } from "@extension/background/utils/email";
import { connectPort, disconnectPort } from "@extension/background/utils/port";
import { id } from "@extension/utils/id";
import browser from "webextension-polyfill";

browser.runtime.onConnect.addListener(async (runtime) => {
  runtime.onDisconnect.addListener(() => {
    disconnectPort(portId);
  });

  const portId = id("port");
  const port = await connectPort(portId, runtime);

  runtime.onMessage.addListener((payload: any) => {
    switch (payload.event) {
      case "emails.load":
        return syncEmailsToPort(port);
    }
  });
});
