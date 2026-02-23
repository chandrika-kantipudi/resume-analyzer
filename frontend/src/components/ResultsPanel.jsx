// ============================================================
// components/ResultsPanel.jsx
// ============================================================
// Displays the structured analysis returned from the backend.
// Uses pure CSS-in-JS (inline styles) for self-containment.
// ============================================================

import React from 'react';
import ScoreGauge from './ScoreGauge';

const getRatingStyle = (rating) => {
  const map = {
    'Excellent': { bg: 'rgba(0,214,143,0.1)', color: '#00d68f', border: 'rgba(0,214,143,0.25)' },
    'Good': { bg: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: 'rgba(108,99,255,0.25)' },
    'Average': { bg: 'rgba(255,209,102,0.1)', color: '#ffd166', border: 'rgba(255,209,102,0.25)' },
    'Below Average': { bg: 'rgba(255,77,109,0.08)', color: '#ff8fa3', border: 'rgba(255,77,109,0.2)' },
    'Poor': { bg: 'rgba(255,77,109,0.12)', color: '#ff4d6d', border: 'rgba(255,77,109,0.3)' },
  };
  return map[rating] || map['Average'];
};

const Section = ({ title, items, icon, accentColor }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <span style={{ ...styles.sectionIcon, color: accentColor }}>{icon}</span>
      <h3 style={styles.sectionTitle}>{title}</h3>
    </div>
    <ul style={styles.list}>
      {items?.map((item, i) => (
        <li key={i} style={styles.listItem}>
          <span style={{ ...styles.bullet, background: accentColor }} />
          <span style={styles.listText}>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const KeywordChip = ({ word, found }) => (
  <span style={{
    ...styles.chip,
    background: found ? 'rgba(0,214,143,0.08)' : 'rgba(255,77,109,0.08)',
    border: `1px solid ${found ? 'rgba(0,214,143,0.2)' : 'rgba(255,77,109,0.2)'}`,
    color: found ? '#00d68f' : '#ff4d6d'
  }}>
    {found ? '✓' : '✗'} {word}
  </span>
);

const ResultsPanel = ({ data }) => {
  const ratingStyle = getRatingStyle(data.performanceRating);

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.headerRow} className="animate-fadeUp">
        <div style={styles.scoreSection}>
          <ScoreGauge score={data.matchScore} />
          <div style={styles.ratingBadge}>
            <span style={{ ...styles.ratingPill, ...ratingStyle }}>
              {data.performanceRating}
            </span>
            <p style={styles.ratingLabel}>Performance Rating</p>
          </div>
        </div>
        {data.summary && (
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>AI ASSESSMENT</p>
            <p style={styles.summaryText}>{data.summary}</p>
          </div>
        )}
      </div>

      {/* Three analysis columns */}
      <div style={styles.grid} className="animate-fadeUp animate-fadeUp-delay-1">
        <Section
          title="Strengths"
          items={data.strengths}
          icon="↑"
          accentColor="#00d68f"
        />
        <Section
          title="Weaknesses"
          items={data.weaknesses}
          icon="↓"
          accentColor="#ff4d6d"
        />
        <Section
          title="Improvements"
          items={data.improvementSuggestions}
          icon="→"
          accentColor="#6c63ff"
        />
      </div>

      {/* Keywords */}
      {(data.keywordsFound?.length > 0 || data.keywordsMissing?.length > 0) && (
        <div style={styles.keywordsBox} className="animate-fadeUp animate-fadeUp-delay-2">
          <h3 style={styles.sectionTitle}>Keyword Analysis</h3>
          <div style={styles.chips}>
            {data.keywordsFound?.map((w, i) => (
              <KeywordChip key={`found-${i}`} word={w} found={true} />
            ))}
            {data.keywordsMissing?.map((w, i) => (
              <KeywordChip key={`miss-${i}`} word={w} found={false} />
            ))}
          </div>
        </div>
      )}

      {/* Meta info */}
      {/* Tokens used shows in dev only */}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fadeUp 0.5s ease forwards',
  },
  headerRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '28px',
    alignItems: 'center',
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  ratingBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  ratingPill: {
    padding: '6px 20px',
    borderRadius: '100px',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid',
  },
  ratingLabel: {
    fontSize: '11px',
    color: '#55556a',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  summaryBox: {
    flex: 1,
    minWidth: '220px',
    borderLeft: '1px solid #2a2a3a',
    paddingLeft: '24px',
  },
  summaryLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#55556a',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: '15px',
    color: '#c0c0d8',
    lineHeight: '1.7',
    fontStyle: 'italic',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  section: {
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '22px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  sectionIcon: {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: 1,
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#8888a8',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  bullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '7px',
  },
  listText: {
    fontSize: '14px',
    color: '#c0c0d8',
    lineHeight: '1.6',
  },
  keywordsBox: {
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '22px',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '14px',
  },
  chip: {
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '500',
  }
};

export default ResultsPanel;
