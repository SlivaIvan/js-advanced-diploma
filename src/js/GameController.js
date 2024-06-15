/* eslint-disable no-alert */
/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable no-lonely-if */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import GamePlay from './GamePlay';
import themes from './themes';
import GameState from './GameState';
import cursors from './cursors';

import { generateTeam } from './generators';
import { possibleMoveIndexes, possibleAttackIndexes } from './utils';

import PositionedCharacter from './PositionedCharacter';

import Bowman from './characters/bowman';
import Daemon from './characters/daemon';
import Magician from './characters/magician';
import Swordsman from './characters/swordsman';
import Undead from './characters/undead';
import Vampire from './characters/vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // Запускаем слушателей по наведение, убиранию и клику по ячейкам
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.start.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    // TODO: load saved stated from stateService

    this.start();
  }

  saveGame() {
    this.stateService.save(this.gameState);
  }

  loadGame() {
    this.gameState = this.stateService.load();
    this.gamePlay.drawUi(themes[this.gameState.teme]); // Отрисовываем тему игры
    this.gamePlay.redrawPositions(this.gameState.positionedCharacter);
  }

  // Старт игры
  start() {
    if (this.gamePlay.cellClickListeners.length === 0) { // Если слушатель не привязан, например, когда мы запускаем игру после выиграша и брокировки поля, то ...
      // снова привязываем все слушатели действй на поле
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    }

    this.gameState = new GameState();
    this.gameState.teme = 1; // При старте игры присваиваем первую тему отрисовки игры, затем будет просто прибавлять к ней 1
    this.gamePlay.drawUi(themes[this.gameState.teme]); // Отрисовываем тему игры

    // Формируем команды
    this.goodTeam = this.formteam([Bowman, Swordsman, Magician]);
    this.badTeam = this.formteam([Daemon, Undead, Vampire]);

    // Расставляем игроков на поле случайным образом
    this.positionedCharacter();
  }

  // Старт новой игры после проигрыша злодеев
  newGame() {
    this.gameState.teme += 1; // Берем следующую тему игры

    this.gamePlay.drawUi(themes[this.gameState.teme]); // Отрисовываем поле

    this.goodTeam = this.formteam([Bowman, Swordsman, Magician]);
    this.badTeam = this.formteam([Daemon, Undead, Vampire]);

    this.replacingPlayersSurvivors(); // Заменяем в команде хороших игроков, на тех что выжили с прошлого уровня

    this.positionedCharacter(); // Расставляем игроков на поле случайным образом
    // this.gameState.positionedCharacter
    this.gamePlay.redrawPositions(this.gameState.positionedCharacter); // Отрисовываем игроков на поле
    console.log('ok');
  }

  // Формирование компанд
  formteam(playerTypes) {
    const plaersCount = this.gameState.teme + 2; // Опред колич игроков с каж стороны. В teme хран номер уроня (1,2,3 ...), просто к нему прибавляем 2 и получаем что с каждым уровнем колич игрок увелич
    return generateTeam(playerTypes, 3, plaersCount);
  }

  // формирование позиций каждой команды
  formPositionsTeam(team, аllPositins, positionedCharacter) {
    // Формируем массив с персоонажами и их позициями, позиции берутся случайным образом из списка аllPositins
    team.characters.forEach((element) => {
      const character = element;
      const idPosition = Math.floor(Math.random() * аllPositins.length);
      const position = аllPositins[idPosition];
      аllPositins.splice(idPosition, 1); // защита от повторения позиций
      positionedCharacter.push(new PositionedCharacter(character, position));
    });

    return positionedCharacter;
  }

  // Действия при клике на любую клетку
  async onCellClick(index) {
    // TODO: react to click
    console.log('Кликнутая клетка', index);
    const check = this.findCharacterOnCellindex(index); // ищем персонажа на кликнутой клетке, если есть, то сохраняем в константу

    if (check) { // Если в кликнутой ячейке есть игрок, то ...
      // После клика проверяем в какой команде игрок
      if (this.definingСommand(check.character.type)) { // если в клиунтой ячейке находит друг, то
        this.medodDeselectCell();// Если какая-то ячека была выделена, то снимаем выделение
        this.gamePlay.selectCell(index); // Выделаем персонажа
        this.gameState.indexSelectedCell = index; // Записываем в gameState индекс выделенной ячейки
      } else { // иначе значит что в этой ячейке враг, то ...
        if (this.gameState.indexSelectedCell !== null) { // ... то проверяем то, был ли клику по вругу кликнут (т.е. выбран) какой-нибудь друг. Если да, то ...
          // Метод дествия после клика по врагу, когда уже выбран был хороший (проверяем в зоне атаки ли ли он, атакуем, ответ врага, проверка наличия игроков, перезапуск)
          this.afterClickingOnEnemy(index, check);
        } else {
          GamePlay.showError('Это персонаж врага, вам нельзя им управлять!');
        }
      }
    } else { // в этой клетке нет персонажа
      if (this.gameState.indexSelectedCell !== null) { // Проверяем была ли выбран до этого клика персонаж, если да, то ...
      // Запускаем метод перемещения персонажа на клинутую ячейку (если это возможно)
        this.characterMovements(index);
      }
    }
  }

  // Действие при наведении курсора на клетку
  onCellEnter(index) {
    // TODO: react to mouse enter
    const check = this.findCharacterOnCellindex(index); // находим персонажа на кликнутой ячейке

    if (check) { // проверяем, есть ли в наведенной клетке персонаж
      const message = this.formTooltip(check); // формируем сообщение с харатеристиками для показа ниже в подсказке
      this.gamePlay.showCellTooltip(message, index); // при наведении на персонажа, показываем подсказку с характеристиками персорнажа

      if (this.definingСommand(check.character.type)) { // если есть персонаж, то проверяем в какой команде, если в хорошей, то ....
        this.gamePlay.setCursor(cursors.pointer); // если есть персонаж, то меняем курсор на палец
      } else { // если персонаж, на которого навели, в плохой команде, то ...
        this.сhangingCursorOnEnemy(index); // Запускаем метод изменения вида курсора при наведении на врага
      }
    } else { // если в ячейке нет персонажа, то ...
      this.gamePlay.setCursor(cursors.auto); // если персонажа нет, то курсор меняем на стрелку

      if (this.gameState.indexSelectedCell !== null) { // если на поле есть выбранный персонаж, то ...
        this.highlightingCellsForStep(index); // запускаем метод подсвечивания клеток, на которые может шагнуть персонаж
      }
    }
  }

  // Дествия при покадании курсора любой клетки
  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index); // прячем подсказку с характеристиками, если курсор не наведен на персонажа

    // Убираем подсвечивание клетки зелёным
    if (this.gameState.indexSelectedCell !== index) { // если клетка не равна клетке в которой есть отмеченный персонаж, то ...
      this.gamePlay.deselectCell(index); // убираем подсвечивание клетки
    }
  }

  // Ф-ия растановки персонажей случайным образом
  positionedCharacter() {
    // Формируем список возможных позиций для твоей команды

    const goodAllPositins = [];
    for (let i = 0; i < 64; i++) {
      if (i % 8 === 0 || (i - 1) % 8 === 0) {
        goodAllPositins.push(i);
      }
    }
    // Формируем список возможных позиций для команды противника
    const badAllPositins = [];
    for (let i = 0; i < 64; i++) {
      if ((i + 2) % 8 === 0 || (i + 1) % 8 === 0) {
        badAllPositins.push(i);
      }
    }

    let positionedCharacter = [];

    // Формируем позиции твоей команды
    positionedCharacter = this.formPositionsTeam(this.goodTeam, goodAllPositins, positionedCharacter);
    // Формируем позиции команды противника все в одном массиве с позициями твоей команды
    positionedCharacter = this.formPositionsTeam(this.badTeam, badAllPositins, positionedCharacter);

    // отрисовываем всех персонажей
    this.gamePlay.redrawPositions(positionedCharacter);
    // сохраняем позиции всех в "глобальную" переменную
    this.gameState.positionedCharacter = positionedCharacter;
  }

  // Проверяем нет ли на клетке персонажа
  findCharacterOnCellindex(index) {
    const rezult = this.gameState.positionedCharacter.find((e) => e.position === index);
    return rezult;
  }

  // формируем текст подсказки
  formTooltip(check) {
    const {
      level, attack, defence, health,
    } = check.character;
    const message = `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
    return message;
  }

  // Определяем в какой команде игрок
  definingСommand(user) {
    return !!['bowman', 'swordsman', 'magician'].find((e) => e === user);
  }

  async attack(attacker, target) {
    console.log('Здоровье врага', target.character.health);

    const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1); // Высчитываем урон, который будет нанесен атакующим атакуемому

    await this.gamePlay.showDamage(target.position, damage); // Ожидаем завершения анимации урона

    // eslint-disable-next-line
    target.character.health -= damage; // Пересчитываем здоровье атакуемого

    // if (!!this.gamePlay.boardEl.contains(target.position)) { // Проверяем, содержится ли элемент в DOM-дереве
    this.gamePlay.redrawPositions(this.gameState.positionedCharacter); // Перерисовываем поле, т.к. изменалась полоска жизни
    // }

    console.log('После удара здоровье врага', target.character.health);
  }

  // Функция удаления убитых игроков
  checkLife() {
    for (let i = 0; i < this.gameState.positionedCharacter.length; i++) { // Перебираем всех игроков на поле
      if (this.gameState.positionedCharacter[i].character.health <= 0) { // Если у какого-то игрока здоровье равно или меньше нуля, то ...
        // Если умер друг, то снимем выделение ячейки
        if (this.definingСommand(this.gameState.positionedCharacter[i].character.type)) { // если в кликнутой ячейке находит друг, то
          this.medodDeselectCell(); // Если какая-то ячека была выделена, то снимаем выделение
        } else { // иначе, если умер враг, то снимаем с него выделение
          this.gamePlay.deselectCell(this.gameState.positionedCharacter[i].position);
        }

        this.gameState.positionedCharacter.splice(i, 1); // ... вырезаем этого игрока из массива всех игроков
      }
    }
    this.gamePlay.redrawPositions(this.gameState.positionedCharacter); // Перерисовываем поле
  }

  // Метод проверки наличия игроков в любой из команд
  checkLifeTeam() {
    let countGoodperson = 0; // Количество твоих игроков на поле
    let countBadperson = 0; // Количество игроков противника на поле
    this.gameState.positionedCharacter.forEach((e) => { // Перебираем всех игроков на поле
      if (this.definingСommand(e.character.type)) { // если игрок в твоей команде, то ...
        countGoodperson += 1; // прибвляем в количеству твоих игроков на поле +1
      } else {
        countBadperson += 1; // иначе прибавляем в количеству игроков противника на поле +1
      }
    });

    console.log('Твоих игроков =', countGoodperson, '  Игроков врага =', countBadperson);
    if (countGoodperson === 0) { // Если после перебора всех игроков в твоей команде ноль игроков, то возвращаем сообщение
      return ('Твоя команда проиграла');
    }

    if (countBadperson === 0) { // Если после перебора всех игроков в команде противника ноль игроков, то возвращаем сообщение
      return ('Команда противника проиграла');
    }
  }

  // Функция прибавления здоровья +80 выживших игрокам
  addHealth() {
    this.gameState.positionedCharacter.forEach((e) => { // Перебираем всех игроков на поле
      e.character.health += 80; // Прибавляем к здоровью выживших игроков 80
      if (e.character.health > 100) { // Если здоровье получилось больше 100 , то ...
        e.character.health = 100; // ... приравниваем здоровье к 100
      }
    });
  }

  addAttackDefence() {
    this.gameState.positionedCharacter.forEach((e) => { // Перебираем всех игроков на поле
      e.character.attack = Math.max(e.character.attack, e.character.attack * (80 + e.character.health) / 100); // Повышаем уровень атаки
      e.character.defence = Math.max(e.character.defence, e.character.defence * (80 + e.character.health) / 100); // Повышаем уровень защиты
    });
  }

  // Блокировка поля
  blockBoard() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.setCursor(cursors.auto);
  }

  //= = Ответ врага после атаки ===
  async answerEnemy() {
    /// ////////////////////////////////////////////////
    let enemyStrike = false; // переменная в которой будем хранить то, был удар или нет, чтобы понять сделать шаг или нет

    const arrPositionGoodPersons = []; // Пустой массив, в которы сложим позиции всех твоих игроков, чтобы потом проверить их позиции на досягаемость врагов
    this.gameState.positionedCharacter.forEach((e) => { // Перебираем позиции всех персонажей,
      if (this.definingСommand(e.character.type)) { // если персонаж в твоей команде, то ...
        arrPositionGoodPersons.push(e.position); // добавляем его позицию в массив
      }
    });

    for (let i = 0; i < this.gameState.positionedCharacter.length; i++) { // Перебираем весь первоснажей на доске (чтобы найти врагов)
      const e = this.gameState.positionedCharacter[i];
      if (!this.definingСommand(e.character.type)) { // проверяем в какой команде каждый игрок, если игрок НЕ в твоей команде, то ....
        const possiblAttack = possibleAttackIndexes(e.position, e.character.distanceAttack); // составляем массив клеток, на которые может ударить перебираемый в данный момент враг

        for (let j = 0; j < possiblAttack.length; j++) { // Будем перебирать все ячейки возможной атаки и ...
          const element = possiblAttack[j];
          if (arrPositionGoodPersons.find((el) => el === element)) { // ... сравнивать каждую ячейку с позицией друзей, и если среди них, есть позиция друга, то ... (element - индекс ячейки)
            const goodTarget = this.findCharacterOnCellindex(element); // находим персонажа на той найденной ячейке, чтобы его атаковать

            await this.attack(e, goodTarget); // производим атаку врагом друга

            i = this.gameState.positionedCharacter.length; // останавливаем перебор врагов, т.к. один из них сделал уже удар (просто переводим счетчик в конец)
            enemyStrike = true; // сохраняем в переменную, что был удар врага
            break;
          }
        }
      }
    }

    if (!enemyStrike) { // если ни один из врагов не смог ударить, то ....
      for (let i = 0; i < this.gameState.positionedCharacter.length; i++) { // Перебираем весь первоснажей на доске (чтобы найти врагов)
        const e = this.gameState.positionedCharacter[i];
        if (!this.definingСommand(e.character.type)) { // проверяем в какой команде каждый игрок, если игрок НЕ в команде друзей, то ....
          e.position -= 1; // передвигаем врага на одну клетку левее
          i = this.gameState.positionedCharacter.length; // останавливаем перебор врагов, т.к. один из них сделал уже шаг (просто переводим счетчик в конец)
        }
      }
      this.gamePlay.redrawPositions(this.gameState.positionedCharacter); // перерисовываем поле
    }
  }

  // Метод удаления выделения с ячейки
  medodDeselectCell() {
    if (this.gameState.indexSelectedCell !== null) {
      this.gamePlay.deselectCell(this.gameState.indexSelectedCell);
      this.gameState.indexSelectedCell = null;
    }
  }

  // Метод изменения вида курсора при наведении на врага
  сhangingCursorOnEnemy(index) {
    if (this.gameState.indexSelectedCell !== null) { // Если уже был выбран персонаж твоей команды, то
      // проверяем не находится ли в зоне поражения, чтобы отобразить курсор прицел и поле подсветить красным
      const personaSelected = this.findCharacterOnCellindex(this.gameState.indexSelectedCell); // сохраняем в переменную ранее выбранного персонажа
      const possiblAttack = possibleAttackIndexes(personaSelected.position, personaSelected.character.distanceAttack); // составляем массив клеток, на которые может ударить ранее выбранный персонаж

      if (possiblAttack.find((el) => el === index)) { // Если в массиве клеток возможных для атаки есть клетка на которую сейчас навели, то ...
        this.gamePlay.setCursor(cursors.crosshair); // при наведении курсор меняется на прицел
        this.gamePlay.selectCell(index, 'red'); // при наведении ячека помечается красным кружком
      } else { // иначе, если наведенной клетки нет в массиве клеток для атаки, то ...
        this.gamePlay.setCursor(cursors.notallowed); // меняем курсор на знак "запрещено"
      }
    } else { // если не был выбран персонаж твоей команды до этого, то ...
      this.gamePlay.setCursor(cursors.pointer); // то меняем курсор на палец
    }
  }

  // Метод подсвечивания клеток, на которые может шагнуть персонаж
  highlightingCellsForStep(index) {
    const character = this.findCharacterOnCellindex(this.gameState.indexSelectedCell); // сохраняем в переменную выбранного персонажа
    const possibleMove = possibleMoveIndexes(this.gameState.indexSelectedCell, character.character.distanceMovi); // Получаем массив ячеек на которые может ходить персонаж

    if (possibleMove.find((e) => e === index)) { // если индекс клеткаю, на которую навели, есть в массиве возможных выбранного шагов персонажа, то ...
      this.gamePlay.selectCell(index, 'green'); // подсвечиваем клетку зелёным кружком
    } else { // если индекса наведенной клетки нет в массиве возможных ходов выбранного персонажа, то ...
      this.gamePlay.setCursor(cursors.notallowed); // меняем курсор на знак "запрещено"
    }
  }

  // Метод дествия после клика по врагу, когда уже выбран был персонаж твоей команды (проверяем в зоне атаки ли ли он, атакуем, ответ врага, проверка наличия игроков, перезапуск)
  async afterClickingOnEnemy(index, check) {
    const persona = this.findCharacterOnCellindex(this.gameState.indexSelectedCell); // находим персонажа на ранее кликнутой ячейке
    const possiblAttack = possibleAttackIndexes(this.gameState.indexSelectedCell, persona.character.distanceAttack); // составляем массив клеток, на которые может атаковать друг

    if (possiblAttack.find((e) => e === index)) { // проверяем находится ли индекс данной ячейки в массиве возможных ячеек для атаки
      await this.attack(persona, check); // если находится в зоне атаки то запускаем функцию атаки, вней передаем атакуещего и атакуемого

      this.checkLife(); // Запускаем функцию удаления мертвых игроков с поля

      //             //== Ответ врага после атаки ===
      await this.answerEnemy();

      this.checkLife(); // Запускаем функцию удаления мертвых игроков с поля

      const whoLost = this.checkLifeTeam(); // Проверяем остались ли у врага игроки

      if (whoLost === 'Команда противника проиграла') {
        alert('Команда противника проиграла');
        if (this.gameState.teme === 4) { // Если чейчас мы играли на последнем 4 уровне, то ...
          this.blockBoard(); // ... блокируем игру
        } else { // иначе переходим на следующий уровень ...
          this.addAttackDefence(); // Запускаем функцию увеличения атаки и защиты
          this.addHealth(); // Запускаем функцию прибавления здоровья выжившим игрокам
          this.medodDeselectCell();// Если какая-то ячека была выделена, то снимаем выделение
          this.newGame();
        }
      }

      if (whoLost === 'Твоя команда проиграла') {
        alert('Твоя команда проиграла');
      }
    }
  }

  // Метод перемещения персонажа на клинутую ячейку (если это возможно)
  async characterMovements(index) {
    const persona = this.findCharacterOnCellindex(this.gameState.indexSelectedCell); // находим персонажа на ранее кликнутой ячейке
    const possibleMove = possibleMoveIndexes(this.gameState.indexSelectedCell, persona.character.distanceMovi); // Получаем массив ячеек на которые может ходить персонаж

    if (possibleMove.find((e) => e === index)) { // если индекс клетки, на которую навели, есть в массиве возможных выбранного шагов персонажа, то ...
      const personaNumberInArr = this.gameState.positionedCharacter.indexOf(persona, 0); // находим номер персонажа в массиве всех игроков на поле, что бы потом по номеру заменить его позицию
      this.gameState.positionedCharacter[personaNumberInArr].position = index; // заменяем в массиве игроков старую позицию на новую только что кликнутую позицию
      this.gamePlay.redrawPositions(this.gameState.positionedCharacter); // перерисовываем поле
      this.medodDeselectCell();// Если какая-то ячека была выделена, то снимаем выделение
      // ================= сделать переход ходы   =================
      await this.answerEnemy(); // запускаем ответный ход врага
      this.checkLife(); // Запускаем функцию удаления мертвых игроков с поля
    }
  }

  // Заменяем в команде игроков твоей команды на тех, что выжили с прошлого уровня
  replacingPlayersSurvivors() {
    for (let i = 0; i < this.gameState.positionedCharacter.length; i += 1) { // Пока i меньше количетсва игроков в новой твоей команде
      if (this.gameState.positionedCharacter[i].character) { // Проверям есть ли в старой команде игрок под таким же номером, если есть, то ...
        this.goodTeam.characters[i] = this.gameState.positionedCharacter[i].character; // Заменяем игрока в новой команде выжившим игроком из сторой команды
        this.goodTeam.characters[i].level += 1; // Увеличиваем уровень выжившего игрока на 1
      }
    }
  }
}
