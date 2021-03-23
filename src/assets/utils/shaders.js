const initShaders = (gl, vsSource, fsSource) => {
    // 创建程序对象（编译，翻译js和glsl es语言的介质）
    const program = gl.createProgram()
    // 建立着色对象
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
    // 把顶点着色器对象装入程序对象中
    gl.attachShader(program, vertexShader)
    // 把片元着色器对象装入程序对象中
    gl.attachShader(program, fragmentShader)
    // 连接webgl上下文对象和程序对象
    gl.linkProgram(program)
    // 启动程序对象
    gl.useProgram(program)
    // 将程序对象挂到gl上下文对象上
    gl.program = program
    return true
}
const loadShader = (gl, shaderType, source) => {
    // 根据着色器类型，建立着色器对象
    const shader = gl.createShader(shaderType)
    // 将着色器源文件传入着色器对象中
    gl.shaderSource(shader, source)
    // 编译着色器对象
    gl.compileShader(shader)
    return shader
}
export default {
    loadShader,
    initShaders
}