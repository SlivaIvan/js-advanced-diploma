/**
 * Entry point of app: don't change this
 */
import themes from './themes';
import GamePlay from './GamePlay';
import GameController from './GameController';
import GameStateService from './GameStateService';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init(gamePlay.drawUi(Object.values(themes)[0]));

// don't write your code here
