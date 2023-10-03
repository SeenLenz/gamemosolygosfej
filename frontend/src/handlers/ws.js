export function msg_event(event) {
  const msg_flags = String(event.data).split(";");
  console.log(msg_flags);
}

export function error_event() {}
export function close_event() {
  window.app.socket.close();
  console.log("connection closed");
}
export function open_event() {}

export function setup() {
  window.app.socket = new WebSocket(
    `ws://localhost:3000/${window.app.ws_config.lobby.key}/${window.app.ws_config.lobby.client_id}`
  );

  // Connection opened
  window.app.socket.addEventListener("open", open_event);

  // Listen for messages
  window.app.socket.addEventListener("message", msg_event);

  console.log(window.app.ws_config.lobby.key);
}
