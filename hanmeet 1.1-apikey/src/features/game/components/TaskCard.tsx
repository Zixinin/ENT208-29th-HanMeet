import React from 'react';
import type { Task, TaskProgress, DifficultyLevel } from '../types/tasks';

interface TaskCardProps {
  task: Task;
  progress: TaskProgress;
  difficultyLevel: DifficultyLevel;
}

const LEVEL_COLORS: Record<DifficultyLevel, string> = {
  1: '#83d68e',
  2: '#ffe59a',
  3: '#7ec8e3',
};

const MAX_DOTS = 8;

function ProgressDots({ current, target }: { current: number; target: number }) {
  const dotCount = Math.min(target, MAX_DOTS);
  const filledCount = Math.min(current, dotCount);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 16,
            color: i < filledCount ? '#ffe59a' : 'rgba(255,255,255,0.25)',
            lineHeight: 1,
          }}
        >
          {i < filledCount ? '●' : '○'}
        </span>
      ))}
    </div>
  );
}

function TaskBody({ task, progress }: { task: Task; progress: TaskProgress }) {
  switch (task.kind) {
    case 'find-item':
      return (
        <div>
          <div style={{ color: '#ffffff', fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
            Find {task.targetIcon} {task.targetEnglish}
          </div>
          <div style={{ color: '#ffe59a', fontSize: 16, marginBottom: 4, lineHeight: 1.35 }}>
            {task.targetChinese}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.35 }}>
            {task.targetPinyin}
          </div>
        </div>
      );

    case 'shopping-list': {
      const remaining = progress.target - progress.current;
      return (
        <div>
          <div style={{ color: '#ffffff', fontSize: 14, marginBottom: 8, lineHeight: 1.45 }}>
            Shopping List
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.45 }}>
            {remaining > 0 ? `${remaining} item${remaining !== 1 ? 's' : ''} left` : 'All done!'}
          </div>
        </div>
      );
    }

    case 'timed-sprint':
      return (
        <div>
          <div style={{ color: '#ff6b6b', fontSize: 18, marginBottom: 8, letterSpacing: 1, lineHeight: 1.35 }}>
            Sprint!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.45 }}>
            {progress.current} found
          </div>
        </div>
      );

    case 'recipe-combo': {
      const remaining = progress.target - progress.current;
      return (
        <div>
          <div style={{ color: '#ffffff', fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>
            Collect: {task.comboName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.45 }}>
            {remaining > 0 ? `${remaining} item${remaining !== 1 ? 's' : ''} left` : 'Complete!'}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

const KIND_LABELS: Record<Task['kind'], string> = {
  'find-item': 'FIND',
  'shopping-list': 'LIST',
  'timed-sprint': 'SPRINT',
  'recipe-combo': 'RECIPE',
};

export function TaskCard({ task, progress, difficultyLevel }: TaskCardProps) {
  const levelColor = LEVEL_COLORS[difficultyLevel];

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100,
        maxWidth: 440,
        minWidth: 320,
        background: '#0f0f1a',
        border: `4px solid ${levelColor}`,
        boxShadow: `6px 6px 0 #000`,
        padding: '20px 24px',
        fontFamily: "'Press Start 2P', monospace",
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header: difficulty badge + task kind */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            background: levelColor,
            color: '#0f0f1a',
            fontSize: 14,
            padding: '4px 10px',
            fontFamily: "'Press Start 2P', monospace",
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          LV.{difficultyLevel}
        </span>
        <span
          style={{
            color: levelColor,
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 1.4,
          }}
        >
          {KIND_LABELS[task.kind]}
        </span>
      </div>

      {/* Task description */}
      <TaskBody task={task} progress={progress} />

      {/* Progress: count + dots */}
      <div style={{ marginTop: 4 }}>
        <div
          style={{
            color: progress.isComplete ? '#83d68e' : 'rgba(255,255,255,0.5)',
            fontSize: 14,
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          {Math.min(progress.current, progress.target)}/{progress.target}
          {progress.isComplete && ' ✓'}
        </div>
        <ProgressDots current={progress.current} target={progress.target} />
      </div>
    </div>
  );
}
