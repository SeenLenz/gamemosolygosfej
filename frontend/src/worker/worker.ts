import { Type, WorkerMsg } from "../../../types";

interface Setup {
    domain: String;
    key: String;
    cid: Number;
}

class Self {
    ws?: WebSocket;
    keepalive_time: number;

    constructor(keepalive_time: number) {
        onmessage = (e) => {
            this.readmsg(e);
        };
        this.keepalive_time = keepalive_time;
        console.log("created stuff");
    }

    async readmsg(event: MessageEvent) {
        if (event.data.types) {
            this.ws?.send(JSON.stringify(event.data));
        } else {
            switch (event.data.type) {
                case Type.init:
                    this.init_msg(event.data);
                    break;
                default:
                    const result = await this.ws?.send(
                        JSON.stringify(event.data)
                    );
                    break;
            }
        }
    }

    init_msg(msg: WorkerMsg) {
        console.log(msg);
        let setupObj = msg.data as Setup;
        this.ws = new WebSocket(
            "ws://" + setupObj.domain + "/" + msg?.id + "/" + msg?.cid
        );

        setInterval((e) => {
            this.ws_keepalive();
        }, this.keepalive_time);

        this.ws.onopen = (e) => {
            this.ws_open(e);
        };
        this.ws.onclose = (e) => {
            this.ws_close(e);
        };
        this.ws.onmessage = (e) => {
            this.ws_message(e);
        };
        this.ws.onerror = (e) => {
            this.ws_error(e);
        };
    }

    start_msg(event: MessageEvent) {
        this.ws?.send(JSON.stringify(event.data));
    }

    ws_message(event: MessageEvent) {
        postMessage(JSON.parse(event.data));
    }

    ws_error(event: Event) {}

    ws_close(event: Event) {}

    ws_keepalive() {
        if (this.ws) {
            this.ws.send("false");
        }
    }

    ws_open(event: Event) {}
}

const Pisti = new Self(30000);
