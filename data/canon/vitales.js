#!/usr/bin/env node
// COMPRUEBA QUE LOS HECHOS QUE NADIE PUEDE ECHAR EN FALTA ESTAN EN EL CANON.
//
// Una lista de control de ~300 sucesos y personas de todo el mundo, cada uno con
// un año y una expresion que debe aparecer en el titulo. Para cada uno dice si
// esta en el canon, si solo esta en el fondo (importancia 1-2: deberia subir al
// canon) o si falta del todo. No es una lista cerrada ni "la historia": es la
// red de seguridad contra los olvidos que ya nos han pasado (Apolo 11, Hiroshima
// o la Peste negra faltaban en el volcado original).
//
//   node vitales.js                      (lee ../events_extended.json)
//   node vitales.js otro.json
const fs=require('fs'), path=require('path');
const E=JSON.parse(fs.readFileSync(process.argv[2]||path.join(__dirname,'..','events_extended.json'),'utf8'));
const N=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// [año, tolerancia, regex sobre es+en]
const L=[
 // prehistoria y antiguedad
 [-9500,200,/gobekli/],[-7000,1000,/arroz|rice/],[-3300,200,/cuneiforme|cuneiform/],[-3100,100,/narmer/],[-2560,50,/gran piramide|great pyramid/],[-2334,30,/sargon/],[-1754,30,/hammurabi/],
 [-1600,200,/thera|santorini/],[-1274,10,/qadesh|kadesh/],[-1200,50,/colapso.*bronce|bronze age collapse/],[-1046,30,/zhou/],[-776,5,/olimpic|olympic/],[-753,5,/roma|rome/],
 [-650,100,/moneda|coin/],[-612,5,/ninive|nineveh/],[-587,5,/babilonia|babylon/],[-563,40,/buda|buddha/],[-551,20,/confucio|confucius/],[-550,20,/ciro|cyrus/],[-509,5,/republica|republic/],
 [-508,5,/democracia|democracy/],[-490,2,/maraton|marathon/],[-480,2,/salamina|salamis/],[-431,3,/peloponeso|peloponnesian/],[-399,3,/socrates/],[-331,2,/gaugamela/],[-322,10,/maurya/],[-261,5,/kalinga/],
 [-221,3,/qin/],[-216,2,/cannas|cannae/],[-202,3,/zama/],[-202,5,/han/],[-146,3,/cartago|carthage/],[-100,100,/ruta de la seda|silk road/],[-49,2,/rubicon/],[-44,2,/cesar|caesar/],[-31,2,/actium/],
 [-27,3,/augusto|augustus/],[30,5,/jesus/],[70,3,/templo|temple/],[79,2,/vesubio|vesuvius/],[105,20,/papel|paper/],[220,5,/tres reinos|three kingdoms/],[313,3,/milan/],[325,2,/nicea|nicaea/],
 [330,5,/constantinopla|constantinople/],[380,5,/tesalonica|thessalonica/],[410,2,/roma|rome/],[451,2,/calcedonia|chalcedon|catalaunicos|catalaunian/],[476,2,/roma|rome/],
 // medieval
 [529,5,/justiniano|justinian|benito|benedict/],[541,5,/peste|plague/],[570,10,/mahoma|muhammad/],[622,2,/hegira|hijra/],[632,2,/mahoma|muhammad/],[636,2,/yarmuk|qadisiyya/],[661,3,/omeya|umayyad/],
 [711,2,/guadalete|hispania|iberia/],[732,2,/poitiers|tours/],[750,15,/abasi|abbasid/],[751,2,/talas/],[762,3,/bagdad|baghdad/],[793,2,/lindisfarne/],[800,2,/carlomagno|charlemagne/],
 [843,2,/verdun/],[868,5,/sutra|diamante|diamond/],[900,100,/maya/],[960,5,/song/],[969,3,/fatimi|fatimid|cairo/],[988,3,/rus|vladimir/],[1000,30,/vinland|erikson/],
 [1054,2,/cisma|schism/],[1066,2,/hastings/],[1071,2,/manzikert/],[1095,2,/clermont|cruzada|crusade/],[1099,2,/jerusalen|jerusalem/],[1187,2,/hattin/],[1206,3,/gengis|genghis|delhi/],[1215,2,/carta magna|magna carta/],
 [1235,10,/mali|sundiata/],[1258,2,/bagdad|baghdad/],[1260,2,/ain jalut|ayn jalut/],[1271,5,/yuan|kublai/],[1281,2,/kamikaze|mongol/],[1324,2,/mansa musa/],[1347,3,/peste negra|black death/],
 [1368,2,/ming/],[1398,2,/delhi|timur|tamerlan/],[1405,5,/zheng he/],[1415,2,/agincourt|azincourt|ceuta/],[1429,2,/orleans|juana|joan/],[1438,5,/pachacutec|pachacuti/],[1450,20,/gutenberg|imprenta|printing/],
 [1453,2,/constantinopla|constantinople/],[1455,3,/rosas|roses/],[1469,10,/nanak/],[1485,2,/bosworth/],[1488,2,/buena esperanza|good hope|dias/],[1492,2,/colon|columbus|granada|judios|jews/],[1494,2,/tordesillas/],[1498,2,/calicut|gama/],
 // moderna
 [1500,2,/cabral|brasil|brazil/],[1501,5,/safavi/],[1517,2,/lutero|luther|tesis|theses/],[1519,3,/magallanes|magellan|cortes/],[1521,2,/tenochtitlan/],[1526,2,/panipat|mohacs/],[1529,2,/viena|vienna/],[1532,2,/cajamarca|atahualpa/],
 [1534,2,/supremacia|supremacy|enrique|henry/],[1536,3,/calvino|calvin/],[1543,2,/copernico|copernicus|vesalio|vesalius/],[1545,3,/trento|trent|potosi/],[1555,2,/augsburgo|augsburg/],[1565,3,/manila|galeon|galleon/],[1571,2,/lepanto/],
 [1572,2,/bartolome|bartholomew/],[1582,2,/gregoriano|gregorian|calendario|calendar/],[1588,2,/armada/],[1592,2,/imjin|corea|korea/],[1598,2,/nantes/],[1600,2,/sekigahara/],[1602,2,/voc|indias orientales|east india/],[1603,3,/tokugawa|edo/],
 [1607,2,/jamestown/],[1609,2,/kepler|galileo|telescopio|telescope/],[1618,2,/treinta anos|thirty years/],[1619,2,/virginia|esclav|slave/],[1620,2,/mayflower/],[1633,2,/galileo/],[1639,3,/sakoku/],[1644,2,/ming|qing|manch/],
 [1648,2,/westfalia|westphalia/],[1649,2,/carlos i|charles i/],[1652,2,/cabo|cape/],[1683,2,/viena|vienna/],[1687,2,/principia|newton/],[1688,2,/gloriosa|glorious/],[1689,2,/nerchinsk/],[1701,3,/asante|ashanti/],
 [1703,2,/petersburgo|petersburg/],[1707,2,/union|aurangzeb/],[1709,2,/poltava/],[1713,2,/utrecht/],[1739,2,/nader|delhi/],[1744,3,/wahhab/],[1755,2,/lisboa|lisbon/],[1756,2,/siete anos|seven years/],[1757,2,/plassey/],
 [1762,2,/contrato social|social contract/],[1769,3,/watt|vapor|steam/],[1770,2,/cook|australia/],[1773,2,/te|tea|pugachov|pugachev/],[1776,2,/independencia|independence|riqueza|wealth/],[1780,2,/tupac amaru/],[1783,2,/paris|montgolfier/],
 [1787,2,/constitucion|constitution/],[1788,2,/sydney|botany/],[1789,2,/bastilla|bastille|derechos|rights/],[1791,2,/haiti|saint-domingue|olympe|gouges/],[1793,2,/luis xvi|louis xvi|terror/],[1796,2,/vacuna|vaccine|jenner/],[1798,2,/egipto|egypt|napoleon/],[1799,2,/brumario|brumaire/],
 // contemporanea
 [1804,2,/haiti|napoleon|sokoto/],[1805,2,/trafalgar|austerlitz/],[1807,2,/trata|slave trade/],[1808,2,/dos de mayo|madrid|corte|rio/],[1810,2,/dolores|hidalgo|mayo|buenos aires/],[1812,2,/rusia|russia|cadiz/],[1815,2,/waterloo|viena|vienna|tambora/],
 [1816,2,/shaka|zulu|tucuman/],[1819,2,/boyaca|singapur|singapore|peterloo/],[1821,2,/mexico|peru|grecia|greece|carabobo/],[1822,2,/brasil|brazil|guayaquil/],[1823,2,/monroe/],[1824,2,/ayacucho/],[1825,2,/stephenson|ferrocarril|railway|decembrist|decembrista/],
 [1830,2,/argelia|algeria|julio|july|belgica|belgium/],[1833,2,/abolicion|abolition/],[1836,2,/trek|alamo|texas/],[1838,2,/lagrimas|tears|blood river/],[1839,2,/opio|opium|tanzimat|daguerr/],[1840,2,/waitangi/],[1842,2,/nankin|nanjing/],
 [1845,2,/irlanda|ireland|hambruna|famine/],[1848,2,/revolucion|revolution|manifiesto|manifesto|seneca|guadalupe hidalgo|california/],[1850,2,/taiping/],[1853,2,/perry|crimea/],[1854,2,/eureka|colera|cholera|snow/],[1857,2,/cipayos|sepoy|mutiny|india/],
 [1859,2,/darwin|origen|origin|solferino/],[1860,2,/garibaldi|palacio de verano|summer palace/],[1861,2,/secesion|civil war|italia|italy|siervos|serfs/],[1863,2,/gettysburg|emancipacion|emancipation|cruz roja|red cross/],[1865,2,/lincoln|appomattox|maxwell/],
 [1866,2,/mendel|sadowa|koniggratz/],[1867,2,/canada|meiji|capital|marx|maximiliano|maximilian/],[1868,2,/meiji|cuba|yara/],[1869,2,/suez|transcontinental|mendeleiev|periodica|periodic/],[1870,2,/sedan|roma|rome|vaticano|vatican/],[1871,2,/aleman|german|comuna|commune|stanley/],
 [1876,2,/bell|telefono|telephone|little bighorn|porfiri|bulgaria/],[1879,2,/zulu|isandlwana|pacifico|pacific|edison|bombilla|bulb/],[1881,2,/tunez|tunisia|alejandro ii|alexander ii/],[1882,2,/egipto|egypt|koch/],[1884,2,/berlin/],[1885,2,/congo|jartum|khartoum|indio|congress|pasteur|benz/],
 [1886,2,/haymarket|benz|witwatersrand/],[1888,2,/brasil|brazil|abolic/],[1889,2,/eiffel|meiji|brasil|brazil|republica/],[1893,2,/hawai|nueva zelanda|new zealand|sufragio|suffrage/],[1894,2,/sino|donghak|dreyfus/],[1895,2,/rayos x|x-ray|lumiere|cine|marti/],
 [1896,2,/adua|adwa|olimp|olymp|atenas|athens/],[1898,2,/cuba|omdurman|fachoda|fashoda|curie|radiactividad|radioactivity/],[1899,2,/boer|filipin|philippine|mil dias|thousand days/],[1900,2,/boxer|planck|cuanto|quantum|freud|suenos|dreams/],[1901,2,/australia|marconi|radio|nobel/],
 [1903,2,/wright|vuelo|flight|panama/],[1904,2,/herero|ruso-japon|russo-japan/],[1905,2,/tsushima|revolucion|revolution|relatividad|relativity|bengala|bengal/],[1908,2,/jovenes turcos|young turk|ford|tunguska|petroleo|oil|mesina|messina/],[1910,2,/mexic|corea|korea|sudafric|south africa|portugal/],
 [1911,2,/xinhai|china|amundsen|machu/],[1912,2,/titanic|anc|republica de china|republic of china/],[1914,2,/sarajevo|marne|panama|guerra mundial|world war/],[1915,2,/gallipoli|armenio|armenian|relatividad|relativity/],[1916,2,/verdun|somme|pascua|easter|sykes|arabe|arab/],
 [1917,2,/octubre|october|balfour|constitucion|constitution|cambrai/],[1918,2,/armisticio|armistice|gripe|flu|influenza/],[1919,2,/versalles|versailles|amritsar|4 de mayo|may fourth|primero de marzo|march 1st|weimar|bauhaus|eclipse/],[1920,2,/sufragio|suffrage|sociedad de naciones|league of nations/],
 [1921,2,/rif|anual|mongolia|insulina|insulin|hambruna|famine/],[1922,2,/marcha sobre roma|march on rome|urss|ussr|tutankamon|tutankhamun|ulises|ulysses|egipto|egypt/],[1923,2,/turquia|turkey|kanto|hiperinflacion|hyperinflation/],[1924,2,/califato|caliphate|lenin/],
 [1926,2,/cristera|cristero|hirohito|television/],[1927,2,/lindbergh|sandino|shanghai/],[1928,2,/penicilina|penicillin|bananeras|banana|quinquenal|five-year/],[1929,2,/crac|crash|wall street|letran|lateran|hubble/],[1930,2,/sal|salt|mundial|world cup|vargas/],
 [1931,2,/manchuria|republica|republic|espana|spain|inundaciones|floods/],[1932,2,/chaco|holodomor|arabia|saudi/],[1933,2,/hitler|new deal|reichstag/],[1934,2,/larga marcha|long march|noche de los cuchillos|long knives/],[1935,2,/etiopia|ethiopia|nuremberg/],
 [1936,2,/guerra civil|civil war|espana|spain|berlin|turing/],[1937,2,/guernica|nankin|nanjing|marco polo|hindenburg|purga|purge/],[1938,2,/anschluss|munich|cristales|crystal|kristallnacht|fision|fission|petrol|expropiacion/],[1939,2,/polonia|poland|molotov|ribbentrop/],
 [1940,2,/francia|france|inglaterra|britain|dunkerque|dunkirk|katyn/],[1941,2,/barbarroja|barbarossa|pearl harbor|atlantico|atlantic/],[1942,2,/stalingrado|stalingrad|midway|wannsee|auschwitz|alamein|quit india/],[1943,2,/kursk|varsovia|warsaw|bengala|bengal|teheran/],
 [1944,2,/normandia|normandy|bretton|varsovia|warsaw/],[1945,2,/hiroshima|yalta|onu|un |naciones unidas|united nations|rendicion|surrender|potsdam|vietnam|indonesia|peron|liga arabe|arab league/],[1946,2,/nuremberg|bikini|churchill|fulton|telon|iron curtain/],[1947,2,/india|pakistan|partici|partition|marshall|transistor|truman|japon|japan/],
 [1948,2,/israel|nakba|gandhi|berlin|bloqueo|blockade|apartheid|derechos humanos|human rights|bogotazo|costa rica|oea|oas/],[1949,2,/china|otan|nato|ginebra|geneva|alemania|germany|semipalatinsk|sovietica|soviet/],
 // actual
 [1950,2,/corea|korea/],[1951,2,/ceca|coal and steel|refugiados|refugee/],[1952,2,/mau mau|egipto|egypt|nasser|bolivia|hidrogeno|hydrogen/],[1953,2,/stalin|iran|mosaddeq|adn|dna|everest|corea|korea/],[1954,2,/dien bien phu|argelia|algeria|brown|guatemala|arbenz/],
 [1955,2,/bandung|varsovia|warsaw|rosa parks|montgomery|polio/],[1956,2,/suez|hungria|hungary|jruschov|khrushchev|marruecos|morocco|sudan|tunez|tunisia/],[1957,2,/sputnik|ghana|roma|rome|malasia|malaya/],[1958,2,/gran salto|great leap|quinta republica|fifth republic|nasa/],
 [1959,2,/cuba|tibet|dalai|antartico|antarctic/],[1960,2,/africa|congo|sharpeville|brasilia|valdivia|pildora|pill|laser|opep|opec/],[1961,2,/gagarin|berlin|muro|wall|cochinos|bay of pigs|lumumba/],[1962,2,/misiles|missile|argelia|algeria|vaticano|vatican|primavera silenciosa|silent spring|sino-india/],
 [1963,2,/kennedy|i have a dream|washington|oua|oau|kenia|kenya|beatles/],[1964,2,/derechos civiles|civil rights|tonkin|brasil|brazil|rivonia|mandela|china.*bomba|atomic|olp|plo|tokio|tokyo/],[1965,2,/vietnam|indonesia|singapur|singapore|selma|rodesia|rhodesia/],[1966,2,/cultural|revolucion cultural|verde|green revolution|nkrumah/],
 [1967,2,/seis dias|six-day|biafra|che|guevara|cien anos|hundred years|solitude|trasplante|transplant|asean/],[1968,2,/tet|praga|prague|mayo|may 68|tlatelolco|king|luther|medellin/],[1969,2,/apolo|apollo|luna|moon|arpanet|stonewall|woodstock|gadafi|gaddafi/],[1970,2,/bhola|ancash|allende|ostpolitik|nasser/],
 [1971,2,/bangladesh|microprocesador|microprocessor|bretton|nixon|idi amin|china.*onu|united nations/],[1972,2,/nixon|china|munich|watergate|bloody sunday|managua/],[1973,2,/chile|allende|yom kipur|yom kippur|opep|opec|petroleo|oil|paris|vietnam|sydney|roe/],
 [1974,2,/claveles|carnation|watergate|nixon|etiopia|ethiopia|haile|portugal|india.*nuclear|smiling/],[1975,2,/saigon|franco|timor|angola|mozambique|jemeres|khmer|libano|lebanon|condor|helsinki|sahara/],[1976,2,/soweto|argentina|tangshan|mao|apple|entebbe/],
 [1977,2,/madres|mothers|egipto|sadat|jerusalen|camp david|ogaden|voyager/],[1978,2,/camp david|deng|reforma|reform|juan pablo|john paul|probeta|ivf|louise brown|camboya|cambodia/],[1979,2,/iran|jomeini|khomeini|afganistan|afghanistan|thatcher|sandinista|nicaragua|three mile|hijo unico|one-child|sovietica|soviet/],
 [1980,2,/iran-irak|iran–iraq|solidaridad|solidarity|gwangju|zimbabue|zimbabwe|romero|viruela|smallpox|shenzhen/],[1981,2,/sida|aids|pc|ibm|sadat|mitterrand/],[1982,2,/malvinas|falklands|libano|lebanon|deuda|debt|mexico/],[1983,2,/sankara|granada|grenada|argentina|alfonsin|sri lanka/],
 [1984,2,/bhopal|etiopia|ethiopia|indira|gandhi|mineros|miners|nunca mas|conadep/],[1985,2,/gorbachov|gorbachev|perestroika|mexico|terremoto|earthquake|armero|plaza|ozono|ozone|juntas/],[1986,2,/chernobil|chernobyl|edsa|filipinas|philippines|challenger|duvalier/],[1987,2,/intifada|corea|korea|montreal|fiyi|fiji|inf/],
 [1988,2,/halabja|iran-irak|chile|plebiscito|plebiscite|birmania|burma|8888|spitak|armenia|lockerbie/],[1989,2,/muro|wall|berlin|tiananmen|rumania|romania|ceausescu|www|web|exxon|afganistan|afghanistan|rushdie|khomeini|velvet|terciopelo/],[1990,2,/mandela|namibia|kuwait|alemania|germany|hubble|yemen|lituania|lithuania/],
 [1991,2,/golfo|gulf|urss|ussr|sovietica|soviet|yugoslavia|croacia|croatia|india|liberalizacion|mercosur|somalia|argelia|algeria|kuwait|japon|japan|burbuja|bubble|bangladesh/],[1992,2,/maastricht|bosnia|los angeles|rodney king|mabo|rio|cumbre|summit|ayodhya|babri|menchu|nobel/],
 [1993,2,/oslo|eritrea|checoslovaquia|czechoslovakia|union europea|european union|waco|mogadiscio|mogadishu/],[1994,2,/ruanda|rwanda|sudafrica|south africa|mandela|zapatista|chiapas|tlcan|nafta|chechenia|chechnya|canal de la mancha|channel tunnel/],[1995,2,/srebrenica|dayton|rabin|oklahoma|kobe|omc|wto|windows|gps/],
 [1996,2,/talibanes|taliban|dolly|guatemala|paz|peace|verdad|truth|sudafrica/],[1997,2,/hong kong|diana|asiatica|asian|crisis|kioto|kyoto|harry potter|deep blue/],[1998,2,/congo|google|chavez|viernes santo|good friday|mitch|suharto|indonesia|pakistan|india|nuclear|omagh/],[1999,2,/kosovo|panama|canal|euro|putin|timor|columbine|venezuela/],
 [2000,2,/mexico|fox|alternancia|intifada|putin|genoma|genome|concorde/],[2001,2,/11s|11-s|9\/11|septiembre|september|afganistan|afghanistan|china.*omc|wto|wikipedia|corralito|argentina|ipod|euro/],[2002,2,/euro|union africana|african union|timor|guerra de irak|lula|bali|sars/],
 [2003,2,/irak|iraq|lula|columbia|darfur|sars|shenzhou|genoma|genome|georgia|rosas|rose/],[2004,2,/tsunami|madrid|11-m|facebook|ucrania|ukraine|naranja|orange|ampliacion|enlargement|beslan|abu ghraib/],[2005,2,/katrina|londres|london|7-j|youtube|cachemira|kashmir|kioto|kyoto|benedicto|benedict/],
 [2006,2,/morales|bolivia|sadam|saddam|corea del norte|north korea|libano|lebanon|hamas|narco|calderon|twitter|pluton|pluto/],[2007,2,/iphone|bhutto|subprime|hipotecas|crisis|kenia|kenya|birmania|burma|azafran|saffron/],[2008,2,/lehman|crisis|obama|pekin|beijing|olimp|olymp|sichuan|nargis|kosovo|georgia|bitcoin|mumbai|bombay/],
 [2009,2,/gripe|flu|h1n1|iran|verde|green|honduras|zelaya|sri lanka|tigres|tamil|lisboa|lisbon|copenhague|copenhagen/],[2010,2,/haiti|primavera arabe|arab spring|tunez|tunisia|bouazizi|chile|mineros|miners|deepwater|wikileaks|islandia|iceland|eyjafjalla|grecia|greece/],
 [2011,2,/primavera arabe|arab spring|egipto|egypt|mubarak|libia|libya|gadafi|gaddafi|siria|syria|fukushima|bin laden|sudan del sur|south sudan|15-m|indignados|occupy|japon|japan|tsunami/],[2012,2,/higgs|crispr|malala|gangnam|sandy|mursi|morsi|maya|chavez|pena nieto/],
 [2013,2,/francisco|francis|snowden|franja y la ruta|belt and road|haiyan|rana plaza|mandela|siria|syria|quimic|chemical|ucrania|ukraine|maidan|euromaidan/],[2014,2,/crimea|ucrania|ukraine|estado islamico|islamic state|isis|ebola|ayotzinapa|ferguson|hong kong|paraguas|umbrella|gaza|mangalyaan|boko haram|chibok/],
 [2015,2,/paris|acuerdo|agreement|clima|climate|bataclan|charlie hebdo|refugiados|refugee|nepal|yemen|iran|nuclear|cuba|estados unidos|ondas gravitacionales|gravitational|ni una menos|venezuela|exodo|exodus|verdad|truth|canada/],
 [2016,2,/brexit|trump|colombia|farc|paz|peace|rio|olimp|olymp|turquia|turkey|golpe|coup|alepo|aleppo|zika|duterte|panama papers/],[2017,2,/rohinya|rohingya|me too|cataluna|catalonia|mosul|raqqa|mugabe|puigdemont|harvey|maria|puerto rico/],
 [2018,2,/afcfta|libre comercio|free trade|kigali|etiopia|ethiopia|eritrea|abiy|khashoggi|iran|nuclear|armenia|pashinyan|chalecos|yellow vest|amlo|bolsonaro|corea|korea|singapur|singapore/],
 [2019,2,/hong kong|chile|estallido|notre|notre-dame|sudan|bashir|amazonia|amazon|incendios|fires|australia|bolivia|evo|greta|thunberg|al-baghdadi|bagdadi|artemisa|black hole|agujero negro|new delhi|cachemira|kashmir|370/],
 [2020,2,/covid|coronavirus|pandemia|pandemic|floyd|black lives|beirut|vacuna|vaccine|arn|mrna|nagorno|karabaj|karabakh|abraham|biden|aborto|abortion|argentina|marea verde|tigray|brexit/],
 [2021,2,/kabul|talibanes|taliban|capitolio|capitol|6 de enero|january 6|myanmar|birmania|golpe|coup|suez|ever given|james webb|webb|evergrande|cop26|glasgow|tigray|sudan|golpe|perseverance|chile|boric|afganistan/],
 [2022,2,/ucrania|ukraine|invasion|isabel ii|elizabeth ii|mujer vida libertad|mahsa|amini|iran|tonga|hunga|pakistan|inundaciones|floods|chatgpt|openai|lula|petro|colombia|qatar|mundial|world cup|roe|dobbs|sri lanka|aragalaya|shinzo abe|abe/],
 [2023,2,/gaza|hamas|7 de octubre|october 7|israel|turquia|turkey|siria|syria|terremoto|earthquake|sudan|jartum|khartoum|niger|golpe|coup|nagorno|karabaj|karabakh|chandrayaan|titan|wagner|prigozhin|milei|argentina|marruecos|morocco|libia|libya|derna|maui|lahaina|india|g20|luna|moon/],
 // personas (el pin de nacimiento o de muerte)
 [-563,40,/buda|buddha/],[-551,20,/confucio|confucius/],[-470,5,/socrates/],[-384,3,/aristoteles|aristotle/],[-356,3,/alejandro|alexander/],[-259,3,/qin shi|shi huang/],[-100,3,/cesar|caesar/],[-69,3,/cleopatra/],[-4,6,/jesus/],
 [570,10,/mahoma|muhammad/],[742,6,/carlomagno|charlemagne/],[980,3,/avicena|ibn sina/],[1162,10,/gengis|genghis/],[1215,3,/kublai/],[1304,3,/ibn battuta|petrarca|petrarch/],[1332,3,/ibn jaldun|ibn khaldun/],[1336,3,/tamerlan|timur/],[1397,3,/gutenberg/],[1398,3,/sejong/],
 [1412,3,/juana de arco|joan of arc/],[1451,3,/colon|columbus|isabel/],[1452,3,/leonardo/],[1466,3,/moctezuma|erasmo|erasmus/],[1469,3,/nanak|maquiavelo|machiavelli/],[1473,3,/copernico|copernicus/],[1475,3,/miguel angel|michelangelo/],[1483,3,/lutero|luther|babur|rafael|raphael/],
 [1491,3,/loyola|ignacio|ignatius/],[1494,3,/suleiman|soliman/],[1502,10,/atahualpa/],[1533,3,/isabel i|elizabeth i/],[1542,3,/akbar/],[1547,3,/cervantes/],[1564,3,/shakespeare|galileo/],[1571,3,/kepler/],[1596,3,/descartes/],[1643,3,/newton/],[1651,3,/sor juana|juana ines/],[1654,3,/kangxi/],
 [1672,3,/pedro|peter/],[1685,3,/bach/],[1694,3,/voltaire/],[1706,3,/franklin/],[1712,3,/rousseau/],[1723,3,/adam smith/],[1724,3,/kant/],[1732,3,/washington/],[1743,3,/toussaint|jefferson|lavoisier/],[1756,3,/mozart/],[1769,3,/napoleon|humboldt|wellington/],[1770,3,/beethoven|hegel/],
 [1783,3,/bolivar/],[1787,3,/shaka/],[1806,3,/juarez/],[1809,3,/lincoln|darwin/],[1818,3,/marx/],[1820,3,/nightingale|engels|tubman/],[1822,3,/pasteur|mendel/],[1828,3,/tolstoi|tolstoy/],[1844,3,/nietzsche/],[1847,3,/edison/],[1853,3,/marti|van gogh/],[1856,3,/freud|tesla/],
 [1861,3,/tagore|rizal/],[1866,3,/sun yat-sen|sun yat/],[1867,3,/curie|dario/],[1869,3,/gandhi/],[1870,3,/lenin/],[1874,3,/churchill/],[1878,3,/stalin|villa/],[1879,3,/einstein|zapata/],[1881,3,/picasso|ataturk|fleming|lu xun/],[1882,3,/roosevelt|woolf|vargas/],
 [1883,3,/kafka|keynes|mussolini/],[1889,3,/hitler|nehru|chaplin|mistral/],[1890,3,/ho chi minh|de gaulle/],[1893,3,/mao/],[1898,3,/umm kulthum|meir/],[1906,3,/senghor|arendt/],[1907,3,/kahlo/],[1908,3,/beauvoir|allende/],[1909,3,/nkrumah/],[1912,3,/turing|kim il/],[1917,3,/indira|parra/],
 [1918,3,/mandela/],[1926,3,/castro|isabel ii|elizabeth ii/],[1927,3,/garcia marquez/],[1928,3,/guevara/],[1929,3,/luther king|arafat/],[1930,3,/achebe|armstrong/],[1931,3,/gorbachov|gorbachev|tutu/],[1940,3,/pele|maathai|lennon/],
];
const porAnio=new Map(); for(const e of E){ const y=e.year; for(let k=-2;k<=2;k++){} (porAnio.get(y)||porAnio.set(y,[]).get(y)).push(e) }
let enCanon=0, soloFondo=0, faltan=0; const listaFondo=[], listaFaltan=[];
for(const [y,tol,re] of L){
 let canon=null, fondo=null;
 for(let yy=y-tol;yy<=y+tol;yy++){ for(const e of porAnio.get(yy)||[]){ const t=N(e.labels.es)+' | '+N(e.labels.en)+' | '+N(e.persona||''); if(re.test(t)){ if(!e.fondo){ canon=e; break } else if(!fondo)fondo=e } } if(canon)break }
 if(canon)enCanon++; else if(fondo){ soloFondo++; listaFondo.push(y+' '+re.source.slice(0,40)+'  ->  solo fondo: '+fondo.labels.es+' ('+fondo.year+', imp '+fondo.importance+')') } else { faltan++; listaFaltan.push(y+' '+re.source) }
}
console.log('lista de control: '+L.length+' entradas · en el canon '+enCanon+' · solo en el fondo '+soloFondo+' · faltan '+faltan);
if(listaFondo.length){ console.log('\nSOLO EN EL FONDO (deberian subir al canon):'); for(const s of listaFondo)console.log('  '+s) }
if(listaFaltan.length){ console.log('\nFALTAN:'); for(const s of listaFaltan)console.log('  '+s) }
