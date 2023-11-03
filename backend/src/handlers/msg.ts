import { WorkerMsg, Calculation, Test } from "../../../types";
import { lobbies } from "..";
import WebSocket from "ws";

export function setup_msg(msg: WorkerMsg, ws: WebSocket) {}

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
