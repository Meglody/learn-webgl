
<template>
    <div style="width: 100%; height: 100vh; background: black">
        <canvas id="canvas" ref="canvasEl"></canvas>
    </div>
</template>

<script setup lang="ts">
import { Matrix4, Vector3, Color } from "three"
import { onMounted, ref } from "vue"
import useColor from '../assets/utils/colors-ts'
import nextPoly from "../assets/utils/nextPoly"
import useShader from '../assets/utils/shaders-ts'
import useScaleLinear from '../assets/utils/scaleLinear'
import useSin from '../assets/utils/sinFn'
const canvasEl = ref<HTMLCanvasElement>()
const {initShaders} = useShader
onMounted(() => {
    canvasEl.value.width = 900
    canvasEl.value.height = window.innerHeight
    const glContext = canvasEl.value.getContext('webgl')
    const vsSource = document.querySelector('#multiDiffColorVertexShader').textContent
    const fsSource = document.querySelector('#multiDiffColorFragmentShader').textContent
    const gl = initShaders(glContext, vsSource, fsSource)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    render(gl)
    animate(gl)
})

// x、z方向空间坐标极值
const [minPosX, maxPosX, minPosZ, maxPosZ] = [-0.7, 0.8, -1, 1]
// x、z方向的弧度极值
const [minAngleX, maxAngleX, minAngleZ, maxAngleZ] = [0, 4 * Math.PI, 0, 2 * Math.PI]

// y高度的极值
const [minPosY, maxPosY] = [0.03, 0.13]
// 色相的极值
const [minH, maxH] = [0.45, 0.55]

const scaleX = useScaleLinear(minPosX, minAngleX, maxPosX, maxAngleX)
const scaleZ = useScaleLinear(minPosZ, minAngleZ, maxPosZ, maxAngleZ)
// 色相和y高度的比例尺
const scaleC = useScaleLinear(minPosY, minH, maxPosY, maxH)

// 色值
const color = ref<Color>(new Color())

// 波浪对象的行数和烈属
const [row, col] = [40, 40]

// 波浪对象的两个attribute变量，分别是位置、颜色
const a_Position = {
    size: 3, 
    index: 0
}
const a_Color = {
    size: 4,
    index: 3
}
// 类目尺寸
const categorySize = a_Position.size + a_Color.size

// 初始化点数据
const initWave = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => nextPoly({
    gl,
    verticesOrigin: createSources(),
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
    },
    attributes: {
        a_Position,
        a_Color
    }
})

const createSources = () => {
    const source = []
    const spaceX = (maxPosX - minPosX) / col
    const spaceZ = (maxPosZ - minPosZ) / row
    for(let z = 0 ; z < row ; z++){
        for(let x = 0 ; x < col ; x++){
            const px = minPosX + x * spaceX
            const pz = minPosZ + z * spaceZ
            source.push(ref([px, 0, pz, 1,1,1,0.5]))
        }
    }
    const sortedSource = []
    const createTriangle = (index) => {
        return [
            source[index], source[index - col - 1], source[index - 1],
            source[index], source[index - col] ,source[index - col - 1]
        ]
    }
    for(let i = 0 ; i < source.length ; i++){
        if(i > col - 1){
            if(i % col !== 0){
                sortedSource.push(...createTriangle(i))
            }
        }
    }
    return sortedSource
}

const offsetPhi = ref(0)

const updateVertices = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    if(wave.value){
        const { verticesOrigin : source } = wave.value
        for(let i = 0 ; i < source.length; i++){
            const [posX, posZ] = [source[i].value[0], source[i].value[2]]
            const angleZ = scaleZ(posZ)
            const a = Math.sin(angleZ) * 0.1 + 0.03
            const omega = 2
            const phi = scaleX(posX) + offsetPhi.value
            const y = useSin(a, omega, phi)(angleZ)
            source[i].value[1] = y
            const h = scaleC(y)
            const {r, g, b} = color.value.setHSL(h, 1, 0.6)
            source[i].value[3] = r
            source[i].value[4] = g
            source[i].value[5] = b
        }
        gl.clearColor(0,0,0,1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        wave.value.updateBuffer()
        // wave.value.draw()
        // wave.value.draw(['LINES'])
        // wave.value.draw(['TRIANGLES'])
        wave.value.draw(['LINES','TRIANGLES'])
    }
}

const animate = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    offsetPhi.value += 0.12
    updateVertices(gl)
    requestAnimationFrame(() => animate(gl))
}

const wave = ref()

const render = (gl: WebGLRenderingContext & {
    program: WebGLProgram;
}) => {
    wave.value = initWave(gl)
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    wave.value.draw()
}
</script>

<style scoped>

</style>