
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import useShader from '../assets/utils/shaders-ts'
import { Vector3, Matrix4, Quaternion } from 'three'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const {paintColor} = useColor
const loopLastTimeStamp = ref(0)
const ratio = window.innerWidth / window.innerHeight
onMounted(() => {
    canvasEl.value.width = window.innerWidth
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#multiMatrixVertexShader').textContent
    const fsSource = document.querySelector('#multiMatrixFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    initVertexPosition(gl, 'a_Position')
    initRatio(gl)
    multipleMatrix(gl)
})

const multipleMatrix = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
    // 1, 自定义矩阵复合
    // // 第一段位移
    // const [bx, by] = [0.1, 0.2]
    // // 第二段位移
    // const [cx, cy] = [0.3, 0.4]
    // // 创建行主序矩阵
    // const bm = new Matrix4().set(
    //     1, 0, 0, bx,
    //     0, 1, 0, by,
    //     0, 0, 1, 0,
    //     0, 0, 0, 1,
    // )
    // const cm = new Matrix4().set(
    //     1, 0, 0, cx,
    //     0, 1, 0, cy,
    //     0, 0, 1, 0,
    //     0, 0, 0, 1,
    // )
    // // 复合矩阵
    // const mt = cm.multiply(bm)
    
    // 2, 矩阵库复合
    // // 第一段旋转矩阵
    // const mr = new Matrix4();
    // mr.makeRotationZ(Math.PI / 2)
    // // 第二段位移矩阵
    // const mt = new Matrix4()
    // mt.makeTranslation(0.3, 0, 0)
    // // 复合矩阵
    // const mtFinal = mt.multiply(mr)

    // 3, compose综合变换复合
    // 第一段位移
    const pos = new Vector3(0.3, 0, 0)
    // 第二段旋转
    const rot = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)
    // 第三段缩放
    const scale = new Vector3(2, 0.5, 1)
    // 复合矩阵 compose 接受的三个参数分别是位移旋转缩放，pos、scale是Vector3类型， rot是Quaternion类型
    const matrix = new Matrix4().compose(pos, rot, scale)
    gl.uniformMatrix4fv(u_Matrix, false, matrix.elements)
    // 所有复合矩阵都要按照先缩放、后旋转、最后位移的顺序使用才是正确的
    // 代码中就是先执行(点乘)的矩阵放在最后，最后的会最先被调用比如
    // 如 mt.multiply(mr) 就是先旋转后位移， cm.multiply(bm) 就是先bm再cm， new Matrix4().compose(t, r, s)
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}

const initRatio = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    const u_Ratio = gl.getAttribLocation(gl.program, 'u_Ratio')
    gl.vertexAttrib1f(u_Ratio, ratio)
}
const initVertexPosition = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string) => {
    const vertex = [[0, 0.1], [-0.085, -0.05], [0.085, -0.05]]
    const vertices = new Float32Array(vertex.flat())
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    const target = gl.getAttribLocation(gl.program, targetName)
    gl.vertexAttribPointer(target, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(target)
}
</script>

<style scoped>

</style>