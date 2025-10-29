import { Room, Client } from "@colyseus/core";
import { GameRoomState } from "../schema/GameRoomState";
import { Player } from "../schema/Player";
import { playerConnectOptions, Position } from "../utils/types";


export class GameRoom extends Room<GameRoomState> {
    maxClients = 80;
    state = new GameRoomState();

    updatePosition(client: Client, newPos: Position) {
        const player: Player = this.state.players.get(client.sessionId);
        player.x = newPos.x;
        player.y = newPos.y;

        this.state.players.set(client.sessionId, player);
    }

    attack(client: Client, victimId: string) {
        const playerInitiator: Player = this.state.players.get(client.sessionId);
        const playerVictim: Player = this.state.players.get(victimId);

        console.log(`${playerInitiator.name} wanna attack ${playerVictim.name}`);
    }

    onCreate() {
        console.log(`Room ${this.roomId} created!`);
        this.onMessage("player:update-position", this.updatePosition.bind(this));
        this.onMessage("player:attack", this.attack.bind(this));
    }

    onJoin(client: Client, options: playerConnectOptions) {
        const player: Player = new Player(options);
        this.state.players.set(client.sessionId, player);
        console.log(options.name, "joined!");
    }

    onLeave (client: Client) {
        const player: Player = this.state.players.get(client.sessionId);
        this.state.players.delete(client.sessionId);
        console.log(player.name, "left!");
    }
}