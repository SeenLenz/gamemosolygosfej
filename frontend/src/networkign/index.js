window.app = {}

document.addEventListener("DOMContentLoaded", (e) => {
    setup();
})

function setup() {
    document.querySelector("#join_bt").addEventListener("click", () => lobby_setup(document.querySelector("#join_label").value))
    document.querySelector("#create_bt").addEventListener("click", () => lobby_setup())
}

async function lobby_setup(lobby_key = 0) {
    console.log("asdfasdf");
    
    if (lobby_key) {
        const response = await fetch("http://127.0.0.1:3000/setup/joinlobby/" + lobby_key);
        window.app.ws_config = await response.json();
        if (window.app.ws_config.Error) {
            console.error(window.app.ws_config.Error)
        } else {

            ws_setup();
        }

    } else {
        const response = await fetch("http://127.0.0.1:3000/setup/lobbycrt");
        window.app.ws_config = await response.json();
        ws_setup();
    }
}

function ws_setup() {
    console.log(window.app.ws_config.lobby)
    window.app.socket = new WebSocket('ws://localhost:3000/./' + window.app.ws_config.lobby.lobby_key + "/" + window.app.ws_config.lobby.client_id);

    // Connection opened
    window.app.socket.addEventListener('open', function (event) {
        window.app.socket.send("true;" + window.app.ws_config.lobby.key + ";" + window.app.ws_config.lobby.client_id)

    });

    // Listen for messages
    window.app.socket.addEventListener('message', function (event) {
        console.log('Message from server ', event);
        console.log(event.data)
    });
}

const sendMessage = () => {
    window.app.socket.send("false;" + window.app.ws_config.lobby.key + ";Wabulabu dabdaa");
}