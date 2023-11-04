export enum Type {
    //setup requests with the server and other cliendsa
    setup,
    //the initial request to the worker
    init,
    //synchronizing game logic
    sync,
    //configuration of the worker
    start,
    //calculation from the server requestsed by the client
    err,
    //no types and shit just a string for testing purposes
    test,
    render,
}
export enum Roles {
    good,
    evil,
    player,
}
enum ErrType {}

export interface Setup {
    domain: String;
}

export interface Start {
    role: Roles;
}

export interface Error {
    type: ErrType;
    message: String;
}
export interface Config {}

export interface Render {}

export interface Test {
    msg: string;
}

export interface WorkerMsg {
    type: Type;
    id?: String;
    cid?: Number;
    data: Setup | Start | Error | Config | Test | Render;
}

export interface Lobby {
    cid: number;
    id: String;
}

export interface WebsocketCfg {
    lobby: Lobby;
    error: String;
}
