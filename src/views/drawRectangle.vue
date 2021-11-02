<template>
    <div style="width: 100%; height: 100vh; background: pink">
        <canvas ref="points" id="points"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders'
import { ref, onMounted } from 'vue'
// refs
const points = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#drawTriangleVertexShader').innerText
const fsSource = document.querySelector('#drawTriangleFragmentShader').innerText
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = points.value
    canvasEl.width = window.innerHeight
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    initShaders(gl, vsSource, fsSource)
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    randerPoints(gl)
})

// 封装同步绘图的方法
const randerPoints = (gl) => {
    const counts_1 = [[-0.1, 0.1], [-0.1, -0.1], [0.1, -0.1], [0.1, 0.1]]
    // !!!!!!!!!!!!!要按着逆时针方向画，才是正面的三角面!!!!!!!!!!!!!!!否则画的是反面的三角面
    const counts_2 = [[-0.1, 0.1], [-0.1, -0.1], [0.1, 0.1], [0.1, -0.1]]
    const counts_3 = [
        [-0.1, 0.1], [-0.1, -0.1], [0.1, 0.1],
        [0.1, 0.1], [-0.1, -0.1], [0.1, -0.1]
    ]
    // 记录顶点数据
    const vertices_1 = new Float32Array(counts_1.flat(Infinity))
    const vertices_2 = new Float32Array(counts_2.flat(Infinity))
    const vertices_3 = new Float32Array(counts_3.flat(Infinity))
    // 简历缓冲对象
    const vertexBuffer = gl.createBuffer()
    // 绑定缓冲对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    // 往缓冲区写入数据
    // gl.bufferData(gl.ARRAY_BUFFER, vertices_1, gl.STATIC_DRAW)
    // gl.bufferData(gl.ARRAY_BUFFER, vertices_2, gl.STATIC_DRAW)
    gl.bufferData(gl.ARRAY_BUFFER, vertices_3, gl.STATIC_DRAW)
    // 获取并修改点位
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
    // 批处理
    gl.enableVertexAttribArray(a_Position)
    // 清理画布
    paintColor(gl, [0,0,0,1])
    // 画连续三角带
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, counts_1.length)
    // 画连续三角扇
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, counts_2.length)
    // 画多个多个独立三角形
    gl.drawArrays(gl.TRIANGLES, 0, counts_3.length)
}
</script>

<style scoped>
</style>