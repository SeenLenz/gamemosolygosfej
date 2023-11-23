import {
    Type,
    Setup,
    WebsocketCfg,
    Lobby,
    Start,
    NetworkBuffer,
    ObjType,
} from "../../../types";
import { main, camera, RemoteBuff } from "../app";
import { Effect, PlayerEffects } from "../application/base/effects";
import { DynamicGameObj, GameObject } from "../application/base/gameobject";
import { Player } from "../application/gamelogic/player";
import { Vec2 } from "../lin_alg";
import { WorkerMsg } from "./WorkerMsg";

export class Network {
    public domain: String;
    public ws_cfg?: Lobby;
    private ws?: WebSocket;
    private Pisti?: Worker;
    private outBuff: NetworkBuffer;

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
                if (msg.data?.effect != undefined) {
                    let pos: Vec2 = msg.data?.pos;
                    new Effect(
                        msg.data?.size,
                        pos,
                        msg.data?.x_dir,
                        msg.data?.texure_index,
                        msg.data?.effect,
                        msg.data?.speed,
                        msg.data?.repeat,
                        msg.data?.offset,
                        msg.data?.reverse,
                        true,
                        msg.data?.parent_obj
                    );
                    break;
                }
                switch (msg.data?.type) {
                    case ObjType.player:
                        RemoteBuff.set(
                            msg.data?.remote_id,
                            new Player(
                                msg.data?.size,
                                msg.data?.pos,
                                true,
                                msg.data?.remote_id
                            )
                        );
                        break;
                    default:
                        break;
                }
                break;
            case Type.sync:
                if (msg.data.hit) {
                    (
                        GameObject.objects.find((v) => {
                            return (
                                (v as DynamicGameObj).remote_id ==
                                msg.data.remote_id
                            );
                        }) as DynamicGameObj
                    ).damage_taken(msg.data.damage, msg.data.hit_dir);
                    break;
                }

                if (msg.data.death) {
                    (
                        GameObject.objects.find((v) => {
                            return (
                                (v as DynamicGameObj).remote_id == msg.data.this
                            );
                        }) as DynamicGameObj
                    ).remove();
                }
                RemoteBuff.get(msg.data.remote_id)?.in(msg.data);
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
            "http://" + this.domain + "/setup/joinlobby/" + lobby_key
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
