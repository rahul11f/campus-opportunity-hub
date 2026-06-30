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

const { expandUrl } = require('../lib/pipeline/urlExpander');
const { classifyUrl } = require('../lib/pipeline/contentClassifier');
const { scrapeGoogleDoc, fetchPdfText, scrapeWithCheerio } = require('../lib/pipeline/webScraper');

const SYSTEM_PROMPT = `
You are an expert AI recruitment data parser.
Your task is to extract information from the given text/json/image data and map it EXACTLY to the following JSON structure.
Do not hallucinate. If a value is missing, return "Not Mentioned" or null where appropriate.

Required JSON Schema:
{
  "basic_information": {
    "company_name": "string | Not Mentioned",
    "company_logo": "string | Not Mentioned",
    "opportunity_type": "string | Not Mentioned",
    "round_name": "string | Not Mentioned",
    "verified_status": "string | Not Mentioned",
    "application_deadline": "string | Not Mentioned",
    "jd_link": "string | Not Mentioned"
  },
  "eligibility": {
    "educational_qualification": "string | Not Mentioned",
    "eligible_branches": "string | Not Mentioned",
    "eligible_streams": "string | Not Mentioned",
    "passing_batch": "string | Not Mentioned",
    "minimum_cgpa_percentage": "string | Not Mentioned",
    "cutoff_criteria": "string | Not Mentioned",
    "active_backlogs_allowed": "string | Not Mentioned",
    "gender_eligibility": "string | Not Mentioned"
  },
  "job_details": {
    "job_role": "string | Not Mentioned",
    "salary_ctc": "string | Not Mentioned",
    "stipend": "string | Not Mentioned",
    "location": "string | Not Mentioned",
    "work_mode": "string | Not Mentioned",
    "employment_type": "string | Not Mentioned"
  },
  "recruitment_process": {
    "hiring_process": "string | Not Mentioned",
    "number_of_rounds": "string | Not Mentioned",
    "elimination_rounds": "string | Not Mentioned"
  },
  "schedule": {
    "event_date": "string | Not Mentioned",
    "time": "string | Not Mentioned",
    "venue": "string | Not Mentioned",
    "mode": "string | Not Mentioned"
  },
  "communication": {
    "communication_channel": "string | Not Mentioned",
    "check_inbox": "string | Not Mentioned",
    "check_spam_folder": "string | Not Mentioned",
    "timing_shared_by": "string | Not Mentioned",
    "additional_instructions": "string | Not Mentioned"
  },
  "attachments": {
    "jd_link": "string | Not Mentioned",
    "student_eligible_list": "string | Not Mentioned",
    "additional_documents": "string | Not Mentioned"
  },
  "source_metadata": {
    "issued_by": "string | Not Mentioned",
    "institution": "string | Not Mentioned",
    "reminder_notice": "string | Not Mentioned",
    "notice_type": "string | Not Mentioned"
  }
}

Return strictly the JSON object. Do not wrap it in markdown code blocks (\`\`\`json). Just the raw JSON.
`;

async function testFull() {
  const initialText = `It is mandatory for all the Eligible students to apply for the companies. Detailed Job Description is available at: https://tinyurl.com/yck9c6ye. T&P Faculty Coordinators ensure maximum participation of all the Eligible students. All the Unplaced Students are required to apply for the given Job Opportunities.`;
  
  console.log('--- Step 1: Initial Parsing with Gemini ---');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM_PROMPT });
  const result = await model.generateContent([`INPUT DATA: \n${initialText}`]);
  const initialRaw = result.response.text().trim();
  
  // Extract JSON
  const firstBrace = initialRaw.indexOf('{');
  const lastBrace = initialRaw.lastIndexOf('}');
  const initialJSON = JSON.parse(initialRaw.substring(firstBrace, lastBrace + 1));
  console.log('Initial Parsed JSON Company:', initialJSON.basic_information.company_name);
  console.log('Initial Parsed JSON JD Link:', initialJSON.basic_information.jd_link);
  
  // Extract URLs
  const url = initialJSON.basic_information.jd_link;
  if (!url || url === 'Not Mentioned') {
    console.log('No JD link found.');
    return;
  }
  
  console.log('\n--- Step 2: Crawling Link ---');
  const expanded = await expandUrl(url);
  const classified = classifyUrl(expanded);
  let scrapedText = '';
  if (classified === 'google_doc') {
    scrapedText = await scrapeGoogleDoc(expanded);
  } else if (classified === 'pdf') {
    const pdf = await fetchPdfText(expanded);
    scrapedText = pdf.text;
  } else {
    const res = await scrapeWithCheerio(expanded);
    scrapedText = res.text;
  }
  console.log('Scraped Content Length:', scrapedText.length);
  
  console.log('\n--- Step 3: Refinement Pass with Gemini ---');
  const refinementPrompt = `
You are refining the parsed recruitment data.
Below is the initial JSON parsed from the short notice, followed by the crawled text/document content from the linked job description (JD) or registration URL.

Initial JSON:
${JSON.stringify(initialJSON, null, 2)}

Crawled Link Content:
${scrapedText}

Your task is to merge these two sources:
1. Correct any placeholder/missing values ("Not Specified", "Not Mentioned", null, or empty lists) in the initial JSON using the rich details in the crawled link content.
2. Ensure you extract the following details completely:
   - Eligible courses, branches, and passing batch (e.g. B.Tech All Branches, BCA, 2026 passing out batch).
   - Salary CTC and stipend details.
   - Number of hiring rounds and round description.
   - Work location, work mode, and eligibility requirements.
   - Deadline dates and times.
3. Return ONLY a valid JSON object matching the 8-section nested schema perfectly. No explanation, no markdown wrapping.
`;
  
  const refineResult = await model.generateContent([refinementPrompt]);
  const refinedRaw = refineResult.response.text().trim();
  const refinedBrace = refinedRaw.indexOf('{');
  const refinedLast = refinedRaw.lastIndexOf('}');
  const refinedJSON = JSON.parse(refinedRaw.substring(refinedBrace, refinedLast + 1));
  
  console.log('\n--- Refined JSON Output ---');
  console.log(JSON.stringify(refinedJSON, null, 2));
}

testFull();
