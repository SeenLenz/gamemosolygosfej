export function wsh_connect(ws: Websocket, me: Event) {
  console.log("connection established");
  return 0;
}
export function wsh_close(ws: Websocket, me: CloseEvent) {
  console.log("connection closed");
  return 0;
}
export function wsh_error(ws: Websocket, me: Event) {}
export function wsh_message(ws: Websocket, me: MessageEvent) {
  console.log("message recieved");
}
export function wsh_retry(
  ws: Websocket,
  me: CustomEvent<ReconnectEventDetail>
) {}
export function wsh_reconnect(
  ws: Websocket,
  me: CustomEvent<ReconnectEventDetail>
) {}
