import { Game } from "./game/Game.js";

const canvas = document.getElementById("canvas");
const game = new Game(canvas);

game.start();