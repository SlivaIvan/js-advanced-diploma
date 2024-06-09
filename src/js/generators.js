/* eslint-disable max-len */
import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const randomlevel = Math.floor(Math.random() * maxLevel) + 1;
    const randomID = Math.floor(Math.random() * (allowedTypes.length));
    yield new allowedTypes[randomID](randomlevel);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const arrTeam = [];

  const playerGenerator = characterGenerator(allowedTypes, maxLevel);

  while (characterCount > 1) {
    arrTeam.push(playerGenerator.next().value);
    // eslint-disable-next-line
    characterCount -= 1;
  }

  const team = new Team(arrTeam);

  return team;
  // TODO: write logic here
}
