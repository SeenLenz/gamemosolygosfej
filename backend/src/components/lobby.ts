import { NetworkBuffer } from "../../../types";
import { PacketBuff } from "./packet_buff";
import WebSocket from "ws";

export class Lobby {
    client_index: number[];
    clients: WebSocket[];
    buff: PacketBuff;

    constructor() {
        this.client_index = [0, 1, 2];
        this.buff = new PacketBuff(20);
        this.clients = [];
    }

    assign_cid(): number {
        if (this.client_index.length > 0) {
            return this.client_index.pop() as number;
        } else {
            return 0;
        }
    }

    Add(client: WebSocket): boolean {
        if (this.client_index.length != 0) {
            this.clients[this.client_index.pop() as number] = client;
            return true;
        } else {
            return false;
        }
    }

    Del(id: number) {
        this.client_index.push(id);
    }
}
