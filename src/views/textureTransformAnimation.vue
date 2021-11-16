
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
import pattern0 from '../assets/image/pattern0.jpg'
import pattern1 from '../assets/image/pattern1.jpg'
import pattern2 from '../assets/image/pattern2.jpg'
import pattern3 from '../assets/image/pattern3.jpg'
import pattern4 from '../assets/image/pattern4.jpg'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const poly = ref()
onMounted(async () => {
    canvasEl.value.width = 450
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#textureTransformAnimationVertexShader').textContent
    const fsSource = document.querySelector('#textureTransformAnimationFragmentShader').textContent
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

const initTextures = async (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, source: number[][]) => {
    const res = await Promise.all(
    [pattern0, pattern1, pattern2, pattern3, pattern4]
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
        uniforms: {
            'u_Alpha': {
                type: 'uniform1f',
                value: 1.0
            }
        },
        samplers: {
            'u_Image': {
                image: res[imageIndex.value],
                format: gl.RGB,
            },
            'u_Pattern': {
                image: res[imageIndex.value + 1],
                format: gl.RGB,
            },
        }
    })

    return res
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
        console.log(imageIndex.value % 4, (imageIndex.value + 1) % 4)
        poly.value = poly.value.updateSamplers({
            'u_Image': {
                image: images[imageIndex.value % images.length],
                format: gl.RGB,
            },
            'u_Pattern' : {
                image: images[(imageIndex.value + 1) % images.length],
                format: gl.RGB,
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