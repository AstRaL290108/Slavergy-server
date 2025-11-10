import { Room, Client, Clock } from "@colyseus/core";
import { GameRoomState } from "../schema/GameRoomState";
import { Player } from "../schema/Player";
import { playerConnectOptions, Position } from "../utils/types";
import { Enemy } from "../schema/Enemy";
import { Bullet } from "../schema/Bullet";


export class GameRoom extends Room<GameRoomState> {
    maxClients = 80;
    state = new GameRoomState();
    clock: Clock = new Clock();

    updatePosition(client: Client, newPos: Position&{ angle: number }) {
        const player: Player = this.state.players.get(client.sessionId);
        console.log(newPos);
        player.x = newPos.x;
        player.y = newPos.y;
        player.angle = newPos.angle;

        // console.log(`${player.name} new position`, player.x, player.y);
    }

    attack(client: Client, { nav, type }: {nav: Position, type: number}) {
        if (type == 1) this.spawnFireBullet(client, nav);
        else if (type == 2) this.spawnIceBullet(client, nav);
    }
    chargePlayers() {
        this.state.players.forEach((player, key) => {
            if ( player.states.health <= 0 ) return;

            player.states.health += player.states.healthCharge;
            if ( player.states.health > player.states.totalHealth )
                player.states.health = player.states.totalHealth;

            player.states.mana += player.states.manaCharge;
            if ( player.states.mana > player.states.totalMana )
                player.states.mana = player.states.totalMana;
        });
    }

    spawnFireBullet(client: Client, nav: Position) {
        const player: Player = this.state.players.get(client.sessionId);
        if (player.states.mana < 50) return;

        const bullet = new Bullet(client.sessionId, player.x, player.y, nav, 1);
        this.state.bullets.set(bullet.id, bullet);
        this.clock.setInterval(() => {bullet.update(this)}, 10);

        player.states.mana -= 50;
        this.broadcast("bullets:spawn", {spawnPos: {x: bullet.x, y: bullet.y}, uuid: bullet.id, type: 1});
    }
    spawnIceBullet(client: Client, nav: Position) {
        const player: Player = this.state.players.get(client.sessionId);
        if (player.states.mana < 100) return;

        const bullet1 = new Bullet(client.sessionId, player.x, player.y, nav, 2);
        this.state.bullets.set(bullet1.id, bullet1);
        this.clock.setInterval(() => {bullet1.update(this)}, 10);

        const bullet2 = new Bullet(client.sessionId, player.x, player.y, { x: nav.x + 50, y: nav.y + 50 }, 2);
        this.state.bullets.set(bullet2.id, bullet2);
        this.clock.setInterval(() => {bullet2.update(this)}, 10);

        const bullet3 = new Bullet(client.sessionId, player.x, player.y, { x: nav.x - 50, y: nav.y - 50 }, 2);
        this.state.bullets.set(bullet3.id, bullet3);
        this.clock.setInterval(() => {bullet3.update(this)}, 10);

        player.states.mana -= 100;
        this.broadcast("bullets:spawn", {spawnPos: {x: bullet1.x, y: bullet1.y}, uuid: bullet1.id, type: 2});
        this.broadcast("bullets:spawn", {spawnPos: {x: bullet2.x, y: bullet2.y}, uuid: bullet2.id, type: 2});
        this.broadcast("bullets:spawn", {spawnPos: {x: bullet3.x, y: bullet3.y}, uuid: bullet3.id, type: 2});
    }

    printMessage(client: Client, message: string) {
        const player: Player = this.state.players.get(client.sessionId);
        console.log(`${player.name} say: "${message}"`);
    }

    onCreate() {
        // console.log(`Room ${this.roomId} created!`);
        this.onMessage("player:update-position", this.updatePosition.bind(this));
        this.onMessage("player:attack", this.attack.bind(this));
        this.onMessage("player:message", this.printMessage.bind(this));

        this.clock.setInterval(() => {
            this.chargePlayers();
        }, 1000);
    }

    onJoin(client: Client, options: playerConnectOptions) {
        const player: Player = new Player({...options, sessionId: client.sessionId});
        this.state.players.set(client.sessionId, player);

        console.log(`${player.name} joined!`);
        client.send("player:control-player-added");

        this.broadcast("room:player-connect", {
            data: JSON.stringify(player),
            sessionId: client.sessionId
        }, { except: client });
    }

    onLeave (client: Client) {
        this.state.players.delete(client.sessionId);
        this.broadcast("room:player-disconnect", client.sessionId);
    }

    onDispose() {
        // console.log(`Room ${this.roomId} is dispose!`);
    }
}