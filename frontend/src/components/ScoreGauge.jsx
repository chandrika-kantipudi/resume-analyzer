// ============================================================
// components/ScoreGauge.jsx
// ============================================================
// A visual circular gauge that shows the match score.
// Uses SVG for crisp rendering at any size.
// ============================================================

import React from 'react';

const ScoreGauge = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = ((score || 0) / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s >= 80) return '#00d68f';
    if (s >= 60) return '#6c63ff';
    if (s >= 40) return '#ffd166';
    return '#ff4d6d';
  };

  const color = getColor(score);

  return (
    <div style={styles.wrapper}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Background track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease' }}
        />
        {/* Glow effect */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          opacity="0.3"
          style={{ filter: 'blur(4px)', transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score text */}
        <text x="70" y="64" textAnchor="middle" style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '28px', fill: color }}>
          {score}
        </text>
        <text x="70" y="83" textAnchor="middle" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fill: '#8888a8', letterSpacing: '1.5px' }}>
          MATCH
        </text>
      </svg>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default ScoreGauge;
