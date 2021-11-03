import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: HelloWorld},
        {path: '/gl', component: () => import('./components/WebGl.vue')},
        {path: '/star', component: () => import('./components/Star.vue')},
        {path: '/multiPoints', component: () => import('./components/MultiPoints.vue')},
        {path: '/drawLineAndTriangle', component: () => import('./views/drawLineAndTriangle.vue')},
        {path: '/drawRectangle', component: () => import('./views/drawRectangle.vue')},
        {path: '/drawByMouse', component: () => import('./views/drawByMouse.vue')},
        {path: '/drawLeo', component: () => import('./views/drawLeo.vue')},
    ]
})

createApp(App)
    .use(router)
    .mount('#app')
