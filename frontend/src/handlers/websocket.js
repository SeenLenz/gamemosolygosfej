export function msg_event() {
  console.log("Message from server ", event);
  console.log(event.data);
}

export function error_event() {}
export function close_event() {}

export function open_event() {
  window.app.socket.send(
    "true;" +
      window.app.ws_config.lobby.key +
      ";" +
      window.app.ws_config.lobby.client_id
  );
}

export function setup() {
  console.log(window.app.ws_config.lobby);
  window.app.socket = new WebSocket("ws://localhost:3000");

  // Connection opened
  window.app.socket.addEventListener("open", open_event);

  // Listen for messages
  window.app.socket.addEventListener("message", msg_event);
}
