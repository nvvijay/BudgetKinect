// import * as snake from './games/snake';
import * as bird from "./games/FlyBirdFly";
import * as snake from "./games/snake";



export class gameInterface {
    // let actions = [];
    constructor() {
        this.gamesList = ['FlyBird', 'Snake'];
        this.game = null;
    };

    getGamesList() {
        return this.gamesList;
    }

    initGame(game) {
        const gameMap = {
            'snake': new snake.Snake('viewport'),
            'flyBird': new bird.FlyBirdFly('viewport'),
        }
        this.game = gameMap[game];
        this.game.init();
        let gameActions = this.game.getActions();
        return this;
    }

    takeAction(label) {
        let action = this.getActionFromLabel(label);
        if (action) {
            this.game.takeAction(action);
        }
        return this;
    }

    mapLabelToAction(mappings) {
        this.mappings = mappings;
        return this;
    }

    getActionFromLabel(label) {
        if (label in this.mappings)
            return this.mappings[label]
        else {
            console.error("Invalid mapping / action");
            return -1;
        }

    }

    gameActions() {
        return this.game.getActions();
    }
}