# Dino Companion Studio - Begleiter & Sprite Editor

Ein eigenstaendiger visueller Editor fuer Dino-Widget-Desk, um eigene Begleiter mit transparenten Sprites zu erstellen und zu bearbeiten.

## Schnellstart

Doppelklicke einfach auf `start_editor.bat` oder oeffne `index.html` direkt in deinem Webbrowser (Edge, Chrome, Firefox etc.). Es ist keine Installation oder Node.js erforderlich.

## Funktionen

1. **Bis zu 8 Bilder / Frames laden:**
   - Waehle bis zu 8 Bilder (PNG, JPG, WebP) per Drag & Drop oder Dateiauswahl.
   - Frames koennen frei sortiert, dupliziert oder geloescht werden.

2. **Hintergrund-Transparenz (Magic Wand / Pipette):**
   - Klicke auf eine Hintergrundfarbe im Bild, um diese vollstaendig transparent zu machen.
   - Mit dem Schieberegler fuer Toleranz lassen sich Raender sauber freistellen.
   - Schaltflaeche "Auf alle Frames anwenden": Entfernt die Hintergrundfarbe bei allen Frames mit nur einem Klick.

3. **Pixel-Genauigkeit & Groessenanpassung:**
   - Zielaufloesungen von 64x64 bis 160x160 Pixel waehlbar.
   - Zoom bis zu 800% mit Pixelgitter.
   - Rote Bodenlinie als Ausrichtungshilfe, damit die Fuesse des Begleiters bei jedem Schritt exakt auf derselben Hoehe stehen.
   - Manuelles Radiergummi-Werkzeug fuer feine Korrekturen.
   - Verschiebe-Werkzeug (Pan / Pfeiltasten), um Bilder im Raster auszurichten.

4. **Live-Animationsvorschau:**
   - Echtzeit-Vorschau der Laufanimation mit anpassbarem Tempo (FPS).
   - Simulationsmodus: Laeuft horizontal hin und her, genau wie auf dem Desktop.
   - Verschiedene Vorschau-Hintergruende (Transparenz-Karo, Dunkel, Gruen, Hell).

5. **Begleiter-Metadaten & 1-Klick-Export:**
   - Name, Symbol/Icon, Beschreibung, Autor, Skalierung und Tempo konfigurierbar.
   - "Als .companion.json speichern": Generiert die fertige Addon-Datei, die direkt in den `companions` Ordner des Dino-Widget-Desk gelegt werden kann.
   - Bestehende `.companion.json` Dateien koennen jederzeit zur Nachbearbeitung geoeffnet werden.
