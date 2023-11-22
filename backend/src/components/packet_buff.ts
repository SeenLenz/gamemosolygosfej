import { NetworkBuffer } from "../../../types";

export class PacketBuff {
    data: Map<number, NetworkBuffer>;
    index_array: number[]; // Make it non-optional
    buff_len: number;
    buff_p: number;

    constructor(buff_len: number) {
        this.buff_len = buff_len;
        this.buff_p = 0;
        this.index_array = [];
        this.data = new Map<number, NetworkBuffer>();
    }

    Add(data: NetworkBuffer) {
        let index = this.buff_len % ++this.buff_p;
        this.data?.set(this.index_array[index], data);
        this.index_array[index] = data.buff_id;
    }

    Get(id: number) {
        return this.data.get(id);
    }
}
