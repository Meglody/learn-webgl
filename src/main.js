import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: HelloWorld},
        {path: '/gl', component: () => import('./components/WebGl.vue')},
        {path: '/star', component: () => import('./components/Star.vue')},
    ]
})

createApp(App)
    .use(router)
    .mount('#app')
