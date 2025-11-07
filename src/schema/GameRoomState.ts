import { MapSchema, Schema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";

export class MapState extends Schema {
    
}

export class GameRoomState extends Schema {
    @type("string") name: string;
    @type("number") playerCount: number = 0;

    @type({ map: Player }) players  = new MapSchema<Player>();
    @type({ map: Bullet }) bullets  = new MapSchema<Bullet>();
    @type({ map: Enemy }) enemyBots = new MapSchema<Enemy>();
    @type(MapState) Map: MapState;
    
    constructor() {
        super();
    }
}