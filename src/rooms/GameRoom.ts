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
        player.x = newPos.x;
        player.y = newPos.y;
        player.angle = newPos.angle;

        // console.log(`${player.name} new position`, player.x, player.y);
    }

    attack(client: Client, victimId: string) {
        const playerInitiator: Player = this.state.players.get(client.sessionId);
        const playerVictim: Player = this.state.players.get(victimId);

        const radius = Math.sqrt( 
            (playerInitiator.x - playerVictim.x)**2 +
            (playerInitiator.y - playerVictim.y)**2 );

        if (radius > playerInitiator.states.attackRange) return;
        playerVictim.getDamage(this, playerInitiator.states.damage);
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

    spawnBullet(client: Client, nav: Position) {
        const player: Player = this.state.players.get(client.sessionId);
        if (player.states.mana < 50) return;

        const bullet = new Bullet(client.sessionId, player.x, player.y, nav);
        this.state.bullets.set(bullet.id, bullet);
        this.clock.setInterval(() => {bullet.update(this)}, 10);

        player.states.mana -= 50;
        this.broadcast("bullets:spawn", {spawnPos: {x: bullet.x, y: bullet.y}, uuid: bullet.id});
    }

    printMessage(client: Client, message: string) {
        const player: Player = this.state.players.get(client.sessionId);
        console.log(`${player.name} say: "${message}"`);
    }

    onCreate() {
        // console.log(`Room ${this.roomId} created!`);
        this.onMessage("player:update-position", this.updatePosition.bind(this));
        this.onMessage("player:attack", this.attack.bind(this));
        this.onMessage("player:spawn-bullet", this.spawnBullet.bind(this));
        this.onMessage("player:message", this.printMessage.bind(this));

        const testEnemy = new Enemy({ x: 500, y: 450 });
        this.state.enemyBots.set(testEnemy.id, testEnemy);

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