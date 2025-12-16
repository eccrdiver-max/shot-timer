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
11. [Modalità Testa a Testa](#11-modalità-testa-a-testa)

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
-   **Gara Veloce:** Modalità per sfide rapide tra amici.
-   **Allenamento:** Lo storico di tutte le tue sessioni e la libreria degli esercizi personali e ufficiali.
-   **Classifier:** Una sezione per tracciare i punteggi dei classifier ufficiali IDPA.
-   **Gare (Matches):** L'area per creare, gestire e visualizzare le competizioni ufficiali.
-   **Tiratori:** La tua rubrica globale di tiratori (visibile a MD e SO).
-   **Armeria:** Gestisci il tuo inventario di armi da fuoco.
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
1.  **Imposta il Par Time (Opzionale):** Inserisci un tempo nel campo "Par Time". Un secondo beep suonerà allo scadere di questo tempo.
2.  **Premi START:** L'app attenderà un tempo casuale (configurabile in Impostazioni) e poi emetterà un beep.
3.  **Inizia a Sparare:** Il timer partirà al segnale. Il microfono registrerà ogni colpo.
4.  **Inserisci le Penalità:** Mentre spari o dopo, puoi inserire Punti Down, Procedurali e HNT. Il **Tempo Finale** si aggiornerà in tempo reale.
5.  **Salva la Sessione:** Una volta terminato, premi **Salva**. Si aprirà una finestra dove potrai associare la sessione a un esercizio, selezionare un tiratore (se sei MD/SO) e l'arma usata.

> **Novità per MD/SO:** Se selezioni un tiratore che ha un **account collegato** (vedi sezione 7), la sessione di allenamento verrà inviata automaticamente anche al suo account personale. Il tiratore potrà così vedere i dati sul proprio telefono nella sezione "Allenamento".

[SCHERMATA: La schermata del timer con una sessione registrata e la finestra di salvataggio aperta.]

### 5. Allenamento (Esercizi Personali e Ufficiali)

Questa sezione è il tuo diario di allenamento digitale e la libreria degli esercizi, ora divisa in due sezioni principali.

-   **Esercizi Ufficiali del Club:** Questa sezione, visibile a tutti, contiene gli esercizi creati e gestiti dai Match Director. Come utente standard o SO, puoi visualizzarli e avviarli direttamente, ma non puoi modificarli o eliminarli.
-   **I Miei Esercizi Personali:** Qui puoi creare, modificare ed eliminare esercizi visibili solo a te. Sono i tuoi appunti e allenamenti privati.

**Come funziona per l'MD:**
Quando un MD crea un nuovo esercizio tramite il pulsante **"Aggiungi Nuovo Esercizio"**, nel modulo apparirà una casella di controllo: **"Rendi questo un Esercizio Ufficiale del Club"**.
-   Se **selezionata**, l'esercizio apparirà nella sezione "Ufficiali" per tutti gli utenti.
-   Se **non selezionata**, rimarrà un esercizio privato nella sezione "Personali" dell'MD.

**Funzionalità degli Esercizi:**
-   **Inizia Esercizio:** Clicca per andare direttamente al Timer con l'esercizio preselezionato.
-   **Vedi Storico:** Analizza tutte le sessioni registrate per quell'esercizio, con la possibilità di esportare in CSV o stampare un report.
-   **Vedi Grafico:** Visualizza un grafico con l'andamento delle tue performance nel tempo per quell'esercizio.
-   **Community:** Puoi scaricare esercizi condivisi da altri utenti o condividere i tuoi (solo esercizi personali).

[SCHERMATA: La vista Allenamento con le due sezioni "Esercizi Ufficiali" e "Esercizi Personali".]

### 6. Classifier IDPA

Questa sezione è dedicata a registrare e tracciare le tue performance nei classifier ufficiali IDPA.

-   **Storico Tentativi:** La schermata principale mostra una lista di tutti i tuoi tentativi passati.
-   **Registra un Nuovo Tentativo:**
    1.  Clicca su **"Aggiungi Nuovo Tentativo"**.
    2.  Seleziona il Classifier, il tiratore e inserisci i punteggi per ogni stringa.
    3.  L'app calcolerà in tempo reale il **Tempo Totale** e la **Classificazione Proiettata**.
    4.  Clicca su **"Salva Tentativo"**.

[SCHERMATA: La schermata del Classifier con lo storico e il modulo di inserimento dati.]

### 7. Gestione Tiratori (Club & Tiratori)

Questo è il tuo hub centrale per tutti i tiratori, organizzati per club. I tiratori aggiunti qui possono essere facilmente importati nei match o selezionati nel timer.

-   **Aggiungi Club:** Crea un nuovo club o squadra.
-   **Aggiungi Tiratore al Club:** Crea il profilo di un nuovo tiratore all'interno di un club.
-   **Collegamento Account (Link):** Quando modifichi o crei un tiratore, puoi selezionare un **"Account Utente"** dalla lista degli utenti registrati nell'app (riconoscibili dall'email).
    *   **Perché farlo?** Collegando il profilo "Tiratore" all'account reale "Utente", abiliti la sincronizzazione automatica. Quando l'MD allena quel tiratore e salva la sessione, i dati vengono inviati istantaneamente anche all'app del tiratore.

