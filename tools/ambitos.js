// AMBITOS FISICOS DE LAS AREAS CULTURALES. Tabla unica.
module.exports = [
 { id:'pueblos_sahara',       region:'SAHARA' },
 { id:'sahel_pueblos',        region:'SAHEL' },
 { id:'chaco_pueblos',        region:'GRAN CHACO' },
 { id:'llanos_orinoco',       region:'LLANOS' },
 { id:'pampa_pueblos',        region:'PAMPAS' },
 { id:'tibet_antiguo',        region:'PLATEAU OF TIBET' },
 { id:'amazonia_noroeste',    region:'AMAZON BASIN', lado:[['Amazonas','N'],['Negro','W']] },
 { id:'amazonia_suroeste',    region:'AMAZON BASIN', lado:[['Amazonas','S'],['Madeira','W']] },
 { id:'amazonia_central',     region:'AMAZON BASIN', lado:[['Amazonas','S'],['Purus','N'],['Ucayali','E']] },
 { id:'alto_xingu',           region:'AMAZON BASIN', lado:[['Amazonas','S'],['Madeira','E'],['Xingu','W']] },
 { id:'ge_cerrado',           region:'BRAZILIAN HIGHLANDS' },
 { id:'pantanal_chiquitania', region:'PANTANAL' },
 { id:'caribes_guayanas',     region:'GUIANA SHIELD', modo:'suma' },
 { id:'caribes_guayanas',     region:'AMAZON BASIN', lado:[['Amazonas','N'],['Negro','E']], modo:'suma' },
];
