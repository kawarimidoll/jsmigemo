import {bitCount, numberOfTrailingZeros} from "./utils";
const LB = 512;
const SB = 64;
export class BitVector {
    words: Uint32Array;
    sizeInBits: number;
    lb: Uint32Array;
    sb: Uint16Array;
    constructor(words: Uint32Array, sizeInBits: number) {
        if ((sizeInBits + 63) >> 5 != words.length) {
            throw new Error();
        }
        this.words = words;
        this.sizeInBits = sizeInBits;
        this.lb = new Uint32Array((sizeInBits + 511) >>> 9);
        this.sb = new Uint16Array(this.lb.length * 8);
        let sum = 0;
        let sumInLb = 0;
        for (let i = 0; i < this.sb.length; i++) {
            let bc = i < (this.words.length >>> 1) ? bitCount(this.words[i * 2]) + bitCount(this.words[i * 2 + 1]) : 0;
            this.sb[i] = sumInLb;
            sumInLb += bc;
            if ((i & 7) == 7) {
                this.lb[i >> 3] = sum;
                sum += sumInLb;
                sumInLb = 0;
            }
        }
    }

    rank(pos: number, b: boolean): number {
        // TODO: optimize
        if (pos < 0 && this.sizeInBits <= pos) {
            throw new RangeError();
        }
        let count1 = this.sb[pos >>> 6] + this.lb[pos >>> 9];
        let posInDWord = pos & 63;
        if (posInDWord >= 32) {
            count1 += bitCount(this.words[(pos >>> 5) & 0xFFFFFFFE]);
        }
        for (let i = (pos & 0xFFFFFFE0); i < pos; i++) {
            if (this.get(i)) {
                count1 = count1 + 1;
            }
        }
        return b ? count1 : (pos - count1);
    }

    select(count: number, b: boolean): number {
        let lbIndex = this.lowerBoundBinarySearchLB(count, b) - 1;
        let countInLb = count - (b ? this.lb[lbIndex] : (512 * lbIndex - this.lb[lbIndex]));
        let sbIndex = this.lowerBoundBinarySearchSB(countInLb, lbIndex * 8, lbIndex * 8 + 8, b) - 1;
        let countInSb = countInLb - (b ? this.sb[sbIndex] : (64 * (sbIndex % 8) - this.sb[sbIndex]));
        let wordL = this.words[sbIndex * 2];
        let wordU = this.words[sbIndex * 2 + 1];
        if (!b) {
            wordL = ~wordL;
            wordU = ~wordU;
        }
        let lowerBitCount = bitCount(wordL);
        let i = 0;
        if (countInSb > lowerBitCount) {
            wordL = wordU;
            countInSb -= lowerBitCount;
            i = 32;
        }
        while (countInSb > 0) {
            countInSb -= wordL & 1;
            wordL >>>= 1;
            i++;
        }
        return sbIndex * 64 + (i - 1);
    }

    private lowerBoundBinarySearchLB(key: number, b: boolean): number {
        let high = this.lb.length;
        let low = -1;
        while (high - low > 1) {
            let mid = (high + low) >>> 1;
            if ((b ? this.lb[mid] : 512 * mid - this.lb[mid]) < key) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return high;
    }

    private lowerBoundBinarySearchSB(key: number, fromIndex: number, toIndex: number, b: boolean): number {
        let high = toIndex;
        let low = fromIndex - 1;
        while (high - low > 1) {
            let mid = (high + low) >>> 1;
            if ((b ? this.sb[mid] : 64 * (mid & 7) - this.sb[mid]) < key) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return high;
    }

    nextClearBit(fromIndex: number): number {
        let u = fromIndex >> 5;
        let word = ~this.words[u] & (0xffffffff  << fromIndex);
        while (true) {
            if (word != 0)
                return (u * 32) + numberOfTrailingZeros(word);
            if (++u == this.words.length)
                return -1;
            word = ~this.words[u];
        }
    }

    size(): number {
        return this.sizeInBits;
    }

    get(pos: number): boolean {
        if (pos < 0 && this.sizeInBits <= pos) {
            throw new RangeError();
        }
        return ((this.words[pos >>> 5] >>> (pos & 31)) & 1) == 1;
    }
}