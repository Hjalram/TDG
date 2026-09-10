import { distance, lerp } from "../utils/math.js"

export class Robot {
    constructor(pos) {
        this.pos = pos;
        this.alive = true;
        this.selected = false;
        this.t = 0;
        this.nextPoint;
        this.lastPoint;
        this.target;
        this.holds = "";
        this.image = new Image();
        this.image.src = "assets/tilesheet-bot.png";
    }

    move(target, tilemap, inventory) {
        if (!this.alive) return;
        
        if (distance(this.pos, target) < 0.05) {
            this.pos = target;
            this.target = undefined;
            this.nextPoint = undefined;
            this.lastPoint = undefined;

            // Check For Minerals
            const index = tilemap.tileArray.findIndex(tile => tile.x == this.pos.x && tile.y == this.pos.y);
            if (index !== -1) {
                if (tilemap.tileArray[index].type == "copper" && this.holds === "") {
                    tilemap.tileArray[index].type = "ground";
                    //copper++;
                    this.holds = "copper";
                }
                if (tilemap.tileArray[index].type == "iron" && this.holds === "") {
                    tilemap.tileArray[index].type = "ground";
                    //copper++;
                    this.holds = "iron";
                }
            }

            // Checking if we can dump the minerals
            if (this.pos.x == 10 && this.pos.y == 13) {
                if (this.holds == "copper") inventory.addItem(new Item("copper")); // This variable doesn't exist
                if (this.holds == "iron") inventory.addItem(new Item("iron"));
                this.holds = "";
            }
            
            return;
        }
        
        if (!this.nextPoint) {
            this.lastPoint = this.pos;
            //this.nextPoint = nextNode(this.pos, target);
            this.t = 0;
        }
        
        if (this.t >= 1) {            
            this.pos = this.nextPoint;
            this.lastPoint = this.pos;
            //this.nextPoint = nextNode(this.pos, target);
            this.t = 0;            
        }

        this.t += 0.03;
        this.pos = lerp(this.t, this.lastPoint, this.nextPoint);

    }

    draw(renderer, camera) {
        const transformed = camera.cameraSpace(renderer.canvas, this.pos);

        let crop = {x: 0, y: 5, width: 16, height: 16};

        if (!this.alive) { crop.x = 0; crop.y = 2*5 + 16; } 
        if (this.selected) { crop.x = 32; crop.y = 3*5 + 48; }
        
        renderer.ctx.drawImage(this.image, crop.x, crop.y, crop.width, crop.height,
                      transformed.x - camera.tileSize/2 - camera.tileSize/16,
                      transformed.y - camera.tileSize + camera.tileSize/16,
                      camera.tileSize,
                      camera.tileSize
        );
        
        renderer.ctx.fillStyle = "white";
        renderer.ctx.fillRect(transformed.x, transformed.y, 2, 2);
    }

    die() {
        this.alive = false;
        /*if (selectedRobot == this) {
            this.selected = false;
            selectedRobot = undefined;
        }*/
    }
}