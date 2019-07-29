// IMPORTS
// ================================================================================================
import * as fs from 'fs';
import * as loader from 'assemblyscript/lib/loader';

// CONSTANTS
// ================================================================================================
const VALUE_BITS = 128;
const VALUE_SIZE = VALUE_BITS / 8;
const MAX_VALUE = 2n**BigInt(VALUE_BITS) - 1n;
const MASK_32B = 0xFFFFFFFFn;
const MASK_64B = 0xFFFFFFFFFFFFFFFFn;

// WASM MODULE
// ================================================================================================
interface Wasm {
    getInputsPtr(): number;
    getOutputsPtr(): number;
    setModulus(mHi1: number, mHi2: number, mLo1: number, mLo2: number): void;

    newArray(elementCount: number): number;

    addArrayElements(aRef: number, bRef: number, elementCount: number): number;
    addArrayElements2(aRef: number, bIdx: number, elementCount: number): number;
    subArrayElements(aRef: number, bRef: number, elementCount: number): number;
    subArrayElements2(aRef: number, bIdx: number, elementCount: number): number;
    mulArrayElements(aRef: number, bRef: number, elementCount: number): number;
    mulArrayElements2(aRef: number, bIdx: number, elementCount: number): number;
    divArrayElements(aRef: number, bRef: number, elementCount: number): number;
    divArrayElements2(aRef: number, bIdx: number, elementCount: number): number;
    expArrayElements(aRef: number, bRef: number, elementCount: number): number;
    expArrayElements2(aRef: number, bIdx: number, elementCount: number): number;
    invArrayElements(sourceRef: number, elementCount: number): number;

    getPowerSeries(length: number, seedIdx: number): number;

    combineVectors(aRef: number, bRef: number, elementCount: number): number;

    mulMatrixes(aRef: number, bRef: number, n: number, m: number, p: number): number;

    evalPolyAtRoots(pRef: number, rRef: number, elementCount: number): number;
    interpolateRoots(rRef: number, yRef: number, elementCount: number): number;
}

// PUBLIC MODULE
// ================================================================================================
export function instantiate(modulus: bigint): Wasm128 {
    const wasm = loader.instantiateBuffer<Wasm>(fs.readFileSync(`${__dirname}/prime128.wasm`));
    return new Wasm128(wasm, modulus);
}

export class Wasm128 {

    readonly modulus    : bigint;
    readonly wasm       : Wasm & loader.ASUtil;
    readonly inputsIdx  : number;
    readonly outputsIdx : number;

    // CONSTRUCTOR
    // ----------------------------------------------------------------------------------------
    constructor(wasm: Wasm & loader.ASUtil, modulus: bigint) {
        this.wasm = wasm;
        this.modulus = modulus;
        this.inputsIdx = (this.wasm.getInputsPtr()) >>> 3;
        this.outputsIdx = (this.wasm.getOutputsPtr()) >>> 3;

        // set modulus in WASM module
        const mLo2 = Number.parseInt((modulus & MASK_32B) as any);
        const mLo1 = Number.parseInt(((modulus >> 32n) & MASK_32B) as any);
        const mHi2 = Number.parseInt(((modulus >> 64n) & MASK_32B) as any);
        const mHi1 = Number.parseInt(((modulus >> 96n) & MASK_32B) as any);
        this.wasm.setModulus(mHi1, mHi2, mLo1, mLo2);
    }

    // VECTOR OPERATIONS
    // ----------------------------------------------------------------------------------------
    newVector(length: number): WasmVector {
        return new WasmVector(this.wasm, length);
    }

    destroyVector(v: WasmVector): void {
        throw new Error('Not implemented');
    }

