import { Connection } from './connection.js';
import { Bridge, setProtocolDebugEnabled } from './bridge.js';
import { ConnectionLostWidget, getDeviceId } from './utils.js';

// Export `setProtocolDebugEnabled` function
// to global scope
window['Korolev'] = {
  'setProtocolDebugEnabled': setProtocolDebugEnabled,
  'reconnect': () => console.log("Connection is not ready")
};

window.document.addEventListener("DOMContentLoaded", () => {

  let config = window['kfg'];
  let clw = new ConnectionLostWidget(config['clw']);
  let connection = new Connection(
    getDeviceId(),
    config['sid'],
    config['r'],
    window.location
  );

  // Set reconnect handler
  window['Korolev']['reconnect'] = () => connection.disconnect();

  connection.dispatcher.addEventListener('open', () => {
    clw.hide();
    let bridge = new Bridge(config, connection);
    let closeHandler = (event) => {
      bridge.destroy();
      clw.show();
      connection
        .dispatcher
        .removeEventListener('close', closeHandler);
    };
    connection
      .dispatcher
      .addEventListener('close', closeHandler);
  });

  connection.dispatcher.addEventListener('close', () => {
    // Reconnect
    connection.connect();
  });

  connection.connect();
});
