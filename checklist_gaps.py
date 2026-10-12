# -*- coding: utf-8 -*-
"""
Revisa la base de datos contra una lista de ~200 eventos/temas historicos
indispensables (investigada con web search: AP World History, listas de
"eventos que cambiaron el mundo", cobertura no-occidental, etc.)

No modifica nada -- solo lee y reporta. Correlo con:
    python3 checklist_gaps.py
"""
import json
import re
import unicodedata

with open("data/events_extended.json", encoding="utf-8") as f:
    data = json.load(f)

def norm(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return s.lower()

# Pre-armamos un "blob" normalizado por evento (id + labels es/en) para buscar rapido.
blobs = []
for e in data:
    parts = [
        e.get("id", ""),
        (e.get("labels", {}) or {}).get("es", "") or "",
        (e.get("labels", {}) or {}).get("en", "") or "",
    ]
    blobs.append(norm(" ".join(parts)))

def buscar(keywords):
    """keywords: lista de substrings (ya en minuscula/sin tilde). OR entre ellos."""
    hits = []
    for kw in keywords:
        for i, b in enumerate(blobs):
            if kw in b:
                hits.append((data[i]["id"], data[i].get("year")))
    # unico, ordenado por anyo
    seen = set()
    out = []
    for h in hits:
        if h[0] not in seen:
            seen.add(h[0])
            out.append(h)
    return sorted(out, key=lambda x: (x[1] is None, x[1]))

# (nombre_para_mostrar, [keywords])
CHECKLIST = [
    # ── ANTIGUEDAD ──
    ("Revolucion agricola / neolitica", ["revolucion neolitica", "agricultural revolution", "neolithic revolution"]),
    ("Escritura cuneiforme / jeroglificos", ["cuneiform", "jeroglifico", "hieroglyph"]),
    ("Piramides de Giza", ["piramide de giza", "great pyramid of giza", "piramides de egipto"]),
    ("Codigo de Hammurabi", ["codigo de hammurabi", "code of hammurabi"]),
    ("Fundacion de Cartago", ["fundacion de cartago", "founding of carthage"]),
    ("Fundacion de Roma", ["fundacion de roma", "founding of rome"]),
    ("Caida del Imperio Asirio", ["caida de asiria", "fall of assyria", "caida de nínive"]),
    ("Cautiverio de Babilonia", ["cautiverio de babilonia", "babylonian captivity"]),
    # ── ANTIGUEDAD CLASICA ──
    ("Democracia ateniense / Clistenes", ["clistenes", "cleisthenes", "democracia ateniense"]),
    ("Batalla de Maraton", ["batalla de maraton", "battle of marathon"]),
    ("Batalla de las Termopilas", ["termopilas", "thermopylae"]),
    ("Vida de Confucio", ["confucio", "confucius"]),
    ("Vida de Buda", ["buda gautama", "siddharta gautama", "gautama buddha"]),
    ("Socrates / Platon / Aristoteles", ["socrates", "platon", "aristoteles", "aristotle"]),
    ("Guerra del Peloponeso", ["guerra del peloponeso", "peloponnesian war"]),
    ("Conquistas de Alejandro Magno", ["alejandro magno", "alexander the great"]),
    ("Unificacion de China / Qin Shi Huang", ["qin shi huang", "gran muralla"]),
    ("Guerras Punicas", ["guerra punica", "punic war"]),
    ("Dinastia Han fundada", ["dinastia han", "han dynasty"]),
    ("Asesinato de Julio Cesar", ["asesinato de julio cesar", "assassination of julius caesar", "julio cesar"]),
    ("Augusto / Imperio Romano", ["augusto", "imperio romano"]),
    ("Nacimiento del cristianismo / Jesus", ["jesus de nazaret", "jesus christ", "crucifixion"]),
    ("Ruta de la Seda", ["ruta de la seda", "silk road"]),
    ("Destruccion del Segundo Templo", ["segundo templo", "second temple"]),
    ("Erupcion del Vesubio / Pompeya", ["pompeya", "vesubio", "pompeii", "vesuvius"]),
    ("Edicto de Milan / Constantino", ["edicto de milan", "edict of milan", "constantino"]),
    ("Concilio de Nicea", ["concilio de nicea", "council of nicaea"]),
    ("Caida del Imperio Romano de Occidente", ["caida del imperio romano", "fall of the western roman empire", "fall of rome"]),
    ("Imperio Gupta", ["imperio gupta", "gupta empire"]),
    # ── MEDIEVAL ──
    ("Vida de Mahoma / nacimiento del Islam", ["mahoma", "muhammad", "hijra"]),
    ("Expansion del Islam / califatos", ["califato omeya", "califato abasida", "umayyad caliphate", "abbasid caliphate"]),
    ("Batalla de Tours / Poitiers", ["batalla de tours", "battle of tours", "battle of poitiers"]),
    ("Carlomagno coronado emperador", ["carlomagno", "charlemagne"]),
    ("Era vikinga / saqueo de Lindisfarne", ["lindisfarne", "era vikinga", "viking age"]),
    ("Casa de la Sabiduria / Bagdad", ["casa de la sabiduria", "house of wisdom"]),
    ("Gran Cisma de 1054", ["gran cisma", "east-west schism", "great schism"]),
    ("Batalla de Hastings", ["batalla de hastings", "battle of hastings"]),
    ("Las Cruzadas", ["primera cruzada", "first crusade", "cruzadas"]),
    ("Genghis Khan / Imperio Mongol", ["genghis khan", "imperio mongol", "mongol empire"]),
    ("Carta Magna", ["carta magna", "magna carta"]),
    ("Saqueo mongol de Bagdad", ["saqueo de bagdad", "mongol conquest of baghdad"]),
    ("Viajes de Marco Polo", ["marco polo"]),
    ("Shogunato Kamakura", ["shogunato kamakura", "kamakura shogunate"]),
    ("Guerra de los Cien Anios", ["guerra de los cien años", "hundred years war"]),
    ("Peste Negra", ["peste negra", "black death"]),
    ("Imperio Otomano fundado", ["imperio otomano fundado", "ottoman empire founded", "osman i"]),
    ("Caida de Constantinopla", ["caida de constantinopla", "fall of constantinople"]),
    ("Imprenta de Gutenberg", ["imprenta", "gutenberg", "printing press"]),
    ("Juana de Arco", ["juana de arco", "joan of arc"]),
    # ── MODERNO TEMPRANO ──
    ("Caida de Granada / fin de la Reconquista", ["caida de granada", "fall of granada", "reconquista"]),
    ("Colon llega a America", ["cristobal colon", "christopher columbus"]),
    ("Vasco da Gama llega a la India", ["vasco da gama"]),
    ("Conquista de Mexico / Aztecas / Cortes", ["conquista de mexico", "hernan cortes", "imperio azteca"]),
    ("Circunnavegacion de Magallanes", ["magallanes", "magellan", "circunnavegacion"]),
    ("Conquista del Imperio Inca / Pizarro", ["francisco pizarro", "imperio inca", "conquista del peru"]),
    ("95 Tesis de Lutero / Reforma", ["95 tesis", "martin lutero", "martin luther", "reforma protestante"]),
    ("Suleiman el Magnifico", ["suleiman el magnifico", "suleiman the magnificent"]),
    ("Copernico y el heliocentrismo", ["copernico", "copernicus", "heliocentrismo"]),
    ("Concilio de Trento", ["concilio de trento", "council of trent"]),
    ("Armada Invencible", ["armada invencible", "spanish armada"]),
    ("Fundacion de Jamestown", ["jamestown"]),
    ("Galileo y la Inquisicion", ["galileo galilei", "juicio de galileo"]),
    ("Guerra de los Treinta Anios", ["guerra de los treinta años", "thirty years war"]),
    ("Viaje del Mayflower", ["mayflower"]),
    ("Ejecucion de Carlos I / Guerra Civil Inglesa", ["carlos i de inglaterra", "english civil war", "charles i"]),
    ("Paz de Westfalia", ["paz de westfalia", "peace of westphalia"]),
    ("Newton publica Principia", ["principia mathematica", "isaac newton"]),
    ("Revolucion Gloriosa", ["revolucion gloriosa", "glorious revolution"]),
    ("Trata transatlantica de esclavos", ["trata de esclavos", "atlantic slave trade"]),
    ("Juicios de brujas de Salem", ["juicios de salem", "salem witch trials"]),
    # ── REVOLUCIONES / SIGLO XIX ──
    ("Guerra de los Siete Anios", ["guerra de los siete años", "seven years war"]),
    ("Revolucion Industrial", ["revolucion industrial", "industrial revolution"]),
    ("Independencia de Estados Unidos", ["declaracion de independencia de los estados unidos", "united states declaration of independence"]),
    ("Toma de la Bastilla / Revolucion Francesa", ["toma de la bastilla", "storming of the bastille", "revolucion francesa"]),
    ("Revolucion Haitiana", ["revolucion haitiana", "haitian revolution"]),
    ("Batalla de Waterloo", ["batalla de waterloo", "battle of waterloo"]),
    ("Congreso de Viena", ["congreso de viena", "congress of vienna"]),
    ("Independencias latinoamericanas / Bolivar", ["simon bolivar", "jose de san martin"]),
    ("Abolicion de la esclavitud (Imperio Britanico)", ["abolicion de la esclavitud", "slavery abolition act"]),
    ("Primera Guerra del Opio", ["guerra del opio", "opium war"]),
    ("Primaveras de los Pueblos de 1848", ["revoluciones de 1848", "revolutions of 1848"]),
    ("Manifiesto Comunista", ["manifiesto comunista", "communist manifesto"]),
    ("Fiebre del oro de California", ["fiebre del oro de california", "california gold rush"]),
    ("Apertura de Japon / Perry", ["comodoro perry", "commodore perry", "black ships"]),
    ("Guerra de Crimea", ["guerra de crimea", "crimean war"]),
    ("Motin de la India de 1857", ["motin de la india", "indian rebellion of 1857"]),
    ("Darwin / El origen de las especies", ["origen de las especies", "origin of species", "charles darwin"]),
    ("Unificacion de Italia", ["unificacion de italia", "unification of italy"]),
    ("Unificacion de Alemania", ["unificacion de alemania", "unification of germany"]),
    ("Guerra Civil Estadounidense", ["guerra civil estadounidense", "american civil war", "guerra de secesion"]),
    ("Restauracion Meiji", ["restauracion meiji", "meiji restoration"]),
    ("Apertura del Canal de Suez", ["canal de suez"]),
    ("Conferencia de Berlin / reparto de Africa", ["conferencia de berlin", "berlin conference", "reparto de africa"]),
    ("Primera Guerra Sino-Japonesa", ["guerra sino-japonesa", "sino-japanese war"]),
    ("Guerra Hispano-Estadounidense", ["guerra hispano-estadounidense", "spanish-american war"]),
    ("Rebelion de los Boxers", ["rebelion de los boxers", "boxer rebellion"]),
    # ── SIGLO XX PRIMERA MITAD ──
    ("Guerra Ruso-Japonesa", ["guerra ruso-japonesa", "russo-japanese war"]),
    ("Revolucion Mexicana", ["revolucion mexicana", "mexican revolution"]),
    ("Revolucion Xinhai / fin de la dinastia Qing", ["revolucion xinhai", "xinhai revolution", "fin de la dinastia qing"]),
    ("Hundimiento del Titanic", ["titanic"]),
    ("Genocidio Armenio", ["genocidio armenio", "armenian genocide"]),
    ("Revolucion Rusa (Febrero y Octubre)", ["revolucion de octubre", "october revolution", "revolucion de febrero"]),
    ("Declaracion Balfour", ["declaracion balfour", "balfour declaration"]),
    ("Gripe espaniola de 1918", ["gripe española", "spanish flu", "pandemia de gripe de 1918"]),
    ("Tratado de Versalles", ["tratado de versalles", "treaty of versailles"]),
    ("Movimiento del Cuatro de Mayo (China)", ["movimiento del cuatro de mayo", "may fourth movement"]),
    ("Sufragio femenino", ["sufragio femenino", "women's suffrage", "decimonovena enmienda"]),
    ("Marcha sobre Roma / Mussolini", ["marcha sobre roma", "march on rome", "benito mussolini"]),
    ("Descubrimiento de la tumba de Tutankamon", ["tutankamon", "tutankhamun"]),
    ("Republica de Turquia / Ataturk", ["ataturk", "republica de turquia"]),
    ("Crack del 29 / Gran Depresion", ["crac del 29", "wall street crash", "gran depresion"]),
    ("Marcha de la Sal / Gandhi", ["marcha de la sal", "salt march", "mahatma gandhi"]),
    ("Invasion japonesa de Manchuria", ["invasion de manchuria", "invasion of manchuria"]),
    ("Hitler nombrado canciller", ["hitler canciller", "hitler becomes chancellor"]),
    ("Larga Marcha / Mao Zedong", ["larga marcha", "long march", "mao zedong"]),
    ("Guerra Civil Espaniola", ["guerra civil española", "spanish civil war"]),
    ("Masacre de Nanjing", ["masacre de nankin", "nanjing massacre"]),
    ("Segunda Guerra Mundial", ["segunda guerra mundial", "world war ii", "world war 2"]),
    ("El Holocausto", ["holocausto", "the holocaust", "shoah"]),
    ("Ataque a Pearl Harbor", ["pearl harbor"]),
    ("Batalla de Stalingrado", ["batalla de stalingrado", "battle of stalingrad"]),
    ("Desembarco de Normandia / Dia D", ["desembarco de normandia", "d-day", "normandy landings"]),
    ("Bombas atomicas Hiroshima y Nagasaki", ["hiroshima", "nagasaki"]),
    ("Fundacion de la ONU", ["fundacion de la onu", "founding of the united nations", "naciones unidas 1945"]),
    # ── GUERRA FRIA ──
    ("Particion de India y Pakistan", ["particion de la india", "partition of india"]),
    ("Creacion del Estado de Israel", ["creacion de israel", "declaracion de independencia de israel", "israeli declaration of independence"]),
    ("Declaracion Universal de Derechos Humanos", ["declaracion universal de derechos humanos", "universal declaration of human rights"]),
    ("Revolucion Comunista China / fundacion de la RPC", ["republica popular china", "chinese communist revolution", "fundacion de la republica popular"]),
    ("Fundacion de la OTAN", ["fundacion de la otan", "otan", "nato founded"]),
    ("Guerra de Corea", ["guerra de corea", "korean war"]),
    ("Muerte de Stalin", ["muerte de stalin", "death of stalin"]),
    ("Conferencia de Bandung", ["conferencia de bandung", "bandung conference"]),
    ("Crisis de Suez", ["crisis de suez", "suez crisis"]),
    ("Lanzamiento del Sputnik", ["sputnik"]),
    ("Revolucion Cubana / Castro", ["revolucion cubana", "cuban revolution", "fidel castro"]),
    ("Ano de Africa (1960)", ["año de africa", "year of africa"]),
    ("Construccion del Muro de Berlin", ["muro de berlin", "berlin wall"]),
    ("Crisis de los Misiles de Cuba", ["crisis de los misiles", "cuban missile crisis"]),
    ("Marcha sobre Washington / MLK", ["marcha sobre washington", "march on washington", "martin luther king"]),
    ("Asesinato de JFK", ["asesinato de kennedy", "assassination of john f kennedy", "jfk assassination"]),
    ("Ley de Derechos Civiles de EEUU", ["ley de derechos civiles", "civil rights act"]),
    ("Guerra de Vietnam", ["guerra de vietnam", "vietnam war"]),
    ("Revolucion Cultural China", ["revolucion cultural china", "cultural revolution"]),
    ("Guerra de los Seis Dias", ["guerra de los seis dias", "six-day war"]),
    ("Primavera de Praga", ["primavera de praga", "prague spring"]),
    ("Llegada a la Luna / Apolo 11", ["apolo 11", "apollo 11", "llegada a la luna"]),
    ("Guerra de Liberacion de Bangladesh", ["liberacion de bangladesh", "bangladesh liberation war"]),
    ("Nixon visita China", ["nixon visita china", "nixon visits china"]),
    ("Fin de Bretton Woods / Nixon Shock", ["bretton woods", "nixon shock"]),
    ("Guerra de Yom Kipur / Crisis del petroleo 1973", ["guerra de yom kipur", "yom kippur war", "crisis del petroleo"]),
    ("Genocidio Camboyano / Jemeres Rojos", ["genocidio camboyano", "khmer rouge", "jemeres rojos"]),
    ("Revolucion Iraní", ["revolucion iraní", "iranian revolution"]),
    ("Invasion sovietica de Afganistan", ["invasion sovietica de afganistan", "soviet invasion of afghanistan"]),
    ("Reformas economicas de Deng Xiaoping", ["deng xiaoping"]),
    ("Guerra de las Malvinas", ["guerra de las malvinas", "falklands war"]),
    ("Desastre de Chernobil", ["chernobil", "chernobyl"]),
    ("Protestas de Tiananmen", ["tiananmen"]),
    ("Caida del Muro de Berlin", ["caida del muro de berlin", "fall of the berlin wall"]),
    ("Disolucion de la Union Sovietica", ["disolucion de la union sovietica", "dissolution of the soviet union"]),
    # ── CONTEMPORANEO ──
    ("Guerra del Golfo", ["guerra del golfo", "gulf war"]),
    ("Fin del Apartheid / Mandela presidente", ["fin del apartheid", "end of apartheid", "nelson mandela"]),
    ("Tratado de Maastricht / Union Europea", ["tratado de maastricht", "maastricht treaty", "union europea fundada"]),
    ("Genocidio de Ruanda", ["genocidio de ruanda", "rwandan genocide"]),
    ("Acuerdos de Oslo", ["acuerdos de oslo", "oslo accords"]),
    ("Acuerdo de Viernes Santo", ["acuerdo de viernes santo", "good friday agreement"]),
    ("Traspaso de Hong Kong", ["traspaso de hong kong", "hong kong handover"]),
    ("Introduccion del euro", ["introduccion del euro", "euro currency introduced"]),
    ("Atentados del 11 de septiembre", ["11 de septiembre", "september 11"]),
    ("Guerra de Irak", ["guerra de irak", "iraq war"]),
    ("Tsunami del Oceano Indico 2004", ["tsunami de 2004", "indian ocean tsunami"]),
    ("Crisis financiera global de 2008", ["crisis financiera de 2008", "global financial crisis"]),
    ("Primavera Arabe", ["primavera arabe", "arab spring"]),
    ("Guerra Civil Siria", ["guerra civil siria", "syrian civil war"]),
    ("Referendum del Brexit", ["brexit"]),
    ("Pandemia de COVID-19", ["covid-19", "covid19", "pandemia de covid"]),
    ("Invasion rusa de Ucrania 2022", ["invasion rusa de ucrania", "russian invasion of ukraine"]),
    # ── CHINA (dinastias/eventos no cubiertos por temas biograficos) ──
    ("Dinastias Shang y Zhou", ["dinastia shang", "shang dynasty", "dinastia zhou", "zhou dynasty"]),
    ("Periodo de los Reinos Combatientes", ["reinos combatientes", "warring states period"]),
    ("Ejercito de Terracota", ["ejercito de terracota", "terracotta army"]),
    ("Invencion del papel (China)", ["invencion del papel", "invention of paper"]),
    ("Dinastia Tang", ["dinastia tang", "tang dynasty"]),
    ("Dinastia Song / revolucion economica", ["dinastia song", "song dynasty"]),
    ("Conquista mongola de China / Dinastia Yuan", ["dinastia yuan", "yuan dynasty"]),
    ("Dinastia Ming fundada / Ciudad Prohibida", ["dinastia ming", "ming dynasty", "ciudad prohibida", "forbidden city"]),
    ("Viajes del tesoro de Zheng He", ["zheng he"]),
    ("Dinastia Qing / conquista Manchu", ["dinastia qing", "qing dynasty"]),
    ("Rebelion Taiping", ["rebelion taiping", "taiping rebellion"]),
    ("China se une a la OMC", ["china se une a la omc", "china joins wto", "world trade organization"]),
    # ── JAPON / COREA ──
    ("Periodo Heian / Cuento de Genji", ["periodo heian", "heian period", "cuento de genji", "tale of genji"]),
    ("Invasiones mongolas de Japon", ["invasiones mongolas de japon", "mongol invasions of japan"]),
    ("Shogunato Tokugawa / sakoku", ["shogunato tokugawa", "tokugawa shogunate", "sakoku"]),
    ("Colonizacion japonesa de Corea", ["colonizacion japonesa de corea", "japanese colonization of korea"]),
    ("Division de Corea", ["division de corea", "division of korea"]),
    # ── INDIA / SUR DE ASIA ──
    ("Civilizacion del Valle del Indo", ["valle del indo", "indus valley civilization", "mohenjo-daro", "harappa"]),
    ("Imperio Maurya / Ashoka", ["imperio maurya", "mauryan empire", "asoka", "ashoka"]),
    ("Sultanato de Delhi", ["sultanato de delhi", "delhi sultanate"]),
    ("Imperio Mogol fundado / Babur", ["imperio mogol", "mughal empire", "babur"]),
    ("Taj Mahal construido", ["taj mahal"]),
    ("Batalla de Plassey / Compania de las Indias", ["batalla de plassey", "battle of plassey", "compañia britanica de las indias orientales"]),
    ("Congreso Nacional Indio fundado", ["congreso nacional indio", "indian national congress"]),
    ("Asesinato de Gandhi", ["asesinato de gandhi", "assassination of gandhi"]),
    ("Guerras Indo-Pakistanies", ["guerra indo-pakistani", "indo-pakistani war"]),
    ("Liberalizacion economica de India (1991)", ["liberalizacion economica de india", "indian economic liberalisation"]),
    # ── MUNDO ISLAMICO ──
    ("Califato Rashidun", ["califato rashidun", "rashidun caliphate"]),
    ("Al-Andalus / conquista de Hispania", ["al-andalus", "conquista musulmana de hispania"]),
    ("Califato Fatimi / fundacion de El Cairo", ["califato fatimi", "fatimid caliphate", "fundacion de el cairo"]),
    ("Saladino recupera Jerusalen", ["saladino", "saladin"]),
    ("Imperio Safavida", ["imperio safavida", "safavid empire"]),
    ("Batalla de Viena 1683", ["batalla de viena", "battle of vienna"]),
    ("Fin del Califato Otomano", ["abolicion del califato", "abolition of the caliphate"]),
    ("Fundacion de Arabia Saudita", ["fundacion de arabia saudita", "arabia saudita fundada", "saudi arabia founded"]),
    ("Auge y caida del Estado Islamico (ISIS)", ["estado islamico", "isis", "islamic state"]),
    # ── AFRICA ──
    ("Reino de Kush / Nubia", ["reino de kush", "kingdom of kush", "nubia"]),
    ("Reino de Aksum", ["reino de aksum", "kingdom of aksum"]),
    ("Imperio de Ghana", ["imperio de ghana", "ghana empire"]),
    ("Imperio de Mali / peregrinacion de Mansa Musa", ["mansa musa", "imperio de mali", "mali empire"]),
    ("Gran Zimbabue", ["gran zimbabue", "great zimbabwe"]),
    ("Imperio Songhai / caida de Tombuctu", ["imperio songhai", "songhai empire", "tombuctu"]),
    ("Reino Zulu / Shaka", ["reino zulu", "zulu kingdom", "shaka zulu"]),
    ("Guerras Anglo-Boer", ["guerra anglo-boer", "anglo-boer war", "guerra de los boers"]),
    ("Batalla de Adwa", ["batalla de adua", "battle of adwa"]),
    ("Congreso Nacional Africano fundado", ["congreso nacional africano fundado", "african national congress founded"]),
    ("Crisis del Congo / asesinato de Lumumba", ["crisis del congo", "congo crisis", "patrice lumumba"]),
    ("Guerra de Biafra", ["guerra de biafra", "biafran war"]),
    ("Apartheid instituido", ["apartheid instituido", "apartheid instituted"]),
    ("Union Africana fundada", ["union africana fundada", "african union founded"]),
    # ── LATINOAMERICA ──
    ("Civilizacion Maya", ["civilizacion maya", "maya civilization"]),
    ("Imperio Inca / Machu Picchu", ["machu picchu"]),
    ("Guerra Mexico-Estados Unidos", ["guerra mexico-estados unidos", "mexican-american war"]),
    ("Guerra de la Triple Alianza", ["guerra de la triple alianza", "war of the triple alliance"]),
    ("Independencia de Cuba / Guerra Hispano-Americana", ["independencia de cuba", "cuban war of independence"]),
    ("Apertura del Canal de Panama", ["canal de panama"]),
    ("Golpe de Estado en Chile / Pinochet", ["golpe de estado en chile", "chilean coup", "augusto pinochet"]),
    ("Levantamiento Zapatista", ["levantamiento zapatista", "zapatista uprising"]),
    ("Crisis de la deuda latinoamericana", ["crisis de la deuda latinoamericana", "latin american debt crisis"]),
    # ── SUDESTE ASIATICO ──
    ("Imperio Jemer / Angkor Wat", ["angkor wat", "imperio jemer", "khmer empire"]),
    ("Colonizacion espaniola de Filipinas", ["colonizacion de filipinas", "colonization of the philippines"]),
    ("Indochina Francesa establecida", ["indochina francesa", "french indochina"]),
    ("Revolucion Nacional Indonesia", ["revolucion nacional indonesia", "indonesian national revolution"]),
    ("Batalla de Dien Bien Phu", ["dien bien phu"]),
    ("Fundacion de la ASEAN", ["fundacion de la asean", "asean founded"]),
    # ── RELIGION ──
    ("Fundacion del sijismo / Guru Nanak", ["sijismo", "sikhism", "guru nanak"]),
    ("Segundo Concilio Vaticano", ["concilio vaticano ii", "second vatican council"]),
    # ── CIENCIA / INVENTOS ──
    ("Invencion de la brujula (China)", ["invencion de la brujula", "invention of the compass"]),
    ("Invencion de la polvora", ["invencion de la polvora", "invention of gunpowder"]),
    ("Maquina de vapor de Watt", ["maquina de vapor", "steam engine", "james watt"]),
    ("Vacuna de la viruela / Jenner", ["vacuna de la viruela", "edward jenner"]),
    ("Invencion del telegrafo", ["telegrafo electrico", "electrical telegraph"]),
    ("Invencion del telefono", ["invencion del telefono", "invention of the telephone"]),
    ("Bombilla incandescente / Edison", ["bombilla incandescente", "incandescent light bulb"]),
    ("Tabla periodica de Mendeleev", ["tabla periodica", "periodic table", "mendeleev"]),
    ("Descubrimiento de los rayos X", ["rayos x", "x-rays discovered"]),
    ("Primer vuelo de los hermanos Wright", ["hermanos wright", "wright brothers", "wright flyer"]),
    ("Teoria de la relatividad / Einstein", ["teoria de la relatividad", "theory of relativity", "albert einstein"]),
    ("Descubrimiento de la penicilina", ["descubrimiento de la penicilina", "discovery of penicillin"]),
    ("Estructura del ADN", ["estructura del adn", "structure of dna", "watson y crick"]),
    ("Proyecto Genoma Humano", ["proyecto genoma humano", "human genome project"]),
    # ── EXPLORACION ──
    ("Viajes del Capitan Cook", ["capitan cook", "captain cook"]),
    ("Expedicion de Lewis y Clark", ["lewis y clark", "lewis and clark expedition"]),
    ("Expedicion de Amundsen al Polo Sur", ["amundsen", "polo sur"]),
    ("Primer ascenso al Everest", ["primer ascenso al everest", "first ascent of mount everest", "hillary y norgay", "tenzing norgay"]),
    # ── DESASTRES / PANDEMIAS ──
    ("Peste de Justiniano", ["peste de justiniano", "plague of justinian"]),
    ("Gran Incendio de Londres", ["gran incendio de londres", "great fire of london"]),
    ("Terremoto de Lisboa de 1755", ["terremoto de lisboa", "lisbon earthquake"]),
    ("Gran Hambruna Irlandesa", ["hambruna irlandesa", "irish potato famine", "gran hambruna irlandesa"]),
    ("Gran terremoto de Kanto 1923", ["terremoto de kanto", "great kanto earthquake"]),
    ("Dust Bowl", ["dust bowl"]),
    ("Desastre de Bhopal", ["desastre de bhopal", "bhopal disaster"]),
    ("Terremoto de Haiti de 2010", ["terremoto de haiti", "haiti earthquake"]),
    ("Desastre de Fukushima", ["fukushima"]),
    # ── CULTURA / ARTE ──
    ("Renacimiento italiano", ["renacimiento italiano", "italian renaissance"]),
    ("Impresionismo (Paris)", ["impresionismo", "impressionism"]),
    ("Renacimiento de Harlem", ["renacimiento de harlem", "harlem renaissance"]),
    ("Era del jazz", ["era del jazz", "jazz age"]),
    # ── ECONOMIA ──
    ("Invencion de la moneda (Lidia)", ["invencion de la moneda", "invention of coinage", "lidia acuñacion"]),
    ("Manía de los tulipanes", ["mania de los tulipanes", "tulip mania"]),
    ("Burbuja de los Mares del Sur", ["burbuja de los mares del sur", "south sea bubble"]),
    ("La Riqueza de las Naciones / Adam Smith", ["riqueza de las naciones", "wealth of nations", "adam smith"]),
    ("Conferencia de Bretton Woods", ["bretton woods"]),
    ("Plan Marshall", ["plan marshall", "marshall plan"]),
    ("Fundacion de la OPEP", ["fundacion de la opep", "opec founded"]),
    ("Lunes Negro 1987", ["lunes negro", "black monday"]),
    ("Crisis financiera asiatica de 1997", ["crisis financiera asiatica", "asian financial crisis"]),
    ("Estallido de la burbuja punto-com", ["burbuja punto com", "dot-com bubble"]),
    # ── DESCOLONIZACION / DERECHOS CIVILES ──
    ("Ghana independencia (primera de Africa subsahariana)", ["independencia de ghana"]),
    ("Guerra de independencia de Argelia", ["guerra de independencia de argelia", "algerian war of independence"]),
    ("Levantamiento Mau Mau / independencia de Kenia", ["mau mau", "independencia de kenia"]),
    ("Independencia de Namibia", ["independencia de namibia", "namibia independence"]),
    ("Brown vs Board of Education", ["brown vs board", "brown v. board"]),
    ("Boicot de autobuses de Montgomery", ["boicot de autobuses de montgomery", "montgomery bus boycott"]),
    ("Ley de Derecho al Voto de EEUU", ["ley de derecho al voto", "voting rights act"]),
    ("Disturbios de Stonewall", ["disturbios de stonewall", "stonewall riots"]),
    # ── TECNOLOGIA / COMPUTACION ──
    ("ENIAC / primera computadora", ["eniac"]),
    ("Invencion del transistor", ["invencion del transistor", "invention of the transistor"]),
    ("Invencion del circuito integrado", ["circuito integrado", "integrated circuit"]),
    ("Creacion de ARPANET", ["arpanet"]),
    ("World Wide Web / Tim Berners-Lee", ["world wide web", "tim berners-lee"]),
    ("Lanzamiento del primer iPhone", ["primer iphone", "iphone 1st generation", "iphone (1"]),
    ("Auge de la IA generativa / ChatGPT", ["chatgpt", "inteligencia artificial generativa"]),
    # ── ESPACIO ──
    ("Yuri Gagarin, primer humano en el espacio", ["yuri gagarin"]),
    ("Fundacion de la NASA", ["fundacion de la nasa", "nasa founded"]),
    ("Sondas Voyager lanzadas", ["voyager 1", "voyager 2", "sondas voyager"]),
    ("Primer lanzamiento del Transbordador Espacial", ["transbordador espacial", "space shuttle"]),
    ("Telescopio espacial Hubble", ["telescopio hubble", "hubble space telescope"]),
    ("Estacion Espacial Internacional", ["estacion espacial internacional", "international space station"]),
    ("Era de SpaceX / vuelos espaciales comerciales", ["spacex"]),
]

faltan = []
si_estan = []
for nombre, kws in CHECKLIST:
    hits = buscar([norm(k) for k in kws])
    if hits:
        si_estan.append((nombre, hits[0]))
    else:
        faltan.append(nombre)

print(f"Total en checklist: {len(CHECKLIST)}")
print(f"Encontrados: {len(si_estan)}")
print(f"FALTANTES: {len(faltan)}")
print()
print("═" * 60)
print(" EVENTOS FALTANTES (no encontrados por keyword)")
print("═" * 60)
for nombre in faltan:
    print(f"  - {nombre}")
