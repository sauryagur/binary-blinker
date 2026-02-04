import { EncodingType } from "./config";
import { PREAMBLE } from "./config";

const bitsToString = (bits: number[]): string => {
  const bytes: number[] = [];

  for (let i = 0; i + 7 < bits.length; i += 8) {
    let value = 0;
    for (let b = 0; b < 8; b++) {
      value = (value << 1) | bits[i + b];
    }
    bytes.push(value);
  }

  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
};

const decodeManchester = (bits: number[]): number[] => {
  const decoded: number[] = [];
  for (let i = 0; i + 1 < bits.length; i += 2) {
    const a = bits[i];
    const b = bits[i + 1];
    if (a === 1 && b === 0) decoded.push(1);
    else if (a === 0 && b === 1) decoded.push(0);
  }
  return decoded;
};

export const decodeBits = (bits: number[], encoding: EncodingType): string => {
  // Find preamble
  for (let i = 0; i + PREAMBLE.length < bits.length; i++) {
    let match = true;
    for (let j = 0; j < PREAMBLE.length; j++) {
      if (bits[i + j] !== PREAMBLE[j]) {
        match = false;
        break;
      }
    }

    if (match) {
      const payload = bits.slice(i + PREAMBLE.length);

      const dataBits =
        encoding === "Manchester" ? decodeManchester(payload) : payload;

      return bitsToString(dataBits);
    }
  }

  return "";
};
