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
        {path: '/translation', component: () => import('./views/translation.vue')},
        {path: '/rotate', component: () => import('./views/rotate.vue')},
        {path: '/scale', component: () => import('./views/scale.vue')},
        {path: '/matrics', component: () => import('./views/matrics.vue')},
        {path: '/multiMatrix', component: () => import('./views/multiMatrix.vue')},
        {path: '/viewMatrix', component: () => import('./views/viewMatrix.vue')},
        {path: '/wave', component: () => import('./views/wave.vue')},
        {path: '/multiVertexWithDiffColor', component: () => import('./views/multiVertexWithDiffColor.vue')},
        {path: '/waveColorful', component: () => import('./views/waveColorful.vue')},
        {path: '/textureBase', component: () => import('./views/textureBase.vue')},
        {path: '/textureFilter', component: () => import('./views/textureFilter.vue')},
    ]
})

createApp(App)
    .use(router)
    .mount('#app')
