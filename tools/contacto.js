#!/usr/bin/env node
// HOJA DE CONTACTO: una region del mundo en diez cortes de tiempo, en una sola
// imagen.
//
// Por que. Las dos cosas que estaban mal en el globo -las lineas que cruzaban
// Estados Unidos y las formas en H del Amazonas- no las encontro ninguna de las
// diez medidas del proyecto. Las encontro el usuario mirando el telefono. Un
// rectangulo y una cuenca del mismo tamano dan el mismo numero en todas las
// metricas que existen; la unica forma de distinguirlos es verlos.
//
// Asi que el barrido visual deja de ser una casualidad y pasa a ser un paso:
// doce regiones por diez siglos, ciento veinte paneles, y se revisan. Lo que
// se busca son las firmas que ninguna metrica tiene:
//
//   - bordes rectos que no sigan a nada
//   - formas que se repiten identicas en siglos consecutivos y luego saltan
//   - manchas que aparecen o desaparecen de golpe entre dos paneles
//   - contornos que no llegan a la costa gris
//   - negro donde deberia haber alguien
//
// Un panel por siglo en la misma hoja es deliberado: **la mitad de los defectos
// de este mapa son temporales y no espaciales**, y un panel suelto no los
// ensena. Una entidad con la misma silueta exacta durante ochocientos anios y
// un salto brusco despues no esta mal dibujada en ningun panel; esta mal en la
// secuencia.
//
//   JSX=<mapa> node contacto.js <salida/> [region,region,...]
//   ANIOS=<a,a,..>  ANCHO=<px por panel, 460>  COSTURAS=1
const fs=require('fs');
const L=require('./lib.js');
const P=require('./pinta_lib.js');

const REGIONES={
 america_norte:   [-170,-52, 12, 72],
 america_central: [-120,-58,  5, 33],
 america_sur:     [ -84,-33,-56, 14],
 europa:          [ -12, 45, 34, 72],
 africa_norte:    [ -20, 52,  4, 39],
 africa_sur:      [   5, 52,-36,  9],
 oriente_medio:   [  24, 80, 11, 48],
 india:           [  58, 97,  4, 39],
 asia_oriental:   [  95,148, 17, 55],
 siberia:         [  52,180, 45, 78],
 insulindia:      [  90,148,-12, 24],
 oceania:         [ 110,180,-48,  6],
};
const SALIDA=process.argv[2]||'/tmp/contacto';
const PEDIDAS=(process.argv[3]||Object.keys(REGIONES).join(',')).split(',');
const ANIOS=(process.env.ANIOS||'-2000,-500,1,500,1000,1300,1500,1700,1850,2000').split(',').map(Number);
const AP=+(process.env.ANCHO||460);
const COL=Math.ceil(Math.sqrt(ANIOS.length*1.6));
const FIL=Math.ceil(ANIOS.length/COL);
const {CIV}=L.load(process.env.JSX);
fs.mkdirSync(SALIDA,{recursive:true});

const anioTxt=a=>a<0?Math.abs(a)+' aC':a+' dC';
for(const nombre of PEDIDAS){
 const caja=REGIONES[nombre];
 if(!caja){console.log('?? region desconocida: '+nombre);continue}
 const [X0,X1,Y0,Y1]=caja;
 const HP=Math.max(1,Math.round(AP*(Y1-Y0)/(X1-X0)));
 const BORDE=2, ROT=18;
 const W=COL*(AP+BORDE)+BORDE, H=FIL*(HP+ROT+BORDE)+BORDE;
 const buf=P.nuevoLienzo(W,H,26);
 ANIOS.forEach((A,k)=>{
  const cx=k%COL, cy=(k/COL)|0;
  const ox=BORDE+cx*(AP+BORDE), oy=BORDE+cy*(HP+ROT+BORDE)+ROT;
  // fondo del panel
  for(let y=oy;y<oy+HP;y++)for(let x=ox;x<ox+AP;x++){const i=(y*W+x)*3;buf[i]=10;buf[i+1]=11;buf[i+2]=13}
  const n=P.panel(buf,W,H,ox,oy,AP,HP,CIV,A,caja,{costuras:!!process.env.COSTURAS});
  P.texto(buf,W,H,anioTxt(A),ox+2,oy-ROT+4,2,200,205,215);
  P.texto(buf,W,H,String(n),ox+AP-6*2*String(n).length-4,oy-ROT+4,2,110,116,128);
 });
 const ruta=SALIDA+'/'+nombre+'.png';
 P.png(buf,W,H,ruta);
 console.log(ruta+'  '+W+'x'+H+'  '+ANIOS.length+' cortes');
}
