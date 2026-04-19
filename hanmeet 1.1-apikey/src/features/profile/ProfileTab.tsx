import React, { useMemo, useState } from 'react';
import { Palette, UserRound } from 'lucide-react';
import { AVATAR_PRESETS } from '../game/data';

interface ProfileTabProps {
  username: string;
  avatarPresetId: string;
  outfitColor: string;
  onSetUsername: (username: string) => void;
  onSetAvatar: (avatarId: string) => void;
  onSetOutfitColor: (color: string) => void;
}

export function ProfileTab({
  username,
  avatarPresetId,
  outfitColor,
  onSetUsername,
  onSetAvatar,
  onSetOutfitColor,
}: ProfileTabProps) {
  const [draftName, setDraftName] = useState(username);

  const currentAvatar = useMemo(
    () => AVATAR_PRESETS.find((avatar) => avatar.id === avatarPresetId) || AVATAR_PRESETS[0],
    [avatarPresetId],
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--pixel-bg)', color: 'var(--pixel-text)', fontFamily: "'Press Start 2P', monospace", padding: '16px' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 20 }}>
          <h2 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }} className="flex items-center gap-2"><UserRound className="w-6 h-6" /> Player Profile</h2>
          <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }} className="mt-1 opacity-70">Pick from 10 preset retro avatars and customize your style.</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="block mb-1 opacity-60">Username</label>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', background: '#0f0f1a', border: '2px solid var(--pixel-border)', color: 'var(--pixel-text)', padding: '8px' }}
                className="block"
                maxLength={20}
              />
            </div>
            <button
              onClick={() => onSetUsername(draftName)}
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', padding: '8px 12px', background: 'var(--pixel-green)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#000', cursor: 'pointer' }}
            >
              Save Name
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 20 }}>
          <h3 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }} className="flex items-center gap-2"><Palette className="w-5 h-5" /> Avatar Presets</h3>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
            {AVATAR_PRESETS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onSetAvatar(avatar.id)}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  padding: '12px',
                  background: avatarPresetId === avatar.id ? 'var(--pixel-green)' : 'var(--pixel-panel)',
                  border: avatarPresetId === avatar.id ? '3px solid var(--pixel-border)' : '3px solid #444',
                  boxShadow: '3px 3px 0 #000',
                  color: avatarPresetId === avatar.id ? '#000' : 'var(--pixel-text)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '24px' }}>{avatar.emoji}</div>
                <p style={{ fontSize: '7px', marginTop: '4px' }}>{avatar.name}</p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="block mb-2 opacity-60">Outfit Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={outfitColor}
                onChange={(event) => onSetOutfitColor(event.target.value)}
                style={{ width: '48px', height: '40px', border: '2px solid var(--pixel-border)', background: 'none', cursor: 'pointer' }}
              />
              <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }}>{outfitColor}</p>
            </div>
          </div>

          <div style={{ border: '3px solid var(--pixel-border)', padding: 16, background: '#0f0f1a', textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="opacity-60">Preview</p>
            <p className="mt-2" style={{ fontSize: '32px', filter: `drop-shadow(0 0 0 ${outfitColor})` }}>{currentAvatar.emoji}</p>
            <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }} className="mt-2">{username}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
