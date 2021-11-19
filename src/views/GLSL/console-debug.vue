<template>
    <div>
        <canvas ref="canvas"></canvas>
    </div>
</template>
<script setup lang="ts">
import useColor from '../../assets/utils/colors'
import useShader from '../../assets/utils/shaders-ts'
import { reactive, ref, onMounted } from 'vue'
const canvas = ref<HTMLCanvasElement>(null);
const { paintColor } = useColor
const vsSource = document.querySelector('#debugVertexShader').textContent
const fsSource = document.querySelector('#debugFragmentShader').textContent
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = canvas.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    const gl = canvasEl.getContext('webgl')
    initShaders(gl, vsSource, fsSource)
    randerPoints(gl)
    logFunc(gl, canvasEl)
})

const randerPoints = (gl: WebGLRenderingContext) => {
    paintColor(gl, [0, 0, 0, 1])
    gl.drawArrays(gl.POINTS, 0, 1)
}
const logFunc = (gl, canvasEl, offset = 0) => {
    const pixel = new Uint8Array(4)
    gl.readPixels(canvasEl.width / 2 + offset, canvasEl.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
    console.log(pixel)
}
</script>

<style scoped>

</style>