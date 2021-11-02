<template>
    <div>
        <canvas ref="points" id="points"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders'
import { defineProps, reactive, ref, onMounted, onUpdated, onUnmounted } from 'vue'
import Compose from '../assets/utils/Compose'
import Track from '../assets/utils/Track'
// g_points储存顶点数据的数组
const state = reactive({ compose: new Compose(), stars: [] })
// refs
const points = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#vertexShader').innerText
const fsSource = document.querySelector('#fragmentShader').innerText
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = points.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    initShaders(gl, vsSource, fsSource)
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    randerPoints(gl)
})

// 封装同步绘图的方法
const randerPoints = (gl) => {
    // 记录顶点数据
    const vertices = new Float32Array([0, 0.1, -0.1, -0.1, 0.1, -0.1])
    // 简历缓冲对象
    const vertexBuffer = gl.createBuffer()
    // 绑定缓冲对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    // 往缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    // 获取并修改点位
    // 位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
    // 大小
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    gl.vertexAttrib1f(a_PointSize, 50)
    // 批处理
    gl.enableVertexAttribArray(a_Position)
    // 清理画布
    paintColor(gl, [0,0,0,1])
    // 绘图
    gl.drawArrays(gl.POINTS, 0, 3)
}
</script>

<style scoped>
</style>