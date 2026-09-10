export class Camera {
    constructor() {
        this.tileScale = 4;
        this.tileSize = 16 * this.tileScale;
        this.speed = {x: 0.03, y: 0.03};
        this.pos = {x: 10, y: 8};
        this.zoom = 0;
    }

    worldSpace(canvas, pos) {
        return {
            x: (pos.x - canvas.width/2)/this.tileSize + this.pos.x,
            y: (pos.y - canvas.height/2)/(this.tileSize/2) + this.pos.y
        };
    }

    cameraSpace(canvas, pos) {
        return {
            x: (pos.x - this.pos.x) * this.tileSize + canvas.width/2, // We use tileSize because our worldspace unit is tiles
            y: (pos.y - this.pos.y) * this.tileSize/2 + canvas.height/2  // Camera position will be in big pixels
        };
    }
}