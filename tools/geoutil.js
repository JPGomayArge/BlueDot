// Utilidades de geometria compartidas.
const bbx=r=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of r){if(p[0]<a)a=p[0];if(p[0]>b)b=p[0];if(p[1]<c)c=p[1];if(p[1]>d)d=p[1]}return[a,b,c,d]};
const hit=(x,y)=>!(x[1]<y[0]||y[1]<x[0]||x[3]<y[2]||y[3]<x[2]);
// Aqui vivia keyhole(), que conectaba un agujero interior al contorno con una
// ranura estrecha. Se ha eliminado a proposito: sus ranuras de ancho cero
// disparan el detector de auto-intersecciones, y al "repararlas" se rellena el
// agujero y vuelve el doble pintado. Para agujeros usa recorte.parte(), que
// trocea el poligono con cortes verticales.
module.exports={bbx,hit};
