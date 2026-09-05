export function mulberry32(seed: number): () => number {
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

/** Same stream as mulberry32, with an explicit serializable cursor. */
export function randomStream(seed: number) {
  let state = seed >>> 0;
  return {
    next: () => {
      const value = mulberry32(state)();
      state = (state + 0x6d2b79f5) >>> 0;
      return value;
    },
    state: () => state,
  };
}
