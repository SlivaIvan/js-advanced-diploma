/* eslint-disable no-undef */
import Character from '../Character';

test('Checking for throwing an error when creating a Character class', () => {
  expect(() => new Character(1, 'bowman')).toThrow(new Error('Нельзя создавать персонажа при помощи new Character()'));
});
