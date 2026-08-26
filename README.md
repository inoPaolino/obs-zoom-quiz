# OBS Zoom-Quiz Overlay (demo)

1. Installa:
   npm install

2. Avvia:
   npm start
   Server su http://localhost:3000

3. Apri:
   - Pannello di controllo: http://localhost:3000/panel
   - Overlay per OBS: http://localhost:3000/overlay

4. In OBS:
   - Aggiungi una Browser Source con URL `http://localhost:3000/overlay`.
   - Imposta larghezza/altezza secondo la tua scena (es. 1920x1080).
   - (Opzionale) Rendila trasparente se vuoi usare solo elementi e mettere feed webcam dietro/in altro layer.

5. Immagini:
   - Per il gioco, crea una cartella `public/images/` e aggiungi immagini ad alta risoluzione.
   - Quando clicchi una cella nel pannello ti verrà chiesto l'URL dell'immagine (es. `/images/easy-A1.jpg`). L'overlay aprirà l'immagine in fullscreen e applicherà gli step di zoom.

Note
- La demo usa un semplice meccanismo di zoom via transform; per risultato migliore fornisci immagini molto grandi (es. 3000x3000) e/o modifica i fattori in overlay.js zoomStages.
- Puoi estendere: mapping automatico cella->file, salvataggio punteggi, integrazione webcam con getUserMedia (occorre consentire l'accesso dalla sorgente browser in OBS), autentificazione del pannello, o un database per salvare partite.
