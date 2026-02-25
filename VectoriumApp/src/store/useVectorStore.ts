import { create } from 'zustand';
import { type Matrix2x2, createIdentity2x2 } from '../engine/mathCore';

export interface Snapshot {
    id: string;
    description: string;
    matrix: Matrix2x2; // 应用于空间的累计矩阵结果
}

interface VectorStore {
    // === Core State ===
    currentMatrix: Matrix2x2;       // 当前展示/编辑的矩阵
    isAnimating: boolean;           // 是否处于状态切换的动画中
    animationProgress: number;      // 0.0 -> 1.0 的插值进度条

    // === Feature Toggles ===
    showEigenvectors: boolean;      // 特征向量高亮显隐开关

    // === History Timeline ===
    history: Snapshot[];            // 执行记录快照链表

    // === Actions ===
    setMatrix: (m: Matrix2x2) => void;
    setAnimationProgress: (p: number) => void;
    toggleEigenvectors: (show: boolean) => void;
    addHistorySnapshot: (desc: string, m: Matrix2x2) => void;
    restoreSnapshot: (id: string) => void;
}

export const useVectorStore = create<VectorStore>((set, get) => ({
    currentMatrix: createIdentity2x2(),
    isAnimating: false,
    animationProgress: 1.0,

    showEigenvectors: false,

    history: [
        {
            id: 'init-1',
            description: 'Identity Matrix',
            matrix: createIdentity2x2()
        }
    ],

    setMatrix: (m) => set({ currentMatrix: m }),

    setAnimationProgress: (p) => set({ animationProgress: p }),

    toggleEigenvectors: (show) => set({ showEigenvectors: show }),

    addHistorySnapshot: (desc, m) => {
        const newSnap: Snapshot = {
            id: `snap-${Date.now()}`,
            description: desc,
            matrix: m
        };
        set((state) => ({ history: [...state.history, newSnap] }));
    },

    restoreSnapshot: (id) => {
        const snapshot = get().history.find((s) => s.id === id);
        if (snapshot) {
            set({ currentMatrix: snapshot.matrix, animationProgress: 1.0 });
        }
    }
}));
