import { Schema, type } from "@colyseus/schema";
import { playerConnectOptions } from "../utils/types";
import { Room } from "colyseus";
import { MapConst } from "../utils/constants";

class PlayerStates extends Schema {
    @type("number") totalHealth: number = 500;
    @type("number") health: number = 500;
    @type("number") healthCharge: number = 5;
    
    @type("number") totalMana: number = 600;
    @type("number") mana: number = 600;
    @type("number") manaCharge: number = 25;

    @type("number") damage: number = 50;
    @type("number") attackRange: number = 250;
    @type("number") moveSpeed: number = 2400;
    @type("number") attackSpeed: number = 1;
}

export class Player extends Schema {
    @type("string") sessionId: string;
    @type("string") name: string;
    @type("number") class_: number;
    @type("number") color: number;
    
    @type("number") x: number;
    @type("number") y: number;
    @type("number") angle: number;

    @type(PlayerStates) states: PlayerStates;

    constructor({ name, color, sessionId }: playerConnectOptions&{sessionId: string}) {
        super();
        this.sessionId = sessionId;
        this.name      = name;
        this.color     = color;

        // 1 - red, 2 - blue, 3 - yellow, 4 - green
        let spawn;
        if (this.color == 1) 
            spawn = MapConst.redSpawn;
        if (this.color == 2) 
            spawn = MapConst.yellowSpawn;
        if (this.color == 3) 
            spawn = MapConst.blueSpawn;
        if (this.color == 4) 
            spawn = MapConst.greenSpawn;

        this.x = Math.round(Math.random()*spawn.x.k) + spawn.x.b;
        this.y = Math.round(Math.random()*spawn.y.k) + spawn.y.b;

        this.states = new PlayerStates();
    }

    getDamage(room: Room, dmg: number) {
        this.states.health -= dmg;
        if (this.states.health <= 0) {
            const client = room.clients.getById(this.sessionId);

            client.send("player:death");
            room.state.players.delete(this.sessionId);
            room.broadcast(
                "room:player-disconnect", 
                this.sessionId, {
                    except: client
                }
            );
        }
    }
}