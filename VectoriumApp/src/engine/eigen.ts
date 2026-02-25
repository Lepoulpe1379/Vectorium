import { type Fraction, type Matrix2x2, toFraction } from './mathCore';
import { add, subtract, multiply } from 'mathjs';

/**
 * 表示一个特征值及其对应的特征向量（如果存在）
 */
export interface EigenResult {
    value: Fraction | number; // 可能是 Fraction (实数) 或者 Number (近似实数，遇到无法开方有理数情况)
    isComplex: boolean;
    vectors: [number, number][]; // 对应的几何方向 (简化为浮点数，因为主要用于可视化)
}

/**
 * 求解 2x2 矩阵的特征值与特征向量
 * 特征多项式: \lambda^2 - tr(A)\lambda + det(A) = 0
 * \lambda = (tr(A) \pm \sqrt{tr(A)^2 - 4det(A)}) / 2
 */
export const solveEigen2x2 = (m: Matrix2x2): EigenResult[] => {
    const a = m[0][0];
    const b = m[0][1];
    const c = m[1][0];
    const d = m[1][1];

    // 迹: tr = a + d
    const tr = add(a, d) as Fraction;
    // 行列式: det = ad - bc
    const det = subtract(multiply(a, d), multiply(b, c)) as Fraction;

    // 判别式: delta = tr^2 - 4*det
    const trSq = multiply(tr, tr) as Fraction;
    const fourDet = multiply(toFraction(4), det) as Fraction;
    const delta = subtract(trSq, fourDet) as Fraction;

    const deltaVal = (Number(delta.n) * Number(delta.s)) / Number(delta.d);

    if (deltaVal < 0) {
        // 复数特征值 (如旋转矩阵)
        return [{
            value: NaN, // 不在界面上显示实数特征值
            isComplex: true,
            vectors: [] // 没有实特征向量
        }];
    }

    const trVal = (Number(tr.n) * Number(tr.s)) / Number(tr.d);
    const sqrtDelta = Math.sqrt(deltaVal);

    const lambda1 = (trVal + sqrtDelta) / 2;
    const lambda2 = (trVal - sqrtDelta) / 2;

    const results: EigenResult[] = [];

    // 获取浮点矩阵进行向量提取
    const aF = (Number(a.n) * Number(a.s)) / Number(a.d);
    const bF = (Number(b.n) * Number(b.s)) / Number(b.d);
    const cF = (Number(c.n) * Number(c.s)) / Number(c.d);
    const dF = (Number(d.n) * Number(d.s)) / Number(d.d);

    const getVector = (lambda: number): [number, number] => {
        // 求解 (A - \lambda I)x = 0
        // => [a - lambda, b]
        //    [c, d - lambda]
        const m11 = aF - lambda;
        const m12 = bF;
        const m21 = cF;
        const m22 = dF - lambda;

        // 容差判断
        const eps = 1e-10;

        // 如果 m11 和 m12 不全为 0
        if (Math.abs(m11) > eps || Math.abs(m12) > eps) {
            if (Math.abs(m12) > eps) {
                return [1, -m11 / m12];
            } else {
                return [0, 1];
            }
        }
        // 参考第二行
        if (Math.abs(m21) > eps || Math.abs(m22) > eps) {
            if (Math.abs(m22) > eps) {
                return [1, -m21 / m22];
            } else {
                return [0, 1];
            }
        }

        // 如果全为0，说明 A = lambda * I （比如单位阵）
        return [1, 0]; // 任何向量都是特征向量，这在特判里处理
    };

    // 极小差值判断重根
    if (Math.abs(lambda1 - lambda2) < 1e-10) {
        // 检查是否为对角标量阵
        if (Math.abs(bF) < 1e-10 && Math.abs(cF) < 1e-10 && Math.abs(aF - dF) < 1e-10) {
            results.push({
                value: lambda1,
                isComplex: false,
                vectors: [[1, 0], [0, 1]] // 整个平面都是特征向量
            });
        } else {
            results.push({
                value: lambda1,
                isComplex: false,
                vectors: [getVector(lambda1)] // 几何重数为1
            });
        }
    } else {
        results.push({
            value: lambda1,
            isComplex: false,
            vectors: [getVector(lambda1)]
        });
        results.push({
            value: lambda2,
            isComplex: false,
            vectors: [getVector(lambda2)]
        });
    }

    // Normalize vectors
    results.forEach(res => {
        res.vectors = res.vectors.map(v => {
            const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
            return [v[0] / len, v[1] / len];
        });
    });

    return results;
};
