export default class Track{
    constructor(target){
        this.parent = null
        // 轨道对象
        this.target = target
        this.start = 0
        this.timeLen = 5
        this.keyMap = new Map()
        this.loop = false
    }
    update(t){
        const { target, start, timeLen, keyMap, loop } = this
        let trackTime = t - start
        loop && (trackTime = trackTime % timeLen)
        for(const [key, fms] of keyMap){
            // key 是轨道对象的某个属性，比如alpha、size等等
            const last = fms.length - 1
            if(trackTime < fms[0][0]){
                target[key] = fms[0][1]
            }else if(trackTime > fms[last][0]){
                target[key] = fms[last][1]
            }else{
                target[key] = getStateBetweenFms(trackTime, fms, last)
            }
        }
    }
}


function getStateBetweenFms(time,fms,last){
    for(let i=0;i<last;i++){
        const fm1=fms[i]
        const fm2=fms[i+1]
        if(time>=fm1[0]&&time<=fm2[0]){
            const delta={
                x:fm2[0]-fm1[0],
                y:fm2[1]-fm1[1],
            }
            const k=delta.y/delta.x
            const b=fm1[1]-fm1[0]*k
            return k*time+b
        }
    }
}