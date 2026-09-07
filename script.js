const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//alert(canvas.width + " " + canvas.height);

ctx.imageSmoothingEnabled = false;

let tileScale = 10;
let tileSize = 16 * tileScale;
let safezone = [
    {row: 24, col: 10},
    {row: 25, col: 9},
    {row: 26, col: 9},
    {row: 25, col: 10},
    {row: 26, col: 10},
    {row: 27, col: 10},
    {row: 27, col: 9},
    {row: 26, col: 11},
    {row: 28, col: 10},
];
let camera = {
    x: 10,
    y: 10,
    speedX: 0.04,
    speedY: 0.04,
    zoom: -2
};
let mouse = {
    x: 0,
    y: 0
};

let img = new Image();
img.src = "assets/ground.png";
let img2 = new Image();
img2.src = "assets/bluemineral-ground.png";
let copperImg = new Image();
copperImg.src = "assets/copper.png";
let selectionImg = new Image();
selectionImg.src = "assets/selection.png";
let dummyImg = new Image();
dummyImg.src = "assets/dummy.png";
let safezoneImg = new Image();
safezoneImg.src = "assets/safezone.png";
let playImg = new Image();
playImg.src = "assets/play.png";
let optionsImg = new Image();
optionsImg.src = "assets/options.png";
const tilesheetImg = new Image();
tilesheetImg.src = "assets/tilesheet.png";

class Turret {
    constructor(pos) {
        this.pos = pos;
        this.range = 2;
    }

    detect(enemies) {
        enemies.forEach(enemy => {
            if (distance(this.pos, enemy.pos) <= this.range) {
                // Fire!
                enemy.die();
            }
        });
    }

    draw() {
        const transformed = cameraSpace(this.pos);
        
        ctx.drawImage(tilesheetImg, 16, 0, 16, 16,
                      transformed.x - tileSize/2,
                      transformed.y - tileSize*(3/4),
                      tileSize,
                      tileSize
                     );

        //ctx.fillStyle = "white";
        //ctx.fillRect(transformed.x, transformed.y, 2, 2);
    }
}

class Enemy {
    constructor(pos) {
        this.pos = pos;
        this.alive = true;
        this.t = 0;
        this.lastPoint;
        this.nextPoint;
    }

    move() {
        //const livingRobots = robots.filter(rob => rob.alive);
        
        if (robots.length > 0 && this.alive) {
            let lowestDist = { // Finding the index of the nearest robot
                dist: 9999999,
                index: -1
            };
            for (let i = 0; i < robots.length; i++) {  
                const dist = distance(this.pos, robots[i].pos);
                if (dist < lowestDist.dist && robots[i].alive) {
                    lowestDist = {
                        dist: dist,
                        index: i
                    };
                }
            }
            if (lowestDist.dist <= 1) { // Killing the robot if near enough
                robots[lowestDist.index].die();
                this.die();
                return;
            }

            if (lowestDist.index != -1) {
                // Implement pathfinding algorithm here

                /*if (this.nextPoint != robots[lowestDist.index].pos) {
                    this.t = 0;
                    this.nextPoint = robots[lowestDist.index].pos;
                    this.lastPoint = this.pos;
                }*/

                if (!this.nextPoint) {
                    this.lastPoint = this.pos;
                    this.nextPoint = nextNode(this.pos, robots[lowestDist.index].pos);
                    this.t = 0;
                }
                
                if (this.t >= 1) {
                    this.pos = this.nextPoint;
                    this.lastPoint = this.pos;
                    this.nextPoint = nextNode(this.pos, robots[lowestDist.index].pos);
                    this.t = 0;
                }
        
                this.t += 0.03;
                this.pos = lerp(this.t, this.lastPoint, this.nextPoint);

                //ctx.fillStyle = "white";
                //ctx.fillRect(this.nextNode.x, this.nextNode.y, 2, 2);
            }
        }
    }

