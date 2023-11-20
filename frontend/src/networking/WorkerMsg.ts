import { Type } from "../../../types";
import { network } from "../app";

export class WorkerMsg {
    cid?: number;
    id?: String;
    type: Type;
    data?: any;

    constructor(type: Type, data?: any) {
        this.cid = network.ws_cfg?.cid;
        this.id = network.ws_cfg?.id;
        this.type = type;

        console.log(this.id);
        if (!data) {
            this.data = {};
        } else {
            this.data = data;
        }
    }
}
