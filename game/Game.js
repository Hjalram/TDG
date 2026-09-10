import { GameState } from "./GameState.js";
import { Input } from "../input/Input.js";
import { Renderer } from "../rendering/Renderer.js";
import { Camera } from "../rendering/Camera.js";
import { TileMap } from "../world/TileMap.js";
import { Inventory } from "../inventory/Inventory.js";
import { Robot } from "../entities/Robot.js";

export class Game {
    constructor(canvas) {
        this.gameState = new GameState(); // these may be passed into functions
        this.input = new Input(canvas);
        this.renderer = new Renderer(canvas);
        this.camera = new Camera();
        this.tilemap = new TileMap();
        this.inventory = new Inventory();
        
        this.robot = new Robot({x: 10, y: 13});

        this.lastTime = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this)); // .bind(this) says that "this" in the function
                                                        // is our class instance
    }

    loop(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(deltaTime);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    update(deltaTime) {
        // Update game state
        if (this.input.getKeyHeld("d")) this.camera.pos.x += this.camera.speed.x;
        if (this.input.getKeyHeld("a")) this.camera.pos.x -= this.camera.speed.x;
        if (this.input.getKeyHeld("w")) this.camera.pos.y -= this.camera.speed.y;
        if (this.input.getKeyHeld("s")) this.camera.pos.y += this.camera.speed.y;
        if (this.input.getKeyHeld(" ")) this.camera.zoom -= 0.1;
        if (this.input.getKeyHeld("Shift")) this.camera.zoom += 0.1;

        
        if (this.input.getKeyDown("q")) {
            if (!this.gameState.getBuildMode()) this.gameState.setBuildMode(true);
            else this.gameState.setBuildMode(false);
        }

        if (this.input.getKeyDown("e")) {
            if (!this.gameState.getInventoryMode()) this.gameState.setInventoryMode(true);
            else this.gameState.setInventoryMode(false);
        }

        this.tilemap.selectedTile = this.input.closestTileToCursor(this.renderer.canvas, this.camera, this.tilemap);

        this.input.resetKeysDown();
    }

    render() {
        this.renderer.clear();
        this.tilemap.draw(this.renderer, this.camera);
        this.tilemap.drawSelection(this.renderer, this.camera);
        this.robot.draw(this.renderer, this.camera);
    }
}