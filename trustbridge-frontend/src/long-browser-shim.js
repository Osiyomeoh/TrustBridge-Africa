// Long browser shim to handle module resolution issues
class Long {
  constructor(low, high, unsigned) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
  }

  static fromNumber(value, unsigned = false) {
    return new Long(value, value < 0 ? -1 : 0, unsigned);
  }

  static fromString(str, unsigned = false, radix = 10) {
    return Long.fromNumber(parseInt(str, radix), unsigned);
  }

  static fromBits(lowBits, highBits, unsigned = false) {
    return new Long(lowBits, highBits, unsigned);
  }

  static fromValue(value, unsigned = false) {
    if (value instanceof Long) {
      return value;
    }
    if (typeof value === 'number') {
      return Long.fromNumber(value, unsigned);
    }
    if (typeof value === 'string') {
      return Long.fromString(value, unsigned);
    }
    if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
      return new Long(value.low, value.high, unsigned);
    }
    return Long.fromNumber(0, unsigned);
  }

  static isLong(value) {
    return value instanceof Long;
  }

  // Additional static methods that might be needed
  static fromInt(value, unsigned = false) {
    return Long.fromNumber(value, unsigned);
  }

  static fromUint(value) {
    return Long.fromNumber(value, true);
  }

  static fromInt64(value, unsigned = false) {
    return Long.fromValue(value, unsigned);
  }

  static fromUint64(value) {
    return Long.fromValue(value, true);
  }

  static ZERO = new Long(0, 0, false);
  static ONE = new Long(1, 0, false);
  static NEG_ONE = new Long(-1, -1, false);
  static MAX_VALUE = new Long(0xFFFFFFFF, 0x7FFFFFFF, false);
  static MIN_VALUE = new Long(0, 0x80000000, false);
  static MAX_UNSIGNED_VALUE = new Long(0xFFFFFFFF, 0xFFFFFFFF, true);

  toString(radix = 10) {
    return this.toNumber().toString(radix);
  }

  toNumber() {
    return this.high * 0x100000000 + (this.low >>> 0);
  }

  toInt() {
    return this.low;
  }

  toUnsigned() {
    return new Long(this.low, this.high, true);
  }

  equals(other) {
    return this.low === other.low && this.high === other.high;
  }

  add(other) {
    const low = (this.low + other.low) | 0;
    const high = (this.high + other.high + (low < this.low ? 1 : 0)) | 0;
    return new Long(low, high, this.unsigned);
  }

  subtract(other) {
    const low = (this.low - other.low) | 0;
    const high = (this.high - other.high - (low > this.low ? 1 : 0)) | 0;
    return new Long(low, high, this.unsigned);
  }

  multiply(other) {
    const a = this.toNumber();
    const b = other.toNumber();
    return Long.fromNumber(a * b, this.unsigned);
  }

  divide(other) {
    const a = this.toNumber();
    const b = other.toNumber();
    return Long.fromNumber(Math.floor(a / b), this.unsigned);
  }

  mod(other) {
    const a = this.toNumber();
    const b = other.toNumber();
    return Long.fromNumber(a % b, this.unsigned);
  }

  shiftLeft(numBits) {
    return Long.fromNumber(this.toNumber() << numBits, this.unsigned);
  }

  shiftRight(numBits) {
    return Long.fromNumber(this.toNumber() >> numBits, this.unsigned);
  }

  and(other) {
    return new Long(this.low & other.low, this.high & other.high, this.unsigned);
  }

  or(other) {
    return new Long(this.low | other.low, this.high | other.high, this.unsigned);
  }

  xor(other) {
    return new Long(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  }

  not() {
    return new Long(~this.low, ~this.high, this.unsigned);
  }

  isZero() {
    return this.low === 0 && this.high === 0;
  }

  isNegative() {
    return !this.unsigned && this.high < 0;
  }

  isOdd() {
    return (this.low & 1) === 1;
  }

  isEven() {
    return (this.low & 1) === 0;
  }

  compare(other) {
    if (this.equals(other)) return 0;
    const thisNeg = this.isNegative();
    const otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1;
    return this.subtract(other).isNegative() ? -1 : 1;
  }

  lessThan(other) {
    return this.compare(other) < 0;
  }

  lessThanOrEqual(other) {
    return this.compare(other) <= 0;
  }

  greaterThan(other) {
    return this.compare(other) > 0;
  }

  greaterThanOrEqual(other) {
    return this.compare(other) >= 0;
  }

  negate() {
    return this.not().add(Long.ONE);
  }

  abs() {
    return this.isNegative() ? this.negate() : this;
  }

  // Additional methods that might be needed by HashConnect
  toBytes(le = false) {
    const bytes = new Uint8Array(8);
    if (le) {
      bytes[0] = this.low & 0xff;
      bytes[1] = (this.low >>> 8) & 0xff;
      bytes[2] = (this.low >>> 16) & 0xff;
      bytes[3] = (this.low >>> 24) & 0xff;
      bytes[4] = this.high & 0xff;
      bytes[5] = (this.high >>> 8) & 0xff;
      bytes[6] = (this.high >>> 16) & 0xff;
      bytes[7] = (this.high >>> 24) & 0xff;
    } else {
      bytes[7] = this.low & 0xff;
      bytes[6] = (this.low >>> 8) & 0xff;
      bytes[5] = (this.low >>> 16) & 0xff;
      bytes[4] = (this.low >>> 24) & 0xff;
      bytes[3] = this.high & 0xff;
      bytes[2] = (this.high >>> 8) & 0xff;
      bytes[1] = (this.high >>> 16) & 0xff;
      bytes[0] = (this.high >>> 24) & 0xff;
    }
    return bytes;
  }

  static fromBytes(bytes, unsigned = false, le = false) {
    if (bytes.length !== 8) {
      throw new Error('Long.fromBytes expects 8 bytes');
    }
    let low, high;
    if (le) {
      low = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
      high = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
    } else {
      high = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
      low = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);
    }
    return new Long(low, high, unsigned);
  }

  toBigInt() {
    return BigInt(this.high) * 0x100000000n + BigInt(this.low >>> 0);
  }

  static fromBigInt(value, unsigned = false) {
    const low = Number(value & 0xffffffffn);
    const high = Number(value >> 32n);
    return new Long(low, high, unsigned);
  }
}

// Export both default and named exports
export default Long;
export { Long };
