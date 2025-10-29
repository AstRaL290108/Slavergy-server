import { Schema, type } from "@colyseus/schema";
import { randomUUID } from "crypto";

export class Bullet extends Schema {
    @type("string") id: string;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") state: number;

    constructor() {
        super();
        this.id = randomUUID();
    }

    update() {}
}