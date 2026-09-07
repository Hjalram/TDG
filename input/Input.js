class Input {
    constructor(canvas) {
        this.heldKeys = new Set();
        this.mouse = {x: 0, y: 0};
        this.mouseClick = false;

        addEventListener("keydown", (event) => {
            this.heldKeys.add(event.key);
        });

        addEventListener("keyup", (event) => {
            this.heldKeys.delete(event.key);
        });

        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect();
            //const scaleX = canvas.width / rect.width;
            //const scaleY = canvas.height / rect.height;

            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        canvas.addEventListener("mousedown", (event) => {
            this.mouseClick = true;
        });
    }

    getKeyDown(key) {
        return this.heldKeys.has(key); 
    }

    consumeClick() {
        const clicked = this.mouseClick;
        this.mouseClick = false;
        return clicked;
    }
}