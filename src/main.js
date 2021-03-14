import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'leaflet/dist/leaflet.css';
import {BootstrapVue, BootstrapVueIcons} from "bootstrap-vue"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueForceNextTick from 'vue-force-next-tick'
import VueCarousel from 'vue-carousel';


/**
 * This is the entry point for the Vue framework, this file should not change much
 * Only relevant, to register new modules, e. g. BootstrapVue
 */

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueForceNextTick)
Vue.use(BootstrapVueIcons)
Vue.use(VueCarousel)

new Vue({
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
