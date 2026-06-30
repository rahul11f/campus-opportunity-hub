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

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const r1 = await supabase.from('student_contributions').select('*, profiles(full_name, email)').limit(1);
  console.log('Result with profiles:', r1.error ? r1.error.message : 'success');

  const r2 = await supabase.from('student_contributions').select('*, student_profiles(full_name, email)').limit(1);
  console.log('Result with student_profiles:', r2.error ? r2.error.message : 'success');
  if (r2.data) {
    console.log('student_profiles relation structure:', r2.data[0]);
  }
}

check();
