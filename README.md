<div align="center">

<img src="./dino_preview.png" width="260" alt="Ankylosaurus Dino Begleiter" />

# Dino-ambient-desk

**Ambient Desktop-Dashboard und Widget fuer Windows 10 und 11**  
*Rahmenloses Glassmorphism-Design mit transparenten Schwebekarten, animiertem Ankylosaurus-Begleiter, bearbeitbaren Kalendernotizen und Frauen-Zyklus-Tracker.*

[![GitHub Release](https://img.shields.io/github/v/release/x4rinia/Dino-ambient-desk?style=flat-square&color=38bdf8)](https://github.com/x4rinia/Dino-ambient-desk/releases)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-512bd4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078d4?style=flat-square&logo=windows)](https://microsoft.com/windows)

</div>

---

## Features und Highlights

### 1. Echtes Windows-Hintergrundbild mit 3 Widget-Stilen
* Zwischen den Widgets wird immer das echte, gestochen scharfe Windows-Desktop-Hintergrundbild angezeigt.
* **Glas-Effekt:** Edle Milchglas-Karten mit sanfter Lichtbrechung.
* **Geblurrt:** Nur der Bereich hinter den einzelnen Widgets wird weichgezeichnet.
* **Schwarz:** Tiefschwarze minimalistische Panels.

### 2. Animierter Ankylosaurus-Begleiter (Transparent freigestellt)
* **Laufen von links nach rechts:** Wandert ruhig und gleichmaessig ueber die konfigurierbare Laufbereich-Breite ohne unruhiges staendiges Umdrehen.
* **Springen und Freuen:** Geht ab und zu in die Knie, springt froehlich hoch in die Luft, jubelt mit offenen Armen und landet sanft wieder auf den Fuessen.
* **Nach vorn schauen:** Wendet den Kopf zur Kamera und schaut dich mit grossen, neugierigen Augen an.
* **Mit der Keule wedeln:** Bleibt stehen und wedelt mit seiner Schwanzkeule inklusive Bewegungs- und Glitzereffekt.
* **Schnelligkeit und Transparenz:** Tempo (50% bis 160%) und Deckkraft (20% bis 100%) frei ueber Schieberegler einstellbar.
* **Sichtbarer Laufbereich beim Einstellen:** Bei geoeffneten Einstellungen zeigt ein gestrichelter Rahmen genau die linke und rechte Grenze. Nach dem Speichern wird der Rahmen vollstaendig unsichtbar.

### 3. Zentrierte Ueberschrift und dezentes Branding
* Frei waehlbarer Text (z. B. `X4rinia und Dino <3`), zentriert ausgerichtet mit dezentem `by x4rinia` in der rechten unteren Ecke.

### 4. Frei verschiebbare Widgets (Verschiebe-Modus)
* Jedes Widget (Ueberschrift, Uhr und Kalender, Zyklus-Tracker, Hardware-Vitals, Countdown, Dino-Laufbereich) laesst sich bei geoeffnetem Einstellungsfenster frei mit der Maus an jede Wunschposition verschieben.
* Positionen bleiben nach dem Speichern pixelgenau an Ort und Stelle.
* Im normalen Modus 100% klick-transparent wie ein echtes Hintergrundbild.

### 5. Bearbeitbare Kalendernotizen (maximal 3 aktiv)
* Direkt in den Einstellungen editierbar (Titel sowie Datum und Uhrzeit).
* Abgelaufene Termine werden automatisch geloescht.
* Optionaler Import externer Kalender ueber Google Kalender oder iCal URL (.ics).

### 6. Zyklus-Kalender (Frauen-Zyklus)
* Uebersichtliche Anzeige der aktuellen Zyklusphase, Zyklustag, Periodenstatus und Countdown zum naechsten Zyklus inklusive grafischer Verlaufsleiste ohne Jahreszeiten-Metaphern.

### 7. System-Tray und Einstellungen
* Laeuft diskret im Windows-Infobereich (System-Tray) mit Rechtsklick-Menue (Einstellungen und Beenden).
* Taskleisten-Eintrag fuer das Hintergrund-Widget ist ausgeblendet.

---

## Download und Schnellstart

1. Lade dir die fertige **[Dino_ambient_Deck.zip](https://github.com/x4rinia/Dino-ambient-desk/releases)** herunter und entpacke sie.
2. Starte die Datei `Dino_ambient_Deck.exe`.
3. Klicke im Infobereich unten rechts neben der Windows-Uhr auf das Dino-Symbol, um die Einstellungen zu oeffnen.

---

## Entwicklung und Build

### Voraussetzungen
* Windows 10 oder 11
* .NET 10 SDK
* Node.js 18+

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
  <sub>Erstellt mit Sorgfalt by x4rinia</sub>
</div>
