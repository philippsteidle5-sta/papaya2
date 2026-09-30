# Integration des All-in-One Kalenders in das Focus Canvas

Nahtlose Einbettung des bereinigten, minimalistischen Termin- und Abonnement-Kalenders direkt in das Focus Canvas (`MultiAssistantCanvas`), sodass Termine, Subscriptions, Privates und Meetings auch im ablenkungsfreien Fokusmodus sofort abruf- und verwaltbar sind.

---

## User Review & Kritische Entscheidungen

> [!IMPORTANT]
> **Zusammenfassung & Entscheidungen:**
> - **Nahtlose Dock-Integration:** Im Clean Focus Dock am unteren Bildschirmrand wird neben Chat, Mikrofon und Core-Orb ein dedizierter Kalender-Trigger (`Calendar`-Icon mit Event-Zähler) ergänzt.
> - **Optische Harmonie im Focus Canvas:** Der Kalender öffnet sich als schwebende, abgedunkelte Glas-Karte (`bg-[#080911]/95 border border-white/10 backdrop-blur-2xl`) mit weichen Ecken (`rounded-3xl`), exakt abgestimmt auf das visuelle Design des Focus-Chatfensters und des 3D-Canvas.
> - **Kein Verlassen des Fokusmodus:** Im Focus Mode (`isFocusMode = true`) bleibt der Kalender voll funktionsfähig, ohne den Benutzer aus dem Canvas oder der Konversation mit den KI-Cores zu reißen.

---

## 1. Übersicht & Kernkonzept

- **Was es macht:** Ermöglicht dem Nutzer, Termine (Meetings, Privat, Rechnungen, Fokus-Sessions) und wiederkehrende Subscriptions direkt im 3D-Partikel Focus Canvas einzusehen, anzulegen und zu verwalten, ohne den ablenkungsfreien Modus zu verlassen oder Fenster wechseln zu müssen.
- **Zielgruppe:** Produktive Nutzer, die im Focus Canvas mit den KI-Assistenten arbeiten und gleichzeitig ihre Termine, Fristen und anstehende Zahlungen im Blick behalten wollen.
- **Mehrwert:** 1-Klick-Zugriff auf den Kalender direkt aus dem Focus Dock; kein Kontextwechsel nötig.

---

## 2. User Experience & Visuelles Design

### Benutzerinteraktions-Flows:
1. **Öffnen über das Focus Dock:**
   - Klick auf das neue Kalender-Symbol im zentrierten Schwebemodock (`#clean-focus-dock`).
   - Die saubere Kalenderkarte gleitet geschmeidig ein (unten zentriert oder als elegantes Popover neben dem Chatfenster).
2. **Kompakte & Erweiterte Ansicht:**
   - Standardmäßig erscheint die exakt vom Nutzer gelobte, kompakte Kalenderkarte (Monats-/Wochensicht, 5 Kategorien: Meeting, Privat, Subscriptions, Rechnungen, Fokus).
   - Bei Bedarf kann die Karte vergrößert oder verschoben werden.
3. **Schnelle Terminerstellung:**
   - Der violette `+`-Button öffnet das Schnelleintrags-Formular direkt auf der Karte.
   - 1-Klick-Presets (z. B. "Meeting eintragen", "Subscription hinterlegen") erleichtern den Schnellstart.
4. **Schließen:**
   - Über das `X`-Symbol in der Kalenderkarte oder erneuten Klick im Dock schließt sich das Overlay sanft.

### Visuelle Identität:
- **Atmosphäre:** Cyberpunk-Minimalismus, tiefschwarzer Hintergrund (`#080911`), transluzentes Glas mit `backdrop-blur-2xl`.
- **Akzente:** Dynamische Agentenfarben (z. B. Warmorange `#ff6b35` bis Fuchsia `#ff2a8d` oder Cyan `#00f2fe`), feine 1px weiße Ränder (`border-white/10`).
- **Typografie:** Feste Monospace-Zahlen (`font-mono`) für Daten und Währungsbeträge, serifenlose Headings (`font-sans font-bold`).

---

## 3. Wichtige Produktentscheidungen & Abwägungen

- **Entscheidung 1: Schwebendes Overlay vs. fester Split-Screen**
  - *Gewählter Ansatz:* Schwebendes Glassmorphism-Overlay (analog zum bestehenden Focus-Chat-Card).
  - *Warum:* Erhält die 3D-Raumtiefe des Focus Canvas und die Partikelanimation, ohne das Blickfeld dauerhaft zu verengen.
  - *Alternative verworfen:* Fester Split-Screen würde das immersive Raumgefühl des Canvas zerstören.

- **Entscheidung 2: Zentraler vs. lokaler State**
  - *Gewählter Ansatz:* Die Kalenderevents synchronisieren sich über den bestehenden LocalStorage-Store (`chronos_calendar_events_v2`), sodass Daten im Standard-Dashboard und im Focus Canvas identisch und echtzeit-synchron sind.
  - *Warum:* Verhindert Dateninkonsistenzen und doppelte Speicherlogik.

---

## 4. Technische Architektur & Datenstrategie

```
┌─────────────────────────────────────────────────────────────┐
│                       Focus Canvas                          │
│                 (MultiAssistantCanvas.tsx)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │    3D Particle Orb    │       │ Embedded Chat Popover │  │
│  │   & Three.js Canvas   │       │ (clean-embedded-chat) │  │
│  └───────────────────────┘       └───────────────────────┘  │
│                                                             │
│              ┌───────────────────────────────┐              │
│              │    Chronos Calendar Card      │  <── NEU     │
│              │  (Eingebettet / Schwebend)    │              │
│              │  - Monats- / Wochengrid       │              │
│              │  - 5 Kategorien-Filter        │              │
│              │  - Schnellerfassung           │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│  ┌───────────────────────────┴───────────────────────────┐  │
│  │                 Clean Focus Dock                      │  │
│  │  [Agent]  [Scope]  [Mic]  [Chat]  [Kalender]  [Brain] │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    Shared Event Storage       │
               │ (localStorage: chronos_events)│
               └───────────────────────────────┘
```

### Komponenten-Änderungsplan:
1. **`src/components/MultiAssistantCanvas.tsx`:**
   - Props um `onToggleCalendar` und `isCalendarOpen` erweitern (oder internen State steuern).
   - Kalender-Button im Clean Focus Dock hinzufügen (neben Chat & Mic).
   - Schwebendes Overlay des bereinigten Kalenders direkt in das Focus Canvas integrieren.
2. **`src/App.tsx`:**
   - Anbindung von `calendarWidget` im Focus Mode freischalten, sodass das Widget im Fokusmodus gezielt geöffnet und gesteuert werden kann.
3. **`src/components/ChronosCalendarWidget.tsx`:**
   - Sicherstellen, dass die Karte im Canvas-Modus optimal positioniert ist (zentriert/schwebend, `z-40`, kein Overflow).
