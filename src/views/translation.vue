<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas ref="points" id="points"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders-ts'
import { ref, onMounted } from 'vue'
// refs
const points = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#translationVertexShader').textContent
const fsSource = document.querySelector('#translationFragmentShader').textContent
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
let a_Transition
onMounted(() => {
    let canvasEl = points.value
    canvasEl.width = 900
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    initShaders(gl, vsSource, fsSource)
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    randerPoints(gl)
    a_Transition = gl.getUniformLocation(gl.program, 'a_Transition')
    translation(gl)
})

let y = 0
const translation = (gl) => {
    y += 0.01
    if(y > 1){
        y = -1
    }
    gl.uniform4f(a_Transition, 0, y , 0, 0)
    paintColor(gl, [0,0,0,1])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    requestAnimationFrame(() => translation(gl))
}

// 封装同步绘图的方法
const randerPoints = (gl) => {
    const counts = [[0, 0.1], [-0.085, -0.05], [0.085, -0.05]]
    // 记录顶点数据
    const vertices = new Float32Array(counts.flat(Infinity))
    // 简历缓冲对象
    const vertexBuffer = gl.createBuffer()
    // 绑定缓冲对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    // 往缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    // 获取并修改点位
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
    // 批处理
    gl.enableVertexAttribArray(a_Position)
    // 清理画布
    paintColor(gl, [0,0,0,1])
    gl.drawArrays(gl.TRIANGLES, 0, counts.length)
}
</script>

<style scoped>
</style>