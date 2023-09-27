import { msg_event, open_event, setup } from "./websocket.js";

export async function lobby_setup(lobby_key = 0) {
  console.log("asdfasdf");
  if (lobby_key) {
    const response = await fetch(
      "http://127.0.0.1:3000/joinlobby/" + lobby_key
    );
    window.app.ws_config = await response.json();
    if (window.app.ws_config.Error) {
      console.error(window.app.ws_config.Error);
    } else {
      setup();
    }
  } else {
    const response = await fetch("http://127.0.0.1:3000/lobbycrt");
    window.app.ws_config = await response.json();
    setup();
  }
}