    draw() {
        const transformed = cameraSpace(this.pos);

        let crop = {
            x: 16, y: 16, width: 16, height: 16
        };
        if (!this.alive) {
            crop.x = 32;
        }
        
        ctx.drawImage(tilesheetImg, crop.x, crop.y, crop.width, crop.height,
                      transformed.x - tileSize/2,
                      transformed.y - tileSize*(3/4),
                      tileSize,
                      tileSize
                     );
    }

    die() {
        // Trigger animation maybe 
        this.alive = false;
    }
}

class Robot {
    constructor(pos) {
        this.pos = pos;
        this.alive = true;
        this.selected = false;
        this.t = 0;
        this.nextPoint;
        this.lastPoint;
        this.target;
        this.holds = "";
    }

    move(target, tilePos, inventory) {
        if (!this.alive) return;
        
        if (distance(this.pos, target) < 0.05) {
            this.pos = target;
            this.target = undefined;
            this.nextPoint = undefined;
            this.lastPoint = undefined;

            // Check For Minerals
            const index = tilePos.findIndex(tile => tile.x == this.pos.x && tile.y == this.pos.y);
            if (index !== -1) {
                if (tilePos[index].type == "copper" && this.holds === "") {
                    tilePos[index].type = "ground";
                    //copper++;
                    this.holds = "copper";
                }
                if (tilePos[index].type == "iron" && this.holds === "") {
                    tilePos[index].type = "ground";
                    //copper++;
                    this.holds = "iron";
                }
            }

            // Checking if we can dump the minerals
            if (this.pos.x == 10 && this.pos.y == 13) {
                if (this.holds == "copper") inventory.resources.copper++;
                if (this.holds == "iron") inventory.resources.iron++;
                this.holds = "";
            }
            
            return;
        }
        
        if (!this.nextPoint) {
            this.lastPoint = this.pos;
            this.nextPoint = nextNode(this.pos, target);
            this.t = 0;
        }
        
        if (this.t >= 1) {            
            this.pos = this.nextPoint;
            this.lastPoint = this.pos;
            this.nextPoint = nextNode(this.pos, target);
            this.t = 0;            
        }

        this.t += 0.03;
        this.pos = lerp(this.t, this.lastPoint, this.nextPoint);

    }

    draw() {
        const transformed = cameraSpace(this.pos);

        let crop = {
            x: 32, y: 0, width: 16, height: 16
        };
        if (!this.alive) {
            crop.x = 0;
            crop.y = 16;
        } 
        if (this.selected) {
            crop.x = 32;
            crop.y = 48;
        }
        
        ctx.drawImage(tilesheetImg, crop.x, crop.y, crop.width, crop.height,
                      transformed.x - tileSize/2,
                      transformed.y - tileSize*(3/4),
                      tileSize,
                      tileSize
                     );
    }

    die() {
        this.alive = false;
        if (selectedRobot == this) {
            this.selected = false;
            selectedRobot = undefined;
        }
    }
}

class Button {
    constructor(text, x, y) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.img;
        this.imageCrop;
        this.width = 10;
        this.height = 10;
        this.shift = "centered";
        

        if (this.text == "PLAY") {
            this.img = playImg;

            this.imageCrop = {
                x: 26,
                y: 1,
                width: 48,
                height: 14
            };
        } else if (this.text == "OPTIONS") {
            this.img = optionsImg;

            this.imageCrop = {
                x: 13,
                y: 1,
                width: 74,
                height: 14
            };
        }

        this.width = this.imageCrop.width * (tileScale-1);
        this.height = this.imageCrop.height * (tileScale-1);

        this.shifted = {x: 0, y: 0};
        if (this.shift == "centered") {
            this.shifted.x = this.x - this.width/2;
            this.shifted.y = this.y - this.height/2;
        }

        this.path = new Path2D();
        this.path.rect(this.shifted.x, this.shifted.y, this.width, this.height);
        this.path.closePath();
    }

    draw() {
        //ctx.fillStyle = "white";
        //ctx.fill(this.path);
        
        //ctx.font = this.fontSize + "px " + this.font;
        //ctx.fillStyle = "black";
        //ctx.fillText(this.text, this.x+this.padding, this.y + this.height-this.padding-2);

 
        
        ctx.drawImage(this.img, this.imageCrop.x, this.imageCrop.y, this.imageCrop.width, this.imageCrop.height,
                      this.shifted.x,
                      this.shifted.y,
                      this.width,
                      this.height);

    }
}

