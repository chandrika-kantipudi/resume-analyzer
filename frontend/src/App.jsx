import React, { useState } from 'react';
import { analyzeResume } from './services/api';
import ResultsPanel from './components/ResultsPanel';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const FileUploadBox = ({ label, number, text, setText }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF, DOCX, or TXT files allowed!');
      return;
    }
    setUploading(true);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setText(res.data.text);
    } catch (err) {
      alert('Failed to parse file. Try copy-pasting instead.');
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>
        <span style={styles.labelNumber}>{number}</span>
        <span>{label}</span>
        <span style={styles.labelHint}>{text.length} chars</span>
      </label>

      {/* File Upload Area */}
      <div
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneActive : {})
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-${number}`).click()}
      >
        <input
          id={`file-${number}`}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {uploading ? (
          <p style={styles.dropText}>⏳ Extracting text...</p>
        ) : fileName ? (
          <p style={styles.dropText}>✅ {fileName}</p>
        ) : (
          <>
            <p style={styles.dropIcon}>📄</p>
            <p style={styles.dropText}>Drop file here or <span style={styles.dropLink}>click to upload</span></p>
            <p style={styles.dropHint}>PDF, DOCX, TXT — max 5MB</p>
          </>
        )}
      </div>

      {/* OR divider */}
      <div style={styles.orDivider}>
        <div style={styles.orLine} />
        <span style={styles.orText}>or type / paste</span>
        <div style={styles.orLine} />
      </div>

      {/* Text Area */}
      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste your ${label.toLowerCase()} here...`}
      />
    </div>
  );
};

const App = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resume.trim() || resume.trim().length < 50) {
      setError('Resume must be at least 50 characters.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError('Job description must be at least 30 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeResume(resume.trim(), jobDescription.trim());
      setResult(data.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⬡</span>
            <span style={styles.logoText}>ResumeAI</span>
          </div>
          <p style={styles.tagline}>Powered by LLaMA 3.3 · Instant ATS Analysis</p>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.inputSection}>
          <div style={styles.inputGrid}>
            <FileUploadBox label="Your Resume" number="01" text={resume} setText={setResume} />
            <FileUploadBox label="Job Description" number="02" text={jobDescription} setText={setJobDescription} />
          </div>

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
                <><span style={styles.spinner} /> Analyzing...</>
              ) : (
                <><span>⚡</span> Analyze Resume</>
              )}
            </button>
            {result && !loading && (
              <button style={styles.resetButton} onClick={() => { setResult(null); setError(null); setResume(''); setJobDescription(''); }}>
                Reset
              </button>
            )}
          </div>
        </section>

        {loading && (
          <div style={styles.loadingPanel}>
            <div style={styles.loadingSpinner} />
            <div>
              <p style={styles.loadingTitle}>Analyzing your resume…</p>
              <p style={styles.loadingSubtext}>LLaMA 3.3 is comparing your experience against the role</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorPanel}>
            <span style={styles.errorIcon}>⚠</span>
            <div>
              <p style={styles.errorTitle}>Analysis Failed</p>
              <p style={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

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
        <p>Resume Analyzer · Built with React, Express & LLaMA 3.3</p>
      </footer>
    </div>
  );
};

const styles = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { borderBottom: '1px solid #1e1e2e', padding: '20px 0', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { fontSize: '22px', color: '#6c63ff' },
  logoText: { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#eeeef5' },
  tagline: { fontSize: '12px', color: '#55556a' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', width: '100%', flex: 1 },
  inputSection: { display: 'flex', flexDirection: 'column', gap: '24px' },
  inputGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: '#8888a8', letterSpacing: '0.5px', textTransform: 'uppercase' },
  labelNumber: { color: '#6c63ff', fontSize: '16px' },
  labelHint: { marginLeft: 'auto', fontSize: '11px', color: '#55556a', fontWeight: '400', textTransform: 'none' },
  dropZone: { border: '2px dashed #2a2a3a', borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', background: '#13131a' },
  dropZoneActive: { borderColor: '#6c63ff', background: 'rgba(108,99,255,0.05)' },
  dropIcon: { fontSize: '32px', marginBottom: '8px' },
  dropText: { fontSize: '14px', color: '#8888a8', marginBottom: '4px' },
  dropLink: { color: '#6c63ff', textDecoration: 'underline' },
  dropHint: { fontSize: '12px', color: '#55556a' },
  orDivider: { display: 'flex', alignItems: 'center', gap: '12px' },
  orLine: { flex: 1, height: '1px', background: '#2a2a3a' },
  orText: { fontSize: '12px', color: '#55556a', whiteSpace: 'nowrap' },
  textarea: { width: '100%', minHeight: '180px', padding: '18px', background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '12px', color: '#eeeef5', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: '1.6', resize: 'vertical', outline: 'none', caretColor: '#6c63ff' },
  buttonRow: { display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' },
  button: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 40px', background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 24px rgba(108,99,255,0.3)' },
  buttonLoading: { background: 'linear-gradient(135deg, #4a44b3 0%, #6040b0 100%)', cursor: 'not-allowed' },
  buttonDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
  spinner: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
  loadingPanel: { marginTop: '32px', background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '20px' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid #2a2a3a', borderTop: '3px solid #6c63ff', borderRadius: '50%', flexShrink: 0, animation: 'spin 1s linear infinite' },
  loadingTitle: { fontSize: '16px', fontWeight: '600', color: '#eeeef5', marginBottom: '4px' },
  loadingSubtext: { fontSize: '13px', color: '#8888a8' },
  errorPanel: { marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: '12px' },
  errorIcon: { fontSize: '20px', color: '#ff4d6d', flexShrink: 0 },
  errorTitle: { fontWeight: '600', color: '#ff8fa3', marginBottom: '4px' },
  errorText: { fontSize: '14px', color: '#8888a8' },
  resultsSection: { marginTop: '40px' },
  resultsDivider: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  resultsLabel: { fontSize: '11px', letterSpacing: '2px', color: '#00d68f', textTransform: 'uppercase', fontWeight: '600', padding: '4px 12px', background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.15)', borderRadius: '100px' },
  footer: { borderTop: '1px solid #1e1e2e', padding: '20px 24px', textAlign: 'center', fontSize: '12px', color: '#55556a' }
};

export default App;