    addVectorElements(a: WasmVector, b: WasmVector | bigint): WasmVector {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.addArrayElements2(a.base, 0, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
        else {
            if (a.length !== b.length) {
                throw new Error('Cannot add vector elements: vectors have different lengths');
            }
            const base = this.wasm.addArrayElements(a.base, b.base, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
    }

    subVectorElements(a: WasmVector, b: WasmVector | bigint): WasmVector {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.subArrayElements2(a.base, 0, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
        else {
            if (a.length !== b.length) {
                throw new Error('Cannot subtract vector elements: vectors have different lengths');
            }
            const base = this.wasm.subArrayElements(a.base, b.base, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
    }

    mulVectorElements(a: WasmVector, b: WasmVector | bigint): WasmVector {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.mulArrayElements2(a.base, 0, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
        else {
            if (a.length !== b.length) {
                throw new Error('Cannot multiply vector elements: vectors have different lengths');
            }
            const base = this.wasm.mulArrayElements(a.base, b.base, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
    }

    divVectorElements(a: WasmVector, b: WasmVector | bigint): WasmVector {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.divArrayElements2(a.base, 0, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
        else {
            if (a.length !== b.length) {
                throw new Error('Cannot divide vector elements: vectors have different lengths');
            }
            const base = this.wasm.divArrayElements(a.base, b.base, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
    }

    expVectorElements(a: WasmVector, b: WasmVector | bigint): WasmVector {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.expArrayElements2(a.base, 0, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
        else {
            if (a.length !== b.length) {
                throw new Error('Cannot exponentiate vector elements: vectors have different lengths');
            }
            const base = this.wasm.expArrayElements(a.base, b.base, a.length);
            return new WasmVector(this.wasm, a.length, base);
        }
    }

    invVectorElements(v: WasmVector): WasmVector {
        const base = this.wasm.invArrayElements(v.base, v.length);
        return new WasmVector(this.wasm, v.length, base);
    }

    combineVectors(a: WasmVector, b: WasmVector): bigint {
        if (a.length !== b.length) {
            throw new Error('Cannot combine vectors: vectors have different lengths');
        }
        const outputPos = this.wasm.combineVectors(a.base, b.base, a.length);
        const lo = this.wasm.U64[this.outputsIdx + outputPos];
        const hi = this.wasm.U64[this.outputsIdx + outputPos + 1];
        return (hi << 64n) | lo;
    }

    // MATRIX OPERATIONS
    // ----------------------------------------------------------------------------------------
    newMatrix(rows: number, columns: number): WasmMatrix {
        return new WasmMatrix(this.wasm, rows, columns);
    }

    destroyMatrix(v: WasmMatrix): void {
        throw new Error('Not implemented');
    }

    addMatrixElements(a: WasmMatrix, b: WasmMatrix | bigint): WasmMatrix {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.addArrayElements2(a.base, 0, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
        else {
            if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
                throw new Error('Cannot add matrix elements: matrixes have different dimensions');
            }
            const base = this.wasm.addArrayElements(a.base, b.base, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
    }

    subMatrixElements(a: WasmMatrix, b: WasmMatrix | bigint): WasmMatrix {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.subArrayElements2(a.base, 0, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
        else {
            if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
                throw new Error('Cannot subtract matrix elements: matrixes have different dimensions');
            }
            const base = this.wasm.subArrayElements(a.base, b.base, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
    }

    mulMatrixElements(a: WasmMatrix, b: WasmMatrix | bigint): WasmMatrix {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.mulArrayElements2(a.base, 0, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
        else {
            if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
                throw new Error('Cannot multiply matrix elements: matrixes have different dimensions');
            }
            const base = this.wasm.mulArrayElements(a.base, b.base, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
    }

    divMatrixElements(a: WasmMatrix, b: WasmMatrix | bigint): WasmMatrix {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.divArrayElements2(a.base, 0, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
        else {
            if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
                throw new Error('Cannot divide matrix elements: matrixes have different dimensions');
            }
            const base = this.wasm.divArrayElements(a.base, b.base, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
    }

    expMatrixElements(a: WasmMatrix, b: WasmMatrix | bigint): WasmMatrix {
        if (typeof b === 'bigint') {
            this.wasm.U64[this.inputsIdx] = b & MASK_64B
            this.wasm.U64[this.inputsIdx + 1] = b >> 64n;
            const base = this.wasm.expArrayElements2(a.base, 0, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
        else {
            if (a.rowCount !== b.rowCount || a.colCount !== b.colCount) {
                throw new Error('Cannot exponentiate matrix elements: matrixes have different dimensions');
            }
            const base = this.wasm.expArrayElements(a.base, b.base, a.elementCount);
            return new WasmMatrix(this.wasm, a.rowCount, a.colCount, base);
        }
    }

    invMatrixElements(v: WasmMatrix): WasmMatrix {
        const base = this.wasm.invArrayElements(v.base, v.elementCount);
        return new WasmMatrix(this.wasm, v.rowCount, v.colCount, base);
    }

    mulMatrixes(a: WasmMatrix, b: WasmMatrix): WasmMatrix {
        const n = a.rowCount;
        const m = a.colCount;
        const p = b.colCount;

        if (m !== b.rowCount) {
            throw new Error(`Cannot compute a product of ${a}x${m} and ${b.rowCount}x${p} matrixes`);
        }

        const base = this.wasm.mulMatrixes(a.base, b.base, n, m, p);
        return new WasmMatrix(this.wasm, n, p, base);
    }

    mulMatrixByVector(a: WasmMatrix, b: WasmVector): WasmVector {
        const n = a.rowCount;
        const m = a.colCount;
        const p = 1;

        if (m !== b.length) {
            throw new Error(`Cannot compute a product of ${a}x${m} matrix and ${b.length}x1 vector`);
        }

        const base = this.wasm.mulMatrixes(a.base, b.base, n, m, p);
        return new WasmVector(this.wasm, n, base);
    }

    // OTHER OPERATIONS
    // ----------------------------------------------------------------------------------------
    getPowerSeries(seed: bigint, length: number): WasmVector {
        this.wasm.U64[this.inputsIdx] = seed & MASK_64B
        this.wasm.U64[this.inputsIdx + 1] = seed >> 64n;
        const base = this.wasm.getPowerSeries(length, 0);
        return new WasmVector(this.wasm, length, base);
    }

    // BASIC POLYNOMIAL OPERATIONS
    // ----------------------------------------------------------------------------------------
    addPolys(a: WasmVector, b: WasmVector): WasmVector {
        throw new Error('Not implemented');
    }

    subPolys(a: WasmVector, b: WasmVector): WasmVector {
        throw new Error('Not implemented');
    }

    mulPolys(a: WasmVector, b: WasmVector): WasmVector {
        throw new Error('Not implemented');
    }

    divPolys(a: WasmVector, b: WasmVector): WasmVector {
        throw new Error('Not implemented');
    }

    mulPolyByConstant(a: WasmVector, b: bigint): WasmVector {
        return this.mulVectorElements(a, b);
    }

    evalPolyAtRoots(p: WasmVector, rootsOfUnity: WasmVector): WasmVector {
        const base = this.wasm.evalPolyAtRoots(p.base, rootsOfUnity.base, p.length);
        return new WasmVector(this.wasm, p.length, base);
    }

    interpolateRoots(rootsOfUnity: WasmVector, ys: WasmVector): WasmVector {
        const base = this.wasm.interpolateRoots(rootsOfUnity.base, ys.base, ys.length);
        return new WasmVector(this.wasm, ys.length, base);
    }
}

// VECTOR CLASS
// ================================================================================================
export class WasmVector {

    readonly wasm           : Wasm & loader.ASUtil;
    readonly base           : number;

    readonly length         : number;
    readonly byteLength     : number;

    constructor(wasm: Wasm & loader.ASUtil, length: number, base?: number) {
        this.wasm = wasm;
        this.base = base === undefined ? this.wasm.newArray(length) : base;
        this.length = length;
        this.byteLength = length * VALUE_SIZE;
    }

    getValue(index: number): bigint {
        const idx = (this.base + index * VALUE_SIZE) >>> 3;
        // reads a 128-bit value from WebAssembly memory (little-endian layout)
        const lo = this.wasm.U64[idx];
        const hi = this.wasm.U64[idx + 1];
        return (hi << 64n) | lo;
    }

    setValue(index: number, value: bigint): void {
        if (value > MAX_VALUE) {
            throw new TypeError(`Value cannot be greater than ${MAX_VALUE}`);
        }
        // writes a 128-bit value to WebAssembly memory (little-endian layout)
        const idx = (this.base + index * VALUE_SIZE) >>> 3;
        this.wasm.U64[idx] = value & MASK_64B
        this.wasm.U64[idx + 1] = value >> 64n;
    }
}

// MATRIX CLASS
// ================================================================================================
export class WasmMatrix {

    readonly wasm           : Wasm & loader.ASUtil;
    readonly base           : number;

    readonly rowCount       : number;
    readonly colCount       : number;
    readonly elementCount   : number;
    readonly byteLength     : number;
    readonly rowSze         : number;

    constructor(wasm: Wasm & loader.ASUtil, rows: number, columns: number, base?: number) {
        this.wasm = wasm;
        this.elementCount = rows * columns;
        this.base = base === undefined ? this.wasm.newArray(this.elementCount) : base;
        this.rowCount = rows;
        this.colCount = columns;
        this.rowSze = columns * VALUE_SIZE;
        this.byteLength = rows * this.rowSze;
    }

    getValue(row: number, column: number): bigint {
        const idx = (this.base + row * this.rowSze + column * VALUE_SIZE) >>> 3;
        // reads a 128-bit value from WebAssembly memory (little-endian layout)
        const lo = this.wasm.U64[idx];
        const hi = this.wasm.U64[idx + 1];
        return (hi << 64n) | lo;
    }

    setValue(row: number, column: number, value: bigint): void {
        if (value > MAX_VALUE) {
            throw new TypeError(`Value cannot be greater than ${MAX_VALUE}`);
        }
        // writes a 128-bit value to WebAssembly memory (little-endian layout)
        const idx = (this.base + row * this.rowSze + column * VALUE_SIZE) >>> 3;
        this.wasm.U64[idx] = value & MASK_64B
        this.wasm.U64[idx + 1] = value >> 64n;
    }
}