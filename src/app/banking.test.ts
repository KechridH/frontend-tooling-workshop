import { describe, expect, it } from 'vite-plus/test';
import { parseAmount } from './banking';

describe('amounts are represented as integer cents', () => {
  it.each([
    ['100.25', 10025],
    ['0.01', 1],
    ['12,50', 1250],
    [' 25 ', 2500],
    ['0', null],
    ['-1', null],
    ['1.001', null],
    ['hello', null],
    ['', null],
  ])('parses %j as %j', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});
