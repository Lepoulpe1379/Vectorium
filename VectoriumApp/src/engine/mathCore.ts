import { create, all, Fraction as MathFraction } from 'mathjs';

// 初始化 math.js，重点启用分数模式，避免浮点误差
const math = create(all, {
    number: 'Fraction'
});

export type Fraction = MathFraction;

/**
 * 尝试将数字、字符串安全转换为精确的分数表示
 */
export const toFraction = (val: number | string | Fraction): Fraction => {
    return math.fraction(val as any) as Fraction;
};

/**
 * 获取分数的字符串展示形式（如 "1/3", "4"）
 */
export const formatFraction = (f: Fraction): string => {
    if (Number(f.d) === 1) return `${Number(f.n) * Number(f.s)}`;
    return `${Number(f.n) * Number(f.s)}/${Number(f.d)}`;
};

/**
 * 获取用于图形系统数值插值的浮点数
 */
export const toFloat = (f: Fraction): number => {
    return (Number(f.n) * Number(f.s)) / Number(f.d);
};

// ============================================
// Matrix 2x2 Operations (MVP 核心)
// ============================================

export type Matrix2x2 = [
    [Fraction, Fraction],
    [Fraction, Fraction]
];

export const createIdentity2x2 = (): Matrix2x2 => [
    [toFraction(1), toFraction(0)],
    [toFraction(0), toFraction(1)]
];

export const createMatrix2x2 = (
    a11: number | string, a12: number | string,
    a21: number | string, a22: number | string
): Matrix2x2 => [
        [toFraction(a11), toFraction(a12)],
        [toFraction(a21), toFraction(a22)]
    ];

/**
 * 行列式计算: ad - bc
 */
export const determinant2x2 = (m: Matrix2x2): Fraction => {
    // m[0][0]*m[1][1] - m[0][1]*m[1][0]
    const ad = math.multiply(m[0][0], m[1][1]) as Fraction;
    const bc = math.multiply(m[0][1], m[1][0]) as Fraction;
    return math.subtract(ad, bc) as Fraction;
};

/**
 * 矩阵乘法 C = A * B
 */
export const multiply2x2 = (A: Matrix2x2, B: Matrix2x2): Matrix2x2 => {
    const c11 = math.add(math.multiply(A[0][0], B[0][0]), math.multiply(A[0][1], B[1][0])) as Fraction;
    const c12 = math.add(math.multiply(A[0][0], B[0][1]), math.multiply(A[0][1], B[1][1])) as Fraction;
    const c21 = math.add(math.multiply(A[1][0], B[0][0]), math.multiply(A[1][1], B[1][0])) as Fraction;
    const c22 = math.add(math.multiply(A[1][0], B[0][1]), math.multiply(A[1][1], B[1][1])) as Fraction;
    return [
        [c11, c12],
        [c21, c22]
    ];
};

/**
 * 向量乘法 V' = A * V
 */
export const multiplyMatrixVector = (A: Matrix2x2, v: [Fraction, Fraction]): [Fraction, Fraction] => {
    const x = math.add(math.multiply(A[0][0], v[0]), math.multiply(A[0][1], v[1])) as Fraction;
    const y = math.add(math.multiply(A[1][0], v[0]), math.multiply(A[1][1], v[1])) as Fraction;
    return [x, y];
};
