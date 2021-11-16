
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import nextPoly from "../assets/utils/nextPoly"
import useShader from '../assets/utils/shaders-ts'
import useScaleLinear from '../assets/utils/scaleLinear'
import useSin from '../assets/utils/sinFn'
// import imgSrc from '../assets/image/sky.jpg'
import imgSrc from '../assets/image/dress.jpg'
import pattern0 from '../assets/image/pattern0.jpg'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const poly = ref()
onMounted(async () => {
    canvasEl.value.width = 450
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#textureMixVertexShader').textContent
    const fsSource = document.querySelector('#textureMixFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    const {source} = initVertex(gl)
    await initTextures(gl, source)
    render(gl)
})

const initVertex = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    const maxU = 1
    const maxV = 1
    const source = [
        [-1, 1, 0, maxV],
        [-1, -1, 0, 0],
        [1, 1, maxU, maxV],
        [1, -1, maxU, 0],
    ]
    return {
        source
    }
}

const initTextures = async (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, source: number[][]) => {
    const res = await Promise.all(
    [imgSrc, pattern0]
        .map(async src => {
            const image = new Image()
            image.src = src
            const ret : HTMLImageElement = await new Promise((resolve) => {
                image.onload = function(){
                    resolve(image)
                }
            })
            return ret
        }
    ))

    poly.value = nextPoly({
        gl,
        types: ['TRIANGLE_STRIP'],
        verticesOrigin: source.map(vertex => ref(vertex)),
        size: 4, 
        attributes: {
            a_Position: {
                size: 2,
                index: 0
            },
            a_Pin: {
                size: 2,
                index: 2
            }
        },
        samplers: {
            'u_Sampler': {
                image: res[0],
                format: gl.RGB,
            },
            'u_Pattern': {
                image: res[1],
                format: gl.RGB,
            }
        }
    })
}


const render = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    poly.value.draw()
}
</script>

<style scoped>

</style>