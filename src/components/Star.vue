<template>
    <div>
        <canvas ref="stars" id="stars"></canvas>
    </div>
</template>
<script setup>
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders'
import { defineProps, reactive, ref, onMounted, onUpdated, onUnmounted } from 'vue'
import Compose from '../assets/utils/Compose'
import Track from '../assets/utils/Track'
// g_points储存顶点数据的数组
const state = reactive({ compose: new Compose(), stars: [] })
// refs
const stars = ref(null);
// 引入底色方法
const {paintColor} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#vertexShader').innerText
const fsSource = document.querySelector('#fragmentShader').innerText
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = stars.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    // 开启片元颜色合成功能，不然渲染的alpha透明通道不会开启
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    // 绘制底色
    paintColor(gl, [0,0,0,0])
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    initShaders(gl, vsSource, fsSource)

    // 使用鼠标绘制点位， 这里的点击事件仅将新建的星星数据制作成轨道添加到合成中
    canvasEl.addEventListener('click', ({clientX, clientY}) => {
        const {x, y} = getCanvasXY(canvasEl, clientX, clientY)
        const randomSize = Math.random() * 5 + 2
        // const alpha = Math.random()
        // 透明度由动画帧来控制
        const alpha = 1
        // 创建一个新的星星数据
        const newStar = {x, y, size: randomSize, alpha}
        // 将新建的星星制作成轨道添加到合成中
        addNewStar(newStar)
    })    
    // 使用requestAnimationFrame来驱动动画
    !(function ani(){
        // 更新整个合成的时间
        state.compose.update(new Date())
        // 渲染动画
        randerPoints(gl)
        requestAnimationFrame(ani)
    })()
})

// 封装鼠标点击canvas画布获取canvas画布x,y坐标方法
const getCanvasXY = (el, clientX, clientY) => {
    const {left, top, width, height} = el.getBoundingClientRect();
    const [cssX, cssY] = [clientX - left, clientY - top];
    const [halfCanvasWidth, halfCanvasHeight] = [width / 2, height / 2];
    const [xBaseCenter, yBaseCenter] = [cssX - halfCanvasWidth, halfCanvasHeight - cssY]
    const [x, y] = [xBaseCenter / halfCanvasWidth, yBaseCenter / halfCanvasHeight]
    return {x, y}
}

// 将星星push到数组中，并实例化成一条track轨道加入compose合成中
// 原理可参考AE动画的制作
const addNewStar = (newStar) => {
    state.stars.push(newStar)
    // 新建一条track
    const newTrack = new Track(newStar)
    // 设置track起始时间
    newTrack.start = new Date()
    // 设置track的关键帧fms
    newTrack.keyMap = new Map([
        // 这里仅设置了星星alpha属性的三个关键帧
        ['alpha', [
            [500, newStar.alpha],
            [1000, 0],
            [1500, newStar.alpha],
        ]]
    ])
    // 设置轨道时长
    newTrack.timeLen = 2000
    // 设置轨道为循环轨道
    newTrack.loop = true
    // 将轨道添加到合成中
    state.compose.add(newTrack)
}

// 封装同步绘图的方法
const randerPoints = (gl) => {
    // 记录顶点数据
    // 获取并修改点位
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    const u_FlagColor = gl.getUniformLocation(gl.program, 'u_FlagColor')
    // 清理画布
    paintColor(gl, [0,0,0,0])
    // 绘图
    state.stars.forEach(({x, y, size, alpha}) => {
        // 设置顶点位置
        gl.vertexAttrib2f(a_Position, x, y)
        // 这里同理设置顶点尺寸
        gl.vertexAttrib1f(a_PointSize, size)
        // 这里设置顶点颜色数据
        gl.uniform4f(u_FlagColor, 0.87, 0.92, 1, alpha)
        gl.drawArrays(gl.POINTS, 0, 1)
    })
}
</script>

<style scoped>
#stars{
    background-image: url('../assets/image/sky.jpg');
    background-size: cover;
    background-position: right bottom;
}
</style>