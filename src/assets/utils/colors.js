import { Color } from "https://unpkg.com/three/build/three.module.js";
// gl画布刷底色的方法
const paintColor = (gl, color) => {
    // 声明颜色
    gl.clearColor(...color)
    // 刷底色 webglAPi
    gl.clear(gl.COLOR_BUFFER_BIT)
}
// 传入cssRGB系color，使用gl渲染
const paintRGBColor = (gl, cssString) => {
    const rgbaString = cssString
    const reg = /\((.*)\)/
    const regString = reg.exec(rgbaString)[1]
    const glColor = regString.split(',').map( (item, index) => {
        if(index < 3){
            return ~~item / 255
        }else{
            return ~~item
        }
    })
    // 万一cssRGB系color没有传a值
    glColor.length === 3 && glColor.push(1)
    paintColor(gl, glColor)
}
// 动态颜色画布, 该方法依赖于threejs， 传入的color属于Color的实例化对象
const paintColorAniSequence = (gl, color) => {
    if(color instanceof Color === false) return
    !(function ani(){
        // HSL颜色偏移， 色相、饱和度、亮度
        color.offsetHSL(0.005, 0, 0)
        // 偏移完了在画布上刷上底色
        // threejs的color实例化对象不包含a值，只能手动赋予
        paintColor(gl, [color.r, color.g, color.b, 1])
        // 循环执行动画
        requestAnimationFrame(ani)
    })()
}
export default {
    paintColor,
    paintRGBColor,
    paintColorAniSequence
}