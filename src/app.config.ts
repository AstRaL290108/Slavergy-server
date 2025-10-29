import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

import { Lobby } from "./rooms/Lobby";
import { GameRoom } from "./rooms/GameRoom";

export default config({

    initializeGameServer: (gameServer) => {
        gameServer.define('lobby', Lobby);
        gameServer.define('game_room', GameRoom);
    },

    initializeExpress: (app) => {
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        app.use("/monitor", monitor());
    },


    beforeListen: () => {
        
    }
});
