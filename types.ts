import { Vec2 } from "./frontend/src/lin_alg";

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
    player,
    good,
    evil,
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

export interface NetworkRenderable {
    pos: Vec2;
    size: Vec2;
    rotation: number;
    x_direction: number;
    texture_index: number;
    z_coord: number;
}

export interface Test {
    msg: string;
}

export interface WorkerMsg {
    type: Type;
    id?: String;
    cid?: Number;
    data: Setup | Start | Error | Config | Test | NetworkRenderable;
}

export interface Lobby {
    cid: number;
    id: String;
}

export interface WebsocketCfg {
    lobby: Lobby;
}
