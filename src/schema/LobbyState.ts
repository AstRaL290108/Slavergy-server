import { MapSchema, Schema, type } from "@colyseus/schema";
import { GameRoomState } from "./GameRoomState";

export class LobbyState extends Schema {
    @type({ map: GameRoomState }) rooms = new MapSchema<GameRoomState>();
    
}
