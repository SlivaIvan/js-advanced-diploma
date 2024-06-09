import Character from '../Character';

class Swordsman extends Character {
  constructor(level) {
    super(level, 'Swordsman');
    this.attack = 40;
    this.defence = 10;
  }
}
