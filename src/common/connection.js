define(['../libs/aria_client.js', './transport_creator.js'], function(AriaLib, TransportCreator) {
  function Connection() {
    this._client = null;
    this.state = this.STATE.idle;
    this._waitingConnection = [];
    this.options = {
      reconnectTimeout: 10000
    }
    this._lastReconnectTime = Date.now() - this.options.reconnectTimeout;
    this._connect = this._connect.bind(this);
    this._destroyClient = this._destroyClient.bind(this);
  }

  Connection.prototype.get = function get(callback) {
    console.debug("Connection got request for transport");
    switch (this.state) {
      case this.STATE.idle:
        console.debug("Was idle, starting connection process");
        this._waitingConnection.push(callback);
        this._connect();
        break;
      case this.STATE.connecting:
        console.debug("Connecting right now, waiting for finish");
        this._waitingConnection.push(callback);
        break;
      case this.STATE.connected:
        console.debug("Already connected, returning", this._client);
        callback(this._client);
        break;
    }
  }

  Connection.prototype.revoke = function revoke(callback) {
    var idx = this._waitingConnection.indexOf(callback);
    console.debug("Revoking transport request from", idx);
    if (idx >= 0) {
      this._waitingConnection.splice(idx, 1);
    }
  }

  Connection.prototype._connect = function connect() {
    if (this._waitingConnection.length == 0) {
      console.debug("No more pending requests for transport left, stopping conneciton process");
      this.state = this.STATE.idle;
      return;
    }
    this.state = this.STATE.connecting;
    TransportCreator.fromCurrentOptions(function(res) {
      if (!res) {
        console.debug("Could not create transport from current options");
        return setTimeout(this._connect, Date.now() - this._lastReconnectTime + this.options.reconnectTimeout);
      }
      console.debug("Got transport from current options", res);
      this._setTransport(res);
    }.bind(this));
  }

  Connection.prototype._setTransport = function setTransport(transport) {
    this._client = new AriaLib.AriaClient(transport);
    this.state = 'connected';
    console.debug("Returning transport for " + this._waitingConnection.length + " waiting requests");
    this._waitingConnection.forEach(function(callback) {
      callback(this._client);
    }.bind(this));
    this._waitingConnection = [];
    transport.on('error', this._destroyClient);
  }

  Connection.prototype._destroyClient = function destroyClient(err) {
    console.debug("Destroying client due to error", err);
    // TODO: destroy client and underlying transport properly
    this._client.cancelAllRequests();
    this._client = null;
    this._connect();
  }

  Connection.STATE = Connection.prototype.STATE = {
    idle: 'idle',
    connecting: 'connecting',
    connected: 'connected'
  }

  return Connection;
});