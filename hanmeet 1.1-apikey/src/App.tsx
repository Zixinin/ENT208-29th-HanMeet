import React, { lazy, Suspense, useMemo, useState } from 'react';
import { BookOpen, Gamepad2, Search, UserRound } from 'lucide-react';
import { useAppState } from './store/useAppState';
import { TabId, VocabularyItem } from './types/domain';
import { ActiveRoomInfo } from './features/game/types/tasks';

const AuthGate = lazy(async () => {
  const mod = await import('./features/auth/components/AuthGate');
  return { default: mod.AuthGate };
});

const GameTab = lazy(async () => {
  const mod = await import('./features/game/GameTab');
  return { default: mod.GameTab };
});

const NotebookTab = lazy(async () => {
  const mod = await import('./features/notebook/NotebookTab');
  return { default: mod.NotebookTab };
});

const DictionaryTab = lazy(async () => {
  const mod = await import('./features/dictionary/DictionaryTab');
  return { default: mod.DictionaryTab };
});

const ProfileTab = lazy(async () => {
  const mod = await import('./features/profile/ProfileTab');
  return { default: mod.ProfileTab };
});

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'game', label: 'Game', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'notebook', label: 'Notebook', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'dictionary', label: 'Dictionary', icon: <Search className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserRound className="w-4 h-4" /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('game');
  const [activeRoomInfo, setActiveRoomInfo] = useState<ActiveRoomInfo | null>(null);
  const {
    profile,
    progress,
    notebook,
    discoveredHiddenItemIds,
    addNotebook,
    removeNotebook,
    gradeNotebook,
    gainXp,
    setDifficulty,
    setAvatar,
    setOutfitColor,
    setUsername,
    discoverHiddenItem,
  } = useAppState();

  const stats = useMemo(
    () => ({
      savedWords: notebook.length,
      level: progress.level,
      unlockedSpaces: progress.unlockedSpaces.length,
    }),
    [notebook.length, progress.level, progress.unlockedSpaces.length],
  );

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(new Date()).toUpperCase();
  }, []);

  const addFromItem = (item: VocabularyItem) => {
    addNotebook({
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      source: 'space',
      aiGenerated: false,
    });
  };

  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading app...</div>}>
      <AuthGate>
        <div
          className="flex flex-col"
          style={{
            height: '100dvh',
            overflow: 'hidden',
            background: 'var(--pixel-bg)',
            color: 'var(--pixel-text)',
          }}
        >
          <header className="sticky top-0 z-40" style={{ background: 'var(--pixel-panel)', borderBottom: '4px solid var(--pixel-border)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 style={{ fontSize: '14px', color: 'var(--pixel-yellow)', textShadow: '2px 2px 0 #000', fontFamily: "'Press Start 2P', monospace" }}>
                  ★ HanMeet ★
                </h1>
                <p style={{ fontSize: '7px', color: 'var(--pixel-text)', opacity: 0.7, marginTop: 4, fontFamily: "'Press Start 2P', monospace" }}>
                  EXPLORE · LEARN · MASTER
                </p>
              </div>
              <div style={{ fontSize: '8px', color: 'var(--pixel-text)', background: '#0f0f1a', border: '3px solid var(--pixel-border)', padding: '6px 12px', fontFamily: "'Press Start 2P', monospace" }}>
                {activeRoomInfo ? (
                  <>
                    <span className="mr-4">ROOM <strong style={{ color: 'var(--pixel-yellow)' }}>
                      {activeRoomInfo.roomId === 'cafe' ? 'CAFÉ' : activeRoomInfo.roomId === 'house' ? 'HOUSE' : 'SUPERMARKET'}
                    </strong></span>
                    <span className="mr-4">LVL <strong style={{ color: 'var(--pixel-yellow)' }}>{stats.level}</strong></span>
                    <span>FOUND <strong style={{ color: 'var(--pixel-green)' }}>{activeRoomInfo.found}/{activeRoomInfo.total}</strong></span>
                  </>
                ) : (
                  <>
                    <span className="mr-4">PLAYER <strong style={{ color: 'var(--pixel-yellow)' }}>{profile.username}</strong></span>
                    <span className="mr-4">LV <strong style={{ color: 'var(--pixel-yellow)' }}>{stats.level}</strong></span>
                    <span className="mr-4">XP <strong style={{ color: 'var(--pixel-green)' }}>{progress.xp}</strong></span>
                    <span>DAY <strong style={{ color: 'var(--pixel-green)' }}>{todayLabel}</strong></span>
                  </>
                )}
              </div>
            </div>

            <nav className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { if (tab.id !== 'game') setActiveRoomInfo(null); setActiveTab(tab.id); }}
                  style={{
                    fontSize: '8px',
                    padding: '8px 14px',
                    border: '3px solid var(--pixel-border)',
                    background: activeTab === tab.id ? 'var(--pixel-border)' : 'var(--pixel-panel)',
                    color: activeTab === tab.id ? '#000' : 'var(--pixel-text)',
                    boxShadow: activeTab === tab.id ? 'none' : '3px 3px 0 #000',
                    transform: activeTab === tab.id ? 'translate(2px,2px)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: "'Press Start 2P', monospace",
                  }}
                >
                  {tab.icon}
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </nav>
          </header>

          <main
            className="flex-1"
            style={{
              minHeight: 0,
              overflow: activeTab === 'game' ? 'hidden' : 'auto',
            }}
          >
            {activeTab === 'game' && (
              <GameTab
                level={progress.level}
                xp={progress.xp}
                selectedDifficulty={progress.selectedDifficulty}
                unlockedSpaces={progress.unlockedSpaces}
                avatarPresetId={profile.avatarPresetId}
                outfitColor={profile.outfitColor}
                discoveredHiddenItemIds={discoveredHiddenItemIds}
                onSetDifficulty={setDifficulty}
                onGainXp={gainXp}
                onAddNotebook={addFromItem}
                onDiscoverHiddenItem={discoverHiddenItem}
                notebook={notebook}
                onGradeNotebook={gradeNotebook}
                onActiveRoomChange={setActiveRoomInfo}
              />
            )}

            {activeTab === 'notebook' && (
              <NotebookTab entries={notebook} onRemove={removeNotebook} onGrade={gradeNotebook} onReviewComplete={gainXp} />
            )}

            {activeTab === 'dictionary' && (
              <DictionaryTab
                onAddNotebook={(result) =>
                  addNotebook({
                    chinese: result.chinese,
                    pinyin: result.pinyin,
                    english: result.english,
                    source: result.aiGenerated ? 'dictionary_ai' : 'dictionary_local',
                    aiGenerated: result.aiGenerated,
                  })
                }
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                username={profile.username}
                avatarPresetId={profile.avatarPresetId}
                outfitColor={profile.outfitColor}
                onSetUsername={setUsername}
                onSetAvatar={setAvatar}
                onSetOutfitColor={setOutfitColor}
              />
            )}
          </main>
        </div>
      </AuthGate>
    </Suspense>
  );
}
