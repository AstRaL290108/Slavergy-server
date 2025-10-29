import { MapSchema, Schema, type } from "@colyseus/schema";
import { playerConnectOptions } from "../utils/types";

export class Player extends Schema {
    @type("string") name: string;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") angle: number;

    @type("number") class_: number;
    @type("number") color: number;

    constructor({ name, color, class_ }: playerConnectOptions) {
        super();
        this.name   = name;
        this.color  = color;
        this.class_ = class_;

        this.x = Math.round(Math.random()*100) + this.color*200 - 50;
        this.y = Math.round(Math.random()*100) + 450;
        this.angle = 90;
    }
}