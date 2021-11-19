precision mediump float;
uniform vec2 u_CanvasSize;
float halfW = u_CanvasSize.x / 2.0;
float halfH = u_CanvasSize.y / 2.0;
mat4 m = mat4(
    255,0,0,255,
    255,255,0,255,
    0,255,0,255,
    0,0,255,255
);
void main(){
    bool xb =  halfW > gl_FragCoord.x;
    bool yb =  halfH > gl_FragCoord.y;
    if(xb){
        if(yb){
            gl_FragColor = m[0] / 255.0;
        }else{
            gl_FragColor = m[1] / 255.0;
        }
    }else{
        if(yb){
            gl_FragColor = m[3] / 255.0;
        }else{
            gl_FragColor = m[4] / 255.0;
        }
    }
}