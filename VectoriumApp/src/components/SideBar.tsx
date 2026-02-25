import React, { useState, useEffect } from "react";
import { useVectorStore } from "../store/useVectorStore";
import { createMatrix2x2, formatFraction, determinant2x2, toFloat } from "../engine/mathCore";
import { useI18nStore } from "../i18n/store";

export const SideBar: React.FC = () => {
    const currentMatrix = useVectorStore((state) => state.currentMatrix);
    const setMatrix = useVectorStore((state) => state.setMatrix);
    const addHistorySnapshot = useVectorStore((state) => state.addHistorySnapshot);
    const toggleEigenvectors = useVectorStore((state) => state.toggleEigenvectors);
    const showEigenvectors = useVectorStore((state) => state.showEigenvectors);
    const { t, language, setLanguage } = useI18nStore();

    const [inputs, setInputs] = useState<[string, string, string, string]>(['1', '0', '0', '1']);

    useEffect(() => {
        setInputs([
            formatFraction(currentMatrix[0][0]),
            formatFraction(currentMatrix[0][1]),
            formatFraction(currentMatrix[1][0]),
            formatFraction(currentMatrix[1][1])
        ]);
    }, [currentMatrix]);

    const handleInputChange = (index: number, val: string) => {
        const newInputs = [...inputs] as [string, string, string, string];
        newInputs[index] = val;
        setInputs(newInputs);

        try {
            if (val === '-' || val.endsWith('/')) return;

            const m = createMatrix2x2(
                newInputs[0] || '0', newInputs[1] || '0',
                newInputs[2] || '0', newInputs[3] || '0'
            );

            setMatrix(m);
        } catch (e) {
            // ignore parsing transient errors
        }
    };

    const handleApplyTransform = () => {
        try {
            const m = createMatrix2x2(
                inputs[0] || '0', inputs[1] || '0',
                inputs[2] || '0', inputs[3] || '0'
            );
            addHistorySnapshot(`Set Matrix [${inputs[0]}, ${inputs[1]}; ${inputs[2]}, ${inputs[3]}]`, m);
        } catch (e) {
            alert(t('sidebar.invalidFormat'));
        }
    };

    // 行列式
    const det = determinant2x2(currentMatrix);
    const detStr = formatFraction(det);
    const detFloat = toFloat(det);

    return (
        <div className="w-80 h-full bg-vectorium-panel border-r border-vectorium-border flex flex-col p-6 overflow-y-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/90">
                        {t('app.title')}
                    </h1>
                    <p className="text-sm text-white/50 mt-1">{t('app.subtitle')}</p>
                </div>
                <div className="flex bg-black/30 rounded p-1 border border-white/5">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-1 text-xs rounded transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage('zh')}
                        className={`px-2 py-1 text-xs rounded transition-colors ${language === 'zh' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        中
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-6">

                {/* === Matrix Input Panel === */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                        {t('sidebar.transformMatrix')}
                    </h2>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <input
                            value={inputs[0]} onChange={(e) => handleInputChange(0, e.target.value)}
                            className="bg-black/40 border border-white/10 rounded h-12 text-center font-mono text-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <input
                            value={inputs[1]} onChange={(e) => handleInputChange(1, e.target.value)}
                            className="bg-black/40 border border-white/10 rounded h-12 text-center font-mono text-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <input
                            value={inputs[2]} onChange={(e) => handleInputChange(2, e.target.value)}
                            className="bg-black/40 border border-white/10 rounded h-12 text-center font-mono text-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <input
                            value={inputs[3]} onChange={(e) => handleInputChange(3, e.target.value)}
                            className="bg-black/40 border border-white/10 rounded h-12 text-center font-mono text-xl text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleApplyTransform}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors"
                    >
                        {t('sidebar.applyAndLog')}
                    </button>
                </div>

                {/* === Properties View === */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-sm text-white/60">{t('sidebar.determinant')}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-white/90">{detStr}</span>
                            {detStr.includes('/') && <span className="text-xs text-white/40">({detFloat.toFixed(2)})</span>}
                        </div>
                    </div>

                    <label className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                            type="checkbox"
                            className="form-checkbox text-blue-500 rounded border-gray-600 bg-black/40 focus:ring-blue-500/50"
                            checked={showEigenvectors}
                            onChange={(e) => toggleEigenvectors(e.target.checked)}
                        />
                        <span className="text-sm text-white/80 font-medium tracking-wide">{t('sidebar.showEigenvectors')}</span>
                    </label>
                </div>
            </div>
        </div>
    );
};
