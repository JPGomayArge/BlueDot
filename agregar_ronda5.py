# -*- coding: utf-8 -*-
"""
BlueDot -- agregar_ronda5.py
Ronda 5 de eventos curados a mano: 151 eventos para llevar el dataset a
~30,000 (asumiendo que ya corriste agregar_indispensables.py y estas en
29,849). Cubre huecos secundarios que no entraron en la ronda anterior:
tratados/instituciones, mas batallas no-occidentales y clasicas, mas
religion, cultura/arte, inventos/ciencia, desastres, exploracion y
economia -- evitando el sesgo hacia biografias que ya domina el pull de
Wikidata.

Lee data/events_extended.json TAL COMO ESTA en tu disco, evita duplicados
por id, y guarda de vuelta. Corre parado en la carpeta del proyecto:

    cd ~/Documents/BlueDot
    python3 agregar_ronda5.py
"""
import json
import collections
from pathlib import Path

EVENTS_PATH = Path(__file__).resolve().parent / "data" / "events_extended.json"

VALID_CATEGORIES = {
    "politica", "batallas", "personas", "inventos",
    "desastres", "exploracion", "religion", "cultura", "economia",
}

NEW_EVENTS = [
    # ══ POLITICA (31) ═══════════════════════════════════════════════════════
    dict(id="tratado_tordesillas_1494", year=1494, lat=41.50, lon=-5.00,
         es="Tratado de Tordesillas", en="Treaty of Tordesillas", category="politica", importance=4),
    dict(id="independencia_texas_1836", year=1836, lat=30.27, lon=-97.74,
         es="Independencia de Texas", en="Texas Revolution / independence", category="politica", importance=3),
    dict(id="separacion_panama_colombia_1903", year=1903, lat=8.98, lon=-79.52,
         es="Separación de Panamá de Colombia", en="Separation of Panama from Colombia", category="politica", importance=3),
    dict(id="independencia_noruega_1905", year=1905, lat=59.91, lon=10.75,
         es="Independencia de Noruega de Suecia", en="Dissolution of the union between Sweden and Norway", category="politica", importance=3),
    dict(id="independencia_irlanda_1922", year=1922, lat=53.35, lon=-6.26,
         es="Independencia de Irlanda", en="Irish independence", category="politica", importance=4),
    dict(id="independencia_grecia_1821", year=1821, lat=37.98, lon=23.73,
         es="Guerra de Independencia griega", en="Greek War of Independence", category="politica", importance=4),
    dict(id="declaracion_independencia_vietnam_1945", year=1945, lat=21.03, lon=105.85,
         es="Declaración de independencia de Vietnam", en="Vietnamese Declaration of Independence", category="politica", importance=3),
    dict(id="independencia_singapur_1965", year=1965, lat=1.35, lon=103.82,
         es="Independencia de Singapur", en="Singaporean independence", category="politica", importance=3),
    dict(id="independencia_angola_1975", year=1975, lat=-8.84, lon=13.23,
         es="Independencia de Angola", en="Angolan independence", category="politica", importance=3),
    dict(id="independencia_mozambique_1975", year=1975, lat=-25.97, lon=32.57,
         es="Independencia de Mozambique", en="Mozambican independence", category="politica", importance=3),
    dict(id="conferencia_yalta_1945", year=1945, lat=44.50, lon=34.16,
         es="Conferencia de Yalta", en="Yalta Conference", category="politica", importance=4),
    dict(id="conferencia_potsdam_1945", year=1945, lat=52.40, lon=13.06,
         es="Conferencia de Potsdam", en="Potsdam Conference", category="politica", importance=4),
    dict(id="fundacion_ceca_1951", year=1951, lat=48.85, lon=2.35,
         es="Fundación de la Comunidad Europea del Carbón y del Acero", en="Founding of the European Coal and Steel Community", category="politica", importance=3),
    dict(id="fundacion_pacto_varsovia_1955", year=1955, lat=52.23, lon=21.01,
         es="Fundación del Pacto de Varsovia", en="Founding of the Warsaw Pact", category="politica", importance=4),
    dict(id="acuerdos_camp_david_1978", year=1978, lat=39.65, lon=-77.47,
         es="Acuerdos de Camp David", en="Camp David Accords", category="politica", importance=4),
    dict(id="protocolo_kioto_1997", year=1997, lat=35.01, lon=135.77,
         es="Protocolo de Kioto", en="Kyoto Protocol", category="politica", importance=3),
    dict(id="acuerdo_paris_clima_2015", year=2015, lat=48.85, lon=2.35,
         es="Acuerdo de París sobre el clima", en="Paris Agreement (climate)", category="politica", importance=4),
    dict(id="independencia_filipinas_1946", year=1946, lat=14.60, lon=120.98,
         es="Independencia de Filipinas", en="Philippine independence", category="politica", importance=3),
    dict(id="congreso_berlin_1878", year=1878, lat=52.52, lon=13.40,
         es="Congreso de Berlín de 1878", en="Congress of Berlin (1878)", category="politica", importance=3),
    dict(id="tratado_salt_i_1972", year=1972, lat=55.75, lon=37.62,
         es="Firma del Tratado SALT I", en="Signing of the SALT I Treaty", category="politica", importance=3),
    dict(id="fundacion_liga_arabe_1945", year=1945, lat=30.04, lon=31.24,
         es="Fundación de la Liga Árabe", en="Founding of the Arab League", category="politica", importance=3),
    dict(id="revolucion_claveles_portugal_1974", year=1974, lat=38.72, lon=-9.14,
         es="Revolución de los Claveles", en="Carnation Revolution", category="politica", importance=4),
    dict(id="transicion_espanola_democracia_1975", year=1975, lat=40.42, lon=-3.70,
         es="Transición española a la democracia", en="Spanish transition to democracy", category="politica", importance=4),
    dict(id="caida_saigon_1975", year=1975, lat=10.82, lon=106.63,
         es="Caída de Saigón", en="Fall of Saigon", category="politica", importance=4),
    dict(id="fundacion_consejo_europa_1949", year=1949, lat=48.58, lon=7.75,
         es="Fundación del Consejo de Europa", en="Founding of the Council of Europe", category="politica", importance=3),
    dict(id="tratado_roma_1957", year=1957, lat=41.90, lon=12.50,
         es="Tratado de Roma (fundación de la CEE)", en="Treaty of Rome (founding of the EEC)", category="politica", importance=4),
    dict(id="acuerdo_schengen_1985", year=1985, lat=49.47, lon=6.36,
         es="Acuerdo de Schengen", en="Schengen Agreement", category="politica", importance=3),
    dict(id="acuerdos_helsinki_1975", year=1975, lat=60.17, lon=24.94,
         es="Acuerdos de Helsinki", en="Helsinki Accords", category="politica", importance=3),
    dict(id="fundacion_interpol_1923", year=1923, lat=48.21, lon=16.37,
         es="Fundación de Interpol", en="Founding of Interpol", category="politica", importance=2),
    dict(id="traspaso_canal_panama_1999", year=1999, lat=8.98, lon=-79.52,
         es="Traspaso del Canal de Panamá a Panamá", en="Handover of the Panama Canal to Panama", category="politica", importance=3),
    dict(id="fundacion_corte_penal_internacional_2002", year=2002, lat=52.08, lon=4.31,
         es="Fundación de la Corte Penal Internacional", en="Founding of the International Criminal Court", category="politica", importance=3),

    # ══ BATALLAS (25) ═══════════════════════════════════════════════════════
    dict(id="batalla_cannas_216", year=-216, lat=41.30, lon=15.90,
         es="Batalla de Cannas", en="Battle of Cannae", category="batallas", importance=4),
    dict(id="batalla_actium_31", year=-31, lat=38.95, lon=20.75,
         es="Batalla de Accio", en="Battle of Actium", category="batallas", importance=4),
    dict(id="batalla_adrianopolis_378", year=378, lat=41.68, lon=26.56,
         es="Batalla de Adrianópolis", en="Battle of Adrianople", category="batallas", importance=3),
    dict(id="batalla_kosovo_1389", year=1389, lat=42.67, lon=21.17,
         es="Batalla de Kosovo (1389)", en="Battle of Kosovo (1389)", category="batallas", importance=3),
    dict(id="caida_tenochtitlan_1521", year=1521, lat=19.43, lon=-99.13,
         es="Caída de Tenochtitlán", en="Fall of Tenochtitlan", category="batallas", importance=5),
    dict(id="batalla_lepanto_1571", year=1571, lat=38.25, lon=21.73,
         es="Batalla de Lepanto", en="Battle of Lepanto", category="batallas", importance=4),
    dict(id="batalla_yorktown_1781", year=1781, lat=37.24, lon=-76.51,
         es="Batalla de Yorktown", en="Battle of Yorktown", category="batallas", importance=4),
    dict(id="batalla_trafalgar_1805", year=1805, lat=36.53, lon=-6.29,
         es="Batalla de Trafalgar", en="Battle of Trafalgar", category="batallas", importance=4),
    dict(id="batalla_austerlitz_1805", year=1805, lat=49.15, lon=16.87,
         es="Batalla de Austerlitz", en="Battle of Austerlitz", category="batallas", importance=4),
    dict(id="guerra_franco_prusiana_1870", year=1870, lat=49.70, lon=4.94,
         es="Guerra Franco-Prusiana", en="Franco-Prussian War", category="batallas", importance=4),
    dict(id="batalla_gettysburg_1863", year=1863, lat=39.83, lon=-77.23,
         es="Batalla de Gettysburg", en="Battle of Gettysburg", category="batallas", importance=4),
    dict(id="batalla_somme_1916", year=1916, lat=50.02, lon=2.75,
         es="Batalla del Somme", en="Battle of the Somme", category="batallas", importance=4),
    dict(id="batalla_ypres_1917", year=1917, lat=50.85, lon=2.89,
         es="Batallas de Ypres", en="Battles of Ypres", category="batallas", importance=3),
    dict(id="batalla_midway_1942", year=1942, lat=28.21, lon=-177.37,
         es="Batalla de Midway", en="Battle of Midway", category="batallas", importance=5),
    dict(id="batalla_el_alamein_1942", year=1942, lat=30.83, lon=28.95,
         es="Batalla de El Alamein", en="Battle of El Alamein", category="batallas", importance=4),
    dict(id="sitio_leningrado_1941", year=1941, lat=59.93, lon=30.34,
         es="Sitio de Leningrado", en="Siege of Leningrad", category="batallas", importance=5),
    dict(id="batalla_iwo_jima_1945", year=1945, lat=24.78, lon=141.32,
         es="Batalla de Iwo Jima", en="Battle of Iwo Jima", category="batallas", importance=4),
    dict(id="batalla_okinawa_1945", year=1945, lat=26.50, lon=127.98,
         es="Batalla de Okinawa", en="Battle of Okinawa", category="batallas", importance=4),
    dict(id="guerra_independencia_angola_1961", year=1961, lat=-8.84, lon=13.23,
         es="Guerra de Independencia de Angola", en="Angolan War of Independence", category="batallas", importance=3),
    dict(id="guerra_chino_vietnamita_1979", year=1979, lat=21.03, lon=105.85,
         es="Guerra Chino-Vietnamita", en="Sino-Vietnamese War", category="batallas", importance=3),
    dict(id="guerra_iran_irak_1980", year=1980, lat=33.31, lon=44.36,
         es="Guerra Irán-Irak", en="Iran–Iraq War", category="batallas", importance=4),
    dict(id="guerra_bosnia_1992", year=1992, lat=43.86, lon=18.41,
         es="Guerra de Bosnia", en="Bosnian War", category="batallas", importance=4),
    dict(id="guerra_kosovo_1998", year=1998, lat=42.67, lon=21.17,
         es="Guerra de Kosovo", en="Kosovo War", category="batallas", importance=4),
    dict(id="guerra_etiopia_eritrea_1998", year=1998, lat=15.32, lon=38.93,
         es="Guerra de Etiopía-Eritrea", en="Eritrean–Ethiopian War", category="batallas", importance=3),
    dict(id="guerra_ruso_georgiana_2008", year=2008, lat=41.72, lon=44.79,
         es="Guerra Ruso-Georgiana", en="Russo-Georgian War", category="batallas", importance=3),

    # ══ RELIGION (15) ═══════════════════════════════════════════════════════
    dict(id="budismo_zen_japon_1191", year=1191, lat=35.01, lon=135.77,
         es="Introducción del budismo Zen en Japón", en="Introduction of Zen Buddhism to Japan", category="religion", importance=3),
    dict(id="cisma_avinon_1378", year=1378, lat=43.95, lon=4.81,
         es="Cisma de Aviñón (Cisma de Occidente)", en="Western Schism (Avignon Papacy)", category="religion", importance=4),
    dict(id="fundacion_jesuitas_1540", year=1540, lat=41.90, lon=12.50,
         es="Fundación de la Compañía de Jesús", en="Founding of the Society of Jesus (Jesuits)", category="religion", importance=4),
    dict(id="masacre_san_bartolome_1572", year=1572, lat=48.85, lon=2.35,
         es="Masacre de San Bartolomé", en="St. Bartholomew's Day massacre", category="religion", importance=4),
    dict(id="edicto_nantes_1598", year=1598, lat=47.22, lon=-1.55,
         es="Edicto de Nantes", en="Edict of Nantes", category="religion", importance=4),
    dict(id="cisma_anglicano_1534", year=1534, lat=51.51, lon=-0.13,
         es="Cisma anglicano de Enrique VIII", en="Henry VIII's break with Rome", category="religion", importance=4),
    dict(id="gran_despertar_1730", year=1730, lat=42.32, lon=-72.63,
         es="Gran Despertar religioso", en="The Great Awakening", category="religion", importance=3),
    dict(id="fundacion_metodismo_1738", year=1738, lat=51.51, lon=-0.13,
         es="Fundación del Metodismo", en="Founding of Methodism", category="religion", importance=3),
    dict(id="fundacion_testigos_jehova_1870", year=1870, lat=40.44, lon=-79.99,
         es="Fundación de los Testigos de Jehová", en="Founding of Jehovah's Witnesses", category="religion", importance=2),
    dict(id="fundacion_bahaismo_1863", year=1863, lat=33.31, lon=44.36,
         es="Fundación del Bahaísmo", en="Founding of the Baháʼí Faith", category="religion", importance=3),
    dict(id="fundacion_estado_vaticano_1929", year=1929, lat=41.90, lon=12.45,
         es="Fundación del Estado de la Ciudad del Vaticano", en="Founding of Vatican City State", category="religion", importance=3),
    dict(id="concilio_vaticano_i_1869", year=1869, lat=41.90, lon=12.45,
         es="Concilio Vaticano I", en="First Vatican Council", category="religion", importance=3),
    dict(id="exilio_dalai_lama_1959", year=1959, lat=29.65, lon=91.13,
         es="Exilio del Dalái Lama del Tíbet", en="Dalai Lama's exile from Tibet", category="religion", importance=4),
    dict(id="eleccion_juan_pablo_ii_1978", year=1978, lat=41.90, lon=12.45,
         es="Elección de Juan Pablo II", en="Election of Pope John Paul II", category="religion", importance=4),
    dict(id="fundacion_movimiento_rastafari_1930", year=1930, lat=18.11, lon=-77.30,
         es="Fundación del movimiento rastafari", en="Founding of the Rastafari movement", category="religion", importance=2),

    # ══ CULTURA (21) ════════════════════════════════════════════════════════
    dict(id="publicacion_quijote_1605", year=1605, lat=40.42, lon=-3.70,
         es="Publicación de Don Quijote de la Mancha", en="Publication of Don Quixote", category="cultura", importance=5),
    dict(id="obras_shakespeare_hamlet_1600", year=1600, lat=51.51, lon=-0.13,
         es="Obras de Shakespeare (Hamlet)", en="Shakespeare's plays (Hamlet)", category="cultura", importance=5),
    dict(id="divina_comedia_dante_1320", year=1320, lat=43.77, lon=11.26,
         es="La Divina Comedia de Dante", en="Dante's Divine Comedy", category="cultura", importance=4),
    dict(id="pintura_mona_lisa_1503", year=1503, lat=43.77, lon=11.26,
         es="Pintura de la Mona Lisa", en="Painting of the Mona Lisa", category="cultura", importance=5),
    dict(id="novena_sinfonia_beethoven_1824", year=1824, lat=48.21, lon=16.37,
         es="Novena Sinfonía de Beethoven", en="Beethoven's Ninth Symphony", category="cultura", importance=4),
    dict(id="guernica_picasso_1937", year=1937, lat=48.85, lon=2.35,
         es="Pintura del Guernica de Picasso", en="Picasso paints Guernica", category="cultura", importance=4),
    dict(id="cien_anios_soledad_1967", year=1967, lat=4.71, lon=-74.07,
         es="Publicación de Cien años de soledad", en="Publication of One Hundred Years of Solitude", category="cultura", importance=4),
    dict(id="festival_woodstock_1969", year=1969, lat=41.69, lon=-74.87,
         es="Festival de Woodstock", en="Woodstock Festival", category="cultura", importance=4),
    dict(id="primeros_jjoo_modernos_1896", year=1896, lat=37.98, lon=23.73,
         es="Primeros Juegos Olímpicos modernos", en="First modern Olympic Games", category="cultura", importance=5),
    dict(id="primera_copa_mundial_fifa_1930", year=1930, lat=-34.90, lon=-56.16,
         es="Primera Copa Mundial de la FIFA", en="First FIFA World Cup", category="cultura", importance=4),
    dict(id="fundacion_hollywood_1910", year=1910, lat=34.05, lon=-118.24,
         es="Fundación de Hollywood como centro del cine", en="Founding of Hollywood as film industry hub", category="cultura", importance=3),
    dict(id="beatlemania_1964", year=1964, lat=53.41, lon=-2.98,
         es="Beatlemanía / invasión británica", en="Beatlemania / British Invasion", category="cultura", importance=3),
    dict(id="movimiento_surrealista_1924", year=1924, lat=48.85, lon=2.35,
         es="Manifiesto Surrealista", en="Surrealist Manifesto", category="cultura", importance=3),
    dict(id="movimiento_cubista_1907", year=1907, lat=48.85, lon=2.35,
         es="Nacimiento del Cubismo", en="Birth of Cubism", category="cultura", importance=4),
    dict(id="fundacion_bauhaus_1919", year=1919, lat=50.98, lon=11.33,
         es="Fundación de la Bauhaus", en="Founding of the Bauhaus", category="cultura", importance=4),
    dict(id="blancanieves_disney_1937", year=1937, lat=34.05, lon=-118.24,
         es="Estreno de Blancanieves, primer largometraje animado", en="Release of Snow White, first animated feature film", category="cultura", importance=3),
    dict(id="fundacion_rae_1713", year=1713, lat=40.42, lon=-3.70,
         es="Fundación de la Real Academia Española", en="Founding of the Real Academia Española", category="cultura", importance=3),
    dict(id="fundacion_ballets_russes_1909", year=1909, lat=48.85, lon=2.35,
         es="Fundación de los Ballets Rusos", en="Founding of the Ballets Russes", category="cultura", importance=3),
    dict(id="primer_festival_cannes_1946", year=1946, lat=43.55, lon=7.02,
         es="Primer Festival de Cine de Cannes", en="First Cannes Film Festival", category="cultura", importance=3),
    dict(id="fundacion_museo_louvre_1793", year=1793, lat=48.86, lon=2.34,
         es="Apertura del Museo del Louvre al público", en="Opening of the Louvre as a public museum", category="cultura", importance=4),
    dict(id="estreno_star_wars_1977", year=1977, lat=34.05, lon=-118.24,
         es="Estreno de Star Wars", en="Release of Star Wars", category="cultura", importance=3),

    # ══ INVENTOS / CIENCIA (21) ═════════════════════════════════════════════
    dict(id="imprenta_jikji_corea_1377", year=1377, lat=36.64, lon=127.49,
         es="Jikji, el libro impreso más antiguo con tipos móviles metálicos", en="Jikji, oldest book printed with movable metal type", category="inventos", importance=4),
    dict(id="algebra_al_juarismi_820", year=820, lat=33.31, lon=44.36,
         es="Álgebra de Al-Juarismi", en="Al-Khwarizmi's algebra", category="inventos", importance=4),
    dict(id="astrolabio_islamico_850", year=850, lat=33.31, lon=44.36,
         es="Perfeccionamiento del astrolabio en el mundo islámico", en="Refinement of the astrolabe in the Islamic world", category="inventos", importance=3),
    dict(id="concepto_cero_aryabhata_500", year=500, lat=25.61, lon=85.14,
         es="Formalización del cero, Aryabhata", en="Formalization of zero, Aryabhata", category="inventos", importance=4),
    dict(id="invencion_maquina_escribir_1868", year=1868, lat=43.04, lon=-87.91,
         es="Invención de la máquina de escribir", en="Invention of the typewriter", category="inventos", importance=3),
    dict(id="invencion_radar_1935", year=1935, lat=52.26, lon=-1.16,
         es="Invención del radar", en="Invention of radar", category="inventos", importance=4),
    dict(id="invencion_laser_1960", year=1960, lat=34.03, lon=-118.68,
         es="Invención del láser", en="Invention of the laser", category="inventos", importance=4),
    dict(id="primer_transplante_corazon_1967", year=1967, lat=-33.92, lon=18.42,
         es="Primer trasplante de corazón humano", en="First human heart transplant", category="inventos", importance=4),
    dict(id="pildora_anticonceptiva_1960", year=1960, lat=41.88, lon=-87.63,
         es="Aprobación de la píldora anticonceptiva", en="Approval of the birth control pill", category="inventos", importance=4),
    dict(id="navegador_mosaic_1993", year=1993, lat=40.11, lon=-88.20,
         es="Lanzamiento del navegador web Mosaic", en="Release of the Mosaic web browser", category="inventos", importance=3),
    dict(id="gps_operativo_1978", year=1978, lat=28.39, lon=-80.61,
         es="Puesta en marcha del sistema GPS", en="GPS system becomes operational", category="inventos", importance=4),
    dict(id="clonacion_oveja_dolly_1996", year=1996, lat=55.95, lon=-3.19,
         es="Clonación de la oveja Dolly", en="Cloning of Dolly the sheep", category="inventos", importance=4),
    dict(id="microprocesador_intel_4004_1971", year=1971, lat=37.35, lon=-121.95,
         es="Lanzamiento del primer microprocesador comercial", en="Release of the first commercial microprocessor", category="inventos", importance=4),
    dict(id="invencion_correo_electronico_1971", year=1971, lat=42.37, lon=-71.11,
         es="Invención del correo electrónico", en="Invention of email", category="inventos", importance=3),
    dict(id="invencion_resonancia_magnetica_1977", year=1977, lat=40.71, lon=-74.01,
         es="Invención de la resonancia magnética (MRI)", en="Invention of MRI", category="inventos", importance=3),
    dict(id="descubrimiento_boson_higgs_2012", year=2012, lat=46.23, lon=6.05,
         es="Descubrimiento del bosón de Higgs", en="Discovery of the Higgs boson", category="inventos", importance=4),
    dict(id="vacuna_polio_salk_1955", year=1955, lat=40.44, lon=-79.99,
         es="Desarrollo de la vacuna contra la polio", en="Development of the polio vaccine", category="inventos", importance=4),
    dict(id="invencion_dinamita_1867", year=1867, lat=59.33, lon=18.07,
         es="Invención de la dinamita", en="Invention of dynamite", category="inventos", importance=3),
    dict(id="descubrimiento_insulina_1921", year=1921, lat=43.65, lon=-79.38,
         es="Descubrimiento de la insulina", en="Discovery of insulin", category="inventos", importance=4),
    dict(id="invencion_fibra_optica_1970", year=1970, lat=42.15, lon=-77.06,
         es="Invención de la fibra óptica de comunicaciones", en="Invention of optical fiber communication", category="inventos", importance=3),
    dict(id="lanzamiento_primer_cd_1982", year=1982, lat=35.68, lon=139.65,
         es="Lanzamiento del primer disco compacto (CD)", en="Launch of the first compact disc (CD)", category="inventos", importance=2),

    # ══ DESASTRES (16) ══════════════════════════════════════════════════════
    dict(id="erupcion_krakatoa_1883", year=1883, lat=-6.10, lon=105.42,
         es="Erupción del Krakatoa", en="Eruption of Krakatoa", category="desastres", importance=5),
    dict(id="terremoto_tangshan_1976", year=1976, lat=39.63, lon=118.18,
         es="Terremoto de Tangshan", en="Tangshan earthquake", category="desastres", importance=4),
    dict(id="hambruna_bengala_1943", year=1943, lat=22.57, lon=88.36,
         es="Hambruna de Bengala de 1943", en="1943 Bengal famine", category="desastres", importance=4),
    dict(id="explosion_halifax_1917", year=1917, lat=44.65, lon=-63.57,
         es="Explosión de Halifax", en="Halifax Explosion", category="desastres", importance=3),
    dict(id="inundacion_johnstown_1889", year=1889, lat=40.33, lon=-78.92,
         es="Inundación de Johnstown", en="Johnstown Flood", category="desastres", importance=3),
    dict(id="terremoto_tsunami_tohoku_2011", year=2011, lat=38.27, lon=140.87,
         es="Terremoto y tsunami de Tōhoku", en="Tōhoku earthquake and tsunami", category="desastres", importance=5),
    dict(id="derrame_exxon_valdez_1989", year=1989, lat=60.80, lon=-146.85,
         es="Derrame de petróleo del Exxon Valdez", en="Exxon Valdez oil spill", category="desastres", importance=3),
    dict(id="derrame_deepwater_horizon_2010", year=2010, lat=28.74, lon=-88.39,
         es="Derrame de petróleo de Deepwater Horizon", en="Deepwater Horizon oil spill", category="desastres", importance=4),
    dict(id="ciclon_bhola_1970", year=1970, lat=22.85, lon=89.55,
         es="Ciclón Bhola de 1970", en="1970 Bhola cyclone", category="desastres", importance=4),
    dict(id="terremoto_mexico_1985", year=1985, lat=19.43, lon=-99.13,
         es="Terremoto de México de 1985", en="1985 Mexico City earthquake", category="desastres", importance=4),
    dict(id="erupcion_pinatubo_1991", year=1991, lat=15.13, lon=120.35,
         es="Erupción del Monte Pinatubo", en="Eruption of Mount Pinatubo", category="desastres", importance=4),
    dict(id="incendio_chicago_1871", year=1871, lat=41.88, lon=-87.63,
         es="Gran Incendio de Chicago", en="Great Chicago Fire", category="desastres", importance=3),
    dict(id="terremoto_kobe_1995", year=1995, lat=34.69, lon=135.20,
         es="Terremoto de Kobe", en="Great Hanshin earthquake (Kobe)", category="desastres", importance=4),
    dict(id="epidemia_colera_londres_1854", year=1854, lat=51.51, lon=-0.13,
         es="Epidemia de cólera de Londres de 1854", en="1854 Broad Street cholera outbreak", category="desastres", importance=3),
    dict(id="gripe_hong_kong_1968", year=1968, lat=22.32, lon=114.17,
         es="Pandemia de gripe de Hong Kong de 1968", en="1968 Hong Kong flu pandemic", category="desastres", importance=3),
    dict(id="explosion_challenger_1986", year=1986, lat=28.39, lon=-80.61,
         es="Explosión del transbordador Challenger", en="Space Shuttle Challenger disaster", category="desastres", importance=4),

    # ══ EXPLORACION (12) ════════════════════════════════════════════════════
    dict(id="vuelo_transatlantico_alcock_brown_1919", year=1919, lat=53.35, lon=-9.05,
         es="Primer vuelo transatlántico sin escalas (Alcock y Brown)", en="First non-stop transatlantic flight (Alcock and Brown)", category="exploracion", importance=3),
    dict(id="vuelo_solitario_lindbergh_1927", year=1927, lat=48.85, lon=2.35,
         es="Vuelo transatlántico en solitario de Lindbergh", en="Lindbergh's solo transatlantic flight", category="exploracion", importance=4),
    dict(id="expedicion_amundsen_norge_1926", year=1926, lat=78.93, lon=11.93,
         es="Expedición del dirigible Norge al Polo Norte", en="Norge airship expedition to the North Pole", category="exploracion", importance=3),
    dict(id="descenso_fosa_marianas_1960", year=1960, lat=11.35, lon=142.25,
         es="Primer descenso a la Fosa de las Marianas", en="First descent to the Mariana Trench", category="exploracion", importance=4),
    dict(id="expedicion_shackleton_antartida_1914", year=1914, lat=-54.28, lon=-36.51,
         es="Expedición Endurance de Shackleton a la Antártida", en="Shackleton's Endurance expedition to Antarctica", category="exploracion", importance=4),
    dict(id="tereshkova_primera_mujer_espacio_1963", year=1963, lat=45.92, lon=63.34,
         es="Valentina Tereshkova, primera mujer en el espacio", en="Valentina Tereshkova, first woman in space", category="exploracion", importance=4),
    dict(id="leonov_primera_caminata_espacial_1965", year=1965, lat=45.92, lon=63.34,
         es="Alekséi Leonov, primera caminata espacial", en="Alexei Leonov, first spacewalk", category="exploracion", importance=4),
    dict(id="viking_1_marte_1976", year=1976, lat=28.39, lon=-80.61,
         es="Primer aterrizaje en Marte, sonda Viking 1", en="First landing on Mars, Viking 1 probe", category="exploracion", importance=4),
    dict(id="descubrimiento_pecio_titanic_1985", year=1985, lat=41.73, lon=-49.95,
         es="Descubrimiento del pecio del Titanic", en="Discovery of the Titanic wreck", category="exploracion", importance=3),
    dict(id="breitling_orbiter_1999", year=1999, lat=46.48, lon=7.13,
         es="Primera vuelta al mundo en globo sin escalas", en="First non-stop round-the-world balloon flight", category="exploracion", importance=3),
    dict(id="primer_ascenso_k2_1954", year=1954, lat=35.88, lon=76.51,
         es="Primer ascenso al K2", en="First ascent of K2", category="exploracion", importance=3),
    dict(id="expedicion_kontiki_1947", year=1947, lat=-12.05, lon=-77.13,
         es="Expedición Kon-Tiki de Thor Heyerdahl", en="Thor Heyerdahl's Kon-Tiki expedition", category="exploracion", importance=3),

    # ══ ECONOMIA (10) ═══════════════════════════════════════════════════════
    dict(id="papel_moneda_dinastia_song_1024", year=1024, lat=30.57, lon=104.07,
         es="Primer papel moneda del mundo (dinastía Song)", en="World's first paper money (Song dynasty)", category="economia", importance=4),
    dict(id="fundacion_banco_inglaterra_1694", year=1694, lat=51.51, lon=-0.13,
         es="Fundación del Banco de Inglaterra", en="Founding of the Bank of England", category="economia", importance=4),
    dict(id="fundacion_bolsa_amsterdam_1602", year=1602, lat=52.37, lon=4.90,
         es="Fundación de la Bolsa de Ámsterdam", en="Founding of the Amsterdam Stock Exchange", category="economia", importance=4),
    dict(id="fundacion_reserva_federal_1913", year=1913, lat=38.90, lon=-77.04,
         es="Fundación de la Reserva Federal de EE. UU.", en="Founding of the U.S. Federal Reserve", category="economia", importance=4),
    dict(id="panico_1907", year=1907, lat=40.71, lon=-74.01,
         es="Pánico bancario de 1907", en="Panic of 1907", category="economia", importance=3),
    dict(id="conferencia_bretton_woods_1944", year=1944, lat=44.26, lon=-71.45,
         es="Conferencia de Bretton Woods (FMI y Banco Mundial)", en="Bretton Woods Conference (IMF and World Bank)", category="economia", importance=5),
    dict(id="segunda_crisis_petroleo_1979", year=1979, lat=35.69, lon=51.39,
         es="Segunda crisis del petróleo de 1979", en="1979 oil crisis", category="economia", importance=3),
    dict(id="lanzamiento_diners_club_1950", year=1950, lat=40.71, lon=-74.01,
         es="Lanzamiento de la tarjeta de crédito Diners Club", en="Launch of the Diners Club credit card", category="economia", importance=2),
    dict(id="fundacion_omc_1995", year=1995, lat=46.23, lon=6.05,
         es="Fundación de la Organización Mundial del Comercio", en="Founding of the World Trade Organization", category="economia", importance=4),
    dict(id="crisis_deuda_griega_2010", year=2010, lat=37.98, lon=23.73,
         es="Crisis de la deuda griega", en="Greek government-debt crisis", category="economia", importance=4),
]


