import { Test, Roles, Start } from "../../../types";
import { WorkerMsg } from "../../../frontend/src/networking/WorkerMsg";
import { lobbies } from "..";
import WebSocket from "ws";

export function start_msg(msg: WorkerMsg, ws: WebSocket) {
    console.log("start from msg start_msg");
    console.log(msg);

    if (msg.id) {
        const lobby = lobbies.get(msg.id);
        for (let i = 0; i < (lobby?.clients.length as number); i++) {
            lobby?.clients[i].send(
                JSON.stringify({
                    ...msg,
                    data: { role: lobby.assign_roles() } as Start,
                })
            );
        }
    }
}

export function sync_msg(msg: WorkerMsg, ws: WebSocket) {}

export function config_msg(msg: WorkerMsg, ws: WebSocket) {}

export function calculation_msg(msg: WorkerMsg, ws: WebSocket) {}

export function test_msg(msg: WorkerMsg, ws: WebSocket) {
    if (msg.id) {
        const lobby = lobbies.get(msg.id);

        for (let i = 0; i < (lobby?.clients.length as number); i++) {
            if (lobby?.clients[i] == ws) {
                lobby?.clients[i].send(
                    JSON.stringify({
                        ...msg,
                        data: { msg: "hello from backend" } as Test,
                    })
                );
                break;
            }
        }
    }
}

export function err_msg(msg: WorkerMsg, ws: WebSocket) {}