[SCHERMATA: La schermata di gestione Tiratori con la lista dei club e il modulo di aggiunta.]

### 8. Gestione Match (Guida Completa)

Questa è la sezione più potente e flessibile dell'app. Il suo utilizzo varia in base al tuo ruolo.

#### Per il Match Director (MD)

Hai il pieno controllo su ogni aspetto della competizione.

**1. Creare un Nuovo Match:**
-   Vai alla scheda **Gare** e clicca su **"Crea Nuova Gara"**.
-   Segui i 3 step: inserisci i dettagli del match, aggiungi gli stage e importa i tiratori dalla tua lista globale.

**2. Pannello di Controllo del Match (Dashboard):**
-   **Classifica:** La vista principale con i punteggi aggiornati.
-   **Gestisci Match:** Organizza le squad, assegna gli SO, e gestisci tiratori e stage.
-   **Punteggio Live (P2P):** Avvia una sessione per la sincronizzazione dei punteggi in tempo reale (vedi sezione dedicata).

[SCHERMATA: Il pannello di controllo del match, con la sezione "Gestisci Match" aperta.]

#### Per il Safety Officer (SO)

Il tuo ruolo è focalizzato sull'inserimento dei punteggi per la tua squad.

1.  **Accedi al Match:** Seleziona il match a cui sei stato assegnato.
2.  **Vista Squad:** Vedrai automaticamente una vista che mostra solo i tiratori della tua squad.
3.  **Inserimento Punteggi:** Per ogni tiratore, clicca su **"Punteggio Stage"** per inserire i risultati.

[SCHERMATA: La vista dedicata per l'SO con la lista dei tiratori nella sua squad.]

#### Per l'Utente Standard (USER)

Puoi visualizzare i match e i loro risultati.
-   Seleziona un match dalla lista per accedere alla sua **Classifica** e vedere i punteggi aggiornati in tempo reale.

### 9. Funzionalità P2P (Punteggio Live)

Questa funzione permette a più dispositivi (es. un tablet per ogni SO) di inviare i punteggi a un dispositivo centrale (dell'MD) in tempo reale, anche senza una connessione internet stabile.

**Come funziona (per l'MD):**
1.  Dal pannello di controllo del match, nel box P2P, clicca su **"Avvia Hosting"**.
2.  Condividi l'**ID Host** o il **QR Code** con i tuoi SO.

**Come funziona (per l'SO):**
1.  Dal pannello di controllo del match, inserisci l'ID Host o scansiona il QR Code.
2.  Una volta connesso, ogni punteggio che inserirai verrà inviato automaticamente all'MD. In caso di perdita di connessione, i punteggi verranno messi in coda e inviati al ripristino della stessa.

[SCHERMATA: Il box P2P dal punto di vista dell'SO, con il campo per l'ID e il pulsante di scansione.]

### 10. Impostazioni

Personalizza la tua esperienza.

-   **Timer:** Regola la sensibilità del microfono e i ritardi del timer.
-   **Lingua:** Scegli tra Italiano e Inglese.
-   **Gestione Utenti (solo MD):** Visualizza la lista di tutti gli utenti registrati e cambia il loro ruolo (da USER a SO o MD).

[SCHERMATA: La schermata Impostazioni con le varie opzioni.]

---

### 11. Modalità Gara Veloce (Testa a Testa)

Questa modalità permette a due o più tiratori di competere uno contro l'altro sullo stesso dispositivo, in modo sequenziale per garantire la sicurezza.

**Come Funziona:**
1.  **Impostazione Gara:**
    *   Vai alla scheda **Gara Veloce**.
    *   Seleziona i tiratori partecipanti dalla lista.
    *   Scegli l'**Esercizio** su cui competere.
    *   Premi **"Inizia Competizione"**.

2.  **Turno del Tiratore:**
    *   L'interfaccia mostrerà di chi è il turno.
    *   Usa il timer come in una normale sessione di allenamento: premi **"INIZIA GARA"**.
    *   Una volta terminato l'esercizio, il timer si fermerà (automaticamente o manualmente).
    *   Inserisci le penalità nella schermata successiva.

3.  **Risultati:**
    *   Al termine del giro di tutti i tiratori, l'app mostrerà la classifica finale.
    *   Puoi consultare la classifica parziale anche durante la gara.

[SCHERMATA: La schermata di impostazione della modalità Gara Veloce.]

---

Grazie per aver scelto Shot Timer Pro! Speriamo che questa guida sia utile. Buon allenamento e in bocca al lupo per i tuoi match!