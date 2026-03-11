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
      // Use dynamic import to avoid startup crash
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimetype === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({ error: 'Could not extract text from file. Try copy-pasting instead.' });
    }

    res.json({ success: true, text: extractedText.trim() });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to parse file. Try copy-pasting instead.' });
  }
});

module.exports = router;