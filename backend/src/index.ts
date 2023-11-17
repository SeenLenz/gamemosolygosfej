import express, { Express, RequestHandler } from "express";
import { Server, createServer } from "http";
import { connection } from "./handlers/wss";
import { v4 as uuid } from "uuid";
import { WebSocketServer } from "ws";
import routes from "./router";
import exp from "constants";
import { Lobby } from "./components/lobby";
export const exp_app: Express = express();
export let lobbies = new Map<String, Lobby>();
const server: Server = createServer(exp_app);
const wss = new WebSocketServer({ server: server });

wss.on("connection", connection);

exp_app.use("/", routes);

server.listen(3000, "10.0.23.4", () => console.log(`Lisening on port :3000`));

//Request legend
//0 : Is this a game or a setup message?
//1 : Lobby id
//2 : client position in lobby
//3 : Raw Game Data
