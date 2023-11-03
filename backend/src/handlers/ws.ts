import { lobbies } from "..";
import { RawData } from "ws";
import { Type } from "../../../types";
import {
    setup_msg,
    sync_msg,
    config_msg,
    calculation_msg,
    test_msg,
    err_msg,
} from "./msg";
import WebSocket from "ws";

export function open(d: RawData, ws: WebSocket) {}
export function close(d: RawData, ws: WebSocket) {
    console.log("close fired");
}
export function message(d: RawData, ws: WebSocket) {
    const data = JSON.parse(d.toString());
    if (data) {
        switch (data.type) {
            case Type.setup:
                setup_msg(data, ws);
                break;
            case Type.sync:
                sync_msg(data, ws);
                break;
            case Type.config:
                config_msg(data, ws);
                break;
            case Type.calculation:
                calculation_msg(data, ws);
                break;
            case Type.test:
                test_msg(data, ws);
                break;
            case Type.err:
                err_msg(data, ws);
                break;
            default:
                break;
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
