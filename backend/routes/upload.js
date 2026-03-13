const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const { mimetype, buffer } = req.file;

    if (mimetype === 'application/pdf') {
      try {
        // Try method 1: pdf-parse
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (e1) {
        try {
          // Try method 2: extract raw text from PDF buffer directly
          const text = buffer.toString('latin1');
          const matches = text.match(/\(([^)]{2,})\)/g);
          if (matches && matches.length > 10) {
            extractedText = matches
              .map(m => m.slice(1, -1))
              .filter(t => /[a-zA-Z]/.test(t))
              .join(' ');
          }
        } catch (e2) {
          return res.status(400).json({
            error: 'Could not parse this PDF. Please upload as DOCX or TXT instead.'
          });
        }
      }
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        error: 'Could not extract text. Please upload as DOCX or TXT instead.'
      });
    }

    res.json({ success: true, text: extractedText.trim() });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      error: 'Failed to parse file. Please try DOCX or TXT format instead.'
    });
  }
});

module.exports = router;