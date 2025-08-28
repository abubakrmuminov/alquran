// src/pages/SurahPage.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AyahCard } from './AyahCard';
import { quranApi } from '../api/quran';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Bookmark, Settings, LastRead } from '../types/quran';

interface SurahPageProps {
  surahNumber: number;
  initialAyah?: number;
  onBack: () => void;
  settings: Settings;
  /** Если true — рендерим все аяты сразу. По умолчанию false (старое поведение) */
  showAll?: boolean;
}

export const SurahPage: React.FC<SurahPageProps> = ({
  surahNumber,
  initialAyah,
  onBack,
  settings,
  showAll = false,
}) => {
  const [surahData, setSurahData] = useState<any>(null);
  const [translationData, setTranslationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('bookmarks', []);
  const [, setLastRead] = useLocalStorage<LastRead | null>('lastRead', null);

  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      try {
        const [arabicData, transData] = await Promise.all([
          quranApi.getSurah(surahNumber),
          quranApi.getSurahWithTranslation(surahNumber, settings.translation),
        ]);

        setSurahData(arabicData);
        setTranslationData(transData);

        // Установим индекс текущего аяха, если передан initialAyah
        if (typeof initialAyah === 'number' && initialAyah > 0) {
          setCurrentAyahIndex(Math.max(0, initialAyah - 1));
        } else {
          setCurrentAyahIndex(0);
        }

        // Если показываем все аяты — можно пометить lastRead как начало суры
        if (showAll) {
          const lastRead: LastRead = {
            surahNumber,
            ayahNumber: 1,
            surahName: arabicData.englishName,
            timestamp: Date.now(),
          };
          setLastRead(lastRead);
        }
      } catch (error) {
        console.error('Error loading surah:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSurah();
  }, [surahNumber, settings.translation, initialAyah, setLastRead, showAll]);

  // Обновляем lastRead только в режиме одиночного просмотра (чтобы не перезаписывать при скролле всего списка)
  useEffect(() => {
    if (!showAll && surahData && currentAyahIndex >= 0) {
      const currentAyah = surahData.ayahs[currentAyahIndex];
      if (currentAyah) {
        const lastRead: LastRead = {
          surahNumber,
          ayahNumber: currentAyah.numberInSurah,
          surahName: surahData.englishName,
          timestamp: Date.now(),
        };
        setLastRead(lastRead);
      }
    }
  }, [currentAyahIndex, surahData, surahNumber, setLastRead, showAll]);

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

  const navigateAyah = (direction: 'prev' | 'next') => {
    if (!surahData) return;

    if (direction === 'prev' && currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1);
    } else if (direction === 'next' && currentAyahIndex < surahData.ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    }
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

  // Подготовим текущие данные (для режима одиночного просмотра)
  const currentAyah = surahData.ayahs?.[currentAyahIndex];
  const currentTranslation = translationData.ayahs?.[currentAyahIndex];

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
            <span>
              {surahData.numberOfAyahs} аятов
            </span>
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

      {showAll ? (
        // Режим: показать все аяты
        <div className="space-y-6">
          {surahData.ayahs.map((ayah: any, index: number) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.25 }}
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
      ) : (
        // Режим: по одному аяту (старое поведение)
        <>
          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            <motion.button
              onClick={() => navigateAyah('prev')}
              disabled={currentAyahIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Предыдущий</span>
            </motion.button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentAyahIndex + 1} / {surahData.ayahs.length}
            </div>

            <motion.button
              onClick={() => navigateAyah('next')}
              disabled={currentAyahIndex === surahData.ayahs.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Следующий</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Current Ayah */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAyahIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AyahCard
                ayah={currentAyah}
                translation={currentTranslation}
                surahNumber={surahNumber}
                surahName={surahData.englishName}
                settings={settings}
                isBookmarked={isBookmarked(currentAyah.numberInSurah)}
                onToggleBookmark={handleToggleBookmark}
              />
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};