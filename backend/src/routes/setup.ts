import { Router } from "express";
import { lobbies } from "../index";
import { v4 as uuid } from "uuid";
import { Lobby } from "../components/lobby";

const router = Router();

router.get("/joinlobby/:lobby_key", (req, res) => {
    if (lobbies.has(req.params.lobby_key)) {
        let lobby = lobbies.get(req.params.lobby_key);
        let cid = lobby?.assign_client_id() as number;

        if (cid < 3) {
            return res.json({
                id: req.params.lobby_key,
                cid: cid,
            });
        } else {
            return res.json({ Error: "Lobby full" });
        }
    } else {
        return res.json({
            Error: "Lobby with ID:" + req.params.lobby_key + " Does not exist",
        });
    }
});

router.get("/lobbycrt", (req, res) => {
    const lobby_key = uuid().slice(0, 8);
    let lobby = new Lobby();
    lobbies.set(lobby_key, lobby);

    return res.json({
        id: lobby_key,
        cid: lobby.assign_client_id(),
    });
});

export default router;
