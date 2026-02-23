// ============================================================
// App.jsx — Root Component
// ============================================================
//
// HOW REACT RE-RENDERING WORKS (Interview Answer):
//
// React maintains a "Virtual DOM" — a lightweight JavaScript
// representation of the actual browser DOM.
//
// Re-render trigger: When state or props CHANGE, React:
// 1. Re-runs the component function (like calling App() again)
// 2. Gets the new Virtual DOM tree
// 3. DIFFS the new tree against the previous one (reconciliation)
// 4. Applies ONLY the minimal real DOM changes needed (patching)
//
// This is far faster than manually updating the DOM because:
// - Real DOM operations are expensive (layout, paint, composite)
// - React batches multiple state updates into one render cycle
// - React can skip rendering components whose props didn't change
//
// In this app, every call to setResult(), setLoading(), setError()
// triggers a re-render. React's diffing means only the changed
// elements update in the browser.
//
// WHY FUNCTIONAL COMPONENTS OVER CLASS COMPONENTS?
// - Less boilerplate (no constructor, this.setState, lifecycle methods)
// - Hooks make state/effects cleaner and more composable
// - Better for testing and code splitting
// - React team recommends functional + hooks for new code
// ============================================================

import React, { useState } from 'react';
import { analyzeResume } from './services/api';
import ResultsPanel from './components/ResultsPanel';

// ============================================================
// WHY useState?
// ============================================================
// In React, you CANNOT just do `let loading = true` and expect
// the UI to update when you set `loading = false`. Regular
// variables don't trigger re-renders.
//
// useState() does two things:
// 1. Persists the value across re-renders (unlike regular vars
//    which reset every time the function runs)
// 2. Triggers a re-render when the setter function is called
//
// const [value, setValue] = useState(initialValue)
//   - value: current state (read-only snapshot for this render)
//   - setValue: function that updates state AND schedules re-render
//   - initialValue: only used on the very first render
//
// We use 4 pieces of state:
// - resume: tracks the resume textarea's text
// - jobDescription: tracks the JD textarea's text
// - loading: boolean to show/hide loading spinner
// - result: stores the structured analysis from backend
// - error: stores error message string or null
// ============================================================

