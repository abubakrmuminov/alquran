import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bookmark as BookmarkIcon, BookmarkFilled } from 'lucide-react';
import { Settings } from '../types/quran';

interface AyahCardProps {
  ayah: any;
  translation: { text: string };
  surahNumber: number;
  surahName: string;
  settings: Settings;
  isBookmarked: boolean;
  onToggleBookmark: (bookmark: any) => void;
}

export const AyahCard: React.FC<AyahCardProps> = ({
  ayah,
  translation,
  surahNumber,
  surahName,
  settings,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация аудио один раз
  useEffect(() => {
    audioRef.current = new Audio(ayah.audio.url);

    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.pause();
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [ayah.audio.url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-2xl text-right font-scheherazade mb-2">{ayah.text}</p>
          <p className="text-gray-600 dark:text-gray-300">{translation.text}</p>
        </div>

        <button
          onClick={() =>
            onToggleBookmark({
              surahNumber,
              ayahNumber: ayah.numberInSurah,
              surahName,
              text: ayah.text,
            })
          }
          className="ml-4 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
        >
          {isBookmarked ? <BookmarkFilled className="w-6 h-6" /> : <BookmarkIcon className="w-6 h-6" />}
        </button>
      </div>

      <button
        onClick={togglePlay}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </motion.div>
  );
};