export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.ctx.imageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.fillStyle = "purple";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}