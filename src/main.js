import { createApp } from 'vue'
import router from './route/router'
import { createPinia } from 'pinia'
import App from './Index.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
