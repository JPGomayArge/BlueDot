function cruce(a,b,c,d){const o=(p,q,r)=>{const v=(q[1]-p[1])*(r[0]-q[0])-(q[0]-p[0])*(r[1]-q[1]);return v>1e-12?1:v<-1e-12?-1:0};
 return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)}
function malo(r){const n=r.length;
 for(let i=0;i<n-1;i++)for(let j=i+2;j<n-1;j++){if(i===0&&j===n-2)continue;
  if(cruce(r[i],r[i+1],r[j],r[j+1]))return [i,j]}
 return null}
module.exports={malo,cruce};
