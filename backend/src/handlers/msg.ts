import { WorkerMsg, Test, Roles, Start } from "../../../types";
import { lobbies } from "..";
import WebSocket from "ws";

export function start_msg(msg: WorkerMsg, ws: WebSocket) {
    const lobby = lobbies.get(msg.id);

    let roles: Roles[] = [Roles.player, Roles.evil, Roles.good];

    // for (let index = 0; index < 15; index++) {
    //     let temp = roles[index % 3];
    //     let random = Math.floor(Math.random() * 16) % 3;

    //     roles[index % 3] = roles[random];
    //     roles[random] = temp;
    // }

    for (let i = 1; i < lobby[0] + 1; i++) {
        lobby[i].send(
            JSON.stringify({
                ...msg,
                data: { role: roles[i - 1] } as Start,
            })
        );
    }
}

export function sync_msg(msg: WorkerMsg, ws: WebSocket) {}

export function config_msg(msg: WorkerMsg, ws: WebSocket) {}

export function calculation_msg(msg: WorkerMsg, ws: WebSocket) {}

export function test_msg(msg: WorkerMsg, ws: WebSocket) {
    const lobby = lobbies.get(msg.id);

    for (let i = 1; i < lobby[0] + 1; i++) {
        if (lobby[i] == ws) {
            lobby[i].send(
                JSON.stringify({
                    ...msg,
                    data: { msg: "hello from backend" } as Test,
                })
            );
            break;
        }
    }
}

export function err_msg(msg: WorkerMsg, ws: WebSocket) {}
