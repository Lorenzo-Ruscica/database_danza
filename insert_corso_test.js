const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Tentativo inserimento corso...");
    const { data, error } = await supabase.from('corsi').insert([{
        nome: "Test Corso",
        descrizione: "Descrizione test",
        prezzo_standard: 50.00
    }]).select();
    
    console.log("Errore:", error);
    console.log("Data:", data);
}

testInsert();
