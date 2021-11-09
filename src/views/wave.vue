
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { Matrix4, Vector3 } from "three"
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import newPoly from "../assets/utils/newPoly"
import useShader from '../assets/utils/shaders-ts'
import useScaleLinear from '../assets/utils/scaleLinear'
import useSin from '../assets/utils/sinFn'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
const {paintColor} = useColor
const loopLastTimeStamp = ref(0)
const dragging = ref(false)
const angleX = ref(0)
const angleY = ref(0)
onMounted(() => {
    canvasEl.value.width = 900
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#waveVertexShader').textContent
    const fsSource = document.querySelector('#waveFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    render(gl)
    animate(gl)
})

// x、z方向空间坐标极值
const [minPosX, maxPosX, minPosZ, maxPosZ] = [-0.7, 0.8, -1, 1]
// x、z方向的弧度极值
const [minAngleX, maxAngleX, minAngleZ, maxAngleZ] = [0, 4 * Math.PI, 0, 2 * Math.PI]

const scaleX = useScaleLinear(minPosX, minAngleX, maxPosX, maxAngleX)
const scaleZ = useScaleLinear(minPosZ, minAngleZ, maxPosZ, maxAngleZ)

// 初始化点数据
const initWave = (gl) => newPoly({
    gl,
    verticesOrigin: createVertices(),
    size: 3, 
    uniforms: {
        'u_ViewMatrix': {
            type: 'uniformMatrix4fv',
            value: new Matrix4().lookAt(
                new Vector3(0.2, 0.4, 1),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0),
            ).elements
        }
    }
})

const createVertices = () => {
    const vertices = []
    for(let z = minPosZ ; z < maxPosZ ; z += 0.04){
        for(let x = minPosX ; x < maxPosX ; x += 0.03){
            vertices.push(ref([x, 0, z]))
        }
    }
    return vertices
}

const offsetPhi = ref(0)

const updateVertices = (gl) => {
    if(wave.value){
        const { verticesOrigin } = wave.value
        for(let i = 0 ; i < verticesOrigin.length; i++){
            const [posX, posZ] = [verticesOrigin[i].value[0], verticesOrigin[i].value[2]]
            const angleZ = scaleZ(posZ)
            const a = Math.sin(angleZ) * 0.1 + 0.03
            const omega = 2
            const phi = scaleX(posX) + offsetPhi.value
            verticesOrigin[i].value[1] = useSin(a, omega, phi)(angleZ)
        }
        gl.clearColor(0,0,0,1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        wave.value.updateBuffer()
        wave.value.draw()
    }
}

const animate = (gl) => {
    offsetPhi.value += 0.03
    updateVertices(gl)
    requestAnimationFrame(() => animate(gl))
}

const wave = ref()

const render = (gl) => {
    wave.value = initWave(gl)
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    wave.value.draw()
}
</script>

<style scoped>

</style>