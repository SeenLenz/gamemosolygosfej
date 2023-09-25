import express, {
  Express,
  Request,
  Response,
  Application,
  RequestHandler,
} from "express";
import httl, { Server, createServer } from "http";

import {
  wsh_close,
  wsh_error,
  wsh_message,
  wsh_connect,
  wsh_reconnect,
  wsh_retry,
} from "./handlers/ws";
import { v4 as uuid } from "uuid";
import { WebSocket, WebSocketServer } from "ws";
import { json } from "stream/consumers";

const app: Express = express();
const server: Server = createServer(app);
const wss = new WebSocketServer({ server: server });

let lobbies = new Map();

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(e) {
    const data = e.toString().split(";");

    if (data[0] != "false") {
      console.log(lobbies.get(data[1]));
      console.log(data);
      lobbies.get(data[1])[data[2]] = ws;
      ws.send("true");
    } else {
      const lobby = lobbies.get(data[1]);
      for (let i = 1; i < lobby[0] + 1; i++) {
        lobby[i].send(data);
      }
    }
  });
});

app.use(express.urlencoded({ extended: true }) as RequestHandler);
app.get("/", express.static("./src/public"), (req, res) => {});
app.get("/joinlobby/:lobby_key", (req, res) => {
  if (lobbies.has(req.params.lobby_key)) {
    let clientarr = lobbies.get(req.params.lobby_key);
    if (clientarr[0] < 3) {
      return res.json({
        lobby: { key: req.params.lobby_key, client_id: ++clientarr[0] },
      });
    } else {
      return res.json({ Error: "Lobby full" });
    }
  } else {
    return res.json({
      Error: "Lobby with ID:" + req.params.lobby_key + " Does not exist",
    });
  }
});

app.get("/lobbycrt", (req, res) => {
  const lobby_key = uuid().slice(0, 8);
  lobbies.set(lobby_key, [1, {}, {}, {}]);
  return res.json({
    lobby: { key: lobby_key, client_id: 1 },
  });
});

server.listen(3000, () => console.log(`Lisening on port :3000`));

//Request legend
//0 : Is this a game or a setup message?
//1 : Lobby id
//2 : client position in lobby
//3 : Raw Game Data
