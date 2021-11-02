// 多边类
import {ref, computed} from 'vue'
const defAttr = (attr) => {
    const verticesOrigin = attr.verticesOrigin ? ref(attr.verticesOrigin) : ref([])
    const ret = {
        gl: attr.gl,
        verticesOrigin,
        // 点位分量
        size: attr.size || 2,
        attrName: attr.attrName || 'a_Position',
        types: attr.types || ['POINTS']
    }
    // 扁平处理的点位数据
    ret.vertices = computed(() => {
        return ret.verticesOrigin.value.flat(Infinity)
    })
    // 顶点数量
    ret.count = computed(() => {
        return ret.vertices.value.length / ret.size
    })
    return ret
}
class Poly {
    constructor(attr) {
        Object.assign(this, defAttr(attr))
        this.init()
    }
    init(){
        const {attrName, size, gl} = this
        if(!gl){
            return
        }
        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        this.updateBuffer()
        const a_Position = gl.getAttribLocation(gl.program, attrName)
        gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(a_Position)
    }
    updateBuffer(){
        const {gl, vertices} = this
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    }
    addVertice(...params){
        this.verticesOrigin.push(...params)
        this.updateBuffer()
    }
    popVertice(){
        const poped = this.verticesOrigin.pop()
        if(poped){
            this.updateBuffer()
        }
    }
    setVertice(idx, vertexCoordinator){
        const {verticesOrigin} = this
        if(verticesOrigin[idx] && verticesOrigin[idx].length == vertexCoordinator.length){
            verticesOrigin[idx] = vertexCoordinator
        }
        this.updateBuffer()
    }
    draw(types = this.types){
        const {gl, count} = this
        for(let type of types){
            gl.drawArrays(gl[type], 0, count)
        }
    }
}

export default Poly