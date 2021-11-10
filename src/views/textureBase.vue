
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
import imgSrc from '../assets/image/sky.jpg'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
onMounted(() => {
    canvasEl.value.width = 900
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#textureBaseVertexShader').textContent
    const fsSource = document.querySelector('#textureBaseFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    const sourceSize = initVertex(gl)
    initTexture(gl)
    render(gl, sourceSize)
})

const initVertex = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    const source = new Float32Array([
        -0.5, 0.5, 0, 1,
        -0.5, -0.5, 0, 0,
        0.5, 0.5, 1, 1,
        0.5, -0.5, 1, 0,
    ])

    const elementBytes = source.BYTES_PER_ELEMENT
    // 系列尺寸
    const positionSize = 2 // 点xy信息
    const pinSize = 2 // 纹理信息
    // 类目尺寸
    const categorySize = positionSize + pinSize
    // 类目字节数
    const categoryBytes = categorySize * elementBytes
    // 系列字节索引位置
    const positionIndex = 0
    const pinIndex = positionSize * elementBytes  
    const sourceSize = source.length * elementBytes  

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
    
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(
        a_Position,
        positionSize,
        gl.FLOAT,
        false,
        categoryBytes,
        positionIndex
    )
    gl.enableVertexAttribArray(a_Position)

    const a_Pin = gl.getAttribLocation(gl.program, 'a_Pin')
    gl.vertexAttribPointer(
        a_Pin,
        pinSize,
        gl.FLOAT,
        false,
        categoryBytes,
        pinIndex
    )
    gl.enableVertexAttribArray(a_Pin)

    return sourceSize
}

const initTexture = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const image = new Image()
    image.src = imgSrc
    image.onload = function(){
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image
        )

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR
        )

        const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
        // 这里的0就是gl.activeTexture(gl.TEXTURE0)的TEXTURE0，很难理解这种api
        gl.uniform1i(u_Sampler, 0)
    }

}


const render = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, sourceSize: number) => {
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, sourceSize)
}
</script>

<style scoped>

</style>