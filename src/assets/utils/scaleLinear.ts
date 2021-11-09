const ScaleLinear = (ax: number, ay: number, bx: number, by: number) => {
    const delta = {
        x: bx - ax,
        y: by - ay
    }
    const k = delta.y / delta.x
    const b = ay - k * ax
    return (x: number) => k * x + b
}
export default ScaleLinear