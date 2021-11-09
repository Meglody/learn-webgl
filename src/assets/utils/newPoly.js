// 多边类
import {ref, reactive, computed} from 'vue'
const newPoly = (attr) => {
    const verticesOrigin = attr.verticesOrigin ? attr.verticesOrigin : reactive([])
    const gl = attr.gl
    // 点位分量
    const size =  attr.size || 2
    const attrName = attr.attrName || 'a_Position'
    const types = attr.types || ['POINTS']
    const circleDot = attr.circleDot || false
    const uniforms = attr.uniforms || {}
    // 扁平处理的点位数据
    const vertices = computed(() => {
        return verticesOrigin.map(item => item.value).flat(Infinity)
    })
    // 顶点数量
    const count = computed(() => {
        return vertices.value.length / size
    })
    const updateBuffer = () => {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.value), gl.STATIC_DRAW)
    }
    const updateUniforms = () => {
        for(let uniform in uniforms){
            const uniformName = uniform
            const {type: uniformType, value: uniformValue} = uniforms[uniform]
            const target = gl.getUniformLocation(gl.program, uniformName)
            if(uniformType.includes('Matrix')){
                gl[uniformType](target, false, uniformValue)
            }else{
                gl[uniformType](target, uniformValue)
            }
        }
    }
    const addVertice = (...params) => {
        verticesOrigin.push(...params)
        updateBuffer()
    }
    const popVertice = () => {
        const poped = verticesOrigin.pop()
        if(poped){
            updateBuffer()
        }
    }
    const getLastVertice = () => {
        return verticesOrigin[verticesOrigin.length - 1]
    }
    const setVertice = (idx, vertexCoordinator) => {
        if(!verticesOrigin[idx]){
            return
        }
        if(verticesOrigin[idx].length == vertexCoordinator.length){
            verticesOrigin[idx] = vertexCoordinator
        }else if(vertexCoordinator.length < verticesOrigin[idx].length){
            for(let i = 0 ; i < vertexCoordinator.length ; i++){
                verticesOrigin[idx][i] = vertexCoordinator[i]
            }
        }
        updateBuffer()
    }
    const draw = () => {
        if(circleDot){
            const u_isPOINTS = gl.getUniformLocation(gl.program, 'u_isPOINTS')
            for(let type of types){
                gl.uniform1f(u_isPOINTS, type === 'POINTS')
                gl.drawArrays(gl[type], 0, count.value)
            }
        }else{
            for(let type of types){
                gl.drawArrays(gl[type], 0, count.value)
            }
        }
    }
    if(!gl){
        return
    }
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    updateBuffer()
    const a_Position = gl.getAttribLocation(gl.program, attrName)
    gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(a_Position)
    updateUniforms()
    return {
        gl,
        verticesOrigin: verticesOrigin,
        size,
        attrName,
        types,
        vertices: vertices,
        count: count,
        updateBuffer,
        addVertice,
        popVertice,
        getLastVertice,
        setVertice,
        draw
    }
}
export default newPoly