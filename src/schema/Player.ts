import { Schema, type } from "@colyseus/schema";
import { playerConnectOptions } from "../utils/types";
import { Room } from "colyseus";

class PlayerStates extends Schema {
    @type("number") totalHealth: number = 500;
    @type("number") health: number = 500;
    @type("number") healthCharge: number = 5;
    
    @type("number") totalMana: number = 600;
    @type("number") mana: number = 600;
    @type("number") manaCharge: number = 10;

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

    constructor({ name, color, class_, sessionId }: playerConnectOptions&{sessionId: string}) {
        super();
        this.sessionId = sessionId;
        this.name      = name;
        this.color     = color;
        this.class_    = class_;

        this.x = Math.round(Math.random()*900) - 1000;
        this.y = Math.round(Math.random()*800) + 100;
        this.angle = 90;

        this.states = new PlayerStates();
    }

    getDamage(room: Room, dmg: number) {
        this.states.health -= dmg;
        
    }
}