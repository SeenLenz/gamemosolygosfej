import { Calculation, Config, Sync, Type, WorkerMsg } from "../../../types";

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

    ws_setup(args: Setup) {}

    readmsg(event: MessageEvent) {
        console.log(event);
        switch (event.data.type) {
            case Type.init:
                this.init_msg(event.data);
                break;
            case Type.setup:
                this.setup_msg(event.data);
                break;
            case Type.sync:
                this.sync_msg(event.data);
                break;
            case Type.config:
                this.config_msg(event.data);
                break;
            case Type.calculation:
                this.calculation_msg(event.data);
                break;
            case Type.test:
                this.test_msg(event.data);
                break;
            case Type.err:
                this.err_msg(event.data);
                break;
            default:
                break;
        }
    }

    test_msg(msg: WorkerMsg) {
        if (this.ws) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    init_msg(msg: WorkerMsg) {
        let setupObj = msg.data as Setup;
        this.ws = new WebSocket(
            "ws://" + setupObj.domain + "/" + msg?.id + "/" + msg?.cid
        );

        //        setInterval((e) => {
        //            this.ws_keepalive();
        //        }, this.keepalive_time);

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

    sync_msg(event: MessageEvent) {}

    config_msg(event: MessageEvent) {}

    calculation_msg(event: MessageEvent) {}

    err_msg(event: MessageEvent) {}

    setup_msg(event: MessageEvent) {}

    sendmsg(res: WorkerMsg) {}
    ws_message(event: MessageEvent) {
        console.log(JSON.parse(event.data));
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
