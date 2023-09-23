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

    lobbies.set(data[0], ws);
  });
});

app.use(express.urlencoded({ extended: true }) as RequestHandler);
app.get("/", express.static("./src/public"), (req, res) => {});
app.get("/lobby", (req, res) => {
  if (lobbies.has(req.body.lobby_key)) {
    let clientarr = lobbies.get(req.body.lobby_key);
    if (clientarr[0] < 3) {
      return res.json({
        lobby: { key: req.body.lobby_key, id: ++clientarr[0] },
      });
    }
  } else {
  }
});

app.get("/joinlobby", (req, res) => {
  const lobby_key = uuid().slice(0, 8);
  lobbies.set(lobby_key, [1, {}, {}, {}]);
  return res.json({
    lobby: { key: lobby_key, id: 1 },
  });
});

server.listen(3000, () => console.log(`Lisening on port :3000`));
