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
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
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
          <div style={{ color: '#ffffff', fontSize: 7, marginBottom: 4, lineHeight: 1.6 }}>
            Find {task.targetIcon} {task.targetEnglish}
          </div>
          <div style={{ color: '#ffe59a', fontSize: 8, marginBottom: 2 }}>
            {task.targetChinese}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 7 }}>
            {task.targetPinyin}
          </div>
        </div>
      );

    case 'shopping-list': {
      const remaining = progress.target - progress.current;
      return (
        <div>
          <div style={{ color: '#ffffff', fontSize: 7, marginBottom: 4 }}>
            Shopping List
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 7 }}>
            {remaining > 0 ? `${remaining} item${remaining !== 1 ? 's' : ''} left` : 'All done!'}
          </div>
        </div>
      );
    }

    case 'timed-sprint':
      return (
        <div>
          <div style={{ color: '#ff6b6b', fontSize: 9, marginBottom: 4, letterSpacing: 1 }}>
            Sprint!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 7 }}>
            {progress.current} found
          </div>
        </div>
      );

    case 'recipe-combo': {
      const remaining = progress.target - progress.current;
      return (
        <div>
          <div style={{ color: '#ffffff', fontSize: 7, marginBottom: 4, lineHeight: 1.5 }}>
            Collect: {task.comboName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 7 }}>
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
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 100,
        maxWidth: 220,
        minWidth: 160,
        background: '#0f0f1a',
        border: `2px solid ${levelColor}`,
        boxShadow: `3px 3px 0 #000`,
        padding: '10px 12px',
        fontFamily: "'Press Start 2P', monospace",
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Header: difficulty badge + task kind */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            background: levelColor,
            color: '#0f0f1a',
            fontSize: 7,
            padding: '2px 5px',
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
            fontSize: 7,
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
      <div style={{ marginTop: 2 }}>
        <div
          style={{
            color: progress.isComplete ? '#83d68e' : 'rgba(255,255,255,0.5)',
            fontSize: 7,
            marginBottom: 2,
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