class Inventory {
    constructor() {
        this.margin = 100;
        this.width = canvas.width - this.margin*2;
        this.height = canvas.height - this.margin*2;
        this.pos = {
            x: canvas.width/2 - this.width/2,
            y: canvas.height/2 - this.height/2
        };
        this.path = new Path2D();
        this.path.rect(this.pos.x, this.pos.y, this.width, this.height);
        this.path.closePath();
        this.resources = {
            turrets: 3,
            copper: 0,
            iron: 0
        };
    }

    draw() {
        // Draw background
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "black";
        ctx.fill(this.path);
        ctx.globalAlpha = 1;

        // Draw Header
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("Inventory", this.pos.x + this.width/2 - 100, this.pos.y + 60);

        // Draw Copper Display
        const copperStr = "Copper: " + this.resources.copper;
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(copperStr, this.pos.x + this.width/2 - 70, this.pos.y + 300);

        // Draw Iron Display
        const ironStr = "Iron: " + this.resources.iron;
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(ironStr, this.pos.x + this.width/2 - 50, this.pos.y + 350);

        // Draw Turrets Display
        const turretsStr = "Turrets: " + this.resources.turrets;
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(turretsStr, this.pos.x + this.width/2 - 70, this.pos.y + 400);
        
    }
}

function nextNode(current, target) {
            //this.targetPoint = target;
    let closeNodes = [
        {x: current.x + 0.5, y: current.y + 0.5},
        {x: current.x - 0.5, y: current.y - 0.5},
        {x: current.x - 0.5, y: current.y + 0.5},
        {x: current.x + 0.5, y: current.y - 0.5}
    ];

    let bestNode = null;
    let lowestNodeDist = Infinity;
    closeNodes.forEach(node => { // Needs to avoid occupied nodes aswell
        const targetDist = distance(node, target);
        if (targetDist < lowestNodeDist) {
            lowestNodeDist = targetDist;
            bestNode = node;
        }
    });

    return bestNode;
}

function distance(p1, p2) {
    const deltaX = p1.x - p2.x;
    const deltaY = p1.y - p2.y;

    return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
}

function lerp(t, p1, p2) {
    let newP = {x: 0, y: 0};
    newP.x = p1.x + t * (p2.x - p1.x); // Adderar en "t-djedel" på p1
    newP.y = p1.y + t * (p2.y - p1.y);
    return newP;
}

function generateTilemap() {
    let newMap = [];
    
    for (i = 0; i < 40; i++) {
        let tileRow = [];
        
        for (j = 0; j < 20; j++) {
            tileRow.push(Math.floor(Math.random()*50 + 1));
        }

        newMap.push(tileRow);
    }

    return newMap;
}


