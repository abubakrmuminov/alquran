import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { AyahCard } from './AyahCard';
import { quranApi } from '../api/quran';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Bookmark, Settings, LastRead } from '../types/quran';

interface SurahPageProps {
  surahNumber: number;
  onBack: () => void;
  settings: Settings;
}

export const SurahPage: React.FC<SurahPageProps> = ({
  surahNumber,
  onBack,
  settings,
}) => {
  const [surahData, setSurahData] = useState<any>(null);
  const [translationData, setTranslationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('bookmarks', []);
  const [, setLastRead] = useLocalStorage<LastRead | null>('lastRead', null);

  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      try {
        const [arabicData, translationData] = await Promise.all([
          quranApi.getSurah(surahNumber),
          quranApi.getSurahWithTranslation(surahNumber, settings.translation),
        ]);

        setSurahData(arabicData);
        setTranslationData(translationData);

        // сохраняем последнее чтение (первый аят суры)
        const lastRead: LastRead = {
          surahNumber,
          ayahNumber: 1,
          surahName: arabicData.englishName,
          timestamp: Date.now(),
        };
        setLastRead(lastRead);
      } catch (error) {
        console.error('Error loading surah:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSurah();
  }, [surahNumber, settings.translation, setLastRead]);

  const handleToggleBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(
        b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
      );

      if (isBookmarked) {
        return prev.filter(
          b => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)
        );
      } else {
        return [...prev, bookmark];
      }
    });
  };

  const isBookmarked = (ayahNumber: number) => {
    return bookmarks.some(
      b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!surahData || !translationData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">Ошибка загрузки суры</div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад к сурам</span>
          </motion.button>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Book className="w-4 h-4" />
            <span>{surahData.numberOfAyahs} аятов</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {surahData.name}
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {surahData.englishName} - {surahData.englishNameTranslation}
          </div>
        </div>
      </div>

      {/* All Ayahs */}
      <div className="space-y-6">
        {surahData.ayahs.map((ayah: any, index: number) => (
          <motion.div
            key={ayah.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
          >
            <AyahCard
              ayah={ayah}
              translation={translationData.ayahs[index]}
              surahNumber={surahNumber}
              surahName={surahData.englishName}
              settings={settings}
              isBookmarked={isBookmarked(ayah.numberInSurah)}
              onToggleBookmark={handleToggleBookmark}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};