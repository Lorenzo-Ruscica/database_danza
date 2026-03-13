const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('allievi').select('id, nome, cognome, iscrizioni_corsi(corsi(nome, prezzo_standard))').order('nome', { ascending: false }).limit(5);
    console.log(JSON.stringify(data, null, 2));
    console.log('Error:', error);
}


run();
