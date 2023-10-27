import { message, open, close } from "./ws";
import WebSocket from "ws";
import { lobbies } from "..";

export function connection(ws: WebSocket, req: Request) {
  const wss_cfg = req.url.split("/");
  console.log("connection url: " + wss_cfg);

  console.log(lobbies)
  lobbies.get(wss_cfg[1])[Number(wss_cfg[2])] = ws;

  ws.on("close", (d: any) => {
    close(d, ws);
  });

  ws.on("open", (d: any) => {
    open(d, ws);
  });

  ws.on("message", (d: any) => {
    message(d, ws);
  });
}
