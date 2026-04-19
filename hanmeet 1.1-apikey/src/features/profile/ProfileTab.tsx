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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-5">
        <h2 className="text-2xl font-bold flex items-center gap-2"><UserRound className="w-6 h-6" /> Player Profile</h2>
        <p className="text-sm opacity-70">Pick from 10 preset retro avatars and customize your style.</p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs uppercase opacity-60">Username</label>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="block px-3 py-2 border-2 border-black"
              maxLength={20}
            />
          </div>
          <button
            onClick={() => onSetUsername(draftName)}
            className="px-3 py-2 border-2 border-black bg-black text-white"
          >
            Save Name
          </button>
        </div>
      </div>

      <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-5">
        <h3 className="font-bold flex items-center gap-2"><Palette className="w-5 h-5" /> Avatar Presets</h3>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
          {AVATAR_PRESETS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSetAvatar(avatar.id)}
              className={`p-3 border-2 transition-all ${avatarPresetId === avatar.id ? 'border-black bg-emerald-100' : 'border-zinc-300 bg-zinc-50 hover:border-black'}`}
            >
              <div className="text-3xl">{avatar.emoji}</div>
              <p className="text-xs mt-1 font-semibold">{avatar.name}</p>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-xs uppercase opacity-60">Outfit Color</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={outfitColor}
              onChange={(event) => onSetOutfitColor(event.target.value)}
              className="w-12 h-10 border border-black"
            />
            <p className="font-mono text-sm">{outfitColor}</p>
          </div>
        </div>

        <div className="mt-6 border-2 border-black p-4 bg-zinc-50 text-center">
          <p className="text-xs uppercase opacity-60">Preview</p>
          <p className="text-4xl mt-2" style={{ filter: `drop-shadow(0 0 0 ${outfitColor})` }}>{currentAvatar.emoji}</p>
          <p className="font-bold mt-2">{username}</p>
        </div>
      </div>
    </div>
  );
}
