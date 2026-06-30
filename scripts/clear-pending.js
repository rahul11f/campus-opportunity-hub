import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('student_contributions')
    .select('*')
    .eq('status', 'pending');
  
  if (error) {
    console.error('Error fetching pending contributions:', error);
    return;
  }
  
  console.log('Pending contributions found:', data?.length || 0);
  console.log(data);

  if (data && data.length > 0) {
    const { error: updateError } = await supabase
      .from('student_contributions')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('status', 'pending');
      
    console.log('Update Error:', updateError);
    console.log('Cleared pending contributions.');
  }
}

run();
