import { Vec2 } from "./frontend/src/lin_alg";

export enum Type {
    //setup requests with the server and other cliendsa
    setup,
    //the initial request to the worker
    init,
    //synchronizing game logic
    sync,
    camera,
    dynamic_game_object,
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
    index: number;
    pos: Vec2;
    size: Vec2;
    rotation: number;
    x_direction: number;
    texture_index: number;
    texture_coords: Float32Array;
    z_coord: number;
}

export interface CameraSync {
    pos: Vec2;
    scale: number;
    rotation: number;
}

export interface Test {
    msg: string;
}

export interface NetworkBuffer {
    types: Type[];
    id?: string;
    cid?: number;
    data: any[];
}

export interface WorkerMsg {
    type: Type;
    id?: string;
    cid?: number;
    data:
        | Setup
        | Start
        | Error
        | Config
        | Test
        | NetworkRenderable
        | CameraSync;
}

export interface Lobby {
    cid: number;
    id: string;
}

export interface WebsocketCfg {
    lobby: Lobby;
}
