import Character from '../Character';

class Vampire extends Character {
  constructor(level) {
    super(level, 'Vampire');
    this.attack = 25;
    this.defence = 25;
  }
}
