<template>
  <div id="app">
    <LayoutBrowser/>
    <div>
      <b-modal id="modal-welcome" size="xl" :title="'Willkommen'" :hide-footer="true" :hide-header="true"
               @hidden="closeWelcomeModal" centered>
        <div class="text-center">
          <img class="mb-3" src="assets/EFRE-Foerderhinweis.svg" alt="EFRE Förderungshinweis" height="60px">
          <h1>Willkommen auf dem BigData@Geo Webportal</h1>
          <h4>Zusammenfassung der Steuerung</h4>
        </div>
        <div class="container">
          <div class="row">
            <div class="col-1 text-center">
              <p class="h1 mb-2"><b-icon icon="list"></b-icon></p>
            </div>
            <div class="col-11">
              Im Menü rechts oben können die Datengrundlage
              <b-icon icon="info-circle-fill"></b-icon> und die Hilfe <b-icon icon="question-circle-fill"></b-icon> geöffnet werden, sowie die Einstellungen <b-icon icon="gear-fill"></b-icon> zurückgesetzt werden.
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-1 text-center">
              <img src="assets/map-icon.svg" width="40px" height="40px" alt="Karte">
            </div>
            <div class="col-11">
              Die Grundlage der Anwendung bietet die Karte. Hier können Zellen zur näheren Betrachtung
              ausgewählt werden.
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-1 text-center">
              <img src="assets/sensor.svg" width="40px" height="40px" alt="Sensor">
            </div>
            <div class="col-11">
              Auf der Karte werden Sensoren angezeigt, deren Daten per Klick näher untersucht werden können.
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-1 text-center">
              <img src="assets/adjust-icon.svg" width="40px" height="40px" alt="Einstellungen">
            </div>
            <div class="col-11">
              Die Auswahl von <u>Variable</u>, <u>Szenario</u> und <u>Zeitraum</u> kann über die Auswahl am
              oberen Rand des Bildschirms eingestellt werden.
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-1 text-center">
              <img src="assets/left-click.png" height="40px" alt="Links-Klick">
            </div>
            <div class="col-11">
              Mit Linksklicks werden immer <u>einzelne</u> Zellen und Sensoren ausgewählt.
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-1 text-center">
              <img src="assets/right-click.png" height="40px" alt="Rechts-Klick">
            </div>
            <div class="col-11">
              Mit Rechtsklicks werden Zellen oder Sensoren zur Auswahl hinzugefügt (weitere Linksklicks heben diese
              Auswahl auf!).
            </div>
          </div>
        </div>
        <div class="text-center">
          <h5>Diese Übersicht lässt sich später erneut über das Menü öffnen.</h5>
        </div>
        <div class="text-center mt-4">
          <b-button class="align-middle btn-lg" variant="primary" v-on:click="closeWelcomeModal">Verstanden</b-button>
        </div>
        <div class="row mt-3 text-center">
          <div class="col-md-6"><a href="https://www.uni-wuerzburg.de/sonstiges/impressum/">Impressum</a></div>
          <div class="col-md-6"><a href="https://www.uni-wuerzburg.de/sonstiges/datenschutz/">Datenschutz</a></div>
        </div>
      </b-modal>
    </div>
    <div id="eu-logo">
      <img class="eu-logo" src="assets/assets_img_EFRE-Foerderhinweis.svg" alt="EU">
    </div>
  </div>
</template>

<script>
import LayoutBrowser from "./components/LayoutBrowser";

export default {
  name: 'App',
  created() {
    document.title = "BigData@Geo — Webportal";
  },
  mounted() {
    if (!localStorage.getItem("welcome-message"))
      this.$bvModal.show("modal-welcome");
  },
  methods: {
    closeWelcomeModal() {
      localStorage.setItem("welcome-message", true);
      this.$bvModal.hide("modal-welcome");
    }
  },
  components: {
    LayoutBrowser
  }
}
</script>

<style>
#modal-welcome .container {
  max-width: 75%;
  margin-bottom: 35px;
  margin-top: 35px;
}

#eu-logo{
  position: fixed;
  right: 25px;
  bottom: 45px;
  z-index: 10;
  cursor: pointer;
}

.loader {
  width: 5rem !important;
  height: 5rem !important;
}

.blurry {
  filter: blur(3px);
}
</style>
