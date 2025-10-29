import { Room, Client } from "@colyseus/core";
import { LobbyState } from "../schema/LobbyState";

export class Lobby extends Room<LobbyState> {
    maxClients = 1000;
    state = new LobbyState();

    onCreate() {

    }

    onJoin(client: Client, options: {name: string}) {
        console.log(client.sessionId, options.name, "joined!");
    }

    onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
