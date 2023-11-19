import { Type } from "../../../types";
import { network } from "../app";

export class WorkerMsg {
    cid?: number;
    id?: String;
    type: Type;
    data?: any;

    constructor(type: Type, data?: any) {
        console.log(network);
        this.cid = network.ws_cfg?.cid;
        this.id = network.ws_cfg?.id;
        this.type = type;

        if (!data) {
            this.data = {};
        } else {
            this.data = data;
        }
    }
}
