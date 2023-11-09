import { Router } from "express";
import { lobbies } from "../index";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/joinlobby/:lobby_key", (req, res) => {
    if (lobbies.has(req.params.lobby_key)) {
        let clientarr = lobbies.get(req.params.lobby_key);
        if (clientarr[0] < 3) {
            return res.json({
                id: req.params.lobby_key,
                cid: ++clientarr[0],
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
    lobbies.set(lobby_key, [1, {}, {}, {}]);
    return res.json({
        id: lobby_key,
        cid: 1,
    });
});

export default router;
