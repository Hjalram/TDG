export class Input {
    constructor(canvas) {
        this.heldKeys = new Set();
        this.downKeys = new Set();
        this.mouse = {x: 0, y: 0};
        this.mouseClick = false;

        addEventListener("keydown", (event) => {
            this.heldKeys.add(event.key);
            this.downKeys.add(event.key);
        });

        addEventListener("keyup", (event) => {
            this.heldKeys.delete(event.key);
        });

        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect();
            //const scaleX = canvas.width / rect.width;
            //const scaleY = canvas.height / rect.height;

            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        });

        canvas.addEventListener("mousedown", (event) => {
            this.mouseClick = true;
        });
    }

    closestTileToCursor(canvas, camera, tilemap) {
        let dists = [];

        for (let i = 0; i < tilemap.tileArray.length; i++) {
            let transformed = camera.cameraSpace(canvas, tilemap.tileArray[i]);

            const deltaX = transformed.x - this.mouse.x;
            const deltaY = transformed.y - this.mouse.y;
            const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

            dists.push(dist);
        }

        const lowestIndex = dists.indexOf(Math.min(...dists));

        return {
            index: lowestIndex,
            pos: tilemap.tileArray[lowestIndex]
        };
    }

    getKeyHeld(key) {
        return this.heldKeys.has(key); 
    }

    getKeyDown(key) {
        const pressed = this.downKeys.has(key);
        this.downKeys.delete(key);
        return pressed;
    }

    resetKeysDown() {
        this.downKeys.clear();
    }

    consumeClick() {
        const clicked = this.mouseClick;
        this.mouseClick = false;
        return clicked;
    }
}