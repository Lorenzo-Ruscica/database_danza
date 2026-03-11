const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: allievi } = await supabase.from('allievi').select('id').limit(1);
    const { data: corsi } = await supabase.from('corsi').select('id').limit(1);

    if (allievi.length > 0 && corsi.length > 0) {
        const { data, error } = await supabase.from('iscrizioni_corsi').insert([{
            allievo_id: allievi[0].id,
            corso_id: corsi[0].id
        }]);
        console.log('Insert Error:', error);
    }
}

run();
