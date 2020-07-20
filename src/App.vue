<template>
    <div id="app">
        <LayoutBrowser/>
        <div>
            <b-modal id="modal-welcome" size="xl" :title="'Willkommen'" :hide-footer="true" :hide-header="true"
                     :no-close-on-backdrop="true" centered>
                <div class="text-center">
                    <h1>Willkommen auf dem BigData@Geo Webportal</h1>
                    <h4>Zusammenfassung der Steuerung</h4>
                </div>
                <div class="container">
                    <div class="row">
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
                            <img src="assets/adjust-icon.svg" width="40px" height="40px" alt="Einstellungen">
                        </div>
                        <div class="col-11">
                            Die Auswahl von <u>Variable</u>, <u>Szenario</u> und <u>Zeitram</u> kann über die Auswahl am
                            oberen Rand des Bildschirms eingestellt werden.
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-1 text-center">
                            <img src="assets/help-icon.svg" height="40px" alt="Hilfe">
                        </div>
                        <div class="col-11">
                            Nähere Beschreibungen zu den Variablen können über den Info-Button neben der
                            Variablenauswahl geöffnet werden.
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-1 text-center">
                            <img src="assets/left-click.png" height="40px" alt="Links-Klick">
                        </div>
                        <div class="col-11">
                            Mit Linksklicks werden immer <u>einzelne</u> Zellen ausgewählt.
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-1 text-center">
                            <img src="assets/right-click.png" height="40px" alt="Rechts-Klick">
                        </div>
                        <div class="col-11">
                            Mit Rechtsklicks werden Zellen zur Auswahl hinzugefügt (weitere Linksklicks heben diese
                            Auswahl auf!).
                        </div>
                    </div>
                </div>
                <div class="text-center">
                    <h5>Diese Übersicht lässt sich später erneut über den Button am unteren rechten Rand öffnen.</h5>
                </div>
                <div class="text-center mt-4">
                    <b-button class="align-middle btn-lg" variant="primary" v-on:click="closeWelcomeModal">Verstanden</b-button>
                </div>
            </b-modal>
        </div>
        <div id="open-welcome-modal-button" v-on:click="openWelcomeModal">
            <img src="assets/help-icon.svg" height="50px" alt="Hilfe">
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
            },
            openWelcomeModal() {
                this.$bvModal.show("modal-welcome");
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

    #open-welcome-modal-button {
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
