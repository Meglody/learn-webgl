<template>
    <div>
        <canvas ref="stars" id="stars"></canvas>
    </div>
</template>
<script setup>
import { Color } from "https://unpkg.com/three/build/three.module.js";
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders'
import { defineProps, reactive, ref, onMounted, onUpdated, onUnmounted } from 'vue'
// g_points储存顶点数据的数组
const state = reactive({ count: 0, g_points: [] })
// refs
const stars = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#vertexShader').innerText
const fsSource = document.querySelector('#fragmentShader').innerText
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = stars.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    // 开启片元颜色合成功能，不然渲染的alpha透明通道不会开启
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    paintColor(gl, [0,0,0,0])
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    initShaders(gl, vsSource, fsSource)

    // 使用鼠标绘制点位
    canvasEl.addEventListener('click', ({clientX, clientY}) => {
        const {left, top, width, height} = canvasEl.getBoundingClientRect();
        const [cssX, cssY] = [clientX - left, clientY - top];
        const [halfCanvasWidth, halfCanvasHeight] = [width / 2, height / 2];
        const [xBaseCenter, yBaseCenter] = [cssX - halfCanvasWidth, halfCanvasHeight - cssY]
        const [x, y] = [xBaseCenter / halfCanvasWidth, yBaseCenter / halfCanvasHeight]
        const randomSize = Math.random()*5 + 2
        const alpha = Math.random()
        randerPoints(gl, x, y, randomSize, alpha)
    })    
})

// 封装同步绘图的方法
const randerPoints = (gl, x, y, size, alpha) => {
    // 记录顶点数据
    state.g_points.push({x,y,size,alpha})
    // 获取并修改点位
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    const u_FlagColor = gl.getUniformLocation(gl.program, 'u_FlagColor')
    // 清理画布
    paintColor(gl, [0,0,0,0])
    // 绘图
    state.g_points.forEach(({x, y, size, alpha: a}) => {
        // 设置顶点位置
        gl.vertexAttrib2f(a_Position, x, y)
        // 这里同理设置顶点尺寸
        gl.vertexAttrib1f(a_PointSize, size)
        // 这里设置顶点颜色数据
        // uniform4f写法
        gl.uniform4f(u_FlagColor, 1, 1, 1 ,a)
        // uniform4fv写法 同前者写法效果一致
        // const _color = new Float32Array([r,g,b,a])
        // gl.uniform4fv(u_FlagColor, _color)
        gl.drawArrays(gl.POINTS, 0, 1)
    })
}
</script>

<style scoped>
#stars{
    background-image: url('../assets/image/sky.jpg');
    background-size: cover;
    background-position: right bottom;
}
</style>