import Character from '../Character';

class Magician extends Character {
  constructor(level) {
    super(level, 'Magician');
    this.attack = 10;
    this.defence = 40;
  }
}
