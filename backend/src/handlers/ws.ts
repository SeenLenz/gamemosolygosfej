import { Websocket } from "websocket-ts";
import { lobbies } from "..";
import { RawData } from "ws";

export function open(d: RawData, ws: any) {}
export function close(d: RawData, ws: any) {
  console.log("close event fired");
}
export function message(d: RawData, ws: any) {
  const data = d.toString().split(";");
  console.log(data);
  const lobby = lobbies.get(data[0]);
  for (let i = 1; i < lobby[0] + 1; i++) {
    if (lobby[i] != ws) {
      lobby[i].send(d.toString());
    }
  }
}
export function error() {}

//Request legend
//0 : Is this a game or a setup message?
//1 : Lobby id
//2 : client position in lobby
//3 : Raw Game Data
