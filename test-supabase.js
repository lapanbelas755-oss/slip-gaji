require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase.from('photographers').select('*');
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Photographers count:", data.length);
  }
}
checkData();
