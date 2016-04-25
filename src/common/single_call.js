window.SingleCall = (function() {
  var ARIA2_METHODS = [
    'addUri', 'addTorrent', 'addMetalink', 'remove', 'forceRemove', 'pause', 'pauseAll', 'forcePause',
    'forcePauseAll', 'unpause', 'unpauseAll', 'tellStatus', 'getUris', 'getFiles', 'getPeers',
    'getServers', 'tellActive', 'tellWaiting', 'tellStopped', 'changePosition', 'changeUri',
    'getOption', 'changeOption', 'getGlobalOption', 'changeGlobalOption', 'getGlobalStat',
    'purgeDownloadResult', 'removeDownloadResult', 'getVersion', 'getSessionInfo', 'shutdown',
    'forceShutdown', 'saveSession'
  ];

  var SYSTEM_METHODS = ['multicall', 'listMethods'];

  function createCallSynonym(requestName, checkThrottling) {
    return function() {
      var callback = arguments[arguments.length - 1];
      var params = [];
      for (var i = 0; i < arguments.length - 1; i++) {
        params.push(arguments[i]);
      }
      this.call(requestName, params, callback);
    }
  }

  function SingleCall() {
    var self = this;
    this.aria2 = {};
    ARIA2_METHODS.forEach(function(name) {
      self.aria2[name] = createCallSynonym('aria2.' + name, true).bind(self);
    });

    this.system = {};
    SYSTEM_METHODS.forEach(function(name) {
      self.system[name] = createCallSynonym('system.' + name, false).bind(self);
    });
  }

  SingleCall.prototype.call = function call(requestName, params, callback) {
    var isFinished = false;
    var success = async.apply(finishCall, false);
    var failHandler = setTimeout(async.apply(finishCall, true), 3000);
    ConnectionService.get(success);

    function finishCall(isTimedOut, client) {
      if (isFinished) {
        console.error("SingleCall call is finished twice");
        return;
      }
      isFinished = true;
      if (isTimedOut) {
        ConnectionService.revoke(success);
        callback(new Error('No connection available'));
      } else {
        clearTimeout(failHandler);
        client.call(requestName, params, callback);
      }
    }
  }

  return SingleCall;
})();

window.SingleCallService = new SingleCall();