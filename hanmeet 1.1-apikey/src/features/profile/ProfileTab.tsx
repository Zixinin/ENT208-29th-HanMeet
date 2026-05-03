import React, { useMemo, useState } from 'react';
import { UserRound } from 'lucide-react';
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
  onSetUsername,
  onSetAvatar,
}: ProfileTabProps) {
  const [draftName, setDraftName] = useState(username);

  const currentAvatar = useMemo(
    () => AVATAR_PRESETS.find((a) => a.id === avatarPresetId) || AVATAR_PRESETS[0],
    [avatarPresetId],
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--pixel-bg)', color: 'var(--pixel-text)', fontFamily: "'Press Start 2P', monospace", padding: '16px' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Username */}
        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 20 }}>
          <h2 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }} className="flex items-center gap-2">
            <UserRound className="w-6 h-6" /> Player Profile
          </h2>
          <p style={{ color: 'var(--pixel-text)', fontSize: '9px' }} className="mt-1 opacity-70">Pick your character and set your name.</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="block mb-1 opacity-60">Username</label>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
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

        {/* Character selection */}
        <div style={{ background: 'var(--pixel-panel)', border: '3px solid var(--pixel-border)', boxShadow: '3px 3px 0 #000', padding: 20 }}>
          <h3 style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }} className="mb-3">
            Choose Character
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVATAR_PRESETS.map((avatar) => {
              const selected = avatarPresetId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => onSetAvatar(avatar.id)}
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '8px',
                    padding: '16px 12px',
                    background: selected ? 'var(--pixel-green)' : 'var(--pixel-panel)',
                    border: selected ? '3px solid var(--pixel-border)' : '3px solid #444',
                    boxShadow: '3px 3px 0 #000',
                    color: selected ? '#000' : 'var(--pixel-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 96,
                      backgroundImage: `url(${avatar.spritePath})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '192px 96px',
                      backgroundPosition: '0 0',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <p style={{ fontSize: '7px', marginTop: 2 }}>{avatar.name}</p>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div style={{ border: '3px solid var(--pixel-border)', padding: 16, background: '#0f0f1a', textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'var(--pixel-text)', fontSize: '8px' }} className="opacity-60">Preview</p>
            <div
              className="mx-auto mt-3 mb-3"
              style={{
                width: 64,
                height: 128,
                backgroundImage: `url(${currentAvatar.spritePath})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '256px 128px',
                backgroundPosition: '0 0',
                imageRendering: 'pixelated',
              }}
            />
            <p style={{ color: 'var(--pixel-yellow)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>{username}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
