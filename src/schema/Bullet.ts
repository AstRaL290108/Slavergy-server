import { Schema, type } from "@colyseus/schema";
import { randomUUID } from "crypto";
import { Position } from "../utils/types";
import { Room } from "colyseus";
import { Player } from "./Player";

export class Bullet extends Schema {
    @type("string") id: string;
    @type("string") playerId: string;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") state: number;

    @type("number") speedX: number;
    @type("number") speedY: number;
    @type("number") speedMain: number = 150;

    @type("boolean") isDestroy: boolean = false;

    constructor(playerId: string, x: number, y: number, nav: Position) {
        super();
        this.id = randomUUID();
        this.playerId = playerId;
        
        this.speedX = nav.x * this.speedMain / Math.sqrt(nav.x**2 + nav.y**2);
        this.speedY = nav.y * this.speedMain / Math.sqrt(nav.x**2 + nav.y**2);

        this.x = x;
        this.y = y;
    }

    update(room: Room) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (!this.checkOutside(room)) return;
        if (!this.checkPlayerCollision(room)) return;
        room.broadcast(`bullet:update-${this.id}`);
    }

    checkOutside(room: Room): boolean {
        if (this.x < -2600 || this.x > 7680 || this.y > 2560 || this.y < -7700 ) {
            this.destroy(room);
            return false;
        }
        return true;
    }

    checkPlayerCollision(room: Room): boolean {
        if (this.isDestroy) return false;
        const playerInitiator: Player = room.state.players.get(this.playerId);

        const keys = room.state.players.keys();
        for (let key of keys) {
            const player: Player = room.state.players.get(key);
            const range = Math.sqrt( (player.x - this.x)**2 + (player.y - this.y)**2 );
            if (range <= 75 && key != this.playerId) {
                player.getDamage(room, playerInitiator.states.damage*1.5);
                this.destroy(room);
                return false;
            }
        }
        return true;
    }

    destroy(room: Room) {
        if (this.isDestroy) return false;
        
        room.state.bullets.delete(this.id);
        room.broadcast("bullets:remove", this.id);
        this.isDestroy = true;
    }
}