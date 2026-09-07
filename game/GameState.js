export class GameState {
    constructor() {
        this.gameState = "game";
        this.buildMode = false;
        this.inventoryMode = false;
    }

    setState(state) {this.gameState = state;}
    getState() {return this.gameState;}

    setBuildMode(mode) {this.buildMode = mode;}
    getBuildMode() {return this.buildMode;}

    setInventoryMode(mode) {this.inventoryMode = mode}
    getInventoryMode() {return this.inventoryMode;}
}