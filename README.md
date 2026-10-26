<div align="center">

<p float="center">
  <img src="./dashboard_preview.png" width="340" alt="Dino Ambient Desk Dashboard Ansicht" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./dino_preview.png" width="220" alt="Ankylosaurus Dino Begleiter" />
</p>

# Dino-ambient-desk

**Ambient Desktop-Dashboard und Widget fuer Windows 10 und 11**  
*Rahmenloses Glassmorphism-Design mit transparenten Schwebekarten, animierten Desktop-Begleitern, Kalender-Notizen, System-Monitoring, Dino Companion Studio und flexibler Modulanordnung.*

[![GitHub Release](https://img.shields.io/github/v/release/x4rinia/Dino-ambient-desk?style=flat-square&color=38bdf8)](https://github.com/x4rinia/Dino-ambient-desk/releases)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-512bd4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078d4?style=flat-square&logo=windows)](https://microsoft.com/windows)

</div>

---

## Uebersicht

Dino-ambient-desk ist ein leichtgewichtiges, modernes Desktop-Dashboard fuer Windows 10 und 11. Es integriert sich nahtlos in den Desktop-Hintergrund, laeuft ressourcenschonend und bietet praktische Widgets fuer den Alltag sowie anpassbare, animierte Schreibtisch-Begleiter.

In der Dashboard-Ansicht sind die verfuegbaren Widgets frei anordbar:
* **Uhrzeit & Datum:** Grosse Zeitanzeige, Wochentag, Kalender mit ISO-8601 Kalenderwoche (KW) und naechste Termine
* **Termine & Notizen:** Ganztagig sichtbare Termine, die erst nach Mitternacht des Tages verstreichen
* **Frauen-Zyklus-Tracker:** Diskrete Perioden- und Zyklusvorhersage inklusive Tagebuch
* **Hardware System Vitals:** Echtzeit-Balken fuer CPU, RAM und GPU
* **Desktop-Begleiter:** Drei integrierte Standard-Begleiter (Drache, Ankylosaurus, Biene) sowie eigene Kreationen ueber das integrierte Dino Companion Studio
* **Mondkalender:** Aktuelle Mondphase mit Beleuchtungsgrad und Tagen bis zum naechsten Vollmond/Neumond
* **Event-Countdown:** Sekundenaktuelle Restzeit bis zum gewuenschten Zieldatum

---

## Alle Funktionen im Detail

### 1. Animierte Schreibtisch-Begleiter & Addon-System
* **Begleiter-Auswahl per Knopfdruck:** Ueber einen eigenen Button in den Einstellungen koennen alle Begleiter uebersichtlich in einer Galerie angezeigt und per Klick aktiviert werden.
* **Drei integrierte Standard-Begleiter (Dino Desk Team):**
  * **Drache:** Der treue violette Drache (geschuetzter Standard-Begleiter).
  * **Ankylosaurus:** Der klassische Original-Dino mit Laufen, Keulen-Wedeln und Freudensprung (exklusiv geschuetzt).
  * **Biene:** Die kleine Honigbiene, die sanft in der Luft schwebt und summt (geschuetzter Standard-Begleiter).
* **Schutzmechanismen:** Alle Standard-Begleiter sind vor versehentlichem Loeschen oder Ueberschreiben geschuetzt.
* **Kompaktes Addon-Dateiformat (.companion.json):** Jeder Begleiter ist in einer einzigen Datei gebuendelt (Name, Beschreibung, Vorschaubild und alle Animations-Frames).
* **Ordner-Zugriff & Live-Erkennung:** Eigene Begleiter lassen sich einfach ueber den Button "Ordner oeffnen" in das Begleiter-Verzeichnis ablegen. Das Dashboard erkennt neu hinzugefuegte Begleiter automatisch in Echtzeit.
* **Fokussierte Animationen:** Alle Begleiter verfuegen ueber eine gleichmaessige, natuerliche 4-Frame-Lauf- oder Schwebeanimation. Der Ankylosaurus besitzt zusaetzlich Keulen-Wedeln und einen Freudensprung.
* **Individuell ein- und ausschaltbare Animationen:** Das Laufen/Fliegen kann in den Einstellungen flexibel aktiviert oder deaktiviert werden. Fuer den Ankylosaurus lassen sich Keulen-Wedeln und Freudensprung separat steuern.
* **Ruhemodus / Auf der Stelle stehen:** Wird das Laufen deaktiviert, bleibt der Begleiter ruhig an seinem Ankerpunkt stehen.
* **Stufenlose Skalierung:** Ueber einen Schieberegler von 50% bis 160% in 5%-Schritten skalierbar. Durch die Verankerung an den Fuessen bleibt der Begleiter bei jeder Groesse exakt auf der Standlinie.
* **Geschwindigkeit, Transparenz und Laufbreite:** Tempo (50% bis 160%), Transparenz (20% bis 100%) und die Weite des Laufbereichs (300px bis 850px) sind frei einstellbar.
* **Visuelle Ausrichtungshilfe:** Bei geoeffneten Einstellungen wird der gesamte Laufbereich mit einem gruen gestrichelten Rahmen dargestellt und kann per Maus an jede Wunschposition auf dem Bildschirm gezogen werden.
* **Integrierter Begleiter-Editor (Dino Companion Studio):** Mit einem Klick auf "Begleiter-Editor oeffnen" startet das Studio im Browser. Eigene Charaktere koennen mit MS Paint Werkzeugen gezeichnet, animiert und als `.companion.json` exportiert werden.

### 2. Dino Companion Studio (Sprite-Editor im MS Paint Stil)
* **Vollstaendige MS Paint Werkzeugleiste:**
  * **Stift:** Frei Hand zeichnen mit kontinuierlichen Linien.
  * **Farbeimer:** Flaechen zusammenhaengend mit Farbe oder Transparenz fuellen.
  * **Radierer:** Pixel transparent wegradieren mit einstellbarer Pinselstaerke.
  * **Hintergrund loeschen:** Zauberstab zur automatischen Freistellung von Hintergruenden mit einstellbarer Toleranz.
  * **Pipette:** Farben direkt aus der Zeichnung aufnehmen.
  * **Verschieben:** Bild bequem per Mausziehen auf der Leinwand positionieren.
* **MS Paint Farbpalette:** 22 vordefinierte Farben, Farbwähler fuer eigene Farben und ein Schachbrett-Feld fuer echte Transparenz.
* **Bis zu 8 Frames & Animations-Vorschau:** Live-Vorschau mit einstellbarem Tempo (FPS) und Standlinie.
* **Beispiel-Sprite inklusive:** Ein integrierter, animierter Beispiel-Dino laedt automatisch als Vorlage.
* **1-Klick-Export:** Speichert fertige Kreationen direkt als `.companion.json` oder laedt alle Einzel-Frames als PNG herunter.

### 3. Desktop-Hintergrund und 2 Widget-Stile
* **Echtes Desktop-Hintergrundbild:** Zwischen den Widgets bleibt das bestehende Windows-Hintergrundbild sichtbar.
* **Geblurrt:** Selektive Hintergrundunschaerfe direkt hinter den Widgets, waehrend das Hintergrundbild dazwischen gestochen scharf bleibt.
* **Schwarz:** Kontraststarke, tiefschwarze Panels fuer maximale Lesbarkeit.

### 4. Uhrzeit und Kalender (Clock & Calendar)
* **Digitale Zeitanzeige:** Grosse, gut lesbare Zeitanzeige inklusive Sekundenanzeige und Datum mit Wochentag.
* **Standardisierte Kalenderwoche:** Korrekte Berechnung und Anzeige der Kalenderwoche nach internationalem ISO-8601-Standard (KW-Anzeige).
* **Monatskalender:** Kompaktes Kalenderraster mit Markierung des aktuellen Tages.
* **Termin-Markierung:** Tage mit hinterlegten Notizen oder Terminen werden hervorgehoben.

### 5. Kalender-Notizen und Terminverwaltung
* **Dashboard-Notizen:** Bis zu drei Termine oder Aufgaben direkt im Widget sichtbar.
* **Einfache Bearbeitung:** Titel, Datum und Uhrzeit koennen im Einstellungsfenster direkt eingetragen werden.
* **Ganztagig sichtbare Termine:** Termine des aktuellen Tages bleiben den gesamten Tag ueber bis Mitternacht sichtbar. Erst wenn der Kalendertag vollstaendig verstrichen ist, werden abgelaufene Termine automatisch entfernt.
* **Kalender-Synchronisation:** Unterstuetzt den Import externer Kalenderdaten via Google Kalender oder iCal-URL (.ics).

### 6. Frauen-Zyklus-Tracker (Cycle Tracker)
* **Diskrete Uebersicht:** Zeigt die aktuelle Zyklusphase, den Zyklustag und die verbleibenden Tage bis zur naechsten Periode.
* **Individuell anpassbar:** Zykluslaenge (z. B. 28 Tage), Periodendauer (z. B. 5 Tage) und Startdatum sind frei konfigurierbar.
* **Symptom-Tagebuch:** Schnelles Erfassen von Stimmungen und koerperlichen Symptomen.

### 7. Mondkalender (Moon Calendar)
* **Astronomische Genauigkeit:** Praezise Berechnung der aktuellen Mondphase, des Beleuchtungsgrads in Prozent und der Tage bis zum naechsten Vollmond oder Neumond.

### 8. Event-Countdown (Countdown Timer)
* **Sekundengenaue Restzeit:** Tage, Stunden, Minuten und Sekunden bis zum gewuenschten Datum.

### 9. Hardware System Vitals
* **Echtzeit-Monitoring:** CPU-Auslastung, RAM-Belegung und GPU-Last ueber performante Windows-APIs.

### 10. Freie Modulanordnung & Drag-and-Drop
* **Flexibles Verschieben:** Jedes Widget kann im Bearbeitungsmodus frei auf dem Bildschirm verschoben werden.
* **Positions-Reset:** Mit einem Klick auf "Positionen automatisch anordnen" laesst sich die Standard-Anordnung jederzeit wiederherstellen.

### 11. Desktop-Integration
* **Unterstuetzung fuer Wallpaper Engine:** Laeuft stabil zusammen mit animierten Desktop-Hintergruenden.
* **Kein Klick-Blockieren:** Liegt nahtlos auf dem Desktop wie ein echtes Wallpaper und behindert keine Windows-Symbole.

### 12. Ressourcen-Effizienz und System-Tray
* **Geringer Arbeitsspeicherverbrauch:** Liegt im Betrieb bei typischerweise nur 40 bis 80 MB RAM.
* **Diskret im System-Tray:** Steuerung laeuft diskret ueber das Dino-Icon im Infobereich neben der Windows-Uhr.
* **Multi-Monitor-Unterstuetzung:** Das Dashboard laesst sich flexibel auf den gewuenschten Monitor zuweisen.

---

## Download und Schnellstart

1. Lade das Release-Archiv **[Dino_ambient_Deck.zip](https://github.com/x4rinia/Dino-ambient-desk/releases)** herunter und entpacke den Ordner.
2. Starte die Anwendung ueber `Dino_ambient_Deck.exe`.
3. Klicke im Windows-Infobereich (System-Tray) mit der rechten Maustaste auf das Dino-Symbol, um die Einstellungen zu oeffnen.
4. Klicke in den Einstellungen auf "Begleiter auswaehlen", um zwischen Drache, Ankylosaurus und Biene zu wechseln, oder klicke auf "Begleiter-Editor oeffnen", um eigene Charaktere zu zeichnen.

---

## Entwicklung und Build

### Voraussetzungen
* Windows 10 oder Windows 11 (64-Bit)
* .NET 10 SDK
* Node.js 18+ und npm

### Repository klonen
```powershell
git clone https://github.com/x4rinia/Dino-ambient-desk.git
cd Dino-ambient-desk
```

### Frontend bauen
```powershell
npm --prefix frontend install
npm --prefix frontend run build
```

### Single-File .exe erstellen
```powershell
dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ".\bin\PublishSingleFile"
```

---

<div align="center">
  <sub>Dino-ambient-desk | Open-Source Desktop Widget Dashboard</sub>
</div>
