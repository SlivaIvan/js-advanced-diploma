import { calcTileType } from '../utils';

describe(calcTileType, () => {
  it('should choose the correct position', () => {
    expect(calcTileType(0, 8)).toBe('top-left');
    expect(calcTileType(1, 8)).toBe('top');
    expect(calcTileType(7, 8)).toBe('top-right');
    expect(calcTileType(56, 8)).toBe('bottom-left');
    expect(calcTileType(63, 8)).toBe('bottom-right');
    expect(calcTileType(57, 8)).toBe('bottom');
    expect(calcTileType(8, 8)).toBe('left');
    expect(calcTileType(15, 8)).toBe('right');
    expect(calcTileType(28, 8)).toBe('center');
  });
});
