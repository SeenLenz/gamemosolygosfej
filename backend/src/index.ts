import express, { Express, Request, Response , Application } from 'express';
import httl, { Server, createServer } from "http"
import { Http2Server } from 'http2';
import { Websocket,  WebsocketBuilder} from 'websocket-ts';

const app: Express = express();
const server: Server = createServer(app);
const wss: WebSocket = new WebsocketBuilder("ws://localhost:9090").build();