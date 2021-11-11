
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import nextPoly from "../assets/utils/nextPoly"
import useShader from '../assets/utils/shaders-ts'
import useScaleLinear from '../assets/utils/scaleLinear'
import useSin from '../assets/utils/sinFn'
// import imgSrc from '../assets/image/sky.jpg'
import imgSrc from '../assets/image/mf.jpg'
import { Matrix4 } from "three"
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const state = reactive<{
    mx: number
    my: number
    modelMatrix: Matrix4 | null
    u_ModelMatrix: WebGLUniformLocation | null
}>({
    mx: 0,
    my: 0,
    modelMatrix: null,
    u_ModelMatrix: null
})
onMounted(async () => {
    canvasEl.value.width = 900
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#cubicVertexShader').textContent
    const fsSource = document.querySelector('#cubicFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    const sourceSize = initVertex(gl)
    initMatrix(gl)
    const textureLoaded = await initTexture(gl)
    ani(gl, sourceSize)
})

const initVertex = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    const source = new Float32Array([
      -0.5, -0.5, -0.5, 0, 0,
      -0.5, 0.5, -0.5, 0, 0.5,
      0.5, -0.5, -0.5, 0.25, 0,
      -0.5, 0.5, -0.5, 0, 0.5,
      0.5, 0.5, -0.5, 0.25, 0.5,
      0.5, -0.5, -0.5, 0.25, 0,

      -0.5, -0.5, 0.5, 0.25, 0,
      0.5, -0.5, 0.5, 0.5, 0,
      -0.5, 0.5, 0.5, 0.25, 0.5,
      -0.5, 0.5, 0.5, 0.25, 0.5,
      0.5, -0.5, 0.5, 0.5, 0,
      0.5, 0.5, 0.5, 0.5, 0.5,

      -0.5, 0.5, -0.5, 0.5, 0,
      -0.5, 0.5, 0.5, 0.5, 0.5,
      0.5, 0.5, -0.5, 0.75, 0,
      -0.5, 0.5, 0.5, 0.5, 0.5,
      0.5, 0.5, 0.5, 0.75, 0.5,
      0.5, 0.5, -0.5, 0.75, 0,

      -0.5, -0.5, -0.5, 0, 0.5,
      0.5, -0.5, -0.5, 0.25, 0.5,
      -0.5, -0.5, 0.5, 0, 1,
      -0.5, -0.5, 0.5, 0, 1,
      0.5, -0.5, -0.5, 0.25, 0.5,
      0.5, -0.5, 0.5, 0.25, 1,

      -0.5, -0.5, -0.5, 0.25, 0.5,
      -0.5, -0.5, 0.5, 0.25, 1,
      -0.5, 0.5, -0.5, 0.5, 0.5,
      -0.5, -0.5, 0.5, 0.25, 1,
      -0.5, 0.5, 0.5, 0.5, 1,
      -0.5, 0.5, -0.5, 0.5, 0.5,

      0.5, -0.5, -0.5, 0.5, 0.5,
      0.5, 0.5, -0.5, 0.75, 0.5,
      0.5, -0.5, 0.5, 0.5, 1,
      0.5, -0.5, 0.5, 0.5, 1,
      0.5, 0.5, -0.5, 0.75, 0.5,
      0.5, 0.5, 0.5, 0.75, 1,
    ]);
    const elementBytes = source.BYTES_PER_ELEMENT
    // 系列尺寸
    const positionSize = 3 // 点xyz信息
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

const initMatrix = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    // 初始化模型矩阵
    state.modelMatrix = new Matrix4()
    state.mx = new Matrix4().makeRotationX(0.02)
    state.my = new Matrix4().makeRotationY(0.02)
    state.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
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

            // 获取采样器对应的Uniform变量
            const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
            gl.uniform1i(u_Sampler, 0)
            resolve('image loaded')
        }
    })
    return ret
}


const render = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}, sourceSize: number) => {
    state.modelMatrix.multiply(new Matrix4().makeRotationX(0.02)).multiply(new Matrix4().makeRotationY(0.02))
    gl.uniformMatrix4fv(state.u_ModelMatrix, false, state.modelMatrix.elements)
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, sourceSize)
}

const ani = (gl, sourceSize) => {
    render(gl, sourceSize)
    requestAnimationFrame(() => ani(gl, sourceSize))
}
</script>

<style scoped>

</style>