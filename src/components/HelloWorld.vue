<template>
  <h2>WEB_GL PRACTICE</h2>
  <div class="home-wrapper flex-column">
    <router-link to="/gl">绘制顶点</router-link>
    <router-link to="/star">星空</router-link>
    <router-link to="/multiPoints">绘制多点</router-link>
    <router-link to="/drawLineAndTriangle">绘制三角形</router-link>
    <router-link to="/drawRectangle">绘制矩形</router-link>
    <router-link to="/drawByMouse">鼠标绘制点线</router-link>
  </div>
</template>

<script setup>
import { defineProps, reactive } from 'vue'

defineProps({
  msg: String
})

const state = reactive({ count: 0 })
</script>

<style scoped>
a {
  color: #42b983;
  margin-bottom: 20px;
}
</style>
<style lang="stylus" scoped>
.home-wrapper
    margin 200px auto
    padding 20px
.flex-row
    display flex
    flex-wrap nowrap
    flex-direction row
    justify-content flex-start
.flex-column
    display flex
    flex-wrap nowrap
    flex-direction column
    justify-content flex-start
</style>