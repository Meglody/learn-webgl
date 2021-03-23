<template>
    <div>
        <canvas ref="canvas"></canvas>
    </div>
</template>
<script setup>
import { Color } from "https://unpkg.com/three/build/three.module.js";
import useColor from '../assets/utils/colors'
import useShader from '../assets/utils/shaders'
import { defineProps, reactive, ref, onMounted, onUpdated, onUnmounted } from 'vue'
const state = reactive({ count: 0 })
// refs
const canvas = ref(null);
// 引入底色方法
const {paintColor, paintRGBColor, paintColorAniSequence} = useColor
// 获取着色器文本 (glsl es语言) 
const vsSource = document.querySelector('#vertexShader').innerText
const fsSource = document.querySelector('#fragmentShader').innerText
// 引入着色器编译器 解析着色器文本，整合到程序对象中，关联到webgl上下文对象中，实现两种语言的相互通信
const {initShaders} = useShader
onMounted(() => {
    let canvasEl = canvas.value
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    // 三维画笔上下文对象
    const gl = canvasEl.getContext('webgl')
    class_1_colors(gl)
    // 第二节课:着色器相关
    // 初始化着色器后，我们把程序对象挂到了gl上下文对象上，之后的gl上下文中就可以使用gl.program
    initShaders(gl, vsSource, fsSource)

    // 获取顶点着色器暴露出来的变量
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    // 修改改变量的值
    // gl.vertexAttrib3f(a_Position, 0, 0.5, 0) // 输入是整数，实际是浮点数做了兼容
    // gl.vertexAttrib2f(a_Position, 0, 0.5) webGl中的函数命名规律 = [函数名][参数个数][参数类型]
    gl.vertexAttrib1f(a_Position, 0.5)
    // 绘制顶点 [绘制方式(此处使用点来绘画)，从哪个点开始画，指定绘制时需要绘制多少个点]
    // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawArrays
    gl.drawArrays(gl.POINTS, 0, 1)

    // 使用鼠标绘制点位
    canvasEl.addEventListener('click', ({clientX, clientY}) => {
        const {left, top, width, height} = canvasEl.getBoundingClientRect();
        const [cssX, cssY] = [clientX - left, clientY - top];
        const [halfCanvasWidth, halfCanvasHeight] = [width / 2, height / 2];
        const [xBaseCenter, yBaseCenter] = [cssX - halfCanvasWidth, halfCanvasHeight - cssY]
        const [x, y] = [xBaseCenter / halfCanvasWidth, yBaseCenter / halfCanvasHeight]
        // 清理画布
        gl.clear(gl.COLOR_BUFFER_BIT)
        // 获取attibute变量，并修改他的值
        gl.vertexAttrib2f(a_Position, x, y)
        // 绘图
        gl.drawArrays(gl.POINTS, 0, 1)
        // 获取attibute变量，并修改他的值
        gl.vertexAttrib2f(a_Position, .1, .5)
        // 绘图
        gl.drawArrays(gl.POINTS, 0, 1)
        // 以上为同步绘制两次使用同一个颜色缓冲区COLOR_BUFFER_BIT，如果异步执行drawArrays会清空颜色缓冲区
        // 以下的异步绘制就会把画布清空
        // setTimeout(() => {
        //     // 获取attibute变量，并修改他的值
        //     gl.vertexAttrib2f(a_Position, 0, 0)
        //     // 绘图
        //     gl.drawArrays(gl.POINTS, 0, 1)
        // }, 1000);
        // 所以不如将清理画布、获取修改点位、绘图三个步骤做个封装，序列化执行
    })    
})


// 第一节课:webgl画布颜色相关
const class_1_colors = (gl) => {
    // 封装一个刷底色方法
    paintColor(gl, [0,0,0,1])
    // 自己定一个css rgb刷底色方法
    paintRGBColor(gl, 'rgba(255, 0, 0, 1)')
    paintRGBColor(gl, 'rgba(100, 255, 0)')
    // 使用threejs刷底色, 实例化对象
    const color = new Color('rgba(255, 100, 0, 1)')
    // threejs的color实例化对象不包含a值，只能手动赋予
    paintColor(gl, [color.r,color.g,color.b,1])
    // 该方法依赖于threejs， 传入的color属于Color的实例化对象
    // paintColorAniSequence(gl, color)
}
</script>

<style scoped>

</style>