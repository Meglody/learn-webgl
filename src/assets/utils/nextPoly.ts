// 多边类
import {Ref, ref, reactive, computed} from 'vue'
interface uniformType {
    [key: string]: {
        type: string
        value: number[]
    }
}
interface attributeType {
    [key: string]: {
        size: number
        index: number
    }
}
interface attrType{
    gl: WebGLRenderingContext & {
        program: WebGLProgram;
    }
    verticesOrigin: Ref<number>[]
    size: number
    uniforms: uniformType
    attributes: attributeType
    types?: string[]
    circleDot?: boolean
}
const newPoly = (attr: attrType) => {
    const verticesOrigin = attr.verticesOrigin ? attr.verticesOrigin : reactive([])
    const gl = attr.gl
    const attributes = attr.attributes || {}
    const types = attr.types || ['POINTS']
    const circleDot = attr.circleDot || false
    const uniforms = attr.uniforms || {}
    // 扁平处理的点位数据
    const vertices = computed(() => {
        return verticesOrigin.map(item => item.value).flat(Infinity)
    })
    // 顶点数量
    const count = computed(() => {
        if(Object.values(attributes).length){
            // 所有顶点数据数量 / 各个系列的分量(size)和
            return vertices.value.length / Object.values(attributes).reduce((res, item) => res += item.size, 0)
        }else{
            return 0
        }
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
    const updateAttributes = () => {
        const elementBytes = new Float32Array(vertices.value).BYTES_PER_ELEMENT
        const categorySize = Object.values(attributes).reduce((res, item) => res += item.size, 0)
        for(let attrib in attributes){
            const attribName = attrib
            const {size, index} = attributes[attrib]
            const target = gl.getAttribLocation(gl.program, attribName)
            gl.vertexAttribPointer(target, size, gl.FLOAT, false, categorySize * elementBytes, index * elementBytes)
            gl.enableVertexAttribArray(target)
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
    const draw = (userTypes: string[]) => {
        if(circleDot){
            const u_isPOINTS = gl.getUniformLocation(gl.program, 'u_isPOINTS')
            if(userTypes){
                for(let type of userTypes){
                    // @ts-ignore
                    gl.uniform1f(u_isPOINTS, type === 'POINTS')
                    gl.drawArrays(gl[type], 0, count.value)
                }
                return
            }
            for(let type of types){
                // @ts-ignore
                gl.uniform1f(u_isPOINTS, type === 'POINTS')
                gl.drawArrays(gl[type], 0, count.value)
            }
        }else{
            if(userTypes){
                for(let type of userTypes){
                    gl.drawArrays(gl[type], 0, count.value)
                }
                return
            }
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
    updateAttributes()
    updateUniforms()
    return {
        gl,
        verticesOrigin: verticesOrigin,
        attributes,
        uniforms,
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