import { App } from "./app.js";
import { lobby_setup } from "./ws.js";
import { close_event } from "./handlers/ws.js";

window.app = new App();

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#join_bt")
    .addEventListener("click", () =>
      lobby_setup(document.querySelector("#join_label").value)
    );
  document
    .querySelector("#create_bt")
    .addEventListener("click", () => lobby_setup());
  document.querySelector("#sendmsg_bt").addEventListener("click", (e) => {
    window.app.socket.send(
      window.app.ws_config.lobby.key +
        ";" +
        window.app.ws_config.lobby.client_id
    );
  });
  document.querySelector("#leave_bt").addEventListener("click", (e) => {
    close_event();
  });
  main();
});

function main() {
  window.app.setup();

  // change to infinte loop
  window.app.main_loop();
}
