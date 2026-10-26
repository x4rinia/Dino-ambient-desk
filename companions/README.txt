# Dino-Widget-Desk — Begleiter-Addons (Companions)

In diesem Ordner werden Begleiter für das Dino-Widget-Desk abgelegt.

## Wie funktioniert das?

Jeder Begleiter ist eine einzelne, eigenständige `.companion.json` Datei:
- Keine tausenden Einzel-Dateien mehr nötig
- Vollständig portabel (eine einzige Datei enthält Name, Beschreibung und alle Animations-Frames)
- Kann einfach heruntergeladen, hier abgelegt oder direkt in der App über "Addon importieren" geladen werden!

## Vorinstallierte Begleiter

- `ankylosaurus.companion.json`: Der offizielle Dino-Begleiter
- `biene.companion.json`: Flotte Honigbiene
- `diddl.companion.json`: Niedliche Springmaus
- `drache.companion.json`: Kleiner Drache
- `elfe.companion.json`: Zauberhafte Elfe
- `hund1.companion.json`: Mops-Welpe
- `hund2.companion.json`: Terrier
- `katze1.companion.json`: Graue Katze
- `katze2.companion.json`: Rote Katze
- `optimus.companion.json`: Cyber-Transformer
- `robot.companion.json`: Futuristischer Roboter
- `troll.companion.json`: Waldtroll

## Eigenen Begleiter erstellen

Eine `.companion.json` Datei hat folgende Struktur:
```json
{
  "id": "mein_begleiter",
  "name": "Mein Begleiter",
  "icon": "✨",
  "description": "Beschreibung meines Begleiters",
  "author": "Dein Name",
  "version": "1.0.0",
  "scale": 100,
  "speed": 100,
  "preview": "data:image/png;base64,...",
  "sprites": {
    "walk": ["data:image/png;base64,...", "..."],
    "tail": ["data:image/png;base64,...", "..."],
    "jump": ["data:image/png;base64,...", "..."]
  }
}
```
Sobald eine Datei in diesen Ordner gelegt wird, erkennt Dino-Widget-Desk sie automatisch!
