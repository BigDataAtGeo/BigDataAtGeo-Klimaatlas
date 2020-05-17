import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'leaflet/dist/leaflet.css';
import {BootstrapVue, BootstrapVueIcons} from "bootstrap-vue"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import VueForceNextTick from 'vue-force-next-tick'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueForceNextTick)
Vue.use(BootstrapVueIcons)

new Vue({
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
