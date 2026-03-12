-- Sblocca la tabella allievi in LETTURA E SCRITTURA PER TUTTI (fase di sviluppo/totem)
CREATE POLICY "Permetti tutte le operazioni su allievi" ON public.allievi 
FOR ALL USING (true) WITH CHECK (true);

-- Sblocca la tabella iscrizioni_corsi in LETTURA E SCRITTURA PER TUTTI
CREATE POLICY "Permetti tutte le operazioni su iscrizioni_corsi" ON public.iscrizioni_corsi 
FOR ALL USING (true) WITH CHECK (true);

-- Sblocca la tabella certificati in LETTURA E SCRITTURA PER TUTTI
CREATE POLICY "Permetti tutte le operazioni su certificati_tabella" ON public.certificati 
FOR ALL USING (true) WITH CHECK (true);

-- Sblocca la tabella pagamenti in LETTURA E SCRITTURA PER TUTTI
CREATE POLICY "Permetti tutte le operazioni su pagamenti" ON public.pagamenti
FOR ALL USING (true) WITH CHECK (true);
