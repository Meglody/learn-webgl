
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { Matrix4, Vector3 } from "three"
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import useShader from '../assets/utils/shaders-ts'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const {paintColor} = useColor
const loopLastTimeStamp = ref(0)
const ratio = window.innerWidth / window.innerHeight
const dragging = ref(false)
const angleX = ref(0)
const angleY = ref(0)
onMounted(() => {
    canvasEl.value.width = window.innerWidth
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#viewMatrixVertexShader').textContent
    const fsSource = document.querySelector('#viewMatrixFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    canvasEl.value.addEventListener('mousedown', event => {
        dragging.value = true
    })
    canvasEl.value.addEventListener('mouseup', event => {
        dragging.value = false
    })
    canvasEl.value.addEventListener('mousemove', event => {
        if(dragging.value){
            const deltaX = event.movementX / window.innerWidth
            const deltaY = -(event.movementY / window.innerHeight) * ratio
            angleX.value += 1.22 * deltaY
            angleY.value += 1.22 * deltaX
            render(gl)
        }
    })
    initRatio(gl)
    render(gl)
})

const initRatio = (gl: WebGLRenderingContext & { program: WebGLProgram }) => {
    const u_Ratio = gl.getAttribLocation(gl.program, 'u_Ratio')
    gl.vertexAttrib1f(u_Ratio, ratio)
}
const initVertexPosition = (gl: WebGLRenderingContext & { program: WebGLProgram }, targetName: string) => {
    const vertexLib = [
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
    ]
    const indices = [
        0,1,
        1,2,
        2,3,
        3,0,

        0,5,
        1,6,
        2,7,
        3,4,

        4,5,
        5,6,
        6,7,
        7,4,
    ]
    const arr = []
    indices.forEach(n => {
        const i = n * 3
        arr.push(
            vertexLib[i] / 5,
            vertexLib[i + 1] / 5,
            vertexLib[i + 2] / 5,
        )
    })
    const vertices = new Float32Array(arr)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    const target = gl.getAttribLocation(gl.program, targetName)
    gl.vertexAttribPointer(target, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(target)
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.LINES, 0, indices.length)
}

const initViewMatrix = (gl: WebGLRenderingContext&{ program: WebGLProgram }) => {
    const [z1, y1] = [Math.cos(angleX.value), -Math.sin(angleX.value)]
    const [x1, z2] = [Math.cos(angleY.value), Math.sin(angleY.value)]
    const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    const viewMatrix = lookAt(
        new Vector3(x1, y1, z1 + z2),
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
    )
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix)
    // gl.uniformMatrix4fv(u_ViewMatrix, false, new Matrix4().lookAt(
    //     new Vector3(x1, y1, z1 + z2),
    //     new Vector3(0, 0, 0),
    //     new Vector3(0, 1, 0),
    // ).elements)
}

// 视图矩阵
const lookAt = (e: Vector3, t: Vector3, u: Vector3) => {
    const d = new Vector3().subVectors(e, t)
    d.normalize()
    const a = new Vector3().crossVectors(u, d)
    a.normalize()
    const b = new Vector3().crossVectors(d, a)
    b.normalize()
    const c = new Vector3(-d.x, -d.y, -d.z)
    c.normalize()
    return [
        a.x, b.x, c.x, 0,
        a.y, b.y, c.y, 0,
        a.z, b.z, c.z, 0,
        0,0,0,1
    ]
}

const render = (gl) => {
    initViewMatrix(gl)
    initVertexPosition(gl, 'a_Position')
}
</script>

<style scoped>

</style>