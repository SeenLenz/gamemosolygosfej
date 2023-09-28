import express, { Express, RequestHandler } from "express";
import { Server, createServer } from "http";

import { v4 as uuid } from "uuid";
import { WebSocketServer } from "ws";

export const exp_app: Express = express();1
const server: Server = createServer(exp_app);
const wss = new WebSocketServer({ server: server });

export let lobbies = new Map();

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
server.listen(3000, () => console.log(`Lisening on port :3000`));

//Request legend
//0 : Is this a game or a setup message?
//1 : Lobby id
//2 : client position in lobby
//3 : Raw Game Data
