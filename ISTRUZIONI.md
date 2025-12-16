# Manuale Utente di Shot Timer Pro

Benvenuto in Shot Timer Pro, l'applicazione completa per gli appassionati di tiro dinamico. Questa guida ti illustrerà tutte le funzionalità, dal semplice timer per l'allenamento alla gestione completa dei match con punteggio in tempo reale.

---

### Indice dei Contenuti
1. [Primo Accesso e Ruoli Utente](#1-primo-accesso-e-ruoli-utente)
2. [Navigazione Principale](#2-navigazione-principale)
3. [Dashboard (Analisi delle Performance)](#3-dashboard-analisi-delle-performance)
4. [Il Timer](#4-il-timer)
5. [Allenamento (Esercizi Personali e Ufficiali)](#5-allenamento-esercizi-personali-e-ufficiali)
6. [Classifier IDPA](#6-classifier-idpa)
7. [Gestione Tiratori (Lista Globale)](#7-gestione-tiratori-lista-globale)
8. [Gestione Match (Guida Completa)](#8-gestione-match-guida-completa)
    - [Per il Match Director (MD)](#per-il-match-director-md)
    - [Per il Safety Officer (SO)](#per-il-safety-officer-so)
    - [Per l'Utente Standard (USER)](#per-lutente-standard-user)
9. [Funzionalità P2P (Punteggio Live)](#9-funzionalità-p2p-punteggio-live)
10. [Impostazioni](#10-impostazioni)
11. [Modalità Gara Veloce (Testa a Testa)](#11-modalità-gara-veloce-testa-a-testa)

---

### 1. Primo Accesso e Ruoli Utente

Shot Timer Pro utilizza un sistema di account per salvare e sincronizzare i tuoi dati. Il sistema si basa su tre ruoli:

-   **USER:** Il ruolo base. Può usare il timer, registrare sessioni di allenamento e visualizzare i risultati dei match.
-   **SO (Safety Officer):** Può gestire e inserire i punteggi per la squad a cui è stato assegnato durante un match.
-   **MD (Match Director):** Ha il controllo completo. Può creare e gestire match, gestire tutti i punteggi, creare esercizi ufficiali per il club e amministrare i ruoli degli altri utenti.

#### Registrazione e Login

-   **Registrati:** Se non hai un account, clicca su "Non hai un account? Registrati". Inserisci un'email e una password per creare il tuo account. Ogni nuovo account inizia con il ruolo **USER**.
-   **Accedi:** Inserisci le tue credenziali per accedere all'app.

[SCHERMATA: La schermata di login e registrazione.]

#### Promozione a MD o SO

Per ottenere i privilegi di MD o SO, un utente con il ruolo di MD deve promuoverti dal pannello **Impostazioni -> Gestione Utenti**.

### 2. Navigazione Principale

L'interfaccia è organizzata in schede accessibili da una barra di navigazione laterale (su desktop) o inferiore (su mobile).

-   **Dashboard:** Il tuo centro di analisi delle performance o, se sei MD/SO, il centro di controllo del club.
-   **Timer:** La funzione cronometro principale per le tue sessioni di tiro.
-   **Gara Veloce:** (Nuovo!) Modalità per sfide rapide tra amici.
-   **Allenamento:** Lo storico di tutte le tue sessioni e la libreria degli esercizi personali e ufficiali.
-   **Classifier:** Una sezione per tracciare i punteggi dei classifier ufficiali IDPA.
-   **Gare (Matches):** L'area per creare, gestire e visualizzare le competizioni ufficiali.
-   **Tiratori:** La tua rubrica globale di tiratori (visibile a MD e SO).
-   **Armeria:** Gestisci il tuo inventario di armi da fuoco e registro manutenzioni.
-   **Impostazioni:** Per personalizzare l'app e gestire gli utenti (solo MD).

[SCHERMATA: L'interfaccia principale con la barra di navigazione evidenziata.]

### 3. Dashboard (Analisi delle Performance)

La Dashboard cambia in base al tuo ruolo.

-   **Per l'Utente Standard (USER):** È il tuo centro di comando per l'analisi delle performance personali. Aggrega i dati di tutte le tue sessioni di allenamento per darti una visione d'insieme dei tuoi progressi. Puoi filtrare per esercizio o per arma, analizzare l'andamento delle penalità e confrontare le performance tra le diverse armi su uno stesso esercizio.
-   **Per il Match Director (MD) e Safety Officer (SO):** Diventa un **Centro di Controllo Club**. Mostra metriche aggregate su tutti i tiratori e club, permettendoti di supervisionare l'attività generale. Puoi espandere ogni club per vedere i suoi membri e accedere allo storico di allenamento di ogni tiratore per monitorarne i progressi.

[SCHERMATA: La schermata della Dashboard per MD con la vista dei club.]

### 4. Il Timer

Il cuore dell'allenamento.

**Come usare il Timer:**
1.  **Imposta il Par Time (Opzionale):** Inserisci un tempo nel campo "Par Time" (nel blocco impostazioni sotto il timer). Un secondo beep suonerà allo scadere di questo tempo.
2.  **Premi START:** L'app attenderà un tempo casuale (configurabile in Impostazioni) e poi emetterà un beep.
3.  **Inizia a Sparare:** Il timer partirà al segnale. Il microfono registrerà ogni colpo.
4.  **Inserisci le Penalità:** Sotto il timer e le statistiche, trovi i campi per Punti Down, Procedurali e HNT. Il **Tempo Finale** si aggiornerà in tempo reale.
5.  **Salva la Sessione:** Una volta terminato, premi **Salva**. Si aprirà una finestra dove potrai associare la sessione a un esercizio, selezionare un tiratore (se sei MD/SO) e l'arma usata.

[SCHERMATA: La schermata del timer con una sessione registrata, i controlli e il blocco penalità visibile.]

### 5. Allenamento (Esercizi Personali e Ufficiali)

Questa sezione è il tuo diario di allenamento digitale e la libreria degli esercizi, ora divisa in due sezioni principali.

-   **Esercizi Ufficiali del Club:** Questa sezione, visibile a tutti, contiene gli esercizi creati e gestiti dai Match Director. Come utente standard o SO, puoi visualizzarli e avviarli direttamente, ma non puoi modificarli o eliminarli.
-   **I Miei Esercizi Personali:** Qui puoi creare, modificare ed eliminare esercizi visibili solo a te. Sono i tuoi appunti e allenamenti privati.

**Funzionalità degli Esercizi:**
-   **Inizia Esercizio:** Clicca per andare direttamente al Timer con l'esercizio preselezionato.
-   **Vedi Storico:** Analizza tutte le sessioni registrate per quell'esercizio, con la possibilità di esportare in CSV o stampare un report.
-   **Vedi Grafico:** Visualizza un grafico con l'andamento delle tue performance nel tempo per quell'esercizio.
-   **Community:** Puoi scaricare esercizi condivisi da altri utenti o condividere i tuoi.

[SCHERMATA: La vista Allenamento con le due sezioni "Esercizi Ufficiali" e "Esercizi Personali".]

### 6. Classifier IDPA

Questa sezione è dedicata a registrare e tracciare le tue performance nei classifier ufficiali IDPA.

-   **Storico Tentativi:** La schermata principale mostra una lista di tutti i tuoi tentativi passati con la classificazione ottenuta.
-   **Registra un Nuovo Tentativo:** Clicca su "Aggiungi Nuovo Tentativo", inserisci i tempi e penalità per ogni stringa e l'app calcolerà la tua classe (Novice, Marksman, Sharpshooter, Expert, Master).

[SCHERMATA: La schermata del Classifier con lo storico.]

### 7. Gestione Tiratori (Club & Tiratori)

Questo è il tuo hub centrale per tutti i tiratori, organizzati per club. I tiratori aggiunti qui possono essere facilmente importati nei match o selezionati nel timer.

-   **Aggiungi Club:** Crea un nuovo club o squadra.
-   **Aggiungi Tiratore al Club:** Crea il profilo di un nuovo tiratore all'interno di un club. Puoi anche collegare un tiratore a un account Utente reale registrato nell'app.

[SCHERMATA: La schermata di gestione Tiratori con la lista dei club espansa.]

### 8. Gestione Match (Guida Completa)

Questa è la sezione più potente e flessibile dell'app. Il suo utilizzo varia in base al tuo ruolo.

#### Per il Match Director (MD)

Hai il pieno controllo su ogni aspetto della competizione.

**1. Creare un Nuovo Match:**
-   Vai alla scheda **Gare** e clicca su **"Crea Nuova Gara"**.
-   Segui i 3 step: Dettagli gara, creazione Stage, importazione Tiratori (dal database globale).

**2. Pannello di Controllo del Match (Dashboard):**
-   **Classifica:** La vista principale con i punteggi aggiornati.
-   **Gestisci Match:** Organizza le squad, assegna gli SO, e gestisci tiratori e stage.
-   **Punteggio Live (P2P):** Avvia una sessione per la sincronizzazione dei punteggi in tempo reale (vedi sezione 9).

[SCHERMATA: Il pannello di controllo del match lato MD.]

#### Per il Safety Officer (SO)

Il tuo ruolo è focalizzato sull'inserimento dei punteggi.

1.  **Accedi al Match:** Seleziona il match.
2.  **Vista Squad:** Se sei stato assegnato a una Squad dall'MD, vedrai una vista semplificata con solo i tuoi tiratori.
3.  **Inserimento Punteggi:** Clicca su "Punteggio Stage" accanto a un tiratore per inserire tempi e penalità.

[SCHERMATA: La vista dedicata per l'SO per l'inserimento punteggi.]

### 9. Funzionalità P2P (Punteggio Live)

Questa funzione permette a più dispositivi (es. tablet degli SO) di inviare punteggi a un dispositivo centrale (MD) in tempo reale, anche senza internet (su rete locale) o via internet.

**Come funziona (per l'MD - Host):**
1.  Dal pannello del match, clicca su **"Avvia Hosting"**.
2.  L'app genererà un **ID Host**. Condividilo con gli SO.

**Come funziona (per l'SO - Client):**
1.  Dal pannello del match, inserisci l'ID Host fornito dall'MD e clicca su **"Unisciti"**.
2.  Una volta connesso (pallino verde), ogni punteggio salvato verrà inviato automaticamente all'MD.
3.  **Modalità Offline:** Se la connessione cade, i punteggi vengono salvati in una "coda". Appena la connessione torna, l'app sincronizzerà tutto automaticamente.

[SCHERMATA: Il pannello P2P che mostra lo stato di connessione.]

### 10. Impostazioni

Personalizza la tua esperienza.

-   **Timer:** Regola la sensibilità del microfono, il tempo di attesa casuale e lo stop automatico.
-   **Lingua:** Scegli tra Italiano e Inglese.
-   **Gestione Utenti (solo MD):** Pannello amministrativo per abilitare/disabilitare utenti e cambiare i loro ruoli (USER, SO, MD).

[SCHERMATA: La schermata Impostazioni.]

---

### 11. Modalità Gara Veloce (Testa a Testa)

Questa modalità permette di organizzare una competizione rapida e informale tra **due o più tiratori** sullo stesso dispositivo.

**Come Funziona:**
1.  **Impostazione:** Vai su "Gara Veloce". Seleziona 2 o più tiratori dalla lista e scegli l'esercizio.
2.  **La Gara:** L'app chiamerà i tiratori uno alla volta.
    *   *Fase Timer:* Il tiratore esegue l'esercizio col timer.
    *   *Fase Penalità:* Subito dopo lo stop, inserisci le penalità.
    *   L'app calcola il tempo finale e passa al prossimo tiratore.
3.  **Classifica:** Alla fine del giro, viene mostrata una classifica immediata con i tempi finali (inclusi di penalità) per decretare il vincitore.

[SCHERMATA: La schermata dei risultati finali di una Gara Veloce.]

---

Grazie per aver scelto Shot Timer Pro! Buon allenamento e in bocca al lupo per i tuoi match!
