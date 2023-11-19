import { NetworkBuffer, Roles } from "../../../types";
import { PacketBuff } from "./packet_buff";
import WebSocket from "ws";

export class Lobby {
    client_index: number[];
    clients: WebSocket[];
    roles: Roles[];

    constructor() {
        this.client_index = [2, 1, 0];
        this.clients = [];
        this.roles = [Roles.evil, Roles.good, Roles.player];
    }

    assign_client_id(): number {
        if (this.client_index.length > 0) {
            return this.client_index.pop() as number;
        } else {
            return 4;
        }
    }

    add_ws_connection(client: WebSocket, cid = 4): boolean {
        if (cid < 3) {
            this.clients[cid] = client;
            return true;
        } else {
            if (this.client_index.length != 0) {
                this.clients[this.client_index.pop() as number] = client;
                return true;
            } else {
                return false;
            }
        }
    }

    delete(id: number) {
        this.client_index.push(id);
    }

    assign_roles() {
        // for (let index = 0; index < 15; index++) {
        //     let temp = roles[index % 3];
        //     let random = Math.floor(Math.random() * 16) % 3;
        //     roles[index % 3] = roles[random];
        //     roles[random] = temp;
        // }

        return this.roles.pop();
    }
}
