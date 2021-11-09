const sinFn = (A: number, Omega: number, phi: number) => {
    return (angle: number) => {
        return A * Math.sin(Omega * angle + phi)
    }
}
export default sinFn