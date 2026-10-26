<div align="center">

<img src="./dino_preview.png" width="260" alt="Ankylosaurus Dino Begleiter" />

# Dino-ambient-desk

**Ambient Desktop-Dashboard und Widget fuer Windows 10 und 11**  
*Rahmenloses Glassmorphism-Design mit transparenten Schwebekarten, animiertem Ankylosaurus-Begleiter, Kalender-Notizen, System-Monitoring und flexibler Modulanordnung.*

[![GitHub Release](https://img.shields.io/github/v/release/x4rinia/Dino-ambient-desk?style=flat-square&color=38bdf8)](https://github.com/x4rinia/Dino-ambient-desk/releases)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-512bd4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078d4?style=flat-square&logo=windows)](https://microsoft.com/windows)

</div>

---

## Uebersicht

Dino-ambient-desk ist ein leichtgewichtiges, aushilfsfreies Desktop-Dashboard fuer Windows 10 und 11. Es integriert sich nahtlos in den Desktop-Hintergrund, laeuft ressourcenschonend im Hintergrund und bietet sowohl praktische Widgets fuer den Alltag als auch einen charmanten, handanimierten Ankylosaurus-Begleiter.

---

## Alle Funktionen im Detail

### 1. Animierter Ankylosaurus-Begleiter (Transparent freigestellt)
* **Natuerliche 4-Frame-Laufanimation:** Geht fluessig und gleichmaessig ueber seinen eingestellten Laufbereich hin und her, ohne unruhiges Drehen oder hinkende Bewegungsablaeufe.
* **Keulen-Wedeln mit Glitzereffekt:** Bleibt zwischendurch stehen und schwingt froehlich seine Schwanzkeule.
* **Freudensprung:** Geht kurz in die Knie und huepft vor Freude mit ausgestreckten Armen in die Luft.
* **Individuell ein- und ausschaltbare Animationen:** Jede der drei Aktionen (Laufen, Keulen-Wedeln, Freudensprung) kann in den Einstellungen ueber Kontrollkaestchen einzeln aktiviert oder deaktiviert werden.
* **Ruhemodus / Auf der Stelle stehen:** Wird das Laufen deaktiviert, bleibt der Dino ruhig an seinem Ankerpunkt stehen. Sind alle Animationen deaktiviert, verharrt er friedlich im Standbild.
* **Stufenlose Skalierung (Dino-Groesse):** Ueber einen Schieberegler von 50% bis 160% in 5%-Schritten skalierbar. Durch die Verankerung an den Fuessen bleibt der Dino bei jeder Groesse exakt auf der Standlinie.
* **Geschwindigkeit, Transparenz und Laufbreite:** Tempo (50% bis 160%), Transparenz (20% bis 100%) und die Weite des Laufbereichs (300px bis 850px) sind frei einstellbar.
* **Visuelle Ausrichtungshilfe:** Bei geoeffneten Einstellungen wird der gesamte Laufbereich mit einem gruen gestrichelten Rahmen dargestellt und kann per Maus an jede Wunschposition auf dem Bildschirm gezogen werden. Nach dem Speichern wird der Rahmen vollstaendig unsichtbar.

### 2. Desktop-Hintergrund und 3 Widget-Stile
* **Echtes Desktop-Hintergrundbild:** Zwischen den Widgets bleibt das bestehende, hochauflösende Windows-Hintergrundbild sichtbar.
* **Glas-Effekt:** Edle Milchglas-Optik mit feiner Lichtbrechung und dezenten Kanten.
* **Geblurrt:** Selektive Hintergrundunschaerfe direkt hinter den Widgets.
* **Schwarz:** Kontraststarke, tiefschwarze Panels fuer maximale Lesbarkeit.

### 3. Uhrzeit und Kalender (Clock & Calendar)
* **Digitale Zeitanzeige:** Grosse, gut lesbare Zeitanzeige inklusive Sekundenanzeige und Datum mit Wochentag.
* **Standardisierte Kalenderwoche:** Korrekte Berechnung und Anzeige der Kalenderwoche nach internationalem ISO-8601-Standard (KW-Anzeige).
* **Monatskalender:** Kompaktes Kalenderraster mit Markierung des aktuellen Tages.
* **Termin-Markierung:** Tage mit hinterlegten Notizen oder Terminen werden durch eine deutliche schwarze Umrandung hervorgehoben.

### 4. Kalender-Notizen und Terminverwaltung
* **Dashboard-Notizen:** Bis zu drei Termine oder Aufgaben direkt im Widget sichtbar.
* **Einfache Bearbeitung:** Titel, Datum und Uhrzeit koennen im Einstellungsfenster direkt eingetragen werden.
* **Automatische Bereinigung:** Abgelaufene Termine werden nach Ablauf automatisch entfernt.
* **Kalender-Synchronisation:** Unterstuetzt den Import externer Kalenderdaten via Google Kalender oder iCal-URL (.ics).

### 5. Frauen-Zyklus-Tracker (Cycle Tracker)
* **Uebersichtliche Phasenanzeige:** Zeigt die aktuelle Zyklusphase, den aktuellen Zyklustag und den Status der Periode.
* **Vorhersage und Countdown:** Berechnet die Tage bis zur naechsten Periode.
* **Grafische Verlaufsleiste:** Strukturierte Visualisierung des Fortschritts ohne ueberladene Metaphern.

### 6. Mondkalender (Moon Calendar)
* **Aktuelle Mondphase:** Detaillierte visuelle Darstellung der Mondphase (Neumond, zunehmender Mond, Vollmond, abnehmender Mond).
* **Beleuchtungsgrad:** Genaue prozentuale Angabe der sichtbaren Mondflaeche.
* **Mondzeiten:** Anzeige der Zeiten fuer Mondaufgang und Monduntergang.

### 7. System-Vitals und Hardware-Monitor
* **Prozessor (CPU):** Anzeige der aktuellen CPU-Auslastung in Prozent sowie der Kerntemperatur.
* **Grafikkarte (GPU):** Auslastungsanzeige und Temperatur des Grafikprozessors.
* **Arbeitsspeicher (RAM):** Belegter und verfuegbarer Arbeitsspeicher in Echtzeit.
* **Netzwerk:** Live-Anzeige der aktuellen Upload- und Download-Geschwindigkeit.

### 8. Event-Countdown
* **Zieldatum und Event-Name:** Frei waehlbarer Titel fuer besondere Ereignisse (z. B. Urlaub, Geburtstag, Jahrestag, Pruefung).
* **Live-Zaehler:** Sekundenaktuelle Rueckwaertszaehlung in Tagen, Stunden, Minuten und Sekunden.

### 9. Schnellzugriff (Quick Launcher)
* **Schnellstart-Schaltflaechen:** Direkte Verknuepfungen zu haeufig genutzten Kommunikationsdiensten wie E-Mail (z. B. Gmail), Discord oder WhatsApp Web.
* **Frei konfigurierbar:** Schaltflaechen koennen einzeln aktiviert oder deaktiviert werden.

### 10. Dashboard-Kopfzeile
* **Frei anpassbarer Titel:** Optionaler Kopfzeilentext oben auf dem Desktop.
* **Vollstaendig anpassbar oder deaktivierbar:** Kann nach Wunsch angepasst oder bei Bedarf komplett ausgeblendet werden.

### 11. Frei verschiebbare Widgets (Drag & Drop Modus)
* **Freie Platzierung:** Bei geoeffnetem Einstellungsfenster laesst sich jedes einzelne Widget mit der Maus frei an die gewuenschte Position auf dem Desktop ziehen.
* **Dauerhafte Speicherung:** Alle Koordinaten werden in der lokalen Konfigurationsdatei gespeichert.
* **Vollstaendig klick-transparent:** Im Normalbetrieb reagiert das Dashboard wie ein echtes Wallpaper, blockiert keine Desktop-Klicks und behindert keine Windows-Symbole.

### 12. Ressourcen-Effizienz und System-Tray
* **Geringer Arbeitsspeicherverbrauch:** Dank automatischem Working-Set-Trimming liegt die Speichernutzung im Betrieb bei typischerweise nur 40 bis 80 MB RAM.
* **Diskret im System-Tray:** Kein stoerender Eintrag in der Windows-Taskleiste; Steuerung laeuft diskret ueber das Dino-Icon im Infobereich neben der Windows-Uhr.
* **Multi-Monitor-Unterstuetzung:** Das Dashboard laesst sich flexibel auf den gewuenschten Monitor zuweisen.

---

## Download und Schnellstart

1. Lade das fertige Release **[Dino_ambient_Deck.zip](https://github.com/x4rinia/Dino-ambient-desk/releases)** herunter und entpacke den Ordner.
2. Starte die Anwendung ueber `Dino_ambient_Deck.exe`.
3. Klicke im Windows-Infobereich (System-Tray) mit der rechten Maustaste auf das Dino-Symbol, um die Einstellungen zu oeffnen.
4. Passe die gewuenschten Module, den Dino-Laufbereich und die Farben nach deinen Vorlieben an.

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
