# -*- coding: utf-8 -*-
"""
BlueDot -- agregar_indispensables.py
Agrega los 147 eventos historicos indispensables que checklist_gaps.py
detecto como faltantes (investigados con web search: AP World History,
listas de "eventos que cambiaron el mundo", y cobertura no-occidental
explicita: China, India, mundo islamico, Africa, Latinoamerica, sudeste
asiatico). Cubre tambien la categoria "economia" con datos reales por
primera vez (Ruta de la Seda, crisis financieras, Bretton Woods-adyacentes,
etc.)

Lee data/events_extended.json TAL COMO ESTA en tu disco (no una copia mia),
evita duplicados por id, y guarda de vuelta. Corre esto parado en la
carpeta del proyecto:

    cd ~/Documents/BlueDot
    python3 agregar_indispensables.py
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
    # ══ ANTIGUEDAD / CLASICA ═══════════════════════════════════════════════
    dict(id="codigo_hammurabi_1754", year=-1754, lat=32.54, lon=44.42,
         es="Código de Hammurabi", en="Code of Hammurabi", category="politica", importance=4),
    dict(id="fundacion_cartago_814", year=-814, lat=36.85, lon=10.32,
         es="Fundación de Cartago", en="Founding of Carthage", category="politica", importance=3),
    dict(id="caida_imperio_asirio_612", year=-612, lat=36.36, lon=43.15,
         es="Caída del Imperio Asirio", en="Fall of the Assyrian Empire", category="batallas", importance=3),
    dict(id="guerra_peloponeso_431", year=-431, lat=37.98, lon=23.73,
         es="Guerra del Peloponeso", en="Peloponnesian War", category="batallas", importance=4),
    dict(id="guerras_punicas_264", year=-264, lat=41.90, lon=12.50,
         es="Guerras Púnicas", en="Punic Wars", category="batallas", importance=4),
    dict(id="ruta_de_la_seda_130", year=-130, lat=34.34, lon=108.94,
         es="Ruta de la Seda", en="Silk Road", category="economia", importance=4),
    dict(id="destruccion_segundo_templo_70", year=70, lat=31.78, lon=35.23,
         es="Destrucción del Segundo Templo", en="Destruction of the Second Temple", category="religion", importance=4),
    dict(id="gran_cisma_1054", year=1054, lat=41.01, lon=28.98,
         es="Gran Cisma de Oriente y Occidente", en="East–West Schism", category="religion", importance=4),
    dict(id="saqueo_mongol_bagdad_1258", year=1258, lat=33.31, lon=44.36,
         es="Saqueo mongol de Bagdad", en="Mongol siege of Baghdad", category="batallas", importance=4),

    # ══ MODERNO TEMPRANO ═══════════════════════════════════════════════════
    dict(id="viaje_mayflower_1620", year=1620, lat=41.96, lon=-70.67,
         es="Viaje del Mayflower", en="Mayflower voyage", category="exploracion", importance=3),
    dict(id="guerra_treinta_anios_1618", year=1618, lat=50.09, lon=14.42,
         es="Guerra de los Treinta Años", en="Thirty Years' War", category="batallas", importance=4),
    dict(id="paz_westfalia_1648", year=1648, lat=51.96, lon=7.63,
         es="Paz de Westfalia", en="Peace of Westphalia", category="politica", importance=5),
    dict(id="revolucion_gloriosa_1688", year=1688, lat=51.51, lon=-0.13,
         es="Revolución Gloriosa", en="Glorious Revolution", category="politica", importance=4),
    dict(id="trata_transatlantica_esclavos_1526", year=1526, lat=5.08, lon=-1.35,
         es="Trata transatlántica de esclavos", en="Transatlantic slave trade", category="desastres", importance=5),
    dict(id="juicios_brujas_salem_1692", year=1692, lat=42.52, lon=-70.89,
         es="Juicios de brujas de Salem", en="Salem witch trials", category="desastres", importance=3),

    # ══ REVOLUCIONES / SIGLO XIX ═══════════════════════════════════════════
    dict(id="guerra_siete_anios_1756", year=1756, lat=52.52, lon=13.40,
         es="Guerra de los Siete Años", en="Seven Years' War", category="batallas", importance=4),
    dict(id="toma_bastilla_1789", year=1789, lat=48.85, lon=2.37,
         es="Toma de la Bastilla", en="Storming of the Bastille", category="politica", importance=5),
    dict(id="revolucion_haitiana_1791", year=1791, lat=18.59, lon=-72.31,
         es="Revolución Haitiana", en="Haitian Revolution", category="politica", importance=4),
    dict(id="abolicion_esclavitud_imperio_britanico_1833", year=1833, lat=51.51, lon=-0.13,
         es="Abolición de la esclavitud en el Imperio Británico", en="Slavery Abolition Act 1833", category="politica", importance=4),
    dict(id="primera_guerra_opio_1839", year=1839, lat=23.13, lon=113.26,
         es="Primera Guerra del Opio", en="First Opium War", category="batallas", importance=4),
    dict(id="primaveras_pueblos_1848", year=1848, lat=48.85, lon=2.35,
         es="Primaveras de los Pueblos de 1848", en="Revolutions of 1848", category="politica", importance=4),
    dict(id="manifiesto_comunista_1848", year=1848, lat=51.51, lon=-0.13,
         es="Manifiesto Comunista", en="The Communist Manifesto", category="cultura", importance=4),
    dict(id="fiebre_oro_california_1848", year=1848, lat=38.58, lon=-121.49,
         es="Fiebre del oro de California", en="California Gold Rush", category="economia", importance=3),
    dict(id="apertura_japon_perry_1853", year=1853, lat=35.44, lon=139.64,
         es="Apertura de Japón (Comodoro Perry)", en="Perry's opening of Japan", category="politica", importance=4),
    dict(id="guerra_crimea_1853", year=1853, lat=44.62, lon=33.53,
         es="Guerra de Crimea", en="Crimean War", category="batallas", importance=4),
    dict(id="motin_india_1857", year=1857, lat=28.98, lon=77.71,
         es="Motín de la India de 1857", en="Indian Rebellion of 1857", category="batallas", importance=4),
    dict(id="guerra_civil_estadounidense_1861", year=1861, lat=38.90, lon=-77.04,
         es="Guerra Civil Estadounidense", en="American Civil War", category="batallas", importance=5),
    dict(id="restauracion_meiji_1868", year=1868, lat=35.68, lon=139.65,
         es="Restauración Meiji", en="Meiji Restoration", category="politica", importance=5),
    dict(id="apertura_canal_suez_1869", year=1869, lat=29.97, lon=32.55,
         es="Apertura del Canal de Suez", en="Opening of the Suez Canal", category="economia", importance=4),
    dict(id="unificacion_alemania_1871", year=1871, lat=52.52, lon=13.40,
         es="Unificación de Alemania", en="Unification of Germany", category="politica", importance=5),
    dict(id="conferencia_berlin_1884", year=1884, lat=52.52, lon=13.40,
         es="Conferencia de Berlín (reparto de África)", en="Berlin Conference", category="politica", importance=4),
    dict(id="primera_guerra_sino_japonesa_1894", year=1894, lat=37.51, lon=122.12,
         es="Primera Guerra Sino-Japonesa", en="First Sino-Japanese War", category="batallas", importance=3),
    dict(id="guerra_hispano_estadounidense_1898", year=1898, lat=23.13, lon=-82.38,
         es="Guerra Hispano-Estadounidense", en="Spanish–American War", category="batallas", importance=4),
    dict(id="rebelion_boxers_1899", year=1899, lat=39.90, lon=116.40,
         es="Rebelión de los Bóxers", en="Boxer Rebellion", category="batallas", importance=3),

    # ══ SIGLO XX ════════════════════════════════════════════════════════════
    dict(id="guerra_ruso_japonesa_1904", year=1904, lat=38.82, lon=121.26,
         es="Guerra Ruso-Japonesa", en="Russo-Japanese War", category="batallas", importance=4),
    dict(id="revolucion_mexicana_1910", year=1910, lat=19.43, lon=-99.13,
         es="Revolución Mexicana", en="Mexican Revolution", category="politica", importance=5),
    dict(id="revolucion_xinhai_1911", year=1911, lat=30.59, lon=114.31,
         es="Revolución Xinhai (fin de la dinastía Qing)", en="Xinhai Revolution", category="politica", importance=4),
    dict(id="declaracion_balfour_1917", year=1917, lat=51.51, lon=-0.13,
         es="Declaración Balfour", en="Balfour Declaration", category="politica", importance=4),
    dict(id="sufragio_femenino_eeuu_1920", year=1920, lat=38.90, lon=-77.04,
         es="Sufragio femenino (19.ª Enmienda, EE. UU.)", en="Women's suffrage (19th Amendment)", category="politica", importance=4),
    dict(id="invasion_japonesa_manchuria_1931", year=1931, lat=41.80, lon=123.43,
         es="Invasión japonesa de Manchuria", en="Japanese invasion of Manchuria", category="batallas", importance=4),
    dict(id="hitler_canciller_1933", year=1933, lat=52.52, lon=13.40,
         es="Hitler nombrado canciller de Alemania", en="Hitler becomes Chancellor of Germany", category="politica", importance=5),
    dict(id="guerra_civil_espanola_1936", year=1936, lat=40.42, lon=-3.70,
         es="Guerra Civil Española", en="Spanish Civil War", category="batallas", importance=5),
    dict(id="desembarco_normandia_1944", year=1944, lat=49.34, lon=-0.60,
         es="Desembarco de Normandía (Día D)", en="Normandy landings (D-Day)", category="batallas", importance=5),
    dict(id="fundacion_onu_1945", year=1945, lat=37.77, lon=-122.42,
         es="Fundación de la ONU", en="Founding of the United Nations", category="politica", importance=5),
    dict(id="declaracion_universal_ddhh_1948", year=1948, lat=48.85, lon=2.35,
         es="Declaración Universal de los Derechos Humanos", en="Universal Declaration of Human Rights", category="politica", importance=4),
    dict(id="muerte_stalin_1953", year=1953, lat=55.75, lon=37.62,
         es="Muerte de Stalin", en="Death of Stalin", category="politica", importance=3),
    dict(id="conferencia_bandung_1955", year=1955, lat=-6.91, lon=107.61,
         es="Conferencia de Bandung", en="Bandung Conference", category="politica", importance=4),
    dict(id="crisis_suez_1956", year=1956, lat=29.97, lon=32.55,
         es="Crisis de Suez", en="Suez Crisis", category="batallas", importance=4),
    dict(id="anio_africa_1960", year=1960, lat=6.52, lon=3.38,
         es="Año de África (1960)", en="Year of Africa", category="politica", importance=4),
    dict(id="asesinato_jfk_1963", year=1963, lat=32.78, lon=-96.81,
         es="Asesinato de John F. Kennedy", en="Assassination of John F. Kennedy", category="politica", importance=4),
    dict(id="ley_derechos_civiles_eeuu_1964", year=1964, lat=38.90, lon=-77.04,
         es="Ley de Derechos Civiles de 1964 (EE. UU.)", en="Civil Rights Act of 1964", category="politica", importance=4),
    dict(id="revolucion_cultural_china_1966", year=1966, lat=39.90, lon=116.40,
         es="Revolución Cultural China", en="Chinese Cultural Revolution", category="politica", importance=4),
    dict(id="guerra_seis_dias_1967", year=1967, lat=31.78, lon=35.23,
         es="Guerra de los Seis Días", en="Six-Day War", category="batallas", importance=4),
    dict(id="primavera_praga_1968", year=1968, lat=50.09, lon=14.42,
         es="Primavera de Praga", en="Prague Spring", category="politica", importance=4),
    dict(id="guerra_liberacion_bangladesh_1971", year=1971, lat=23.81, lon=90.41,
         es="Guerra de Liberación de Bangladesh", en="Bangladesh Liberation War", category="batallas", importance=4),
    dict(id="nixon_visita_china_1972", year=1972, lat=39.90, lon=116.40,
         es="Nixon visita China", en="Nixon's visit to China", category="politica", importance=3),
    dict(id="guerra_yom_kipur_1973", year=1973, lat=30.05, lon=33.75,
         es="Guerra de Yom Kipur", en="Yom Kippur War", category="batallas", importance=4),
    dict(id="genocidio_camboyano_1975", year=1975, lat=11.56, lon=104.92,
         es="Genocidio camboyano (Jemeres Rojos)", en="Cambodian genocide (Khmer Rouge)", category="desastres", importance=5),
    dict(id="revolucion_irani_1979", year=1979, lat=35.69, lon=51.39,
         es="Revolución Iraní", en="Iranian Revolution", category="politica", importance=4),
    dict(id="invasion_sovietica_afganistan_1979", year=1979, lat=34.56, lon=69.21,
         es="Invasión soviética de Afganistán", en="Soviet invasion of Afghanistan", category="batallas", importance=4),
    dict(id="guerra_malvinas_1982", year=1982, lat=-51.70, lon=-57.85,
         es="Guerra de las Malvinas", en="Falklands War", category="batallas", importance=3),
    dict(id="caida_muro_berlin_1989", year=1989, lat=52.52, lon=13.40,
         es="Caída del Muro de Berlín", en="Fall of the Berlin Wall", category="politica", importance=5),
    dict(id="acuerdos_oslo_1993", year=1993, lat=59.91, lon=10.75,
         es="Acuerdos de Oslo", en="Oslo Accords", category="politica", importance=4),
    dict(id="traspaso_hong_kong_1997", year=1997, lat=22.32, lon=114.17,
         es="Traspaso de Hong Kong a China", en="Handover of Hong Kong", category="politica", importance=4),
    dict(id="acuerdo_viernes_santo_1998", year=1998, lat=54.60, lon=-5.93,
         es="Acuerdo de Viernes Santo", en="Good Friday Agreement", category="politica", importance=3),
    dict(id="introduccion_euro_1999", year=1999, lat=50.11, lon=8.68,
         es="Introducción del euro", en="Introduction of the euro", category="economia", importance=4),

    # ══ CONTEMPORANEO ═══════════════════════════════════════════════════════
    dict(id="tsunami_oceano_indico_2004", year=2004, lat=5.55, lon=95.32,
         es="Tsunami del Océano Índico de 2004", en="2004 Indian Ocean tsunami", category="desastres", importance=5),
    dict(id="crisis_financiera_global_2008", year=2008, lat=40.71, lon=-74.01,
         es="Crisis financiera global de 2008", en="2008 global financial crisis", category="economia", importance=5),
    dict(id="primavera_arabe_2010", year=2010, lat=36.81, lon=10.18,
         es="Primavera Árabe", en="Arab Spring", category="politica", importance=5),
    dict(id="referendum_brexit_2016", year=2016, lat=51.51, lon=-0.13,
         es="Referéndum del Brexit", en="Brexit referendum", category="politica", importance=4),

    # ══ CHINA (no cubierto por temas biograficos) ══════════════════════════
    dict(id="dinastias_shang_zhou_1600", year=-1600, lat=36.10, lon=114.32,
         es="Dinastías Shang y Zhou", en="Shang and Zhou dynasties", category="politica", importance=3),
    dict(id="periodo_reinos_combatientes_475", year=-475, lat=34.34, lon=108.94,
         es="Periodo de los Reinos Combatientes", en="Warring States period", category="batallas", importance=3),
    dict(id="invencion_papel_china_105", year=105, lat=34.62, lon=112.45,
         es="Invención del papel", en="Invention of paper", category="inventos", importance=4),
    dict(id="dinastia_song_960", year=960, lat=34.80, lon=114.35,
         es="Dinastía Song y su revolución económica", en="Song dynasty economic revolution", category="economia", importance=3),
    dict(id="dinastia_yuan_1271", year=1271, lat=39.90, lon=116.40,
         es="Conquista mongola de China (Dinastía Yuan)", en="Mongol conquest of China (Yuan dynasty)", category="politica", importance=3),
    dict(id="dinastia_ming_ciudad_prohibida_1420", year=1420, lat=39.90, lon=116.40,
         es="Dinastía Ming y la Ciudad Prohibida", en="Ming dynasty and the Forbidden City", category="politica", importance=4),
    dict(id="rebelion_taiping_1850", year=1850, lat=32.06, lon=118.80,
         es="Rebelión Taiping", en="Taiping Rebellion", category="batallas", importance=4),
    dict(id="china_omc_2001", year=2001, lat=39.90, lon=116.40,
         es="China se une a la Organización Mundial del Comercio", en="China joins the World Trade Organization", category="economia", importance=3),

    # ══ JAPON / COREA ═══════════════════════════════════════════════════════
    dict(id="periodo_heian_794", year=794, lat=35.01, lon=135.77,
         es="Periodo Heian (Cuento de Genji)", en="Heian period (Tale of Genji)", category="cultura", importance=3),
    dict(id="invasiones_mongolas_japon_1274", year=1274, lat=33.59, lon=130.40,
         es="Invasiones mongolas de Japón", en="Mongol invasions of Japan", category="batallas", importance=3),
    dict(id="colonizacion_japonesa_corea_1910", year=1910, lat=37.57, lon=126.98,
         es="Colonización japonesa de Corea", en="Japanese colonization of Korea", category="politica", importance=4),
    dict(id="division_corea_1945", year=1945, lat=37.57, lon=126.98,
         es="División de Corea", en="Division of Korea", category="politica", importance=4),

    # ══ INDIA ═══════════════════════════════════════════════════════════════
    dict(id="sultanato_delhi_1206", year=1206, lat=28.61, lon=77.21,
         es="Sultanato de Delhi", en="Delhi Sultanate", category="politica", importance=3),
    dict(id="congreso_nacional_indio_1885", year=1885, lat=19.08, lon=72.88,
         es="Fundación del Congreso Nacional Indio", en="Founding of the Indian National Congress", category="politica", importance=3),
    dict(id="asesinato_gandhi_1948", year=1948, lat=28.61, lon=77.21,
         es="Asesinato de Gandhi", en="Assassination of Gandhi", category="politica", importance=4),
    dict(id="liberalizacion_economica_india_1991", year=1991, lat=28.61, lon=77.21,
         es="Liberalización económica de la India", en="Indian economic liberalisation", category="economia", importance=4),

    # ══ MUNDO ISLAMICO ══════════════════════════════════════════════════════
    dict(id="califato_rashidun_632", year=632, lat=24.47, lon=39.61,
         es="Califato Rashidún", en="Rashidun Caliphate", category="politica", importance=4),
    dict(id="califato_fatimi_cairo_969", year=969, lat=30.04, lon=31.24,
         es="Califato Fatimí y fundación de El Cairo", en="Fatimid Caliphate and founding of Cairo", category="politica", importance=3),
    dict(id="fin_califato_otomano_1924", year=1924, lat=41.01, lon=28.98,
         es="Fin del Califato Otomano", en="Abolition of the Ottoman Caliphate", category="politica", importance=4),
    dict(id="fundacion_arabia_saudita_1932", year=1932, lat=24.71, lon=46.68,
         es="Fundación de Arabia Saudita", en="Founding of Saudi Arabia", category="politica", importance=4),

    # ══ AFRICA ══════════════════════════════════════════════════════════════
    dict(id="reino_kush_nubia_1070", year=-1070, lat=18.53, lon=31.82,
         es="Reino de Kush (Nubia)", en="Kingdom of Kush (Nubia)", category="politica", importance=2),
    dict(id="guerras_anglo_boer_1899", year=1899, lat=-25.75, lon=28.19,
         es="Guerras Anglo-Bóer", en="Anglo-Boer Wars", category="batallas", importance=4),
    dict(id="congreso_nacional_africano_1912", year=1912, lat=-29.12, lon=26.21,
         es="Fundación del Congreso Nacional Africano", en="Founding of the African National Congress", category="politica", importance=3),
    dict(id="apartheid_instituido_1948", year=1948, lat=-25.75, lon=28.19,
         es="Instauración del Apartheid", en="Institution of Apartheid", category="politica", importance=5),
    dict(id="guerra_biafra_1967", year=1967, lat=6.44, lon=7.49,
         es="Guerra de Biafra", en="Nigerian Civil War (Biafra)", category="batallas", importance=4),
    dict(id="union_africana_2002", year=2002, lat=9.02, lon=38.75,
         es="Fundación de la Unión Africana", en="Founding of the African Union", category="politica", importance=3),

    # ══ LATINOAMERICA ═══════════════════════════════════════════════════════
    dict(id="civilizacion_maya_250", year=250, lat=17.22, lon=-89.62,
         es="Civilización Maya (periodo clásico)", en="Maya civilization (Classic period)", category="cultura", importance=4),
    dict(id="imperio_inca_machu_picchu_1450", year=1450, lat=-13.16, lon=-72.55,
         es="Imperio Inca y Machu Picchu", en="Inca Empire and Machu Picchu", category="cultura", importance=4),
    dict(id="guerra_mexico_eeuu_1846", year=1846, lat=19.43, lon=-99.13,
         es="Guerra México-Estados Unidos", en="Mexican–American War", category="batallas", importance=4),
    dict(id="guerra_triple_alianza_1864", year=1864, lat=-25.28, lon=-57.63,
         es="Guerra de la Triple Alianza", en="Paraguayan War (War of the Triple Alliance)", category="batallas", importance=3),
    dict(id="independencia_cuba_1902", year=1902, lat=23.13, lon=-82.38,
         es="Independencia de Cuba", en="Cuban independence", category="politica", importance=3),
    dict(id="apertura_canal_panama_1914", year=1914, lat=8.98, lon=-79.52,
         es="Apertura del Canal de Panamá", en="Opening of the Panama Canal", category="inventos", importance=4),
    dict(id="golpe_chile_pinochet_1973", year=1973, lat=-33.45, lon=-70.67,
         es="Golpe de Estado en Chile", en="1973 Chilean coup d'état", category="politica", importance=4),
    dict(id="levantamiento_zapatista_1994", year=1994, lat=16.75, lon=-92.64,
         es="Levantamiento Zapatista", en="Zapatista uprising", category="politica", importance=3),
    dict(id="crisis_deuda_latinoamericana_1982", year=1982, lat=19.43, lon=-99.13,
         es="Crisis de la deuda latinoamericana", en="Latin American debt crisis", category="economia", importance=3),

    # ══ SUDESTE ASIATICO ════════════════════════════════════════════════════
    dict(id="colonizacion_espanola_filipinas_1565", year=1565, lat=10.32, lon=123.89,
         es="Colonización española de Filipinas", en="Spanish colonization of the Philippines", category="politica", importance=3),
    dict(id="indochina_francesa_1887", year=1887, lat=21.03, lon=105.85,
         es="Establecimiento de la Indochina Francesa", en="Establishment of French Indochina", category="politica", importance=3),
    dict(id="revolucion_nacional_indonesia_1945", year=1945, lat=-6.21, lon=106.85,
         es="Revolución Nacional Indonesia", en="Indonesian National Revolution", category="politica", importance=4),
    dict(id="batalla_dien_bien_phu_1954", year=1954, lat=21.39, lon=103.02,
         es="Batalla de Dien Bien Phu", en="Battle of Dien Bien Phu", category="batallas", importance=4),
    dict(id="fundacion_asean_1967", year=1967, lat=13.75, lon=100.50,
         es="Fundación de la ASEAN", en="Founding of ASEAN", category="politica", importance=3),

    # ══ RELIGION ════════════════════════════════════════════════════════════
    dict(id="concilio_vaticano_ii_1962", year=1962, lat=41.90, lon=12.45,
         es="Segundo Concilio Vaticano", en="Second Vatican Council", category="religion", importance=4),

    # ══ CIENCIA / INVENTOS ══════════════════════════════════════════════════
    dict(id="invencion_brujula_1044", year=1044, lat=34.80, lon=114.35,
         es="Invención de la brújula", en="Invention of the compass", category="inventos", importance=3),
    dict(id="invencion_polvora_850", year=850, lat=34.34, lon=108.94,
         es="Invención de la pólvora", en="Invention of gunpowder", category="inventos", importance=4),
    dict(id="maquina_vapor_watt_1769", year=1769, lat=52.48, lon=-1.90,
         es="Máquina de vapor de Watt", en="Watt steam engine", category="inventos", importance=5),
    dict(id="descubrimiento_rayos_x_1895", year=1895, lat=49.79, lon=9.93,
         es="Descubrimiento de los rayos X", en="Discovery of X-rays", category="inventos", importance=4),
    dict(id="proyecto_genoma_humano_2003", year=2003, lat=38.98, lon=-77.10,
         es="Proyecto Genoma Humano", en="Human Genome Project", category="inventos", importance=4),

    # ══ EXPLORACION ═════════════════════════════════════════════════════════
    dict(id="viajes_capitan_cook_1768", year=1768, lat=50.37, lon=-4.14,
         es="Viajes del Capitán Cook", en="Captain Cook's voyages", category="exploracion", importance=4),
    dict(id="expedicion_lewis_clark_1804", year=1804, lat=38.63, lon=-90.20,
         es="Expedición de Lewis y Clark", en="Lewis and Clark Expedition", category="exploracion", importance=3),

    # ══ DESASTRES ═══════════════════════════════════════════════════════════
    dict(id="gran_incendio_londres_1666", year=1666, lat=51.51, lon=-0.09,
         es="Gran Incendio de Londres", en="Great Fire of London", category="desastres", importance=4),
    dict(id="dust_bowl_1930", year=1930, lat=35.47, lon=-101.83,
         es="Dust Bowl", en="Dust Bowl", category="desastres", importance=3),
    dict(id="desastre_bhopal_1984", year=1984, lat=23.26, lon=77.41,
         es="Desastre de Bhopal", en="Bhopal disaster", category="desastres", importance=4),

    # ══ CULTURA ═════════════════════════════════════════════════════════════
    dict(id="renacimiento_italiano_1400", year=1400, lat=43.77, lon=11.26,
         es="Renacimiento italiano", en="Italian Renaissance", category="cultura", importance=5),
    dict(id="renacimiento_harlem_1920", year=1920, lat=40.81, lon=-73.94,
         es="Renacimiento de Harlem", en="Harlem Renaissance", category="cultura", importance=3),
    dict(id="era_jazz_1920", year=1920, lat=29.95, lon=-90.07,
         es="Era del Jazz", en="Jazz Age", category="cultura", importance=3),

    # ══ ECONOMIA ════════════════════════════════════════════════════════════
    dict(id="invencion_moneda_lidia_600", year=-600, lat=38.48, lon=28.04,
         es="Invención de la moneda acuñada (Lidia)", en="Invention of coinage (Lydia)", category="economia", importance=3),
    dict(id="mania_tulipanes_1637", year=1637, lat=52.37, lon=4.90,
         es="Manía de los tulipanes", en="Tulip mania", category="economia", importance=3),
    dict(id="burbuja_mares_sur_1720", year=1720, lat=51.51, lon=-0.13,
         es="Burbuja de los Mares del Sur", en="South Sea Bubble", category="economia", importance=3),
    dict(id="plan_marshall_1948", year=1948, lat=38.90, lon=-77.04,
         es="Plan Marshall", en="Marshall Plan", category="economia", importance=4),
    dict(id="fundacion_opep_1960", year=1960, lat=33.31, lon=44.36,
         es="Fundación de la OPEP", en="Founding of OPEC", category="economia", importance=3),
    dict(id="lunes_negro_1987", year=1987, lat=40.71, lon=-74.01,
         es="Lunes Negro de 1987", en="Black Monday (1987)", category="economia", importance=3),
    dict(id="crisis_financiera_asiatica_1997", year=1997, lat=13.75, lon=100.50,
         es="Crisis financiera asiática de 1997", en="1997 Asian financial crisis", category="economia", importance=4),
    dict(id="burbuja_puntocom_2000", year=2000, lat=37.39, lon=-122.08,
         es="Estallido de la burbuja punto-com", en="Dot-com bubble burst", category="economia", importance=4),

    # ══ DESCOLONIZACION / DERECHOS CIVILES ══════════════════════════════════
    dict(id="independencia_ghana_1957", year=1957, lat=5.60, lon=-0.19,
         es="Independencia de Ghana", en="Ghanaian independence", category="politica", importance=4),
    dict(id="guerra_independencia_argelia_1954", year=1954, lat=36.75, lon=3.06,
         es="Guerra de Independencia de Argelia", en="Algerian War of Independence", category="batallas", importance=4),
    dict(id="mau_mau_kenia_1952", year=1952, lat=-1.29, lon=36.82,
         es="Levantamiento Mau Mau e independencia de Kenia", en="Mau Mau uprising and Kenyan independence", category="batallas", importance=3),
    dict(id="independencia_namibia_1990", year=1990, lat=-22.56, lon=17.08,
         es="Independencia de Namibia", en="Namibian independence", category="politica", importance=3),
    dict(id="brown_vs_board_1954", year=1954, lat=39.05, lon=-95.68,
         es="Brown contra el Consejo de Educación", en="Brown v. Board of Education", category="politica", importance=4),
    dict(id="ley_derecho_voto_eeuu_1965", year=1965, lat=38.90, lon=-77.04,
         es="Ley de Derecho al Voto de 1965 (EE. UU.)", en="Voting Rights Act of 1965", category="politica", importance=4),
    dict(id="disturbios_stonewall_1969", year=1969, lat=40.73, lon=-74.00,
         es="Disturbios de Stonewall", en="Stonewall riots", category="politica", importance=4),

    # ══ TECNOLOGIA / COMPUTACION ════════════════════════════════════════════
    dict(id="eniac_1945", year=1945, lat=39.95, lon=-75.16,
         es="ENIAC (primera computadora electrónica)", en="ENIAC (first electronic computer)", category="inventos", importance=4),
    dict(id="invencion_transistor_1947", year=1947, lat=40.68, lon=-74.40,
         es="Invención del transistor", en="Invention of the transistor", category="inventos", importance=5),
    dict(id="invencion_circuito_integrado_1958", year=1958, lat=32.78, lon=-96.81,
         es="Invención del circuito integrado", en="Invention of the integrated circuit", category="inventos", importance=4),
    dict(id="auge_ia_generativa_chatgpt_2022", year=2022, lat=37.77, lon=-122.42,
         es="Auge de la IA generativa (ChatGPT)", en="Rise of generative AI (ChatGPT)", category="inventos", importance=4),

    # ══ ESPACIO ═════════════════════════════════════════════════════════════
    dict(id="fundacion_nasa_1958", year=1958, lat=38.90, lon=-77.04,
         es="Fundación de la NASA", en="Founding of NASA", category="exploracion", importance=4),
    dict(id="sondas_voyager_1977", year=1977, lat=28.39, lon=-80.61,
         es="Lanzamiento de las sondas Voyager", en="Launch of the Voyager probes", category="exploracion", importance=4),
    dict(id="primer_transbordador_espacial_1981", year=1981, lat=28.39, lon=-80.61,
         es="Primer lanzamiento del Transbordador Espacial", en="First Space Shuttle launch", category="exploracion", importance=3),
    dict(id="telescopio_hubble_1990", year=1990, lat=28.39, lon=-80.61,
         es="Lanzamiento del telescopio espacial Hubble", en="Launch of the Hubble Space Telescope", category="exploracion", importance=3),
    dict(id="estacion_espacial_internacional_1998", year=1998, lat=45.92, lon=63.34,
         es="Fundación de la Estación Espacial Internacional", en="Founding of the International Space Station", category="exploracion", importance=4),
    dict(id="era_spacex_2010", year=2010, lat=28.39, lon=-80.61,
         es="Era de SpaceX y los vuelos espaciales comerciales", en="Era of SpaceX and commercial spaceflight", category="exploracion", importance=3),
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
