const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testAll() {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hello");
      const response = await result.response;
      console.log(`Model ${m} succeeded: ${response.text().substring(0, 30)}`);
      return;
    } catch (e) {
      console.error(`Model ${m} failed:`, e.message || e);
    }
  }
}

testAll();
