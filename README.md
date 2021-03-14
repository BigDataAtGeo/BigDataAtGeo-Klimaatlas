# BigData@Geo Webplattform

## Installation

Konsole öffnen und in das Verzeichnis des Projekts wechseln, dann Abhängigkeiten installieren

```
cd code-bigdata-at-geo-webplatform
npm install
```

## Enwicklung

Generell empfiehlt es sich zur Entwicklung am Projekt die

- [Vue-Einführung](https://vuejs.org/v2/guide/)
- und den [Vue Style Guide](https://vuejs.org/v2/style-guide/)

durchzuarbeiten.

Konsole öffnen und in das Verzeichnis des Projekts wechseln, dann Server mit Live-Reloading starten.

```
npm run serve
```

## Deployment
```
npm run build
```

# Dokumentation

Folgende Abbildung zeigt grob, wie die Abhängigkeiten der Anwendung verlaufen.

![Architektur der Abhängigkeiten](docs/img/bdatgeo-architecture.png)

### App

Enthält Willkommensnachricht mit Anleitung zur Bedienung.
Bindet außerdem das Layout für den Inhalt ein, bisher gibt es nur ein Layout für Browser: *LayoutBrowser*.
Es wäre allerdings denkbar, Layouts für unterschiedliche Clients durch weitere Schichten zu unterstützen, z. B. *LayoutMobile*.

### LayoutBrowser

Verantwortlich für die räumliche Komposition aller Komponenten. 
Für Browser wird im oberen Teil die *SettingsSelection* angezeigt, 
den Hintergrund bildet die *ProjectionMap*
und auf der rechten Bildschirmseite werden zusätliche Widgets angezeigt.
Letztere haben einen *WidgetShell*-Wrapper, mit dem der Inhalt der Widgets ein-/ausgeklappt werden kann.

Außerdem ist Funktionalität enthalten, um die Breite des Widget-Containers per Drag-and-Drop einzustellen.
Das ist über den eingezeichneten roten Bereich möglich.

![LayoutBrowser](docs/img/layout-browser.png)

Das Layout bricht über einfache Media-Queries bei zu kleiner Fensterweite um, so dass der Inhalt stattdessen vertikal sequenziell angezeigt wird.

![LayoutBrowser](docs/img/layout-browser-vertical.png)

### ProjectionMap

Leaflet-basierte Karte die den gesamten Hintergrund des Fensters einnimmt.
Hier werden die Klimaprojektionen pro Koordinaten in Form von kleinen Zellen angezeigt.
Außerdem sind Icons für die Bodenfeuchtemessstationen enthalten.

Zellen und Stationen können mittels Linksklick ausgewählt werden, um weitere Informationen in anderen Widgets dazu anzuzeigen.
Durch Rechtsklick werden ausgewählte Zellen/Stationen aus der Auswahl entfernt und nicht ausgewählt der Auswahl hinzugefügt.

![ProjectionMap](docs/img/projection-map.png)

### SettingsSelection

Hier können die meisten Einstellungen getroffen werden.
Vor allem Variable, Szenario und Zeitraum der Klimaprojektion.
Außerdem kann über das Lupen-Icon nach einzelnen Orten auf der Karte gesucht werden.
Das Menü bietet als Dropdown die Optionen:
- die Willkommensnachricht erneut anzuzeigen,
- Informationen zur Datengrundlage anzuzeigen,
- das Impressum zu besuchen,
- den Datenschutz zu besuchen,
- einen Link mit den aktuellen Einstellungen zu generieren, z. B. um eine bestimmte Ansicht mit Kollegen zu teilen,
- und alle Einstellungen zurückzusetzen.

![SettingsSelection](docs/img/settings-selection.png)

### WidgetShell

Das ist ein Wrapper, um den Inhalt von Widgets per Klick ein- und ausklappen zu können.

![Widget Shell](docs/img/widget-shell.png)

### InformationText

Generisches Widget, um eine Kopfzeile und dazugehörigen Text anzuzeigen.

![InformationText](docs/img/information-text.png)

### CellLineChart

Dieses Widget zeigt den historischen Verlauf für auf der Karte auswählte Zellen unter den aktuellen Einstellungen,
also einer Kombination aus *Variable*, *Szenario* und *Zeitraum*, in Form eines Linienplots an.

![CellLineChart](docs/img/cell-line-chart.png)

### StationLineChartCarousel

Das ist ein Wrapper, um für jede ausgewählte Station ein *StationLineChart* in Form einer Slideshow anzuzeigen.
Über die Bulletpoints unten können die Slides für jede Station gewechselt werden.

![StationLineChartCarousel](docs/img/station-chart-carousel.png)

### StationLineChartCarousel

Dieses Widget zeigt die Sensorinformationen einer Station an. 
Hierbei können verschiedene Sensoren beliebig kombiniert werden.
Die Vorauswahl besteht aus Bodentemperatur, Niederschlag und Volumetric Water Content.
Über die Date-Inputs unterhalb des Plots kann das Min- und Maximum der X-Achse eingestellt werden.

Die Daten werden beim Laden des Widgets dafür von der API abgefragt. 
Da verschiedene Sensor-IDs zum selben Datensatz gehören, müssen diese in der Implementierung nachträglich kombiniert werden.

![StationLineChart](docs/img/station-chart.png)

### WeatherCarousel

Das ist ebenfalls ein Wrapper, der wie *StationLineChartCarousel* mehrere *WeatherLive*-Widgets in Form einer Slideshow anzeigt.

### WeatherLive

Dieses Widget fragt die OpenWeatherMap-API ab, um zu auf der Karte ausgewählten Zellen individuell Wetterinformationen,
wie Temperatur, Luftfeuchtigkeit oder Luftdruck, anzuzeigen.

![WeatherLive](docs/img/weather-live.png)

### Store

Instanz eines VueX-Stores, der die Einstellungen, wie ausgewählte Zellen/Stationen, Variable, Szenario, Zeitraum, ..., enthält.
Änderungen werden im Localstorage des Browsers gespeichert und beim nächsten Laden der Seite wiederhergestellt.
Enthält die URL beim Laden der Seite einen gültigen *?state=...*-Parameter, wird dieser stattdessen zur Initialisierung des Zustands verwendet.
Nur *SettingsSelection* und *ProjectionMap* schreiben in den *Store*.
Widgets warten auf Änderungen des Zustands und erstellen dann eine lokale Kopie davon.
Die lokale Kopie wird dann intern in den Widgets weiterverwendet.
