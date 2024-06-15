/* eslint-disable no-console */
/* eslint-disable max-len */
/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index > 0 && index < (boardSize - 1)) {
    return 'top';
  }
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  }
  if (index === boardSize * boardSize - boardSize) {
    return 'bottom-left';
  }
  if (index > (boardSize * boardSize - boardSize) && index < (boardSize * boardSize - 1)) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if ((index + 1) % boardSize === 0) {
    return 'right';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

// Функция получения массива возможных клеток, на которые может сходить персонаж двигаясь по горизонтали и диагнонали
export function possibleMoveIndexes(index, distance) {
  const arrr = [];
  // console.log(index);
  // Берем в массив ячеки слева от позиции
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }

    arrr.push(index - i);

    if ((index - i) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Берем в массив ячеки справа от позиции
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }
    arrr.push(index + i);
    if ((index + i + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Берём ячейки сверху
  for (let i = 1; i <= distance; i += 1) {
    const step = 8 * i;
    if (index - step < 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(index - step);
  }

  // Берём ячейки снизу
  for (let i = 1; i <= distance; i += 1) {
    const step = 8 * i;
    if (index + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(index + step);
  }

  // Берёс ячейки по диагонали
  // Вверх и влево
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }

    const newindex = index - i;

    const step = 8 * i;
    if (newindex - step < 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(newindex - step);

    if ((index - i) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Вниз и влево
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }

    const newindex = index - i;

    const step = 8 * i;
    if (newindex + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(newindex + step);

    if ((index - i) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Вверх и вправо
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }
    const newindex = index + i;

    const step = 8 * i;
    if (newindex - step < 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(newindex - step);

    if ((index + i + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Вниз и вправо
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }
    const newindex = index + i;

    const step = 8 * i;
    if (newindex + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(newindex + step);

    if ((index + i + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  return arrr;
}

// Функция получения массива возможных клеток, на которые может атаковать персонаж двигаясб беря клетки по квадрату
export function possibleAttackIndexes(index, distance) {
  const arrr = [];
  console.log(index);
  // Берем в массив ячеки слева от позиции
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }

    arrr.push(index - i);

    if ((index - i) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Берем в массив ячеки справа от позиции
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }
    arrr.push(index + i);
    if ((index + i + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
      break;
    }
  }

  // Берём ячейки сверху
  for (let i = 1; i <= distance; i += 1) {
    const step = 8 * i;
    if (index - step < 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(index - step);
  }

  // Берём ячейки снизу
  for (let i = 1; i <= distance; i += 1) {
    const step = 8 * i;
    if (index + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    arrr.push(index + step);
  }

  // Берёс ячейки по диагонали
  // Вверх и влево
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }
    for (let j = 1; j <= distance; j += 1) {
      const newindex = index - j;

      const step = 8 * i;
      if (newindex - step < 0) { // Если игрок стоит на верхней строке, то выше брать ячейки нельзя
        break;
      }

      arrr.push(newindex - step);

      if ((index - j) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
        break;
      }
    }
  }

  // Вниз и влево
  for (let i = 1; i <= distance; i += 1) {
    if (index % 8 === 0) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
      break;
    }

    for (let j = 1; j <= distance; j += 1) {
      const newindex = index - j;

      const step = 8 * i;
      if (newindex + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
        break;
      }
      arrr.push(newindex + step);

      if ((index - j) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
        break;
      }
    }
  }

  // Вверх и вправо
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }
    for (let j = 1; j <= distance; j += 1) {
      const newindex = index + j;

      const step = 8 * i;
      if (newindex - step < 0) { // Если игрок стоит на верхней строчке, то выше брать ячейки нельзя
        break;
      }
      arrr.push(newindex - step);

      if ((index + j + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
        break;
      }
    }
  }

  // Вниз и вправо
  for (let i = 1; i <= distance; i += 1) {
    if ((index + 1) % 8 === 0) { // Если игрок стоит на правом краю, то справа брать ячейки нельзя
      break;
    }

    for (let j = 1; j <= distance; j += 1) {
      const newindex = index + j;

      const step = 8 * i;
      if (newindex + step > 8 * 8) { // Если игрок стоит на левом краю, то слева брать ячейки нельзя
        break;
      }
      arrr.push(newindex + step);

      if ((index + j + 1) % 8 === 0) { // Если следующая ячеку крайняя слева, то больше в массив не берем
        break;
      }
    }
  }

  return arrr;
}
