import Character from '../Character';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.distanceMovi = 4;
    this.distanceAttack = 1;
  }
}
