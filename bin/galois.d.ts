declare module '@guildofweavers/galois' {

    /** Polynomial represented in reverse-coefficient form */
    export type Polynom = Vector;

    export interface WasmOptions {
        readonly memory: WebAssembly.Memory;
    }

    export interface FiniteField {

        /** Characteristic of the field: p in GF(p**n) */
        readonly characteristic: bigint;
        
        /** Extension of the field: n in GF(p**n) */
        readonly extensionDegree: number;

        /** Non-optimized version of the field object */
        readonly jsField: FiniteField;

        /** A flag indicating whether the field uses WebAssembly optimization */
        readonly isOptimized: boolean;

        /** Size of a field element in bytes */
        readonly elementSize: number;

        /** Additive identity of the field */
        readonly zero: bigint;

        /** Multiplicative identity of the field */
        readonly one: bigint;

        isElement(value: bigint): boolean;

        // BASIC ARITHMETICS
        // ----------------------------------------------------------------------------------------

        /**
         * Computes x + y
         * @param x Field element
         * @param y Field element
         */
        add(x: bigint, y: bigint): bigint;

        /**
         * Computes x - y
         * @param x Field element
         * @param y Field element
         */
        sub(x: bigint, y: bigint): bigint;

        /**
         * Computes x * y
         * @param x Field element
         * @param y Field element
         */
        mul(x: bigint, y: bigint): bigint;

        /**
         * Computes x * inv(y)
         * @param x Field element
         * @param y Field element
         */
        div(x: bigint, y: bigint): bigint;

        /**
         * Computes b**p
         * @param b Field element to exponentiate
         * @param p Exponent, a positive or a negative number
         */
        exp(b: bigint, p: bigint): bigint;

        /**
         * Computes modular multiplicative inverse using Extended Euclidean algorithm
         * @param value Field element to invert
         */
        inv(value: bigint): bigint;

        /**
         * Computes modular additive inverse
         * @param value Filed element to negate
         */
        neg(value: bigint): bigint;

        // VECTOR OPERATIONS
        // ----------------------------------------------------------------------------------------

        /** Creates a new vector of the specified length */
        newVector(length: number): Vector;

        /** Creates a new vector from the specified array of values */
        newVectorFrom(values: bigint[]): Vector;

        /** Computes a new vector v such that v[i] = a[i] + b[i] for all i */
        addVectorElements(a: Vector, b: Vector): Vector;

        /** Computes a new vector v such that v[i] = a[i] + b for all i */
        addVectorElements(a: Vector, b: bigint): Vector;

        /** Computes a new vector v such that v[i] = a[i] - b[i] for all i */
        subVectorElements(a: Vector, b: Vector): Vector;

        /** Computes a new vector v such that v[i] = a[i] - b for all i */
        subVectorElements(a: Vector, b: bigint): Vector;

        /** Computes a new vector v such that v[i] = a[i] * b[i] for all i */
        mulVectorElements(a: Vector, b: Vector): Vector;

        /** Computes a new vector v such that v[i] = a[i] * b for all i */
        mulVectorElements(a: Vector, b: bigint): Vector;

        /** Computes a new vector v such that v[i] = a[i] * inv(b[i]) for all i */
        divVectorElements(a: Vector, b: Vector): Vector;

        /** Computes a new vector v such that v[i] = a[i] * inv(b) for all i */
        divVectorElements(a: Vector, b: bigint): Vector;

        /** Computes a new vector v such that v[i] = a[i]^b[i] for all i */
        expVectorElements(a: Vector, b: Vector): Vector;

        /** Computes a new vector v such that v[i] = a[i]^b for all i */
        expVectorElements(a: Vector, b: bigint): Vector;

        /** Computes multiplicative inverse for all vector elements using Montgomery batch inversion */
        invVectorElements(v: Vector): Vector;

        /** Computes additive inverse for all vector elements */
        negVectorElements(v: Vector): Vector;

        /** Computes a linear combination of two vectors */
        combineVectors(a: Vector, b: Vector): bigint;

        /** Computes a linear combination as sum(v[i][j]*k[i]) for each row i */
        combineManyVectors(v: Vector[], k: Vector): Vector;

        /**
         * Creates a new vector by selecting values from the source vector by skipping over the specified number of elements
         * @param v Source vector
         * @param skip Number of elements to skip before selecting the next value
         * @param times Number of times to pluck the source vector
         */
        pluckVector(v: Vector, skip: number, times: number): Vector;

        /** Creates a new vector with the length truncated to the specified value */
        truncateVector(v: Vector, newLength: number): Vector;

        /** Creates a copy of a vector that represents the source vector duplicated the specified number of times */
        duplicateVector(v: Vector, times?: number): Vector;

        /** Creates a new vector with the elements rotated by the specified number of slots */
        rotateVector(v: Vector, slots: number): Vector;

        /** Transposes the provided vector into a matrix with the specified number of columns */
        transposeVector(v: Vector, columns: number, step?: number): Matrix;

        /** Splits the provided vector into the a matrix with the specified number of rows */
        splitVector(v: Vector, rows: number): Matrix;

        // MATRIX OPERATIONS
        // ----------------------------------------------------------------------------------------

        /** Creates a new matrix with the specified number of rows and columns */
        newMatrix(rows: number, columns: number): Matrix;

        /** creates a new matrix from the specified 2-dimensional array of values */
        newMatrixFrom(values: bigint[][]): Matrix;

        /** Creates a new matrix using provided vectors as matrix rows */
        newMatrixFromVectors(v: Vector[]): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] + b[i,j] for all i and j */
        addMatrixElements(a: Matrix, b: Matrix): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] + b for all i and j */
        addMatrixElements(a: Matrix, b: bigint): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] - b[i,j] for all i and j */
        subMatrixElements(a: Matrix, b: Matrix): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] - b for all i and j */
        subMatrixElements(a: Matrix, b: bigint): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] * b[i,j] for all i and j */
        mulMatrixElements(a: Matrix, b: Matrix): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] * b for all i and j */
        mulMatrixElements(a: Matrix, b: bigint): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] * inv(b[i,j]) for all i and j */
        divMatrixElements(a: Matrix, b: Matrix): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j] * inv(b) for all i and j */
        divMatrixElements(a: Matrix, b: bigint): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j]^b[i,j] for all i and j */
        expMatrixElements(a: Matrix, b: Matrix): Matrix;

        /** Computes a new matrix m such that m[i,j] = a[i,j]^b for all i and j */
        expMatrixElements(a: Matrix, b: bigint): Matrix;

        /** Computes multiplicative inverse for all matrix elements using Montgomery batch inversion */
        invMatrixElements(m: Matrix): Matrix;

        /** Computes additive inverse for all matrix elements */
        negMatrixElements(v: Matrix): Matrix;

        /**
         * Computes a matrix with dimensions [m,n] which is a product of matrixes a and b
         * @param a Matrix with dimensions [m,p]
         * @param b Matrix with dimensions [p,n]
         */
        mulMatrixes(a: Matrix, b: Matrix): Matrix;

        /**
         * Computes a vector of length m which is a product of matrix a and vector b
         * @param m Matrix with dimensions [m,n]
         * @param v Vector of length n
         */
        mulMatrixByVector(m: Matrix, v: Vector): Vector;

        /** Computes a new matrix n such that n[i,j] = m[i,j] * v[i] for all i and j */
        mulMatrixRows(m: Matrix, v: Vector): Matrix;

        /** Computes a new matrix n such that n[i,j] = v[i][j] - m[i,j]  */
        subMatrixElementsFromVectors(v: Vector[], m: Matrix): Matrix;

        /** Returns an array of vectors corresponding to the matrixes' rows */
        matrixRowsToVectors(m: Matrix): Vector[];

        /** Returns a vector which represents a concatenation of the matrix's rows  */
        joinMatrixRows(m: Matrix): Vector;

        /** Returns a new matrix which is a transpose of the provided matrix */
        transposeMatrix(m: Matrix): Matrix;

        // RANDOMNESS
        // ----------------------------------------------------------------------------------------

        /**
         * Generate a cryptographically-secure random field element
         */
        rand(): bigint;

        /**
         * Generates a sequence of pseudorandom field elements from the provided seed
         * @param seed Seed for the PRNG
         * @param length Length of sequence to generate
         */
        prng(seed: bigint | Buffer, length: number): Vector;

        /**
         * Generates a single pseudorandom field element from the provided seed
         * @param seed Seed for the PRNG
         */
        prng(seed: bigint | Buffer): bigint;

        // OTHER OPERATIONS
        // ----------------------------------------------------------------------------------------

        /**
         * Computes a primitive root of unity such that root**order=1
         * @param order Order of the root of unity
         */
        getRootOfUnity(order: number): bigint;

        /**
         * Computes a series of powers for the provided base element
         * @param base Field element to exponentiate
         * @param length Length of the series to return
         */
        getPowerSeries(base: bigint, length: number): Vector;

        // BASIC POLYNOMIAL OPERATIONS
        // ----------------------------------------------------------------------------------------

        /**
         * Computes a[i] + b[i] for all i
         * @param a Polynomial
         * @param b Polynomial
         */
        addPolys(a: Polynom, b: Polynom): Polynom;

        /**
         * Computes a[i] - b[i] for all i
         * @param a Polynomial
         * @param b Polynomial
         */
        subPolys(a: Polynom, b: Polynom): Polynom;

        /**
         * Computes a[i] * b[i] at all i
         * @param a Polynomial
         * @param b Polynomial
         */
        mulPolys(a: Polynom, b: Polynom): Polynom;

        /**
         * Computes a[i] * inv(b[i]) for all i
         * @param a Polynomial
         * @param b Polynomial
         */
        divPolys(a: Polynom, b: Polynom): Polynom;

        /**
         * Computes p[i] * c for all i
         * @param p Polynomial to multiply
         * @param c Constant
         */
        mulPolyByConstant(p: Polynom, c: bigint): Polynom;

        // POLYNOMIAL EVALUATION
        // ----------------------------------------------------------------------------------------

        /**
         * Evaluates a polynomial at a provided x coordinates
         * @param p Polynomial to evaluate
         * @param x X coordinate at which to evaluate the polynomial
         */
        evalPolyAt(p: Vector, x: bigint): bigint;

        /**
         * Uses Fast Fourier Transform to evaluate a  set of polynomials at all provided roots of unity
         * @param p Polynomials to evaluate
         * @param rootsOfUnity Roots of unity representing x coordinates to evaluate
         */
        evalPolyAtRoots(p: Vector, rootsOfUnity: Vector): Vector;

        /**
         * Uses Fast Fourier Transform to evaluate a polynomial at all provided roots of unity
         * @param p A matrix where each row contains a polynomial to evaluate
         * @param rootsOfUnity Roots of unity representing x coordinates to evaluate
         */
        evalPolysAtRoots(p: Matrix, rootsOfUnity: Vector): Matrix;

        /**
         * Evaluates a set of degree 3 polynomials at the provided x coordinate
         * @param polys A matrix where each row is a degree 3 polynomial (4 values per row)
         * @param x X coordinate at which to evaluate the polynomials
         */
        evalQuarticBatch(polys: Matrix, x: bigint): Vector;

        /**
         * Evaluates a set of degree 3 polynomials at provided x coordinates
         * @param polys A matrix where each row is a degree 3 polynomial (4 values per row)
         * @param xs A vector of x coordinates to evaluate
         */
        evalQuarticBatch(polys: Matrix, xs: Vector): Vector;

        // POLYNOMIAL INTERPOLATION
        // ----------------------------------------------------------------------------------------

        /**
         * Uses Lagrange Interpolation to compute a polynomial from provided points
         * @param xs x coordinates of points
         * @param ys y coordinates of points
         */
        interpolate(xs: Vector, ys: Vector): Vector;

        /**
         * Uses Fast Fourier Transform to compute a polynomial from provided points
         * @param rootsOfUnity Roots of unity representing x coordinates of points to interpolate
         * @param ys y coordinates of points to interpolate
         */
        interpolateRoots(rootsOfUnity: Vector, ys: Vector): Vector;

        /**
         * Uses Fast Fourier Transform to compute polynomials from provided points
         * @param rootsOfUnity Roots of unity representing x coordinates of points to interpolate
         * @param ys A matrix with each row representing y coordinates of points to interpolate
         */
        interpolateRoots(rootsOfUnity: Vector, ySets: Matrix): Matrix;

        /**
         * Uses an optimized version of Lagrange Interpolation for degree 3 polynomials
         * @param xSets A matrix of X coordinates (4 values per row)
         * @param ySets A matrix of Y coordinates (4 values per row)
         */
        interpolateQuarticBatch(xSets: Matrix, ySets: Matrix): Matrix;
    }

    // DATA TYPES
    // ----------------------------------------------------------------------------------------
    export interface Vector {
        readonly length     : number;
        readonly byteLength : number;
        readonly elementSize: number;

        /** Returns the element located at the specified index */
        getValue(index: number): bigint;

        /**
         * Copies a vector element (in little-endian form) into the destination buffer
         * @param index Index at which the element is located
         * @param destination Buffer into which the element should be copied
         * @param offset Byte offset in the destination buffer at which to copy the element
         * @returns Number of bytes written to the destination buffer
         */
        copyValue(index: number, destination: Buffer, offset: number): number;

        /** Returns contents of the vector as a BigInt array */
        toValues(): bigint[];

        /** Serializes vector elements into a single buffer */
        toBuffer(startIdx?: number, elementCount?: number): Buffer;
    }

    export interface Matrix {
        readonly rowCount   : number;
        readonly colCount   : number;
        readonly byteLength : number;
        readonly elementSize: number;

        /** Returns the element located at the specified row and column */
        getValue(row: number, column: number): bigint;

        /**
         * Copies a matrix element (in little-endian form) into the destination buffer
         * @param row Row index at which the element is located
         * @param column Column index at which the element is located
         * @param destination Buffer into which the element should be copied
         * @param offset Byte offset in the destination buffer at which to copy the element
         * @returns Number of bytes written to the destination buffer
         */
        copyValue(row: number, column: number, destination: Buffer, offset: number): number;

        /** Returns contents of the matrix as a 2-dimensional BigInt array */
        toValues(): bigint[][];

        /** Serializes matrix elements into a single buffer (in row-major form) */
        toBuffer(): Buffer;

        /** Serializes matrix rows into an array of buffers (one buffer per row) */
        rowsToBuffers(indexes?: number[]): Buffer[];
    }

    // GLOBAL FUNCTIONS
    // ----------------------------------------------------------------------------------------

    /**
     * Creates a prime field for the specified modulus. If useWasm is set to true, will try to
     * instantiate a WebAssembly-optimized version of the field. If WASM optimization is not
     * available for the specified modulus, will create a regular JavaScript-based field.
     */
    export function createPrimeField(modulus: bigint, useWasm?: boolean): FiniteField

    /**
     * Tries to create a WebAssembly-optimized prime field for the specified modulus and pass the
     * provided options to it. If WASM optimization is not available for the specified modulus,
     * will create a regular JavaScript-based field.
     */
    export function createPrimeField(modulus: bigint, options?: Partial<WasmOptions>): FiniteField

}