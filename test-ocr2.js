const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testOCR() {
  require('dotenv').config({ path: 'b:\\Desktop\\campus-opportunity-hub\\campus-opportunity-hub\\.env.local' });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const filePath = 'C:\\\\Users\\\\Rahul\\\\.gemini\\\\antigravity-ide\\\\brain\\\\840f562c-66e8-473e-a562-730b16b7412d\\\\media__1782991526185.png';
  const buffer = fs.readFileSync(filePath);

  const promptText = `
Please transcribe all text visible in this image accurately.
IMPORTANT: If you see any URLs (links) that are split across multiple lines, you MUST reconstruct them into a single continuous URL without any spaces or line breaks.
Do not format as markdown. Just output the raw text.
`;

  try {
    const result = await model.generateContent([
      promptText,
      { inlineData: { data: buffer.toString('base64'), mimeType: 'image/png' } }
    ]);
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}

testOCR();
