import {
    Type,
    Setup,
    WebsocketCfg,
    Lobby,
    Start,
    NetworkBuffer,
    ObjType,
} from "../../../types";
import { main, camera } from "../app";
import { Player } from "../application/gamelogic/player";
import { PlayerRole } from "../application/gamelogic/roles/role";
import { Vec2 } from "../lin_alg";
import { WorkerMsg } from "./WorkerMsg";

export class Network {
    public domain: String;
    public ws_cfg?: Lobby;
    private ws?: WebSocket;
    private Pisti?: Worker;
    private outBuff: NetworkBuffer;
    private char?: Player;

    constructor(domain: String) {
        this.Pisti = new Worker(
            new URL("../worker/worker.ts", import.meta.url)
        );
        this.Pisti.onmessage = (event) => {
            this.worker_msg(event);
        };
        this.domain = domain;
        this.outBuff = { types: [], data: [] };
    }

    worker_msg(event: MessageEvent) {
        if (event.data.types) {
            event.data.data.forEach((data: WorkerMsg, index: number) => {
                this.parse_msg({
                    type: event.data.types[index],
                    data: data,
                });
            });
        } else {
            this.parse_msg(event.data);
        }
    }

    private parse_msg(msg: any) {
        switch (msg.type) {
            case Type.crt:
                switch (msg.data?.type) {
                    case ObjType.player:
                        this.char = new Player(
                            msg.data?.size,
                            msg.data?.pos,
                            true
                        );
                        break;
                    default:
                        break;
                }
                break;
            case Type.sync:
                switch (msg.data.type) {
                    case ObjType.player:
                        if (this.char) {
                            this.char.velocity = new Vec2(
                                msg.data.vel.x,
                                msg.data.vel.y
                            );
                            this.char.pos = new Vec2(
                                msg.data.pos.x,
                                msg.data.pos.y
                            );
                            this.char.frame_time = msg.data.frame_time;
                            this.char.sprite_index = msg.data.sprite_index;
                            this.char.x_direction = msg.data.x_dir;
                        }
                        break;

                    default:
                        break;
                }
                break;
            case Type.start:
                main((msg.data as Start).role);
                break;
            default:
                break;
        }
    }

    flush() {
        if (this.outBuff.data.length > 0) {
            this.Pisti?.postMessage(this.outBuff);
            this.outBuff.data = [];
            this.outBuff.types = [];
        }
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
        this.outBuff?.data.push(msg.data);
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
        const response = await fetch(
            "https://" + this.domain + "/setup/joinlobby/" + lobby_key
        );
        this.ws_cfg = await response.json();

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
        }
    }

    test() {
        console.log(
            "This is a test of networkign library availabilyt in worker.ts"
        );
        this.Pisti?.postMessage({ test: true });
    }
}
