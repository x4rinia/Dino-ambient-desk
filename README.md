<div align="center">

<img src="./app_icon.png" width="128" height="128" alt="Dino Ambient Deck Logo" />

# 🦖 Dino_ambient_Deck

**Elegantes Ambient Desktop-Dashboard & Widget für Windows 10/11**  
*Rahmenloses Glassmorphism-Design mit transparenten Schwebekarten, interaktivem Pixel-Dino, bearbeitbaren Kalendernotizen und Zyklus-Tracker.*

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512bd4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078d4?style=flat-square&logo=windows)](https://microsoft.com/windows)

---

### 📸 Beispiel-Vorschau (Live Ambient Dashboard)

<img src="./preview.jpg" width="100%" alt="Dino Ambient Deck Vorschau" />

</div>

---

## ✨ Features & Highlights

1. **Echtes Windows-Hintergrundbild mit 3 Widget-Stilen:**
   - Zwischen den Widgets wird immer das echte, gestochen scharfe Windows-Desktop-Hintergrundbild angezeigt.
   - **🪟 Glas-Effekt:** Edle Milchglas-Karten mit sanfter Lichtbrechung.
   - **🌫️ Geblurrt:** Nur der Bereich hinter den einzelnen Widgets wird weichgezeichnet.
   - **⬛ Schwarz:** Tiefschwarze minimalistische Panels.

2. **Frei verschiebbare Widgets (Verschiebe-Modus):**
   - Jedes Widget (Überschrift, Uhr & Kalender, Zyklus-Tracker, Hardware-Vitals, Countdown, Dino-Ankerpunkt) lässt sich bei geöffnetem Einstellungsfenster frei mit der Maus an jede Wunschposition verschieben.
   - Positionen bleiben nach dem Speichern pixelgenau an Ort und Stelle.
   - Bleibt im normalen Modus 100% klick-transparent wie ein echtes Hintergrundbild.

3. **🦕 4 Dino-Begleiter mit automatischer Wechsel-Liste:**
   - **🛡️ Ankylosaurus**, **👑 Triceratops**, **⚡ Stegosaurus** und **🌿 Brachiosaurus** mit individuellen Pixel-Animationen.
   - **Wechsel-Liste mit Häkchen:** Du entscheidest über Checkboxen, welche Dinos im automatischen Wechselmodus rotieren sollen.
   - **Verschiebbarer Ankerpunkt:** Der Dino läuft in seinem Radius um den gesetzten Punkt und verlässt niemals das Bild.

4. **📅 Bearbeitbare Kalendernotizen (max. 3 aktiv):**
   - Direkt in den Einstellungen editierbar (Titel & Datum/Uhrzeit).
   - Abgelaufene Termine werden automatisch gelöscht.
   - Optionaler Import externer Kalender über **Google Kalender / iCal URL (`.ics`)**.

5. **🌸 Zyklus-Kalender (Frauen-Zyklus):**
   - Übersichtliche Anzeige der aktuellen Zyklusphase, Zyklustag, Periodenstatus und Countdown zum nächsten Zyklus inklusive grafischer Verlaufsleiste (ohne Jahreszeiten-Metaphern).

6. **⚡ System-Tray & Einstellungen:**
   - Läuft diskret im Windows-Infobereich (System-Tray) mit Rechtsklick-Menü (`Einstellungen` und `Beenden`).
   - Taskleisten-Eintrag für das Hintergrund-Widget ist ausgeblendet.

---

## 🚀 Download & Schnellstart

1. Lade dir die fertige **[Dino_ambient_Deck.zip](file:///h:/Dino-Widget-Desk/Dino_ambient_Deck.zip)** herunter und entpacke sie.
2. Starte direkt die `Dino_ambient_Deck.exe`.
3. Klicke im Infobereich (unten rechts neben der Windows-Uhr) auf das Dino-Symbol, um die Einstellungen zu öffnen.

---

## 🛠️ Entwicklung & Build

### Voraussetzungen
* Windows 10/11
* [.NET 10 SDK](https://dotnet.microsoft.com/)
* [Node.js 18+](https://nodejs.org/)

### Frontend bauen
```powershell
npm --prefix frontend run build
```

### Single-File .exe erstellen
```powershell
dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o ".\bin\PublishSingleFile"
```
