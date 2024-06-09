import Character from '../Character';

class Bowman extends Character {
  constructor(level) {
    super(level, 'Bowman');
    this.attack = 25;
    this.defence = 25;
  }
}
