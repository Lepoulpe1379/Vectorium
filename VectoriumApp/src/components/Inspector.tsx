import React from "react";
import { History } from "lucide-react";
import { useVectorStore } from "../store/useVectorStore";
import { formatFraction } from "../engine/mathCore";
import { useI18nStore } from "../i18n/store";

export const Inspector: React.FC = () => {
    const history = useVectorStore((state) => state.history);
    const restoreSnapshot = useVectorStore((state) => state.restoreSnapshot);
    const currentMatrix = useVectorStore((state) => state.currentMatrix);
    const { t } = useI18nStore();

    return (
        <div className="w-80 h-full bg-vectorium-panel border-l border-vectorium-border flex flex-col shadow-2xl z-10">
            <div className="h-16 border-b border-vectorium-border flex items-center px-6 gap-3">
                <History className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-semibold text-white/70">{t('inspector.operationLog')}</h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-3">
                    {history.map((snap, index) => {

                        // 为了直观这里将矩阵拍平展示在小徽章旁
                        const preview = `[ ${formatFraction(snap.matrix[0][0])}, ${formatFraction(snap.matrix[0][1])} ]\n[ ${formatFraction(snap.matrix[1][0])}, ${formatFraction(snap.matrix[1][1])} ]`;

                        // 判断是否正好是当前指向的记录
                        // 在 MVP 阶段通过深比较矩阵内容判断激活项
                        const isActive = JSON.stringify(snap.matrix) === JSON.stringify(currentMatrix);

                        let desc = snap.description;
                        if (desc === 'Identity Matrix') {
                            desc = t('inspector.identityMatrix' as any);
                        } else if (desc.startsWith('Set Matrix ')) {
                            const matrixValues = desc.replace('Set Matrix ', '');
                            desc = `${t('sidebar.setMatrixAction')} ${matrixValues}`;
                        }

                        return (
                            <div
                                key={snap.id}
                                onClick={() => restoreSnapshot(snap.id)}
                                className={`p-3 rounded-lg border flex items-start gap-4 cursor-pointer transition-colors ${isActive
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                                    }`}>
                                    {index}
                                </div>

                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${isActive ? 'text-blue-200' : 'text-white/80'}`}>
                                        {desc}
                                    </div>
                                    <pre className="mt-2 text-[10px] text-white/40 font-mono leading-tight bg-black/30 p-2 rounded">
                                        {preview}
                                    </pre>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
