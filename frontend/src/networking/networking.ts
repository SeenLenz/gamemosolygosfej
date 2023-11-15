import {
    Type,
    Setup,
    WebsocketCfg,
    WorkerMsg,
    Lobby,
    Start,
    NetworkBuffer,
} from "../../../types";
import { main } from "../app";
import { PlayerRole } from "../application/gamelogic/roles/role";

export class Network {
    public domain: String;
    public ws_cfg?: Lobby;
    private ws?: WebSocket;
    private Pisti?: Worker;
    private outBuff: NetworkBuffer;

    private msg: WorkerMsg | NetworkBuffer;

    constructor(domain: String) {
        this.Pisti = new Worker(
            new URL("../worker/worker.ts", import.meta.url)
        );
        this.msg = {} as WorkerMsg;
        this.Pisti.onmessage = (event) => {
            this.worker_msg(event);
        };
        this.domain = domain;
        this.outBuff = { types: [], data: [] };
    }

    get data() {
        return this.msg;
    }

    worker_msg(event: MessageEvent) {
        this.msg = event.data as WorkerMsg;
        if (this.msg.type == Type.start) {
            main((this.msg.data as Start).role);
        }
    }

    async flush() {
        this.Pisti?.postMessage(this.outBuff);
        this.outBuff.data = [];
        this.outBuff.types = [];
    }

    async send(msg: WorkerMsg) {
        if (this.Pisti) {
            this.Pisti.postMessage(msg);
        } else {
            console.error("");
        }
    }

    outBuff_add(msg: any) {
        this.outBuff?.types.push(msg.type);
        this.outBuff?.data.push(msg);
    }

    async create_lobby() {
        const response = await fetch(
            "https://" + this.domain + "/setup/lobbycrt"
        );
        this.ws_cfg = await response.json();

        const lobbyElement = document.querySelector("#lobby_lb");
        if (lobbyElement && this.ws_cfg && this.ws_cfg.id !== undefined) {
            lobbyElement.innerHTML = this.ws_cfg.id;
        }

        this.outBuff.id = this.ws_cfg?.id;
        this.outBuff.cid = this.ws_cfg?.cid;

        if (this.Pisti) {
            this.Pisti?.postMessage({
                type: Type.init,
                id: this.ws_cfg?.id,
                cid: this.ws_cfg?.cid,
                data: {
                    domain: this.domain,
                } as Setup,
            } as WorkerMsg);
        } else {
            console.error("Failed to communicate with backend");
        }
    }

    async join_lobby(lobby_key: String) {
        console.log("join from ts");

        const response = await fetch(
            "https://" + this.domain + "/setup/joinlobby/" + lobby_key
        );
        this.ws_cfg = await response.json();

        if (this.Pisti) {
            this.Pisti?.postMessage({
                type: Type.init,
                id: this.ws_cfg?.id,
                cid: this.ws_cfg?.cid,
                data: {
                    domain: this.domain,
                } as Setup,
            } as WorkerMsg);
        }
    }

    test() {
        console.log(
            "This is a test of networkign library availabilyt in worker.ts"
        );
        this.Pisti?.postMessage({ test: true });
    }
}
