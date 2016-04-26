var downloadedUrl;
function getDownloadedUrl() {
  return downloadedUrl;
}

require(['/common/init.js', '/common/notification.js'], function(init, Notification) {
  var client = init.client;
  function download(target, tab) {
    client.call.aria2.addUri([target.linkUrl || srcUrl], function(err, res) {
      if (err) {
        Notification.showDownloadStartError(err);
      } else {
        Notification.showDownloadStart();
      }
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