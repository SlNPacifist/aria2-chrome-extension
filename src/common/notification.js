define(function() {
  function showRpcError(message, error) {
    var options = {
      type: 'basic',
      iconUrl: 'webui-aria2/favicon.ico',
      title: 'Rpc error',
      message: message
    }
    chrome.notifications.create(null, options);
    console.error("Rpc error", message, error);
  }

  return {
    showRpcError: showRpcError
  };
});