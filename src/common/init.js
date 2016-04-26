require.config({
  baseUrl: '/'
});

define(['./connection.js', './client.js'], function(Connection, Client) {
  var connection = new Connection();
  return {
    client: new Client(connection),
  }
});