// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
    try {
        // 1. Inizializza Supabase Client (usando variabili environment cablate per edge functions)
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Mancano le credenziali Supabase nell'ambiente.")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // 2. Calcola la data esatta tra 30 giorni
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 30)

        // Formatta YYYY-MM-DD per la query SQL
        const targetDateStr = targetDate.toISOString().split('T')[0]

        console.log(`Esecuzione controllo certificati in scadenza il: ${targetDateStr}`)

        // 3. Esegui la query per trovare gli allievi con certificato in scadenza
        // Nota: A seconda del modello dati reale la query andrà adattata. Assumiamo una vista o un inner join supportato
        // Per un mock, faremo una chiamata alla tabella allievi
        const { data: allieviInScadenza, error } = await supabase
            .from('allievi')
            .select('id, nome, cognome, email, scadenza_certificato')
            .eq('scadenza_certificato', targetDateStr)

        if (error) {
            throw error
        }

        if (!allieviInScadenza || allieviInScadenza.length === 0) {
            return new Response(
                JSON.stringify({ message: "Nessun certificato in scadenza tra 30 giorni." }),
                { headers: { "Content-Type": "application/json" } }
            )
        }

        // 4. Invia Email a tutti i risultati tramite Resend SDK
        if (!resendApiKey) {
            console.warn("API Key di Resend mancante. Le email non verranno inviate, ma ho trovato: ", allieviInScadenza)
            return new Response(
                JSON.stringify({ message: `Trovati ${allieviInScadenza.length} allievi ma nessuna API key configurata.` }),
                { headers: { "Content-Type": "application/json" } }
            )
        }

        const promises = allieviInScadenza.map(async (allievo: any) => {
            // Usa l'API REST diretta di Resend in Deno invece dell'SDK Node
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: "Scuola di Danza <info@tua-scuola-danza.it>",
                    to: [allievo.email],
                    subject: "Avviso Scadenza Certificato Medico",
                    html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Ciao ${allievo.nome} ${allievo.cognome},</h2>
              <p>Ti informiamo che il tuo certificato medico sportivo scadrà tra esattamente 30 giorni (il ${allievo.scadenza_certificato}).</p>
              <p>Per continuare a frequentare i corsi in sicurezza, ti preghiamo di rinnovarlo e portarne una copia in segreteria o caricarlo tramite il totem.</p>
              <br/>
              <p>Grazie,<br/>La Segreteria</p>
            </div>
          `
                })
            })

            if (!res.ok) {
                throw new Error(`Errore invio email a ${allievo.email}: ${await res.text()}`)
            }
            return allievo.id
        })

        await Promise.all(promises)

        return new Response(
            JSON.stringify({
                message: `Elaborazione completata. Inviate ${promises.length} email di promemoria.`,
                dateTargeted: targetDateStr
            }),
            { headers: { "Content-Type": "application/json" } }
        )

    } catch (error: any) {
        console.error("Errore generico:", error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
})
