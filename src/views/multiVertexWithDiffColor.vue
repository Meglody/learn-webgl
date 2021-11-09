<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas ref="canvasEl" id="canvasEl"></canvas>
    </div>
</template>
<script setup lang="ts">
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders-ts'
import { defineProps, reactive, ref, onMounted, onUpdated, onUnmounted } from 'vue'
// refs
const canvasEl = ref<HTMLCanvasElement>();
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#multiDiffColorVertexShader').textContent
const fsSource = document.querySelector('#multiDiffColorFragmentShader').textContent
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    canvasEl.value.width = window.innerWidth
    canvasEl.value.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = initShaders(canvasEl.value.getContext('webgl'), vsSource, fsSource)
    randerPoints(gl)
})

const randerPoints = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    // attribute数据合一（位置信息和颜色信息并排）
    const source = new Float32Array([
        0, 0.1, 0, 1, 0, 0, 1,
        -0.1, -0.1, 0, 0, 1, 0, 1,
        0.1, -0.1, 0, 0, 0, 1, 1,
    ])
    // 元素字节数
    const elementBytes = source.BYTES_PER_ELEMENT
    // 系列尺寸（位置信息尺寸3，颜色信息尺寸4）
    const vertexSize = 3
    const colorSize = 4
    // 类目尺寸
    const categorySize = vertexSize + colorSize
    // 类目字节数
    const categoryBytes = categorySize * elementBytes
    // 系列字节数位置索引
    const vertexByteIndex = 0
    const colorByteIndex = vertexSize * elementBytes
    // 顶点总数
    const sourceSize = source.length / categorySize

    // 建立缓冲对象
    const sourceBuffer = gl.createBuffer()
    // 绑定缓冲对象
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer)
    // 往缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
    // 修改点的位置
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(
        a_Position,
        vertexSize,
        gl.FLOAT,
        false,
        categoryBytes,
        vertexByteIndex
    )
    gl.enableVertexAttribArray(a_Position)
    // 修改点的颜色
    const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(
        a_Color,
        colorSize,
        gl.FLOAT,
        false,
        categoryBytes,
        colorByteIndex
    )
    gl.enableVertexAttribArray(a_Color)
    paintColor(gl, [0,0,0,1])
    gl.drawArrays(gl.POINTS, 0, sourceSize)
}
</script>

<style scoped>
</style>