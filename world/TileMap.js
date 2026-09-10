export class TileMap {
    constructor() {
        this.tileScale = 10;
        this.tileSize = 16 * this.tileScale;
        this.tilemap = this.generateTilemap();
        this.tileArray = this.makeTileArray();
        this.selectedTile = {};

        // Image Related
        this.tilesheet = new Image();
        this.tilesheet.src = "./assets/tilesheet.png"; // HTML document URL
        this.selectionImg = new Image();
        this.selectionImg.src = "./assets/selection.png";

        this.groundCrop = {x: 0, y: 0, width: 16, height: 16};
        this.ironCrop = {x: 0, y: 32, width: 16, height: 16};
        this.copperCrop = {x: 16, y: 32, width: 16, height: 16};
    }

    generateTilemap() {
        let newMap = [];
        
        for (let i = 0; i < 40; i++) {
            let tileRow = [];
            
            for (let j = 0; j < 20; j++) {
                tileRow.push(Math.floor(Math.random()*50 + 1));
            }

            newMap.push(tileRow);
        }

        return newMap;
    }

    makeTileArray() {
        let tilePos = [];
        
        for (let i = 0; i < this.tilemap.length; i++) {
            for (let j = 0; j < this.tilemap[i].length; j++) {
                let safe = false;
                let type = "ground";
                if (this.tilemap[i][j] == 2) type = "iron";
                if (this.tilemap[i][j] == 3) type = "copper";
                
                /*safezone.forEach(tile => {
                    if (tile.row === i && tile.col === j) {
                        safe = true;
                    }
                });*/
                
                if (i % 2 == 0) {
                    if (this.tilemap[i][j] != 0) {
                        tilePos.push({
                            x: j,
                            y: i * 0.5,
                            type: type,
                            safe: safe
                        });
                        //drawTile(j * tileSize + -camera.x*tileSize, i * tileSize * 0.25 + camera.y*tileSize); // i=y j=x
                    }
                }
                else {
                    if (this.tilemap[i][j] != 0) {
                        tilePos.push({
                            x: j + 0.5,
                            y: i * 0.5,
                            type: type,
                            safe: safe
                        });
                        
                        //drawTile(j * tileSize + 0.5*tileSize + -camera.x*tileSize, i * tileSize * 0.25 + camera.y*tileSize);
                    }
                }
            }
        }

        return tilePos;
    }

    draw(renderer, camera) {
        for (let i = 0; i < this.tileArray.length; i++) {
            let transformed = camera.cameraSpace(renderer.canvas, this.tileArray[i]);
            let crop = this.groundCrop;

            //drawTile(transformed.x - tileSize/2, transformed.y - tileSize/4);
            if (this.tileArray[i].type === "iron") crop = this.ironCrop;
            if (this.tileArray[i].type === "copper") crop = this.copperCrop;
            
            renderer.ctx.drawImage(this.tilesheet, crop.x, crop.y, crop.width, crop.height, 
                        transformed.x - camera.tileSize/2, 
                        transformed.y - camera.tileSize/4, 
                        camera.tileSize, 
                        camera.tileSize
                        ); 

            renderer.ctx.strokeStyle = "red";

            renderer.ctx.strokeRect(
                transformed.x - camera.tileSize / 2,
                transformed.y - camera.tileSize / 4,
                camera.tileSize,
                camera.tileSize
            );
            
            if (i === this.selectedTile.index) {
                renderer.ctx.drawImage(
                    this.selectionImg, 
                    transformed.x  - camera.tileSize / 2, 
                    transformed.y - camera.tileSize / 4,
                    camera.tileSize,
                    camera.tileSize
                );
            }
            
            
            // Debug Dots
            /*const data = "x: " + this.tileArray[i].x + ", y: " + this.tileArray[i].y;
            //const data = distance(this.tileArray[i], worldSpace(mouse));
            ctx.font = "10px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(data, transformed.x-10, transformed.y);*/
        }
    }
}