import React, { useState, useMemo } from 'react';

const COMMIT_TYPES = [
  { value: 'feat', label: 'feat - 新功能' },
  { value: 'fix', label: 'fix - 修复' },
  { value: 'docs', label: 'docs - 文档' },
  { value: 'style', label: 'style - 格式' },
  { value: 'refactor', label: 'refactor - 重构' },
  { value: 'perf', label: 'perf - 性能' },
  { value: 'test', label: 'test - 测试' },
  { value: 'build', label: 'build - 构建' },
  { value: 'ci', label: 'ci - CI' },
  { value: 'chores', label: 'chores - 杂务' },
  { value: 'revert', label: 'revert - 回退' },
];

const COMMIT_SCOPES = [
  'p1', 'p2', 'hw1', 'hw2', 'hw3', 'hw4', 'hw5', 'hw6', 'hw7', 'hw8',
];

interface CommitFormProps {
  currentBranch: string;
  stagedCount: number;
  committing: boolean;
  onCommit: (message: string, options?: { allowEmpty?: boolean }) => void;
}

export default function CommitForm({ currentBranch, stagedCount, committing, onCommit }: CommitFormProps) {
  const [type, setType] = useState('');
  const [scope, setScope] = useState('');
  const [message, setMessage] = useState('');
  const [optBuild, setOptBuild] = useState(false);
  const [optJoj, setOptJoj] = useState(false);
  const [allowEmpty, setAllowEmpty] = useState(false);

  const preview = useMemo(() => {
    if (!type || !message.trim()) return '';
    let msg = scope ? `${type}(${scope}): ${message.trim()}` : `${type}: ${message.trim()}`;
    const opts: string[] = [];
    if (optBuild) opts.push('build');
    if (optJoj) opts.push('joj');
    msg += ` [${opts.join(' ')}]`;
    return msg;
  }, [type, scope, message, optBuild, optJoj]);

  const canCommit = type && message.trim() && (stagedCount > 0 || allowEmpty) && !committing;

  const handleSubmit = () => {
    if (!canCommit || !preview) return;
    onCommit(preview, allowEmpty ? { allowEmpty: true } : undefined);
    setType('');
    setScope('');
    setMessage('');
    setOptBuild(false);
    setOptJoj(false);
    setAllowEmpty(false);
  };

  return (
    <div className="commit-section">
      <div className="commit-form-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Type...</option>
          {COMMIT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="">Scope...</option>
          {COMMIT_SCOPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <input
        className="commit-input"
        type="text"
        placeholder="Commit message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && canCommit) handleSubmit(); }}
      />

      <div className="commit-options">
        <label className="commit-option-label">
          <input type="checkbox" checked={optBuild} onChange={(e) => setOptBuild(e.target.checked)} />
          [build]
        </label>
        <label className="commit-option-label">
          <input type="checkbox" checked={optJoj} onChange={(e) => setOptJoj(e.target.checked)} />
          [joj]
        </label>
        <label className="commit-option-label">
          <input type="checkbox" checked={allowEmpty} onChange={(e) => setAllowEmpty(e.target.checked)} />
          Allow empty
        </label>
      </div>

      {preview && (
        <div className="commit-preview">{preview}</div>
      )}

      <button
        className="btn-primary btn-commit"
        onClick={handleSubmit}
        disabled={!canCommit}
      >
        {committing ? 'Committing...' : `Commit to ${currentBranch}`}
      </button>
    </div>
  );
}
