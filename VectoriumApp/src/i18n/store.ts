import { create } from 'zustand';
import { en } from './locales/en';
import { zh } from './locales/zh';

export type Language = 'en' | 'zh';

const dictionaries = {
    en,
    zh,
};

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

interface I18nState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
    // 默认尝试获取浏览器语言，否则为中文
    language: typeof navigator !== 'undefined' && navigator.language.startsWith('zh') ? 'zh' : 'en',
    setLanguage: (lang: Language) => set({ language: lang }),
    t: (key: TranslationKey) => {
        const { language } = get();
        const dictionary = dictionaries[language] || dictionaries.en;
        const keys = key.split('.');

        let value: any = dictionary;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key doesn't exist in current language
                let fallbackValue: any = dictionaries.en;
                for (const fk of keys) {
                    if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                        fallbackValue = fallbackValue[fk];
                    } else {
                        return key; // Return the key itself if not found even in fallback
                    }
                }
                return fallbackValue as string;
            }
        }
        return value as string;
    },
}));
