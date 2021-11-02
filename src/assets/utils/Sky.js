class Sky {
    constructor(gl){
        this.gl = gl
        this.children = []
    }
    add(target){
        target.gl = this.gl
        this.children.push(target)
    }
    draw(){
        this.children.forEach(target => {
            target.updateBuffer()
            target.draw()
        })
    }
}

export default Sky