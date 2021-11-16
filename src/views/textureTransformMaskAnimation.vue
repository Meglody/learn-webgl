
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
import pattern0 from '../assets/image/pattern0.jpg'
import pattern1 from '../assets/image/pattern1.jpg'
import pattern2 from '../assets/image/pattern2.jpg'
import pattern3 from '../assets/image/pattern3.jpg'
import pattern4 from '../assets/image/pattern4.jpg'
import sky from '../assets/image/sky.jpg'
import nichijou1 from '../assets/image/gif/nichijou_1.png'
import nichijou2 from '../assets/image/gif/s.gif'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const poly = ref()
onMounted(async () => {
    canvasEl.value.width = 450
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#textureTransformMaskAnimationVertexShader').textContent
    const fsSource = document.querySelector('#textureTransformMaskAnimationFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    const {source} = initVertex(gl)
    const images = await initTextures(gl, source)
    drawAni(gl, images)
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

const originImage = ref<HTMLImageElement>()
const maskImage = ref<HTMLImageElement>()

const initTextures = async (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, source: number[][]) => {
    const patterns = await Promise.all(
    [sky, nichijou1, nichijou2, pattern0, pattern1, pattern2, pattern3, pattern4]
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
            },
            'u_Pattern_1': {
                image: patterns[imageIndex.value],
                format: gl.RGB,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                textureMinFilter: gl.LINEAR
            },
            'u_Pattern_2': {
                image: patterns[imageIndex.value + 1],
                format: gl.RGB,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                textureMinFilter: gl.LINEAR
            },
        }
    })

    return patterns
}

const dd = ref<number>(0)
const imageIndex = ref<number>(0)
let t = false

const drawAni = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, images: HTMLImageElement[]) => {
    dd.value += 0.01
    // alpha变为1的一瞬间变回0
    if(dd.value >= Math.PI / 2){
        dd.value = 0
    }
    const alpha = Math.sin(dd.value)
    // 更改片元alpha
    poly.value = poly.value.updateUniforms({
        'u_Alpha': {
            type: 'uniform1f',
            value: alpha
        }
    })
    // 更改片元的两张图片
    if(dd.value === 0 && !t){
        t = true
        imageIndex.value++
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
                image: images[imageIndex.value % images.length],
                format: gl.RGB,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                textureMinFilter: gl.LINEAR
            },
            'u_Pattern_2' : {
                image: images[(imageIndex.value + 1) % images.length],
                format: gl.RGB,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                textureMinFilter: gl.LINEAR
            }
        })
        setTimeout(() => {
            t = false
        }, 500)
    }
    render(gl)
    requestAnimationFrame(() => drawAni(gl, images))
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