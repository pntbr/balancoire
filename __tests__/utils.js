import { convertToNumber, formatToCurrency } from '../src/utils';

test('convertToNumber should convert euro string to number', () => {
  expect(convertToNumber('1234,56 €')).toBe(1234.56);
  expect(convertToNumber('1234')).toBe(1234);
  expect(convertToNumber('')).toBe(0);
});

test('formatToCurrency should format number to euro string', () => {
  expect(formatToCurrency(1234.56)).toBe('1234,56 €');
  expect(formatToCurrency(0)).toBe('');
});
