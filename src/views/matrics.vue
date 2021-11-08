
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import useShader from '../assets/utils/shaders-ts'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const {paintColor} = useColor
const loopLastTimeStamp = ref(0)
const ratio = window.innerWidth / window.innerHeight
onMounted(() => {
    canvasEl.value.width = window.innerWidth
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#matricsVertexShader').textContent
    const fsSource = document.querySelector('#matricsFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    initVertexPosition(gl, 'a_Position')
    initRatio(gl)
    loopPlay(() => matricTransform(gl, 'u_Matrix'), true)
})
const initRatio = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    const u_Ratio = gl.getAttribLocation(gl.program, 'u_Ratio')
    gl.vertexAttrib1f(u_Ratio, ratio)
}
const initVertexPosition = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string) => {
    const vertex = [[0, 0.1], [-0.085, -0.05], [0.085, -0.05]]
    const vertices = new Float32Array(vertex.flat())
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    const target = gl.getAttribLocation(gl.program, targetName)
    gl.vertexAttribPointer(target, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(target)
}
let angle = 0
const matricTransform = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string) => {
    const u_Matrix = gl.getUniformLocation(gl.program, targetName)
    angle += 0.1
    const sinB = Math.sin(angle)
    const cosB = Math.cos(angle)
    if(angle > 2 * Math.PI){
        angle = 0
    }
    // 列主序
    const mat2 = [
        cosB, sinB,
        -sinB, cosB
    ]
    // 等同于 
    // const mat4 = [
    //     cosB, sinB, 0, 0,
    //     -sinB, cosB, 0, 0,
    //     0, 0, 1, 0,
    //     0, 0, 0, 1
    // ]
    // 按照正弦缩放三角面
    gl.uniformMatrix2fv(u_Matrix, false, mat2)
    // gl.uniformMatrix4fv(u_Matrix, false, mat4)
    paintColor(gl, [0.75,0.34,0.32,1])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}
const loopPlay = (fn?: { (): void; (): void }, play?: boolean) => {
    if(play){
        fn()
    }
    requestAnimationFrame((timestamp) => {
        if(!loopLastTimeStamp.value){
            loopLastTimeStamp.value = timestamp
        }
        if((timestamp - loopLastTimeStamp.value) > 16.67){
            loopLastTimeStamp.value = timestamp
            return loopPlay(fn, true)
        }else{
            return loopPlay(fn, false)
        }
    })
}
</script>

<style scoped>

</style>