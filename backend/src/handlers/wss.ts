import { message, open, close } from "./ws";
import WebSocket, { RawData } from "ws";
import { lobbies } from "..";

export function connection(ws: WebSocket, req: Request) {
    const wss_cfg = req.url.split("/");
    console.log(wss_cfg);

    lobbies.get(wss_cfg[1])[Number(wss_cfg[2])] = ws;

    ws.on("close", (d: RawData) => {
        close(d, ws);
    });

    ws.on("open", (d: RawData) => {
        open(d, ws);
    });

    ws.on("message", (d: RawData) => {
        message(d, ws);
    });
}
