export default class Compose{
    constructor(){
        this.parent = null
        this.children = []
    }
    add(track){
        track.parent = this
        this.children.push(track)
    }
    update(t){
        this.children.forEach(child => {
            child.update(t)
        })
    }
}