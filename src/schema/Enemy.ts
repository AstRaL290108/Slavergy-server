import { MapSchema, Schema, type } from "@colyseus/schema";
import { randomUUID } from "crypto";
import { Position } from "../utils/types";

export class Enemy extends Schema {
    @type("string") id: string;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") state: number;

    constructor(position: Position) {
        super();
        this.id = randomUUID();

        this.x = position.x;
        this.y = position.y;
    }

    update() {
        console.log();
    }
}