def to_event(e):
    return {
        "id": e["id"], "wikidataId": None, "year": e["year"], "lat": e["lat"], "lon": e["lon"],
        "labels": {"es": e["es"], "en": e["en"]},
        "wikiTitles": {"es": e["es"], "en": e["en"]},
        "category": e["category"], "importance": e["importance"],
    }


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        existing = json.load(f)
    print(f"Eventos existentes (leidos de tu disco, tal cual estan ahora): {len(existing)}")

    existing_ids = set(e["id"] for e in existing)

    new_objs = [to_event(e) for e in NEW_EVENTS]
    new_ids = [o["id"] for o in new_objs]
    assert len(new_ids) == len(set(new_ids)), "id duplicado dentro de NEW_EVENTS -- revisar script"

    collisions = [i for i in new_ids if i in existing_ids]
    if collisions:
        print("IDs que ya existian (se omiten, no se duplican):", collisions)

    to_add = [o for o in new_objs if o["id"] not in existing_ids]

    bad_cat = [o for o in to_add if o["category"] not in VALID_CATEGORIES]
    if bad_cat:
        print("ERROR -- categorias invalidas, abortando:", [(o["id"], o["category"]) for o in bad_cat])
        return
    bad_coord = [o for o in to_add
                 if not isinstance(o["lat"], (int, float)) or not isinstance(o["lon"], (int, float))
                 or not (-90 <= o["lat"] <= 90) or not (-180 <= o["lon"] <= 180)]
    if bad_coord:
        print("ERROR -- coordenadas invalidas, abortando:", [o["id"] for o in bad_coord])
        return

    merged = existing + to_add
    merged.sort(key=lambda d: d["year"])

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")

    cats = collections.Counter(o["category"] for o in to_add)
    print(f"\nEventos nuevos agregados: {len(to_add)}")
    print("Por categoria:", dict(cats))
    print(f"Total del dataset ahora: {len(merged)}")
    print(f"Archivo actualizado: {EVENTS_PATH}")


if __name__ == "__main__":
    main()
