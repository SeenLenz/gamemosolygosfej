import { App } from "./app.js";
import { lobby_setup } from "./handlers/setup.js";

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
  main();
});

function main() {
  window.app.setup();

  // change to infinte loop
  window.app.main_loop();
}
