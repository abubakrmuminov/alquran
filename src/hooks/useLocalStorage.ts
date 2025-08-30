import { useState, useEffect, useCallback } from 'react';
import type { LastRead } from '../types/quran';

export function useLastRead(key: string = 'lastRead') {
  const [lastRead, setLastReadState] = useState<LastRead | null>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  });

  // Обновление с проверкой на равенство
  const setLastRead = useCallback((value: LastRead | null) => {
    try {
      if (value && JSON.stringify(lastRead) === JSON.stringify(value)) {
        return; // ничего не меняем → не будет ререндера
      }

      setLastReadState(value);

      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, lastRead]);

  // Слушаем изменения из других вкладок
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setLastReadState(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [lastRead, setLastRead] as const;
}