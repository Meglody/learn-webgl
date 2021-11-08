<template>
    <div style="width: 100%; height: 100vh;">
        <canvas ref="leo" id="leo"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders-ts'
import { ref, onMounted, reactive, watch } from 'vue'
import newPoly from '../assets/utils/newPoly';
import Sky from '../assets/utils/Sky';
import Compose from '../assets/utils/Compose'
import Track from '../assets/utils/Track'
// refs
const leo = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#leoVertexShader').textContent
const fsSource = document.querySelector('#leoFragmentShader').textContent
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
const nowPoly = ref(null)
const hoveringPoint = ref(null)
const sky = ref(null)
const compose = ref(new Compose())

const getCanvasXY = (el, clientX, clientY) => {
    const {left, top, width, height} = el.getBoundingClientRect();
    const [cssX, cssY] = [clientX - left, clientY - top];
    const [halfCanvasWidth, halfCanvasHeight] = [width / 2, height / 2];
    const [xBaseCenter, yBaseCenter] = [cssX - halfCanvasWidth, halfCanvasHeight - cssY]
    const [x, y] = [xBaseCenter / halfCanvasWidth, yBaseCenter / halfCanvasHeight]
    return {x, y}
}
const glToCssPos = ({x,y},{width,height}) => {
  const [halfWidth, halfHeight] = [width / 2, height / 2];
  return {
    x:x*halfWidth,
    y:-y*halfHeight
  }
}
onMounted(() => {
    let canvasEl = leo.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    // 开启片元颜色合成功能，不然渲染的alpha透明通道不会开启
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    initShaders(gl, vsSource, fsSource)
    paintColor(gl, [0,0,0,0])
    initMouseDrawer(gl, canvasEl)
    !(function ani(){
        compose.value.update(new Date())
        render(gl)
        requestAnimationFrame(ani)
    })()
})
const initMouseDrawer = (gl, canvasEl) => {
    sky.value = new Sky(gl)
    canvasEl.oncontextmenu = () => {
        return false
    }
    canvasEl.addEventListener('mousedown', (event) => {
        if(event.button === 2){
            popVertice()
        }else{
            const {x, y} = getCanvasXY(canvasEl, event.clientX, event.clientY)
            if(!nowPoly.value){
                createPoly(gl,x,y)
            }else{
                addVertice([x,y,randomPointSize(),1])
            }
        }
        render(gl)
    })

    const timer = ref(false)
    canvasEl.addEventListener('mousemove', (event) => {
        if(!timer.value){
            timer.value = true
            setTimeout(() => {
                timer.value = false
            }, 16.67);
            const {x, y} = getCanvasXY(canvasEl, event.clientX, event.clientY)
            hoveringPoint.value = hoverPoint(canvasEl, x, y)
            canvasEl.style.cursor = hoveringPoint.value ? 'pointer' : 'default'
            if(nowPoly.value){
                nowPoly.value.setVertice(nowPoly.value.count - 1, [x, y])
                render(gl)
            }
        }
    })
}
const createPoly = (gl,x,y) => {
    const p1 = hoveringPoint.value ? hoveringPoint.value : createNewPoint([x, y, randomPointSize(), 1])
    const p2 = createNewPoint([x, y, randomPointSize(), 1])
    nowPoly.value = newPoly({
        gl,
        verticesOrigin: reactive([
            p1,
            // 第二个是鼠标跟随的顶点
            p2
        ]),
        types: ['POINTS', 'LINE_STRIP'],
        size: 4,
        attrName: 'a_Attr',
        circleDot: true
    })
    sky.value.add(nowPoly.value)
}
const createTrack = (vec4) => {
    const track = new Track(vec4)
    track.start = new Date()
    track.timeLen = 2000
    track.loop = true
    track.keyMap = new Map([
        [
            'pointSize',
            [
                [500, vec4.pointSize],
                [1000, 0],
                [1500, vec4.pointSize],
            ]
        ],
        [
            'alpha',
            [
                [500, 1],
                [1000, 0],
                [1500, 1],
            ]
        ],
    ])
    compose.value.add(track)
    return track.targetArr
}
const addVertice = (vec4) => {
    const point = hoveringPoint.value ? hoveringPoint.value : createNewPoint(vec4)
    console.log(point)
    nowPoly.value.addVertice(point)
}
const popVertice = () => {
    nowPoly.value.popVertice()
    compose.value.children.pop()
    nowPoly.value = null
}
const randomPointSize = () => {
    return Math.random()* 8 + 3
}
const createNewPoint = (vec4) => {
    const [x, y, pointSize, alpha] = vec4
    const ret = createTrack({x, y, pointSize, alpha})
    return ret
}
const hoverPoint = (canvasEl, x, y) => {
    const allPolys = sky.value.children
    // 排除距离大于10的顶点，100是开方
    const distFilter = (vx, vy) => {
        const delta = {
            x: x - vx,
            y: y - vy
        }
        const {x: cssx, y: cssy} = glToCssPos(delta, canvasEl)
        const dist = cssx * cssx + cssy * cssy
        if(dist < 100){
            return true
        }
        return false
    }
    // 排除现在正在绘制的poly的最后一个点，这个点正在跟着鼠标移动呢
    const noCurrentTailFilter = vertex => {
        if(nowPoly.value){
            return vertex !== nowPoly.value.getLastVertice()
        }else{
            return true
        }
    }
    const ret = allPolys
        .map(poly => poly.verticesOrigin)
        .flat()
        .filter(vertex => noCurrentTailFilter(vertex))
        .find(({value: [vx, vy, pointSize, alpha]}) => distFilter(vx, vy))
    if(ret){
        return ret
    }
    return false
}
const render = (gl) => {
    paintColor(gl, [0,0,0,0])
    sky.value.draw()
}
</script>

<style scoped>
body {
margin: 0;
overflow: hidden;
}
#leo {
    background: url('../assets/image/sky_2.jpg');
    background-size: cover;
    background-position: right bottom;
}
</style>