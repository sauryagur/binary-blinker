// utils/encoder.ts

export type EncodingType = 'Manchester' | 'Raw Binary';

const stringToBits = (text: string): number[] => {
  const data = new TextEncoder().encode(text);
  const bits: number[] = [];
  data.forEach(byte => {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  });
  return bits;
};

export const encodeData = (text: string, type: EncodingType): number[] => {
  const rawBits = stringToBits(text);
  
  // Preamble (8-bit sync pattern: 10101011)
  const preamble = [1, 0, 1, 0, 1, 0, 1, 1]; 
  
  const payload = type === 'Manchester' 
    ? rawBits.flatMap(bit => (bit === 1 ? [1, 0] : [0, 1]))
    : rawBits;

  return [...preamble, ...payload];
};