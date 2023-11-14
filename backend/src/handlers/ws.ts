import { lobbies } from "..";
import { RawData } from "ws";
import { NetworkBuffer, Type } from "../../../types";
import { start_msg, test_msg } from "./msg";
import WebSocket from "ws";

export function open(d: RawData, ws: WebSocket) {}
export function close(d: RawData, ws: WebSocket) {
    console.log("close fired");
}
export function message(d: RawData, ws: WebSocket) {
    const data = JSON.parse(d.toString());
    console.log("\n\n");
    console.log(d, data);
    const lobby = lobbies.get(data.id);
  if (data) {
    if (!data.type) {
      for (let i = 1; i < lobby[0] + 1; i++) {
            if (lobby[i] !== ws) {
              lobby[i].send(JSON.stringify(data));
              break;
            }
          }
    } else {
      switch (data.type) {
        case Type.start:
          start_msg(data, ws);
          break;
        case Type.test:
          test_msg(data, ws);
          break;
        default:
          for (let i = 1; i < lobby[0] + 1; i++) {
            if (lobby[i] !== ws) {
              lobby[i].send(JSON.stringify(data));
              break;
            }
          }
      }
    }
    } else {
        console.log("invalid data");
    }
}
export function error() {}

//Request legend
//0 : Is a game or a setup message?
//1 : Lobby id
//2 : client position in lobby
//3 : Raw Game Data
