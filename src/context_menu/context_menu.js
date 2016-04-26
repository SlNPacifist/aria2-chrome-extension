var downloadedUrl;
function getDownloadedUrl() {
  return downloadedUrl;
}

require(['/common/init.js'], function(init) {
  var client = init.client;
  function download(target, tab) {
    client.call.aria2.addUri([target.linkUrl || srcUrl], function(err, res) {
      if (err) {
        return Notification.showRpcError("Could not add download", err);
      }
      console.log("Result of addUri", err, res);
    });
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
});