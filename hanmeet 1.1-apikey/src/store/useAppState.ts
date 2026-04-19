import { useEffect, useMemo, useRef, useState } from 'react';
import { ITEMS } from '../features/game/data';
import { applyXp } from '../features/game/progression';
import { applyReview } from '../features/notebook/reviewEngine';
import { getAuthModePreference, subscribeAuthModePreference } from '../lib/authMode';
import { pullCloudState, pushCloudState } from '../lib/cloudState';
import { defaultState, loadState, saveState } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';
import { Difficulty, NotebookEntry, SpaceId, UserProfile, UserProgress, VocabularyItem } from '../types/domain';

interface AddNotebookInput {
  chinese: string;
  pinyin: string;
  english: string;
  source: NotebookEntry['source'];
  aiGenerated: boolean;
}

export function useAppState() {
  const [profile, setProfile] = useState<UserProfile>(defaultState.profile);
  const [progress, setProgress] = useState<UserProgress>(defaultState.progress);
  const [notebook, setNotebook] = useState<NotebookEntry[]>(defaultState.notebook);
  const [discoveredHiddenItemIds, setDiscoveredHiddenItemIds] = useState<string[]>(
    defaultState.discoveredHiddenItemIds,
  );
  const [hydrated, setHydrated] = useState(false);
  const [authMode, setAuthMode] = useState(getAuthModePreference());
  const [cloudUserId, setCloudUserId] = useState<string | null>(null);
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const lastPushedCloudSnapshot = useRef('');

  useEffect(() => {
    const persisted = loadState();
    setProfile(persisted.profile);
    setProgress(persisted.progress);
    setNotebook(persisted.notebook);
    setDiscoveredHiddenItemIds(persisted.discoveredHiddenItemIds);
    setHydrated(true);
  }, []);

  useEffect(() => subscribeAuthModePreference(setAuthMode), []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setCloudUserId(data.session?.user?.id || null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUserId(session?.user?.id || null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!cloudUserId || authMode !== 'cloud') {
      setCloudHydrated(false);
      lastPushedCloudSnapshot.current = '';
      return;
    }

    let cancelled = false;

    const hydrateFromCloud = async () => {
      try {
        const cloud = await pullCloudState(cloudUserId);
        if (cancelled) return;

        if (cloud.hasAnyData) {
          if (cloud.profile) setProfile(cloud.profile);
          if (cloud.progress) setProgress(cloud.progress);
          if (cloud.notebook) setNotebook(cloud.notebook);
        } else {
          await pushCloudState(cloudUserId, { profile, progress, notebook });
          if (cancelled) return;
        }

        setCloudHydrated(true);
      } catch (error) {
        console.error('Cloud hydration failed:', error);
        setCloudHydrated(true);
      }
    };

    hydrateFromCloud();
    return () => {
      cancelled = true;
    };
  }, [hydrated, cloudUserId, authMode]);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ profile, progress, notebook, discoveredHiddenItemIds });
  }, [hydrated, profile, progress, notebook, discoveredHiddenItemIds]);

  useEffect(() => {
    if (!hydrated || !cloudHydrated || !cloudUserId || authMode !== 'cloud') return;

    const snapshot = JSON.stringify({ profile, progress, notebook });
    if (snapshot === lastPushedCloudSnapshot.current) return;

    const timeoutId = window.setTimeout(() => {
      pushCloudState(cloudUserId, { profile, progress, notebook })
        .then(() => {
          lastPushedCloudSnapshot.current = snapshot;
        })
        .catch((error) => {
          console.error('Cloud sync failed:', error);
        });
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [hydrated, cloudHydrated, cloudUserId, authMode, profile, progress, notebook]);

  const itemsById = useMemo(() => {
    const map = new Map<string, VocabularyItem>();
    ITEMS.forEach((item) => map.set(item.id, item));
    return map;
  }, []);

  const addNotebook = (input: AddNotebookInput) => {
    const duplicate = notebook.find(
      (entry) =>
        entry.chinese === input.chinese &&
        entry.english.toLowerCase() === input.english.toLowerCase(),
    );
    if (duplicate) return;

    setNotebook((prev) => [
      {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        chinese: input.chinese,
        pinyin: input.pinyin,
        english: input.english,
        source: input.source,
        aiGenerated: input.aiGenerated,
        mastery: 0,
        intervalDays: 1,
        dueAt: Date.now(),
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const removeNotebook = (id: string) => {
    setNotebook((prev) => prev.filter((entry) => entry.id !== id));
  };

  const gradeNotebook = (id: string, grade: 'again' | 'good' | 'easy') => {
    setNotebook((prev) => prev.map((entry) => (entry.id === id ? applyReview(entry, grade) : entry)));
  };

  const gainXp = (amount: number) => {
    setProgress((prev) => {
      const next = applyXp(prev.level, prev.xp, prev.unlockedSpaces, amount);
      return {
        ...prev,
        level: next.level,
        xp: next.xp,
        unlockedSpaces: next.unlockedSpaces,
      };
    });
  };

  const setDifficulty = (difficulty: Difficulty) => {
    setProgress((prev) => ({ ...prev, selectedDifficulty: difficulty }));
  };

  const setAvatar = (avatarPresetId: string) => {
    setProfile((prev) => ({ ...prev, avatarPresetId }));
  };

  const setOutfitColor = (outfitColor: string) => {
    setProfile((prev) => ({ ...prev, outfitColor }));
  };

  const setUsername = (username: string) => {
    setProfile((prev) => ({ ...prev, username: username.trim() || prev.username }));
  };

  const discoverHiddenItem = (itemId: string) => {
    setDiscoveredHiddenItemIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  };

  const isSpaceUnlocked = (spaceId: SpaceId) => progress.unlockedSpaces.includes(spaceId);

  return {
    profile,
    progress,
    notebook,
    discoveredHiddenItemIds,
    itemsById,
    addNotebook,
    removeNotebook,
    gradeNotebook,
    gainXp,
    setDifficulty,
    setAvatar,
    setOutfitColor,
    setUsername,
    discoverHiddenItem,
    isSpaceUnlocked,
  };
}
