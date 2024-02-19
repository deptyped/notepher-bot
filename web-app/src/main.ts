import './assets/main.css'
import 'requestidlecallback-polyfill'

import { createApp } from 'vue'

import { createPinia } from 'pinia'
import touchEvents from 'vue3-touch-events'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// TODO: remove temporary types fix
app.use<[]>(touchEvents)

const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true)
  }
})

app.mount('#app')
