// src/hooks/useDecks.ts
import { useState, useEffect } from 'react';
import { DeckSummary } from '../types';
import { ApiClient } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function useDecks() {
  const { token } = useAuth(); // берём токен из контекста
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = async () => {
    if (!token) return; // Если токена нет — ничего не делаем
    setLoading(true);
    setError(null);

    try {
      const data = await ApiClient.getUserDecks(token);
      setDecks(data);
    } catch (err: any) {
      console.error('Error fetching decks:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [token]);

  return { decks, loading, error, refresh: fetchDecks };
}

export default useDecks;