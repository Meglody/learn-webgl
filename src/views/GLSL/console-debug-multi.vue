<template>
    <div>
        <canvas ref="canvas"></canvas>
    </div>
</template>
<script setup lang="ts">
import useColor from '../../assets/utils/colors'
import useShader from '../../assets/utils/shaders-ts'
import { reactive, ref, onMounted } from 'vue'
import nextPoly from '../../assets/utils/nextPoly';
const canvas = ref<HTMLCanvasElement>(null);
const { paintColor } = useColor
const vsSource = document.querySelector('#debugMultiVertexShader').textContent
const fsSource = document.querySelector('#debugMultiFragmentShader').textContent
const {initShaders} = useShader
const poly = ref()
onMounted(() => {
    let canvasEl = canvas.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    const gl = initShaders(canvasEl.getContext('webgl'), vsSource, fsSource)
    randerPoints(gl, canvasEl)
    logFunc(gl, canvasEl)
})

const randerPoints = (gl: WebGLRenderingContext & { program: WebGLProgram }, canvasEl: HTMLCanvasElement) => {
    const source = [
        [-1, 1],
        [-1, -1],
        [1, 1],
        [1, -1],
    ]
    poly.value = nextPoly({
        gl,
        types: ['TRIANGLE_STRIP'],
        verticesOrigin: source.map(numberArray => ref(numberArray)),
        size: 2,
        attributes: {
            'a_Position': {
                size: 2,
                index: 0
            }
        },
        uniforms: {
            'u_CanvasSize': {
                type: 'uniform2fv',
                value: [canvasEl.width, canvasEl.height]
            }
        }
    })
    paintColor(gl, [0, 0, 0, 1])
    poly.value.draw()
}
const logFunc = (gl, canvasEl, offset = 0) => {
    const pixel = new Uint8Array(4)
    for(let y = 0 ; y < 2 ; y++){
        for(let x = 0 ; x < 2 ; x++){
            gl.readPixels(canvasEl.width * (x + 0.5) / 2, canvasEl.height * (y + 0.5) / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
            console.log(pixel)
        }
    }
}
</script>

<style scoped>

</style>