const App = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --------------------------------------------------------
  // handleAnalyze — The Core Event Handler
  // --------------------------------------------------------
  // async: allows us to use await inside it
  // This function orchestrates the full request-response cycle:
  //
  // 1. Validate inputs (don't hit the server with empty data)
  // 2. Set loading = true → React re-renders → spinner appears
  // 3. Clear previous error/result
  // 4. Await the API call (non-blocking — UI stays responsive)
  // 5. On success: set result → React re-renders → results appear
  // 6. On failure: set error → React re-renders → error appears
  // 7. Finally: set loading = false → spinner always disappears
  //
  // The finally block is critical — it runs whether the call
  // succeeded or failed. Without it, if the API throws, loading
  // would stay true forever and the button would be stuck.
  // --------------------------------------------------------
  const handleAnalyze = async () => {
    // Client-side validation before touching the network
    if (!resume.trim() || resume.trim().length < 50) {
      setError('Please paste a resume with at least 50 characters.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError('Please paste a job description with at least 30 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeResume(resume.trim(), jobDescription.trim());
      setResult(data.data);
    } catch (err) {
      // err.userMessage is set by our axios interceptor in api.js
      setError(err.userMessage || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // RENDER — React calls this every time state changes
  // --------------------------------------------------------
  // JSX is compiled by Babel to React.createElement() calls.
  // It's not HTML — it's a syntax for describing the Virtual DOM.
  //
  // Key patterns used here:
  // - Controlled inputs: value={resume} onChange={e => setResume(e.target.value)}
  //   The textarea's value is controlled by React state, not the DOM.
  //   Every keystroke calls setResume → re-render → textarea shows new value.
  //   This gives React full control and enables validation/derived state.
  //
  // - Conditional rendering: {loading && <Spinner />}
  //   React renders falsy values (false, null, undefined) as nothing.
  //
  // - Derived display: disabled={loading || !resume || !jobDescription}
  //   Computed from state on each render — no separate useEffect needed.
  // --------------------------------------------------------

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>ResumeAI</span>
          </div>
          <p style={styles.tagline}>Powered by GPT-4o · Instant ATS Analysis</p>
        </div>
      </header>

      <main style={styles.main}>
        {/* Input Section */}
        <section style={styles.inputSection}>
          <div style={styles.inputGrid}>
            {/* Resume Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelNumber}>01</span>
                <span>Your Resume</span>
                <span style={styles.labelHint}>{resume.length} chars</span>
              </label>
              <textarea
                style={styles.textarea}
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your full resume here…

Include: work experience, skills, education, certifications, projects, and any relevant achievements."
                disabled={loading}
              />
            </div>

            {/* Job Description Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelNumber}>02</span>
                <span>Job Description</span>
                <span style={styles.labelHint}>{jobDescription.length} chars</span>
              </label>
              <textarea
                style={styles.textarea}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here…

Include: responsibilities, required qualifications, nice-to-have skills, and company context."
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.buttonRow}>
            <button
              style={{
                ...styles.button,
                ...(loading ? styles.buttonLoading : {}),
                ...((!resume || !jobDescription) ? styles.buttonDisabled : {})
              }}
              onClick={handleAnalyze}
              disabled={loading || !resume.trim() || !jobDescription.trim()}
            >
              {loading ? (
                <>
                  <span style={styles.spinner} />
                  Analyzing with GPT-4o…
                </>
              ) : (
                <>
                  <span style={styles.buttonIcon}>⚡</span>
                  Analyze Resume
                </>
              )}
            </button>
            {result && !loading && (
              <button
                style={styles.resetButton}
                onClick={() => { setResult(null); setError(null); setResume(''); setJobDescription(''); }}
              >
                Reset
              </button>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingPanel}>
            <div style={styles.loadingContent}>
              <div style={styles.loadingSpinner} />
              <div>
                <p style={styles.loadingTitle}>Analyzing your resume…</p>
                <p style={styles.loadingSubtext}>GPT-4o is comparing your experience against the role requirements</p>
              </div>
            </div>
            <div style={styles.loadingSteps}>
              {['Parsing resume', 'Matching keywords', 'Scoring alignment', 'Generating insights'].map((step, i) => (
                <div key={step} style={{ ...styles.loadingStep, animationDelay: `${i * 0.5}s` }}>
                  <span style={styles.loadingDot} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={styles.errorPanel}>
            <span style={styles.errorIcon}>⚠</span>
            <div>
              <p style={styles.errorTitle}>Analysis Failed</p>
              <p style={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <section style={styles.resultsSection}>
            <div style={styles.resultsDivider}>
              <span style={styles.resultsLabel}>Analysis Complete</span>
            </div>
            <ResultsPanel data={result} />
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Resume Analyzer · Built with React, Express & GPT-4o</p>
      </footer>
    </div>
  );
};

// ============================================================
// STYLES — JavaScript style objects
// ============================================================
// Using inline styles for this project keeps it portable and
// self-contained. In production you'd use CSS Modules,
// styled-components, or Tailwind for better maintainability.
// ============================================================
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '1px solid #1e1e2e',
    padding: '20px 0',
    background: 'rgba(10,10,15,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '22px',
    color: '#6c63ff',
  },
  logoText: {
    fontFamily: 'DM Serif Display, Georgia, serif',
    fontSize: '22px',
    color: '#eeeef5',
    letterSpacing: '-0.3px',
  },
  tagline: {
    fontSize: '12px',
    color: '#55556a',
    letterSpacing: '0.5px',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    width: '100%',
    flex: 1,
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#8888a8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  labelNumber: {
    color: '#6c63ff',
    fontFamily: 'DM Serif Display, Georgia, serif',
    fontSize: '16px',
  },
  labelHint: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#55556a',
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: '0',
  },
  textarea: {
    width: '100%',
    minHeight: '280px',
    padding: '18px',
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    color: '#eeeef5',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    caretColor: '#6c63ff',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 40px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 24px rgba(108,99,255,0.3)',
  },
  buttonLoading: {
    background: 'linear-gradient(135deg, #4a44b3 0%, #6040b0 100%)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  resetButton: {
    padding: '14px 28px',
    background: 'transparent',
    color: '#8888a8',
    border: '1px solid #2a2a3a',
    borderRadius: '100px',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingPanel: {
    marginTop: '32px',
    background: '#13131a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #2a2a3a',
    borderTop: '3px solid #6c63ff',
    borderRadius: '50%',
    flexShrink: 0,
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#eeeef5',
    marginBottom: '4px',
  },
  loadingSubtext: {
    fontSize: '13px',
    color: '#8888a8',
  },
  loadingSteps: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  loadingStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#55556a',
    animation: 'fadeUp 0.4s ease forwards',
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#6c63ff',
    boxShadow: '0 0 6px #6c63ff',
  },
  errorPanel: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px 24px',
    background: 'rgba(255,77,109,0.06)',
    border: '1px solid rgba(255,77,109,0.2)',
    borderRadius: '12px',
    animation: 'fadeUp 0.3s ease forwards',
  },
  errorIcon: {
    fontSize: '20px',
    color: '#ff4d6d',
    flexShrink: 0,
  },
  errorTitle: {
    fontWeight: '600',
    color: '#ff8fa3',
    marginBottom: '4px',
  },
  errorText: {
    fontSize: '14px',
    color: '#8888a8',
  },
  resultsSection: {
    marginTop: '40px',
  },
  resultsDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  resultsLabel: {
    fontSize: '11px',
    letterSpacing: '2px',
    color: '#00d68f',
    textTransform: 'uppercase',
    fontWeight: '600',
    padding: '4px 12px',
    background: 'rgba(0,214,143,0.08)',
    border: '1px solid rgba(0,214,143,0.15)',
    borderRadius: '100px',
  },
  footer: {
    borderTop: '1px solid #1e1e2e',
    padding: '20px 24px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#55556a',
  }
};

export default App;
