const Imap = require("imap");

const imap = new Imap({
  user: "simon@koeck.dev",
  password: "BLJwMBynDSXY8eNtEQSxrerk6f86gzbJ",
  host: "mail.privateemail.com",
  port: 993,
  tls: true,
});

imap.on("ready", function () {
  console.log("IMAP ready");

  imap.openBox("INBOX", true, (err, box) => {
    if (err) {
      console.log(err);
      return;
    }

    const f = imap.seq.fetch("1:3", {
      bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
      struct: true,
    });

    f.on("message", function (msg, seqno) {
      console.log("Message #%d", seqno);
      var prefix = "(#" + seqno + ") ";
      msg.on("body", function (stream, info) {
        var buffer = "";
        stream.on("data", function (chunk) {
          buffer += chunk.toString("utf8");
        });
        stream.once("end", function () {
          console.log(prefix + "Parsed header: %s", Imap.parseHeader(buffer));
        });
      });

      msg.once("attributes", function (attrs) {
        console.log(prefix + "Attributes: %s", attrs, false, 8);
      });

      msg.once("end", function () {
        console.log(prefix + "Finished");
      });
    });

    f.once("error", function (err) {
      console.log("Fetch error: " + err);
    });

    f.once("end", function () {
      console.log("Done fetching all messages!");
      imap.end();
    });
  });
});

imap.on("error", function (err) {
  console.log("Error occurred");
  console.log(err);
});

imap.on("end", function () {
  console.log("Connection ended");
});

imap.connect();
