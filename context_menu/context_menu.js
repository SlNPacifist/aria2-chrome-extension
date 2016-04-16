function download(target, tab) {
  ClientCreator.fromOptions(Options.get(), function(err, client) {
    if (err) {
      return console.error(err);
    }

    client.aria2.addUri([target.linkUrl || srcUrl], function(err, res) {
      console.log("Result of addUri", err, res);
    });
  });
}

chrome.contextMenus.create({
  "title": "Download via Aria2",
  "contexts":["link", "image"],
  "onclick": download
});