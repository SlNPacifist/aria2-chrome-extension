define(function() {
  function showDownloadStartError(error) {
    var options = {
      type: 'basic',
      iconUrl: '/webui-aria2/favicon.ico',
      title: 'Download error',
      message: 'Could not start download'
    }
    chrome.notifications.create(null, options);
    console.error("Download error", error);
  }

  function showDownloadStart() {
    var options = {
      type: 'basic',
      iconUrl: '/webui-aria2/favicon.ico',
      title: 'Download started',
      message: 'Download started'
    }
    chrome.notifications.create(null, options);
  }

  return {
    showDownloadStartError: showDownloadStartError,
    showDownloadStart: showDownloadStart
  };
});