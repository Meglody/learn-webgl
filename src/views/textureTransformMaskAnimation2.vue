
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
import dress from '../assets/image/dress.jpg'
import mask from '../assets/image/mask-dress.jpg'
import nichijou2 from '../assets/video/test.mp4'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const poly = ref()
onMounted(async () => {
    canvasEl.value.width = 450
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#videoMaskAnimationVertexShader').textContent
    const fsSource = document.querySelector('#videoMaskAnimationFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    const {source} = initVertex(gl)
    await initTextures(gl, source)
    const videoEl = document.createElement('video')
    videoEl.src = nichijou2
    videoEl.autoplay = true
    videoEl.muted = true
    videoEl.loop = true
    videoEl.setAttribute('crossOrigin', 'Anonymous')
    videoEl.play()
    videoEl.addEventListener('play', () => {
        drawAni(gl, videoEl)
    })
})

const initVertex = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    const maxU = 1
    const maxV = 1
    const maxU_2 = 1
    const maxV_2 = 1.4
    const source = [
        [-1, 1, 0, maxV, 0, maxV_2],
        [-1, -1, 0, 0, 0, 0],
        [1, 1, maxU, maxV, maxU_2, maxV_2],
        [1, -1, maxU, 0, maxU_2, 0],
    ]
    return {
        source
    }
}

const originImage = ref<HTMLImageElement>()
const maskImage = ref<HTMLImageElement>()

const initTextures = async (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, source: number[][]) => {
    originImage.value = await new Promise(async resolve => {
        const image = new Image()
        image.src = dress
        const ret : HTMLImageElement = await new Promise(resolve => {
            image.onload = function(){
                resolve(image)
            }
        })
        resolve(ret)
    })

    maskImage.value = await new Promise(async resolve => {
        const image = new Image()
        image.src = mask
        const ret : HTMLImageElement = await new Promise(resolve => {
            image.onload = function(){
                resolve(image)
            }
        })
        resolve(ret)
    })

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
            },
            a_videoPin: {
                size: 2,
                index: 4
            }
        },
        uniforms: {
            'u_Alpha': {
                type: 'uniform1f',
                value: 1.0
            }
        },
        samplers: {
            'u_Image': {
                image: originImage.value,
                format: gl.RGB,
            },
            'u_Mask': {
                image: maskImage.value,
                format: gl.RGB,
            }
        }
    })
}

const drawAni = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, videoEl: HTMLVideoElement) => {
    poly.value = poly.value.updateSamplers({
        'u_Image': {
            image: originImage.value,
            format: gl.RGB,
        },
        'u_Mask': {
            image: maskImage.value,
            format: gl.RGB,
        },
        'u_Pattern_1': {
            image: videoEl,
            format: gl.RGB,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            textureMinFilter: gl.LINEAR
        }
    })
    render(gl)
    requestAnimationFrame(() => drawAni(gl, videoEl))
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