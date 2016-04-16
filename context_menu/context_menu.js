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

var downloadedUrl;
function getDownloadedUrl() {
  return downloadedUrl;
}

function downloadAs(target, tab) {
  var params = {
    url: "/context_menu/download_as.html",
    focused: true,
    type: 'popup',
    width: 300,
    height: 80
  };
  downloadedUrl = target.linkUrl || srcUrl;
  chrome.windows.create(params);
}

chrome.contextMenus.create({
  "title": "Download via Aria2",
  "contexts":["link", "image"],
  "onclick": download
});

chrome.contextMenus.create({
  "title": "Download via Aria2 as...",
  "contexts":["link", "image"],
  "onclick": downloadAs
});