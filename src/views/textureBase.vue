
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
import imgSrc from '../assets/image/erha.jpg'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
onMounted(async () => {
    canvasEl.value.width = 900
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#textureBaseVertexShader').textContent
    const fsSource = document.querySelector('#textureBaseFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    const sourceSize = initVertex(gl)
    const textureLoaded = await initTexture(gl)
    render(gl, sourceSize)
})

const initVertex = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    const maxU = 2
    const maxV = 2
    const source = new Float32Array([
        -0.5, 0.5, 0, maxV,
        -0.5, -0.5, 0, 0,
        0.5, 0.5, maxU, maxV,
        0.5, -0.5, maxU, 0,
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
    const sourceSize = source.length / categorySize

    const sourceBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer)
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

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    return sourceSize
}

const initTexture = async (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    // 激活纹理单元
    gl.activeTexture(gl.TEXTURE0)
    // 创建纹理对象
    const texture = gl.createTexture()
    // 绑定纹理对象使用TEXTURE_2D纹理
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const image = new Image()
    image.src = imgSrc
    const ret = await new Promise((resolve) => {
        image.onload = function(){
            // 纹理设置
            gl.texImage2D(
                // 纹理类型
                gl.TEXTURE_2D,
                // 基本图像等级
                0,
                // 纹理中的颜色组件
                gl.RGB,
                // 纹理数据格式（要和上面相同）
                gl.RGB,
                // 纹理数据的数据类型
                gl.UNSIGNED_BYTE,
                // 图像源
                image
            )

            // 纹理对象的其他参数(修改纹理容器)
            gl.texParameteri(
                // 纹理类型
                gl.TEXTURE_2D,
                // 补间运算参数名(纹理缩小滤波器) key 与下面的 value 相对应
                gl.TEXTURE_MIN_FILTER,
                // 补间运算参数值(线性) value
                gl.LINEAR
            )

            // 纹理的复制(记得去改变source中纹理类别的顶点极值)
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_S,
            //     gl.REPEAT
            // )

            // 纹理的裁切（非二次幂图像兼容）
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_S,
            //     gl.CLAMP_TO_EDGE
            // )
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_T,
            //     gl.CLAMP_TO_EDGE
            // )

            // 纹理的镜像复制
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_S,
            //     gl.MIRRORED_REPEAT
            // )
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_T,
            //     gl.MIRRORED_REPEAT
            // )

            // 纹理的部分复制（垂直的或者水平的都可以，镜像的不镜像的也都可以）
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_S,
            //     gl.MIRRORED_REPEAT
            // )
            // gl.texParameteri(
            //     gl.TEXTURE_2D,
            //     gl.TEXTURE_WRAP_T,
            //     gl.CLAMP_TO_EDGE
            // )

            // 获取采样器对应的Uniform变量
            const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
            // 告诉着色器中的采样器，纹理对象在哪个纹理单元
            // 这里的0就是gl.activeTexture(gl.TEXTURE0)的TEXTURE0
            // (吐槽：很难理解这种api设计，上面用gl.TEXTURE0，这里又是一个0。。。)
            gl.uniform1i(u_Sampler, 0)
            resolve('image loaded')
        }
    })
    return ret
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