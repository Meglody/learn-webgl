<template>
  <h2>WEB_GL PRACTICE</h2>
  <div class="home-wrapper flex-column">
    <router-link to="/gl">绘制顶点</router-link>
    <router-link to="/star">星空</router-link>
    <router-link to="/multiPoints">绘制多点</router-link>
    <router-link to="/drawLineAndTriangle">绘制三角形</router-link>
    <router-link to="/drawRectangle">绘制矩形</router-link>
    <router-link to="/drawByMouse">鼠标绘制点线</router-link>
    <router-link to="/drawLeo">绘制狮子座</router-link>
    <router-link to="/translation">位移</router-link>
    <router-link to="/rotate">旋转</router-link>
    <router-link to="/scale">缩放</router-link>
    <router-link to="/multiMatrix">复合矩阵变换</router-link>
    <router-link to="/viewMatrix">视图矩阵</router-link>
    <router-link to="/wave">波浪</router-link>
    <router-link to="/multiVertexWithDiffColor">多点异色绘制</router-link>
    <router-link to="/waveColorful">彩色波浪</router-link>
    <router-link to="/textureBase">纹理初级</router-link>
    <router-link to="/textureFilter">纹理混合</router-link>
    <router-link to="/cubic">魔方案例</router-link>
    <router-link to="/textureMix">纹理混合</router-link>
    <router-link to="/textureTransformAnimation">纹理转场</router-link>
    <router-link to="/textureTransformMaskAnimation">换装达人</router-link>
    <router-link to="/textureTransformMaskAnimation2">视频贴图</router-link>
    <router-link to="/console-debug">调试GLSL ES变量</router-link>
    <router-link to="/console-debug-multi">调试多个GLSL ES变量</router-link>
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
    margin 30px auto
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