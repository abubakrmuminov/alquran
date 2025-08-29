// src/components/SurahPage.tsx
import React, { useState, useEffect } from 'react';
import { AyahCard } from './AyahCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { SurahData, Translation, LastRead, Settings } from '../types/quran';
import quranApi from '../api/quranApi';

interface SurahPageProps {
  surahNumber: number;
  initialAyah?: number;
  onBack: () => void;
  settings: Settings;
}

export const SurahPage: React.FC<SurahPageProps> = ({
  surahNumber,
  initialAyah,
  onBack,
  settings,
}) => {
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [translationData, setTranslationData] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useLocalStorage<LastRead>('lastRead', {
    surahNumber,
    ayahNumber: initialAyah || 1,
    surahName: '',
    timestamp: Date.now(),
  });

  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', []);

  // Загрузка данных
  useEffect(() => {
    let isMounted = true;

    const loadSurah = async () => {
      setLoading(true);
      try {
        const [arabicRes, translationRes] = await Promise.all([
          quranApi.getSurah(surahNumber),
          quranApi.getSurahWithTranslation(surahNumber, settings.translation),
        ]);

        if (!isMounted) return;

        setSurahData(arabicRes);
        setTranslationData(translationRes);

        setLastRead({
          surahNumber,
          ayahNumber: initialAyah || 1,
          surahName: arabicRes.englishName,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Error loading surah:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSurah();

    return () => {
      isMounted = false;
    };
  }, [surahNumber, settings.translation, initialAyah, setLastRead]);

  const isBookmarked = (ayahNumber: number) =>
    bookmarks.some(
      (b: any) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

  const handleToggleBookmark = (ayah: any, translationText: string) => {
    const exists = isBookmarked(ayah.numberInSurah);
    if (exists) {
      setBookmarks((prev: any[]) =>
        prev.filter(
          b => !(b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah)
        )
      );
    } else {
      setBookmarks((prev: any[]) => [
        ...prev,
        {
          surahNumber,
          surahName: surahData?.englishName || '',
          ayahNumber: ayah.numberInSurah,
          text: ayah.text,
          translation: translationText,
        },
      ]);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!surahData || !translationData) return <div className="p-4 text-center">No data</div>;

  const ayahs = surahData.ayahs || [];
  const translations = translationData.ayahs || [];

  return (
    <div className="p-4 space-y-6">
      <button onClick={onBack} className="mb-4 text-blue-500">Back</button>
      {ayahs.map((ayah, idx) => (
        <AyahCard
          key={ayah.numberInSurah}
          ayah={ayah}
          translation={translations[idx] || { text: '' }}
          surahNumber={surahNumber}
          surahName={surahData.englishName}
          settings={settings}
          isBookmarked={isBookmarked(ayah.numberInSurah)}
          onToggleBookmark={handleToggleBookmark}
        />
      ))}
    </div>
  );
};