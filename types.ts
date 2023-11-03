export enum Type {
    //setup requests with the server and other cliendsa
    setup,
    //the initial request to the worker
    init,
    //synchronizing game logic
    sync,
    //configuration of the worker
    config,
    //calculation from the server requestsed by the client
    calculation,
    //something went wrong
    err,
    //no types and shit just a string for testing purposes
    test,
}

enum ErrType {}

export interface Setup {
    domain: String;
}
export interface Sync {}
export interface Calculation {}
export interface Error {
    type: ErrType;
    message: String;
}
export interface Config {}
export interface Test {
    msg: string;
}

export interface WorkerMsg {
    type: Type;
    id?: String;
    cid?: Number;
    data: Setup | Sync | Calculation | Error | Config | Test;
}

export interface Lobby {
    client_id: number;
    key: String;
}

export interface WebsocketCfg {
    lobby: Lobby;
    error: String;
}
