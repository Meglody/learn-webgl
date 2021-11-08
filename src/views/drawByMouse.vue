<template>
    <div style="width: 100%; height: 100vh; background: yellowgreen">
        <canvas ref="points" id="points"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders-ts'
import { ref, onMounted } from 'vue'
import Poly from '../assets/utils/Poly';
import Sky from '../assets/utils/Sky';
// refs
const points = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#mouseDrawVertexShader').textContent
const fsSource = document.querySelector('#mouseDrawFragmentShader').textContent
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
const nowPoly = ref(null)
const sky = ref(null)
const getCanvasXY = (el, clientX, clientY) => {
    const {left, top, width, height} = el.getBoundingClientRect();
    const [cssX, cssY] = [clientX - left, clientY - top];
    const [halfCanvasWidth, halfCanvasHeight] = [width / 2, height / 2];
    const [xBaseCenter, yBaseCenter] = [cssX - halfCanvasWidth, halfCanvasHeight - cssY]
    const [x, y] = [xBaseCenter / halfCanvasWidth, yBaseCenter / halfCanvasHeight]
    return {x, y}
}
onMounted(() => {
    let canvasEl = points.value
    canvasEl.width = 900
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    initShaders(gl, vsSource, fsSource)
    // test(gl)
    paintColor(gl, [0,0,0,1])
    initMouseDrawer(gl, canvasEl)
})
const initMouseDrawer = (gl, canvasEl) => {
    sky.value = new Sky(gl)
    canvasEl.oncontextmenu = () => {
        return false
    }
    canvasEl.addEventListener('mousedown', (event) => {
        if(event.button === 2){
            nowPoly.value.popVertice()
            nowPoly.value = null
        }else{
            const {x, y} = getCanvasXY(canvasEl, event.clientX, event.clientY)
            if(!nowPoly.value){
                createPoly(gl,x,y)
            }else{
                nowPoly.value.addVertice([x,y])
            }
        }
        render(gl)
    })

    canvasEl.addEventListener('mousemove', (event) => {
        if(nowPoly.value){
            const {x, y} = getCanvasXY(canvasEl, event.clientX, event.clientY)
            nowPoly.value.setVertice(nowPoly.value.count - 1, [x, y])
            render(gl)
        }
    })
}
const createPoly = (gl,x,y) => {
    nowPoly.value = new Poly({
        gl,
        verticesOrigin: [
            [x,y],
            // 第二个是鼠标跟随的顶点
            [x,y]
        ],
        types: ['POINTS', 'LINE_STRIP'],
        size: 2,
    })
    sky.value.add(nowPoly.value)
}
const render = (gl) => {
    paintColor(gl, [0,0,0,1])
    sky.value.draw()
}
const test = (gl) => {
    paintColor(gl, [0,0,0,1])
    nowPoly.value = new Poly({
        gl,
        verticesOrigin: [
            [0, 0.1]
        ],
    })
    nowPoly.value.updateBuffer()
    nowPoly.value.draw(['POINTS'])
    setTimeout(() => {
        paintColor(gl, [0,0,0,1])
        nowPoly.value.addVertice([-0.1, -0.1])
        nowPoly.value.draw(['POINTS'])
    }, 2000);
    setTimeout(() => {
        paintColor(gl, [0,0,0,1])
        nowPoly.value.draw(['POINTS', 'LINE_STRIP'])
    }, 3000);
}
</script>

<style scoped>
</style>