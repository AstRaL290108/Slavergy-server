import { MapSchema, Schema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { Bullet } from "./Bullet";

export class MapState extends Schema {
    
}

export class GameRoomState extends Schema {
    @type("string") name: string;
    @type("number") playerCount: number = 0;

    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: Player }) bullets = new MapSchema<Bullet>();
    @type(MapState) Map: MapState;
    
    constructor() {
        super();
    }
}