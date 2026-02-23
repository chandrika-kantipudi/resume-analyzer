const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/analyze', async (req, res, next) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || resume.trim().length < 50) {
      return res.status(400).json({ error: 'Resume must be at least 50 characters.' });
    }
    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({ error: 'Job description must be at least 30 characters.' });
    }

    const safeResume = resume.trim().substring(0, 6000);
    const safeJD = jobDescription.trim().substring(0, 3000);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS and career coach AI.
Return ONLY valid JSON, no markdown, no code fences, no extra text.
JSON structure:
{
  "matchScore": <integer 0-100>,
  "performanceRating": <"Excellent"|"Good"|"Average"|"Below Average"|"Poor">,
  "strengths": [<3-5 strings>],
  "weaknesses": [<3-5 strings>],
  "improvementSuggestions": [<3-5 strings>],
  "keywordsFound": [<keywords from JD found in resume>],
  "keywordsMissing": [<keywords from JD missing in resume>],
  "summary": "<2-3 sentence assessment>"
}`
        },
        {
          role: 'user',
          content: `Analyze this resume against the job description.

=== RESUME ===
${safeResume}

=== JOB DESCRIPTION ===
${safeJD}

Return ONLY the JSON object.`
        }
      ]
    });

    const rawContent = completion.choices[0].message.content;

    let analysisResult;
    try {
      const cleaned = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      analysisResult = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ error: 'AI returned unexpected format. Please try again.' });
    }

    res.status(200).json({ success: true, data: analysisResult });

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;