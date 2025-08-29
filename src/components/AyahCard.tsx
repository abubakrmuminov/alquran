import React, { useState } from 'react';
import { Heart, Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { quranApi } from '../api/quran';
import type { Bookmark, Settings } from '../types/quran';

interface AyahCardProps {
ayah: any;
translation: any;
surahNumber: number;
surahName: string;
settings: Settings;
isBookmarked: boolean;
onToggleBookmark: (bookmark: Bookmark) => void;
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
const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

const getFontSizeClass = () => {
switch (settings.fontSize) {
case 'small': return 'text-lg';
case 'large': return 'text-2xl';
default: return 'text-xl';
}
};

const handlePlayAudio = async () => {
try {
if (currentAudio && !currentAudio.paused) {
currentAudio.pause();
setIsPlaying(false);
return;
}

const audioData = await quranApi.getAyahAudio(surahNumber, ayah.numberInSurah, settings.reciter);  

  if (audioData.audio) {  
    const audio = new Audio(audioData.audio);  
    setCurrentAudio(audio);  
    setIsPlaying(true);  

    audio.onended = () => {  
      setIsPlaying(false);  
      setCurrentAudio(null);  
    };  

    audio.onerror = () => {  
      setIsPlaying(false);  
      setCurrentAudio(null);  
    };  

    await audio.play();  
  }  
} catch (error) {  
  console.error('Error playing audio:', error);  
  setIsPlaying(false);  
}

};

const handleToggleBookmark = () => {
const bookmark: Bookmark = {
surahNumber,
surahName,
ayahNumber: ayah.numberInSurah,
text: ayah.text,
translation: translation?.text || '',
};
onToggleBookmark(bookmark);
};

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-green-500"
>
{/* Ayah Number and Controls */}
<div className="flex items-center justify-between mb-4">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
<span className="text-white font-bold text-sm">{ayah.numberInSurah}</span>
</div>
<span className="text-sm text-gray-600 dark:text-gray-400">
Аят {ayah.numberInSurah}
</span>
</div>

<div className="flex items-center space-x-2">  
      <motion.button  
        onClick={handlePlayAudio}  
        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"  
        whileHover={{ scale: 1.1 }}  
        whileTap={{ scale: 0.9 }}  
      >  
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}  
      </motion.button>  

      <motion.button  
        onClick={handleToggleBookmark}  
        className={`p-2 rounded-lg transition-colors ${  
          isBookmarked  
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'  
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'  
        }`}  
        whileHover={{ scale: 1.1 }}  
        whileTap={{ scale: 0.9 }}  
      >  
        <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />  
      </motion.button>  
    </div>  
  </div>  

  {/* Arabic Text */}  
  <div className={`text-right leading-relaxed mb-4 text-gray-800 dark:text-white ${getFontSizeClass()}`}>  
    {ayah.text}  
  </div>  

  {/* Translation */}  
  {translation && (  
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-gray-600 pt-4">  
      {translation.text}  
    </div>  
  )}  

  {/* Audio Indicator */}  
  {isPlaying && (  
    <motion.div  
      className="flex items-center space-x-2 mt-4 text-green-600 dark:text-green-400"  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
    >  
      <Volume2 className="w-4 h-4" />  
      <span className="text-sm">Воспроизводится...</span>  
      <div className="flex space-x-1">  
        {[...Array(3)].map((_, i) => (  
          <motion.div  
            key={i}  
            className="w-1 h-4 bg-green-500 rounded-full"  
            animate={{  
              scaleY: [1, 1.5, 1],  
              opacity: [1, 0.5, 1],  
            }}  
            transition={{  
              duration: 1,  
              repeat: Infinity,  
              delay: i * 0.2,  
            }}  
          />  
        ))}  
      </div>  
    </motion.div>  
  )}  
</motion.div>

);
};

этот?