function clear() {
    ctx.fillStyle = "purple";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function calculateTilePositions(layer) {
    let tilePos = [];
    
    for (let i = 0; i < layer.length; i++) {
        for (let j = 0; j < layer[i].length; j++) {
            let safe = false;
            let type = "ground";
            if (layer[i][j] == 2) type = "iron";
            if (layer[i][j] == 3) type = "copper";
            
            safezone.forEach(tile => {
                if (tile.row === i && tile.col === j) {
                    safe = true;
                }
            });
            
            if (i % 2 == 0) {
                if (layer[i][j] != 0) {
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
                if (layer[i][j] != 0) {
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

function cameraSpace(pos) {
    return {
        x: (pos.x - camera.x) * tileSize + canvas.width/2, // We use tileSize because our worldspace unit is tiles
        y: (pos.y - camera.y) * tileSize/2 + canvas.height/2  // Camera position will be in big pixels
    };
}

function worldSpace(pos) {
    return {
        x: (pos.x - canvas.width/2)/tileSize + camera.x,
        y: (pos.y - canvas.height/2)/(tileSize/2) + camera.y
    };
}

function drawTilemapLayer(tilePos) {
    for (let i = 0; i < tilePos.length; i++) {
        let transformed = cameraSpace(tilePos[i]);
        let drawImg = img;
        //drawTile(transformed.x - tileSize/2, transformed.y - tileSize/4);
        if (tilePos[i].type === "iron") drawImg = img2;
        if (tilePos[i].type === "copper") drawImg = copperImg;
        
        ctx.drawImage(drawImg, 
                      transformed.x - tileSize/2, 
                      transformed.y - tileSize/4, 
                      tileSize, 
                      tileSize
                    ); 
        
        
        // Debug Dots
        /*const data = "x: " + tilePos[i].x + ", y: " + tilePos[i].y;
        //const data = distance(tilePos[i], worldSpace(mouse));
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(data, transformed.x-10, transformed.y);*/
    }
}

function closestTileToCursor(tilePos) {
    let dists = [];
    for (let i = 0; i < tilePos.length; i++) {
        let transformed = cameraSpace(tilePos[i]);

        const deltaX = transformed.x - mouse.x;
        const deltaY = transformed.y - mouse.y;
        const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

        dists.push(dist);
    }
    const lowestIndex = dists.indexOf(Math.min(...dists));
    return lowestIndex;
}

function drawSafezone(tilePos) {
    tilePos.forEach(tile => {
        const transformed = cameraSpace(tile);
        
        if (tile.safe == true) {
            ctx.drawImage(safezoneImg, 
                          transformed.x - tileSize/2, 
                          transformed.y - tileSize/4, 
                          tileSize, 
                          tileSize
                         ); 
        }
    });
}

function drawSelection(tilePos) {
    const lowestIndex = closestTileToCursor(tilePos);
    
    for (let i = 0; i < tilePos.length; i++) {
        let transformed = cameraSpace(tilePos[i]);
        
        if (i === lowestIndex) {
            ctx.drawImage(selectionImg, 
                          transformed.x - tileSize/2, 
                          transformed.y - tileSize/4, 
                          tileSize, 
                          tileSize
                         ); 
        }
    }

    //return lowestIndex;
}

function gameLoop() {
    if (moveRightKey) camera.x += camera.speedX;
    if (moveLeftKey) camera.x -= camera.speedX;
    if (moveUpKey) camera.y -= camera.speedY;
    if (moveDownKey) camera.y += camera.speedY;
    if (spaceKey) camera.zoom -= 0.1;
    if (shiftKey) camera.zoom += 0.1;
    
    tileScale = 10 + camera.zoom;
    tileSize = 16 * tileScale;

    //tilePositions = ;
    drawTilemapLayer(tilePositions);
    drawSafezone(tilePositions);
    if (buildMode || selectedRobot) drawSelection(tilePositions);

    turrets.forEach(turret => {
        //turret.draw(); 
        turret.detect(enemies);
    });

    enemies.forEach(enemy => {
        enemy.move(); // The enemy reference is shared between enemies and entities
                        // So i dont need to concat the arrays again
    });

    robots.forEach(robot => {
        if (robot.target) {
            robot.move(robot.target, tilePositions, inventory);
        }
    });

    entities.sort((a, b) => a.pos.y - b.pos.y); // We probably don't want to sort every frame
    entities.forEach(entity => {
        entity.draw();
    });


    if (inventoryMode) inventory.draw();

    frameCount += 1;
    if (frameCount == 300) {
        enemies.push(new Enemy({
            x: Math.floor(Math.random()*20),
            y: Math.floor(Math.random()*20)
        }));
        entities = enemies.concat(turrets, robots);
        entities.sort((a, b) => a.pos.y - b.pos.y);
        frameCount = 0;
    }

    if (mouseClick) {
        if (buildMode && inventory.resources.turrets > 0) {
            const closestIndex = closestTileToCursor(tilePositions);
            turrets.push(new Turret(tilePositions[closestIndex]));
            entities = enemies.concat(turrets, robots);
            entities.sort((a, b) => a.pos.y - b.pos.y); 

            inventory.resources.turrets--;
        }
        else {
            let change = false;
            robots.forEach(rob => {
                const d = distance(worldSpace(mouse), rob.pos);
                if (d < 1 && rob.alive) {
                    if (rob !== selectedRobot) {
                        if (selectedRobot) {
                            selectedRobot.selected = false;
                        }
                        selectedRobot = rob;
                        selectedRobot.selected = true;
                    }
                    else {
                        selectedRobot.selected = false;
                        selectedRobot = undefined;
                    }
                        
                    change = true;
                }
            });
            if (!change && selectedRobot) {
                const target = tilePositions[closestTileToCursor(tilePositions)];
                selectedRobot.target = target;
                selectedRobot.selected = false;
                selectedRobot = undefined;
            }
        }
        
        mouseClick = false;
    }
}

function menuLoop() {
    //ctx.font = "30px Arial";
    //ctx.fillStyle = "white";
    //ctx.fillText("MENU", 100, 100);

    //ctx.fill(path);

    button.draw();
    button2.draw();

    if (mouseClick) {
        if (ctx.isPointInPath(button.path, mouse.x, mouse.y)) gameState = "game";
        if (ctx.isPointInPath(button2.path, mouse.x, mouse.y)) gameState = "options";
        
        mouseClick = false;
    }
}

function optionsLoop() {
    
}

let turrets = [];
let enemies = [];
let robots = [];
let entities = [];
let gameState = "game";
let selectedRobot;
let frameCount = 0;
//let copper = 0;
const tilemap = generateTilemap();
const tilePositions = calculateTilePositions(tilemap);
const button = new Button("PLAY", canvas.width/2, 400);
const button2 = new Button("OPTIONS", canvas.width/2, 550);
const inventory = new Inventory();


//enemies.push(new Enemy({x: 10, y: 10}));
//enemies.push(new Enemy({x: 10.5, y: 10.5}));
//enemies.push(new Enemy({x: 13, y: 12}));
//enemies.push(new Enemy({x: 7, y: 7}));

robots.push(new Robot({x: 10, y: 12}));
robots.push(new Robot({x: 11, y: 13}));
robots.push(new Robot({x: 9, y: 13}));
robots.push(new Robot({x: 10, y: 14}));

turrets.push(new Turret({x: 10, y: 13}));

entities = enemies.concat(turrets, robots);
entities.sort((a, b) => a.pos.y - b.pos.y);


function update() {
    clear();
    
    if (gameState == "menu") menuLoop();
    if (gameState == "game") gameLoop();
    if (gameState == "options") optionsLoop();
    
    requestAnimationFrame(update);
}


let moveRightKey = false;
let moveUpKey = false;
let moveLeftKey = false;
let moveDownKey = false;
let mouseClick = false;
let spaceKey = false;
let shiftKey = false;
let buildMode = false;
let inventoryMode = false;

addEventListener("keydown", (event) => {
    switch(event.key) {
            case "d":
                moveRightKey = true; break;
            case "a":
                moveLeftKey = true; break;
            case "w":
                moveUpKey = true; break;
            case "s":
                moveDownKey = true; break;
            case " ":
                spaceKey = true; break;
            case "Shift":
                shiftKey = true; break;
            case "q":
                if (!buildMode && !selectedRobot) buildMode = true;
                else buildMode = false;
                break;
            case "e":
                if (!inventoryMode) inventoryMode = true;
                else inventoryMode = false;
                break;
                
    }
});

addEventListener("keyup", (event) => {
    switch(event.key) {
            case "d":
                moveRightKey = false; break;
            case "a":
                moveLeftKey = false; break;
            case "w":
                moveUpKey = false; break;
            case "s":
                moveDownKey = false; break;
            case " ":
                spaceKey = false; break;
            case "Shift":
                shiftKey = false; break;
    }
});

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    //const scaleX = canvas.width / rect.width;
    //const scaleY = canvas.height / rect.height;

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener("mousedown", (event) => {
    mouseClick = true;
});

window.addEventListener("error", (event) => {
  //console.error("ERROR:", event.error);
  alert(event.error?.message || event.message);
});

addEventListener("unhandledrejection", (event) => {
  alert(`Promise error: ${event.reason?.message || event.reason}`);
});

update();
