
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
    const vsSource = document.querySelector('#scaleVertexShader').textContent
    const fsSource = document.querySelector('#scaleFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    initRatio(gl)
    initBuffer(gl, 'a_Position')
    loopPlay(() => scale(gl, 'u_Scale', 2), true)
})
const initRatio = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    const u_Ratio = gl.getAttribLocation(gl.program, 'u_Ratio')
    gl.vertexAttrib1f(u_Ratio, ratio)
}
const initBuffer = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string) => {
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
const scale = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string, scaleRatio: number = 1.0) => {
    const u_Scale = gl.getUniformLocation(gl.program, targetName)
    angle += 0.05
    if(angle > Math.PI){
        angle = 0
    }
    // 按照正弦缩放三角面
    gl.uniform1f(u_Scale, 1 + scaleRatio * Math.sin(angle))  // 1 ↔️ 2.2
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