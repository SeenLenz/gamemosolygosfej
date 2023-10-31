window.app = {};

document.addEventListener("DOMContentLoaded", (e) => {
  setup();
});
console.log("asdf");
function setup() {
  document
    .querySelector("#join_bt")
    .addEventListener("click", () =>
      lobby_setup(document.querySelector("#join_label").value)
    );
  document
    .querySelector("#create_bt")
    .addEventListener("click", () => lobby_setup());
  document
    .querySelector("#msg_bt")
    .addEventListener("click", () => sendMessage());
}

async function lobby_setup(lobby_key = 0) {
  if (lobby_key) {
    const response = await fetch(
      "https://gamemosolygosfej.onrender.com/setup/joinlobby/" + lobby_key
    );
    window.app.ws_config = await response.json();
    if (window.app.ws_config.Error) {
      console.error(window.app.ws_config.Error);
    } else {
      ws_setup();
    }
  } else {
    const response = await fetch(
      "https://gamemosolygosfej.onrender.com/setup/lobbycrt"
    );
    window.app.ws_config = await response.json();
    ws_setup();
  }
}

function ws_setup() {
  console.log(window.app.ws_config.lobby);
  window.app.socket = new WebSocket(
    "ws://gamemosolygosfej.onrender.com/" +
      window.app.ws_config.lobby.key +
      "/" +
      window.app.ws_config.lobby.client_id
  );

  // Connection opened
  window.app.socket.addEventListener("open", function (event) {
    window.app.socket.send(
      "true;" +
        window.app.ws_config.lobby.key +
        ";" +
        window.app.ws_config.lobby.client_id
    );
  });

  // Listen for messages
  window.app.socket.addEventListener("message", function (event) {
    console.log("Message from server ", event);
    console.log(event.data);
  });
}

const sendMessage = () => {
  console.log(window.app);
  window.app.socket.send(
    "false;" + window.app.ws_config.lobby.key + ";Wabulabu dabdaa"
  );
};
