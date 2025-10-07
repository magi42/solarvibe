import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const KM_IN_AU = 149_597_870.7;
const DISTANCE_SCALE = 8; // scene units per AU
const SIZE_MULTIPLIER = 2200; // enlarges bodies for visibility
const MIN_BODY_RADIUS = 0.35;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
const TWO_PI = Math.PI * 2;
const MIN_MOON_ORBIT_SCALE = 12;
const MAX_MOON_ORBIT_SCALE = 900;
const MOON_CLEARANCE = 0.12;
const MARS_MOON_SCALE = 0.25;
const JUPITER_MOON_VISUAL_SCALE = 2.0;
const JUPITER_MOON_MIN_RADIUS = 0.32;
const JUPITER_MOON_SURFACE_MULTIPLIERS = {
  io: 1,
  europa: 2,
  ganymede: 3,
  callisto: 5,
};
const OUTER_PLANETS = new Set(['jupiter', 'saturn', 'uranus', 'neptune']);
const OUTER_SURFACE_FACTOR_MIN = 1;
const OUTER_SURFACE_FACTOR_MAX = 5;
const RING_SEGMENTS = 256;

const LANGUAGE_CODES = ['fi', 'en', 'sv', 'de', 'el'];

const LOCALES = {
  fi: {
    nativeName: 'Suomi',
    flag: '🇫🇮',
    numberFormat: 'fi-FI',
    title: 'Aurinkokuntasimulaatio',
    hints: {
      controls: 'Marko Grönroos, 2025',
      time: '',
    },
    stats: {
      time: 'Simulaation aika (UTC)',
      speed: 'Nopeuskerroin',
      realTime: '1x (reaaliaika)',
    },
    instructionsTitle: 'Ohje',
    instructions: [
      'Napsauta kohdetta valitaksesi; tuplaklikkaa lukitaksesi kameran.',
      'Pyöritä näkymää hiiren painikkeella, zoomaa rullalla ja siirrä näkymää vetämällä oikealla painikkeella, kun seuranta on pois päältä.',
      'Planeettojen koot on korostettu näkyvyyden parantamiseksi.',
    ],
    buttons: {
      lock: 'Lukitse seuranta',
      following: 'Seuranta päällä',
      unlock: 'Vapauta',
      now: 'NYT',
      play: 'Käynnistä simulointi',
      pause: 'Pysäytä simulointi',
    },
    selection: {
      title: 'Valittu kohde',
      none: 'Ei valittua kohdetta.',
      meanDistance: 'Keski-etäisyys',
      diameter: 'Halkaisija',
      rotation: 'Pyörähdysaika',
      cameraLocked: 'Kamera lukittu tähän kohteeseen.',
    },
    typeNames: {
      star: 'tähti',
      planet: 'planeetta',
      moon: 'kuu',
      'dwarf-planet': 'kääpiöplaneetta',
    },
    units: {
      hour: 'h',
      day: 'vrk',
    },
    ariaLanguageButton: 'Valitse kieli',
  },
  en: {
    nativeName: 'English',
    flag: '🇬🇧',
    numberFormat: 'en-US',
    title: 'Solar System Simulation',
    hints: {
      controls: 'Marko Grönroos, 2025',
      time: '',
    },
    stats: {
      time: 'Simulation time (UTC)',
      speed: 'Speed factor',
      realTime: '1x (real time)',
    },
    instructionsTitle: 'Guide',
    instructions: [
      'Click an object to select it; double-click to lock the camera.',
      'Drag to rotate, zoom with the scroll wheel, and pan by dragging with the right mouse button when tracking is off.',
      'Planet sizes are exaggerated for clarity.',
    ],
    buttons: {
      lock: 'Lock tracking',
      following: 'Tracking active',
      unlock: 'Release',
      now: 'NOW',
      play: 'Start simulation',
      pause: 'Pause simulation',
    },
    selection: {
      title: 'Selected object',
      none: 'No object selected.',
      meanDistance: 'Mean distance',
      diameter: 'Diameter',
      rotation: 'Rotation period',
      cameraLocked: 'Camera locked to this object.',
    },
    typeNames: {
      star: 'star',
      planet: 'planet',
      moon: 'moon',
      'dwarf-planet': 'dwarf planet',
    },
    units: {
      hour: 'h',
      day: 'd',
    },
    ariaLanguageButton: 'Select language',
  },
  sv: {
    nativeName: 'Svenska',
    flag: '🇸🇪',
    numberFormat: 'sv-SE',
    title: 'Solsystemets simulering',
    hints: {
      controls: 'Marko Grönroos, 2025',
      time: '',
    },
    stats: {
      time: 'Simulerad tid (UTC)',
      speed: 'Hastighetsfaktor',
      realTime: '1x (realtid)',
    },
    instructionsTitle: 'Guide',
    instructions: [
      'Klicka på ett objekt för att välja det; dubbelklick låser kameran.',
      'Dra för att rotera, zooma med rullhjulet och panorera genom att dra med höger musknapp när följningen är av.',
      'Planeternas storlek är överdriven för tydlighet.',
    ],
    buttons: {
      lock: 'Lås följning',
      following: 'Följning på',
      unlock: 'Frigör',
      now: 'NU',
      play: 'Starta simulering',
      pause: 'Pausa simulering',
    },
    selection: {
      title: 'Valt objekt',
      none: 'Inget objekt valt.',
      meanDistance: 'Medelavstånd',
      diameter: 'Diameter',
      rotation: 'Rotationstid',
      cameraLocked: 'Kameran är låst till objektet.',
    },
    typeNames: {
      star: 'stjärna',
      planet: 'planet',
      moon: 'måne',
      'dwarf-planet': 'dvärgplanet',
    },
    units: {
      hour: 'h',
      day: 'dygn',
    },
    ariaLanguageButton: 'Välj språk',
  },
  de: {
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    numberFormat: 'de-DE',
    title: 'Simulation des Sonnensystems',
    hints: {
      controls: 'Marko Grönroos, 2025',
      time: '',
    },
    stats: {
      time: 'Simulationszeit (UTC)',
      speed: 'Geschwindigkeitsfaktor',
      realTime: '1x (Echtzeit)',
    },
    instructionsTitle: 'Anleitung',
    instructions: [
      'Klicken Sie ein Objekt an, um es zu wählen; Doppelklick fixiert die Kamera.',
      'Ziehen Sie zum Drehen, zoomen Sie mit dem Scrollrad und verschieben Sie durch Ziehen mit der rechten Maustaste, wenn keine Verfolgung aktiv ist.',
      'Planeten sind zur besseren Lesbarkeit vergrößert dargestellt.',
    ],
    buttons: {
      lock: 'Verfolgung sperren',
      following: 'Verfolgung aktiv',
      unlock: 'Freigeben',
      now: 'JETZT',
      play: 'Simulation starten',
      pause: 'Simulation pausieren',
    },
    selection: {
      title: 'Ausgewähltes Objekt',
      none: 'Kein Objekt ausgewählt.',
      meanDistance: 'Mittlere Entfernung',
      diameter: 'Durchmesser',
      rotation: 'Rotationsperiode',
      cameraLocked: 'Kamera auf dieses Objekt fixiert.',
    },
    typeNames: {
      star: 'Stern',
      planet: 'Planet',
      moon: 'Mond',
      'dwarf-planet': 'Zwergplanet',
    },
    units: {
      hour: 'h',
      day: 'Tage',
    },
    ariaLanguageButton: 'Sprache wählen',
  },
  el: {
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    numberFormat: 'el-GR',
    title: 'Προσομοίωση Ηλιακού Συστήματος',
    hints: {
      controls: 'Marko Grönroos, 2025',
      time: '',
    },
    stats: {
      time: 'Χρόνος προσομοίωσης (UTC)',
      speed: 'Συντελεστής ταχύτητας',
      realTime: '1x (πραγματικός χρόνος)',
    },
    instructionsTitle: 'Οδηγίες',
    instructions: [
      'Επιλέξτε σώμα με κλικ· διπλό κλικ κλειδώνει την κάμερα.',
      'Σύρετε για περιστροφή, ζουμάρετε με τη ροδέλα και μετατοπίστε σύροντας με το δεξί κουμπί του ποντικιού όταν η παρακολούθηση είναι ανενεργή.',
      'Τα μεγέθη των πλανητών είναι υπερμεγεθυσμένα για ευκρίνεια.',
    ],
    buttons: {
      lock: 'Κλείδωμα παρακολούθησης',
      following: 'Η παρακολούθηση ενεργή',
      unlock: 'Απελευθέρωση',
      now: 'ΤΩΡΑ',
      play: 'Έναρξη προσομοίωσης',
      pause: 'Παύση προσομοίωσης',
    },
    selection: {
      title: 'Επιλεγμένο σώμα',
      none: 'Δεν έχει επιλεγεί σώμα.',
      meanDistance: 'Μέση απόσταση',
      diameter: 'Διάμετρος',
      rotation: 'Περίοδος περιστροφής',
      cameraLocked: 'Η κάμερα είναι κλειδωμένη σε αυτό το σώμα.',
    },
    typeNames: {
      star: 'άστρο',
      planet: 'πλανήτης',
      moon: 'δορυφόρος',
      'dwarf-planet': 'νάνος πλανήτης',
    },
    units: {
      hour: 'ώ',
      day: 'ημ.',
    },
    ariaLanguageButton: 'Επιλογή γλώσσας',
  },
};

const DESCRIPTIONS = {
  sun: {
    fi: 'Järjestelmän keskuskappale, joka valaisee ja vetää puoleensa kaikki muut kohteet.',
    en: 'Central star providing light and gravity for the system.',
    sv: 'Den centrala stjärnan som ger systemet ljus och gravitation.',
    de: 'Der zentrale Stern, der dem System Licht und Schwerkraft liefert.',
    el: 'Το κεντρικό άστρο που παρέχει φως και βαρύτητα στο σύστημα.',
  },
  mercury: {
    fi: 'Sisimmäinen planeetta, jonka hitaasti pyörivä pinta paahtuu Auringon lähellä.',
    en: 'Innermost planet whose slowly rotating surface bakes close to the Sun.',
    sv: 'Den innersta planeten vars långsamt roterande yta hettas upp nära solen.',
    de: 'Der innerste Planet, dessen langsam rotierende Oberfläche in Sonnennähe erhitzt wird.',
    el: 'Ο πιο εσωτερικός πλανήτης με αργά περιστρεφόμενη επιφάνεια που καίγεται κοντά στον Ήλιο.',
  },
  venus: {
    fi: 'Paksuun pilvikerrokseen kääritty planeetta, joka pyörii taaksepäin.',
    en: 'Cloud-wrapped planet that rotates backwards.',
    sv: 'En molntäckt planet som roterar baklänges.',
    de: 'Ein von Wolken verhüllter Planet, der rückwärts rotiert.',
    el: 'Ένας πλανήτης σκεπασμένος από σύννεφα που περιστρέφεται ανάποδα.',
  },
  earth: {
    fi: 'Kotiplaneetta, jonka meri ja maanosat näkyvät tekstuurissa.',
    en: 'Our home planet with oceans and continents visible on the map.',
    sv: 'Vår hemplanet där hav och kontinenter syns på kartan.',
    de: 'Unser Heimatplanet, dessen Ozeane und Kontinente auf der Karte sichtbar sind.',
    el: 'Ο πλανήτης μας, με ωκεανούς και ηπείρους ορατούς στον χάρτη.',
  },
  moon: {
    fi: 'Maan kuu, joka hallitsee vuorovesiä ja pyörähtää kerran kiertonsa aikana.',
    en: 'Earth’s moon, driving the tides and rotating once per orbit.',
    sv: 'Jordens måne som styr tidvattnet och roterar ett varv per omlopp.',
    de: 'Der Mond der Erde, der die Gezeiten lenkt und sich einmal pro Umlauf dreht.',
    el: 'Η Σελήνη της Γης, που ρυθμίζει τις παλίρροιες και περιστρέφεται μία φορά ανά τροχιά.',
  },
  mars: {
    fi: 'Punainen planeetta, jossa on jäiset navat ja pölymyrskyjä.',
    en: 'The red planet with icy poles and frequent dust storms.',
    sv: 'Den röda planeten med isiga poler och återkommande dammstormar.',
    de: 'Der rote Planet mit eisigen Polkappen und häufigen Staubstürmen.',
    el: 'Ο κόκκινος πλανήτης με παγωμένους πόλους και συχνές καταιγίδες σκόνης.',
  },
  phobos: {
    fi: 'Marsin sisempi, epäsäännöllinen kuu; kiertoaika alle kahdeksan tuntia.',
    en: 'Innermost Martian moon, irregular and racing around in under eight hours.',
    sv: 'Mars innersta måne, oregelbunden och med en omloppstid under åtta timmar.',
    de: 'Innerster Marsmond, unregelmäßig geformt und in weniger als acht Stunden um den Planeten.',
    el: 'Ο εσωτερικότερος δορυφόρος του Άρη, ακανόνιστος και με περίοδο κάτω από οκτώ ώρες.',
  },
  deimos: {
    fi: 'Marsin ulompi kuu, pienikokoinen ja hitaammin kiertävä kuin Phobos.',
    en: 'Outer Martian moon, small and orbiting more slowly than Phobos.',
    sv: 'Mars yttre måne, liten och långsammare än Phobos.',
    de: 'Äußerer Marsmond, klein und langsamer unterwegs als Phobos.',
    el: 'Ο εξωτερικός δορυφόρος του Άρη, μικρός και πιο αργός από τον Φόβο.',
  },
  jupiter: {
    fi: 'Aurinkokunnan massiivisin planeetta, jonka pilvivöissä näkyy suuri punainen pilkku.',
    en: 'Most massive planet of the system, its cloud bands host the Great Red Spot.',
    sv: 'Systemets mest massiva planet med molnband som hyser den Stora röda fläcken.',
    de: 'Der massereichste Planet des Systems; seine Wolkenbänder tragen den Großen Roten Fleck.',
    el: 'Ο πιο ογκώδης πλανήτης του συστήματος, με ζώνες νεφών και τη Μεγάλη Ερυθρά Κηλίδα.',
  },
  io: {
    fi: 'Tuliperäinen kuu, jonka pinnalla purkautuu lukuisia laavoja.',
    en: 'Volcanic moon covered in active lava eruptions.',
    sv: 'En vulkanisk måne täckt av aktiva lavautbrott.',
    de: 'Ein vulkanischer Mond, bedeckt von aktiven Lavaaustritten.',
    el: 'Δορυφόρος με έντονη ηφαιστειακή δραστηριότητα και συνεχή εκρήξεις λάβας.',
  },
  europa: {
    fi: 'Jääkuoren alla saattaa olla suolainen valtameri.',
    en: 'May hide a salty ocean beneath its ice shell.',
    sv: 'Kan dölja ett salt hav under sitt istäcke.',
    de: 'Könnte unter seiner Eisdecke einen salzigen Ozean verbergen.',
    el: 'Ίσως κρύβει έναν αλμυρό ωκεανό κάτω από το κέλυφος πάγου.',
  },
  ganymede: {
    fi: 'Aurinkokunnan suurin kuu, suurempi kuin Merkurius.',
    en: 'Largest moon in the solar system, bigger than Mercury.',
    sv: 'Det största månen i solsystemet, större än Merkurius.',
    de: 'Der größte Mond des Sonnensystems, größer als Merkur.',
    el: 'Ο μεγαλύτερος δορυφόρος του ηλιακού συστήματος, μεγαλύτερος από τον Ερμή.',
  },
  callisto: {
    fi: 'Vanha ja kraatteroitunut kuu Jupiterin ulkokehällä.',
    en: 'Old, heavily cratered moon on Jupiter’s outer track.',
    sv: 'En gammal, kraftigt kraterfylld måne i Jupiters yttre bana.',
    de: 'Ein alter, stark verkraterter Mond auf Jupiters äußerer Bahn.',
    el: 'Παλιός δορυφόρος με πολλούς κρατήρες στη εξωτερική τροχιά του Δία.',
  },
  saturn: {
    fi: 'Kaasujätti, jonka ikoniset renkaat hallitsevat näkymää.',
    en: 'Gas giant whose iconic rings dominate the view.',
    sv: 'Gasutjätte vars ikoniska ringar dominerar vyn.',
    de: 'Gasriese, dessen ikonische Ringe das Erscheinungsbild bestimmen.',
    el: 'Γίγαντας αερίων με εμβληματικούς δακτυλίους που κυριαρχούν στην εικόνα.',
  },
  mimas: {
    fi: 'Pieni ja voimakkaasti kraatteroitu Saturnuksen kuu.',
    en: 'Small, heavily cratered moon of Saturn.',
    sv: 'En liten, hårt kratermärkt Saturnusmåne.',
    de: 'Kleiner, stark verkraterter Saturnmond.',
    el: 'Μικρός δορυφόρος του Κρόνου γεμάτος κρατήρες.',
  },
  enceladus: {
    fi: 'Jääinen kuu, jonka etelänavasta purkautuu vesihöyryä.',
    en: 'Icy moon venting water vapour from its south pole.',
    sv: 'Isig måne som sprutar ut vattenånga från sydpolen.',
    de: 'Eisiger Mond, der Wasserdampf aus seiner Südpolregion ausstößt.',
    el: 'Παγωμένος δορυφόρος που εκτινάσσει υδρατμούς από τον νότιο πόλο.',
  },
  tethys: {
    fi: 'Saturnuksen kuu, jonka rata on lähes täydellisen ympyrä.',
    en: 'Saturnian moon moving on an almost circular orbit.',
    sv: 'Saturnusmåne med nästan perfekt cirkulär bana.',
    de: 'Saturnmond mit nahezu kreisförmiger Umlaufbahn.',
    el: 'Δορυφόρος του Κρόνου με σχεδόν κυκλική τροχιά.',
  },
  dione: {
    fi: 'Kuu, jonka jäinen pinta on halki rotkoista.',
    en: 'Moon with an icy surface scarred by chasms.',
    sv: 'Måne med isig yta fylld av klyftor.',
    de: 'Mond mit vereister Oberfläche, durchzogen von Schluchten.',
    el: 'Δορυφόρος με παγωμένη επιφάνεια γεμάτη χαράδρες.',
  },
  rhea: {
    fi: 'Saturnuksen toiseksi suurin kuu, hiljaisen kraatterinen.',
    en: 'Saturn’s second-largest moon, quietly cratered.',
    sv: 'Saturnus näst största måne, stilla och kraterfylld.',
    de: 'Zweitgrößter Saturnmond mit zahlreichen, ruhigen Kratern.',
    el: 'Ο δεύτερος μεγαλύτερος δορυφόρος του Κρόνου με ήρεμες περιοχές κρατήρων.',
  },
  titan: {
    fi: 'Paksuun typpiatmosfääriin verhoutunut jättikuu.',
    en: 'Giant moon cloaked in a dense nitrogen atmosphere.',
    sv: 'En jättemåne täckt av en tät kväveatmosfär.',
    de: 'Gigantischer Mond in eine dichte Stickstoffatmosphäre gehüllt.',
    el: 'Γιγάντιος δορυφόρος σκεπασμένος από πυκνή ατμόσφαιρα αζώτου.',
  },
  iapetus: {
    fi: 'Kauempana kiertävä kuu, jonka etu- ja takapuoli poikkeavat voimakkaasti.',
    en: 'Distant moon with strikingly different leading and trailing hemispheres.',
    sv: 'En avlägsen måne med tydligt olika fram- och baksida.',
    de: 'Entfernter Mond mit stark unterschiedlichen Vorder- und Rückseiten.',
    el: 'Απομακρυσμένος δορυφόρος με εντυπωσιακά διαφορετικά ημισφαίρια.',
  },
  uranus: {
    fi: 'Jättiläinen, joka pyörii lähes kyljellään ja omistaa himmeät renkaat.',
    en: 'Giant planet rotating almost on its side with faint rings.',
    sv: 'Gasutjätte som roterar nästan på sidan och har svaga ringar.',
    de: 'Gasriese, der fast auf der Seite rotiert und schwache Ringe besitzt.',
    el: 'Γίγαντας που περιστρέφεται σχεδόν πλαγιασμένος και έχει αμυδρούς δακτυλίους.',
  },
  miranda: {
    fi: 'Pieni kuu täynnä jyrkkiä rotkoja ja mosaiikkisia tasankoja.',
    en: 'Small moon criss-crossed by cliffs and patchwork plains.',
    sv: 'Liten måne fylld av branta klippor och mosaikartade slätter.',
    de: 'Kleiner Mond mit steilen Klippen und flickenartigen Ebenen.',
    el: 'Μικρός δορυφόρος γεμάτος από απότομα φαράγγια και μωσαϊκά πεδία.',
  },
  ariel: {
    fi: 'Kirkas kuu, jonka jääpinnalla näkyy kaivautuneita kanjoneita.',
    en: 'Bright moon whose icy surface is carved by canyons.',
    sv: 'Ljusstark måne vars isiga yta är uppsprucken av kanjoner.',
    de: 'Heller Mond mit eisiger Oberfläche, durchzogen von Canyons.',
    el: 'Φωτεινός δορυφόρος με παγωμένη επιφάνεια γεμάτη φαράγγια.',
  },
  umbriel: {
    fi: 'Tumma kuu, joka kiertää Uranuksen ekvaattoritasossa.',
    en: 'Dark moon orbiting in Uranus’s equatorial plane.',
    sv: 'Mörk måne som går i Uranus ekvatorialplan.',
    de: 'Dunkler Mond in der Äquatorebene des Uranus.',
    el: 'Σκοτεινός δορυφόρος που κινείται στο ισημερινό επίπεδο του Ουρανού.',
  },
  titania: {
    fi: 'Uranuksen suurin kuu, jonka pinnalla näkyy laajoja jäänlaaksoja.',
    en: 'Largest moon of Uranus, showing broad icy valleys.',
    sv: 'Uranus största måne med vidsträckta isdalar.',
    de: 'Größter Mond des Uranus mit ausgedehnten Eis-Tälern.',
    el: 'Ο μεγαλύτερος δορυφόρος του Ουρανού με εκτεταμένες παγωμένες κοιλάδες.',
  },
  oberon: {
    fi: 'Uloin suuri Uranuksen kuu, tumma ja kraatteroitu.',
    en: 'Outermost large Uranian moon, dark and cratered.',
    sv: 'Den yttersta av Uranus stora månar, mörk och kraterfylld.',
    de: 'Äußerster großer Uranusmond, dunkel und verkratert.',
    el: 'Ο πιο εξωτερικός μεγάλος δορυφόρος του Ουρανού, σκοτεινός και γεμάτος κρατήρες.',
  },
  neptune: {
    fi: 'Kaukaisin jättiläinen, jonka myrskyiset ilmavirtaukset ovat äärimmäisiä.',
    en: 'Outermost giant whose storms drive extreme winds.',
    sv: 'Den yttersta jätten vars stormar driver extrema vindar.',
    de: 'Äußerster Riese, dessen Stürme extrem starke Winde erzeugen.',
    el: 'Ο πιο απομακρυσμένος γίγαντας με καταιγίδες που δημιουργούν ακραίους ανέμους.',
  },
  triton: {
    fi: 'Suuri kuu, joka kiertää Neptunusta vastakkaiseen suuntaan ja suihkuttaa typpeä.',
    en: 'Large moon orbiting Neptune backwards and venting nitrogen geysers.',
    sv: 'Stor måne som går runt Neptunus baklänges och sprutar kvävegejsrar.',
    de: 'Großer Mond, der Neptun retrograd umkreist und Stickstoff-Geysire ausstößt.',
    el: 'Μεγάλος δορυφόρος που περιφέρεται αντίθετα από την κίνηση του Ποσειδώνα και εκτοξεύει πίδακες αζώτου.',
  },
  proteus: {
    fi: 'Epäsäännöllinen ja tumma Neptunuksen sisäkuu.',
    en: 'Irregular, dark inner moon of Neptune.',
    sv: 'Oregelbunden och mörk innermåne till Neptunus.',
    de: 'Unregelmäßiger, dunkler innerer Mond des Neptun.',
    el: 'Ακανόνιστος, σκοτεινός εσωτερικός δορυφόρος του Ποσειδώνα.',
  },
  ceres: {
    fi: 'Asteroidivyöhykkeen kääpiöplaneetta, jonka pinta on harmaan ja jäisen kirjava.',
    en: 'Dwarf planet in the asteroid belt with a mottled, icy surface.',
    sv: 'Dvärgplanet i asteroidbältet med flammig, isig yta.',
    de: 'Zwergplanet im Asteroidengürtel mit gefleckter, vereister Oberfläche.',
    el: 'Νάνος πλανήτης στη ζώνη των αστεροειδών με κηλιδωμένη, παγωμένη επιφάνεια.',
  },
};

let currentLanguage = 'fi';
try {
  const stored = window.localStorage.getItem('language');
  if (stored && LOCALES[stored]) {
    currentLanguage = stored;
  }
} catch (error) {
  currentLanguage = 'fi';
}

const TEXTURE_MAP = {
  sun: 'data/textures/sun.jpg',
  mercury: 'data/textures/mercury.jpg',
  venus: 'data/textures/venus.jpg',
  earth: 'data/textures/earth.jpg',
  moon: 'data/textures/moon.jpg',
  mars: 'data/textures/mars.jpg',
  jupiter: 'data/textures/jupiter.jpg',
  saturn: 'data/textures/saturn.jpg',
  uranus: 'data/textures/uranus.jpg',
  neptune: 'data/textures/neptune.jpg',
  ceres: 'data/textures/ceres.jpg',
  io: 'data/textures/io.jpg',
  europa: 'data/textures/europa.jpg',
  ganymede: 'data/textures/ganymede.jpg',
  callisto: 'data/textures/callisto.jpg',
};

function getLocale() {
  return LOCALES[currentLanguage] ?? LOCALES.fi;
}

function getDescriptionText(key) {
  if (!key) return '';
  const entry = DESCRIPTIONS[key];
  if (!entry) return '';
  return entry[currentLanguage] ?? entry.fi ?? entry.en ?? '';
}

let languageMenuOpen = false;

function initializeLanguageMenu() {
  if (!languageButton || !languageMenu || !languageSwitch) return;
  languageButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleLanguageMenu();
  });
  languageMenu.addEventListener('click', (event) => {
    event.stopPropagation();
    const option = event.target.closest('.language-option');
    if (!option) return;
    const lang = option.dataset.lang;
    if (lang) {
      setLanguage(lang);
      closeLanguageMenu();
    }
  });
  document.addEventListener('click', (event) => {
    if (!languageSwitch.contains(event.target)) {
      closeLanguageMenu();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLanguageMenu();
    }
  });
}

function toggleLanguageMenu() {
  if (!languageMenu || !languageButton) return;
  if (!languageMenuOpen) {
    renderLanguageMenu();
  }
  languageMenuOpen = !languageMenuOpen;
  languageMenu.classList.toggle('open', languageMenuOpen);
  languageButton.setAttribute('aria-expanded', languageMenuOpen ? 'true' : 'false');
}

function closeLanguageMenu() {
  if (!languageMenuOpen) {
    if (languageButton) {
      languageButton.setAttribute('aria-expanded', 'false');
    }
    return;
  }
  languageMenuOpen = false;
  if (languageMenu) {
    languageMenu.classList.remove('open');
  }
  if (languageButton) {
    languageButton.setAttribute('aria-expanded', 'false');
  }
}

function renderLanguageMenu() {
  if (!languageMenu) return;
  languageMenu.innerHTML = LANGUAGE_CODES.map((code) => {
    const locale = LOCALES[code];
    if (!locale) return '';
    const activeClass = code === currentLanguage ? 'language-option active' : 'language-option';
    const pressedAttr = code === currentLanguage ? 'true' : 'false';
    return `<button type="button" class="${activeClass}" data-lang="${code}" aria-pressed="${pressedAttr}"><span class="language-flag">${locale.flag}</span><span class="language-name">${locale.nativeName}</span></button>`;
  }).join('');
}

function setLanguage(lang) {
  if (!LOCALES[lang]) return;
  if (lang === currentLanguage) {
    applyLocale();
    refreshSpeedLabel();
    updateSelectionPanel();
    updateFollowState();
    updateHud(new Date(simTimeMs));
    closeLanguageMenu();
    return;
  }
  currentLanguage = lang;
  try {
    window.localStorage.setItem('language', lang);
  } catch (error) {
    // ignore
  }
  applyLocale();
  refreshSpeedLabel();
  updateSelectionPanel();
  updateFollowState();
  updateHud(new Date(simTimeMs));
  closeLanguageMenu();
}

function applyLocale() {
  const locale = getLocale();
  document.documentElement.lang = currentLanguage;
  document.title = locale.title;

  if (titleElement) titleElement.textContent = locale.title;
  if (hintControlsElement) {
    hintControlsElement.textContent = locale.hints.controls;
    hintControlsElement.style.display = locale.hints.controls ? '' : 'none';
  }
  if (hintTimeElement) {
    hintTimeElement.textContent = locale.hints.time;
    hintTimeElement.style.display = locale.hints.time ? '' : 'none';
  }
  if (simTimeLabelElement) simTimeLabelElement.textContent = locale.stats.time;
  if (speedLabelTextElement) speedLabelTextElement.textContent = locale.stats.speed;
  if (selectionTitleElement) selectionTitleElement.textContent = locale.selection.title;
  if (instructionsTitleElement) instructionsTitleElement.textContent = locale.instructionsTitle;
  if (instructionsListElement) {
    instructionsListElement.innerHTML = locale.instructions.map((line) => `<li>${line}</li>`).join('');
  }
  if (nowButton) nowButton.textContent = locale.buttons.now;
  if (nowButton) nowButton.setAttribute('aria-label', locale.buttons.now);

  if (lockButton && !selectedBody) {
    lockButton.textContent = locale.buttons.lock;
  }
  if (unlockButton) {
    unlockButton.textContent = locale.buttons.unlock;
  }
  if (playButton) {
    playButton.setAttribute('aria-label', locale.buttons.play);
    playButton.title = locale.buttons.play;
  }
  if (pauseButton) {
    pauseButton.setAttribute('aria-label', locale.buttons.pause);
    pauseButton.title = locale.buttons.pause;
  }
  if (languageButton) {
    languageButton.innerHTML = `<span class="language-flag">${locale.flag}</span><span class="language-name">${locale.nativeName}</span><span class="language-caret">▾</span>`;
    languageButton.setAttribute('aria-label', locale.ariaLanguageButton);
    languageButton.setAttribute('aria-expanded', 'false');
  }

  renderLanguageMenu();
  closeLanguageMenu();
}

const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050611);

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
const textureCache = new Map();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000);
camera.position.set(30, 20, 30);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 800;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x566b9a, 0.9);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfff1b0, 6_000);
sunLight.decay = 2;
sunLight.distance = 0;
sunLight.castShadow = false;
scene.add(sunLight);

addStarfield();

const clock = new THREE.Clock();
let simTimeMs = Date.now();
const SPEED_STEPS = [
  1,
  3,
  10,
  30,
  100,
  300,
  1_000,
  3_000,
  10_000,
  30_000,
  100_000,
  300_000,
  1_000_000,
  3_000_000,
  10_000_000,
  30_000_000,
  100_000_000,
  300_000_000,
  1_000_000_000,
  3_000_000_000,
  10_000_000_000,
  30_000_000_000,
  100_000_000_000,
];
let speedStep = 0;
let simSpeed = speedFromStep(speedStep);
let isPaused = false;

const simTimeValueElement = document.getElementById('sim-time');
const speedSlider = document.getElementById('speed-slider');
const speedValueElement = document.getElementById('speed-label');
const selectionTitleElement = document.getElementById('selection-title');
const selectionPanel = document.getElementById('selection');
const lockButton = document.getElementById('lock-button');
const unlockButton = document.getElementById('unlock-button');
const timeButtons = document.getElementById('time-buttons');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const nowButton = document.getElementById('now-button');

const titleElement = document.getElementById('title');
const hintControlsElement = document.getElementById('hint-controls');
const hintTimeElement = document.getElementById('hint-time');
const simTimeLabelElement = document.getElementById('label-sim-time');
const speedLabelTextElement = document.getElementById('label-speed');
const instructionsTitleElement = document.getElementById('instructions-title');
const instructionsListElement = document.getElementById('instructions-list');
const languageSwitch = document.getElementById('language-switch');
const languageButton = document.getElementById('language-button');
const languageMenu = document.getElementById('language-menu');

const pointer = new THREE.Vector2();

const highlightGeometry = new THREE.SphereGeometry(1, 16, 12);
const highlightMaterial = new THREE.MeshBasicMaterial({
  color: 0x2e96ff,
  wireframe: true,
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
});
const selectionHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
selectionHighlight.visible = false;
selectionHighlight.renderOrder = 5;
scene.add(selectionHighlight);

let selectedBody = null;
let followBody = null;
initializeLanguageMenu();
applyLocale();
updateSelectionPanel();

speedSlider.addEventListener('input', (event) => {
  speedStep = clampSpeedIndex(Number(event.target.value));
  simSpeed = speedFromStep(speedStep);
  refreshSpeedLabel();
});

lockButton.addEventListener('click', () => {
  if (selectedBody) {
    followBody = selectedBody;
    updateFollowState();
    controls.target.copy(selectedBody.group.position);
    controls.update();
    updateSelectionPanel();
  }
});

unlockButton.addEventListener('click', () => {
  followBody = null;
  updateFollowState();
  updateSelectionPanel();
});

window.addEventListener('resize', onWindowResize);
const raycaster = new THREE.Raycaster();

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('dblclick', onDoubleClick);
window.addEventListener('keydown', onKeyDown);
if (timeButtons) {
  timeButtons.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.action === 'now') {
      snapToNow();
      return;
    }
    const adjust = Number(button.dataset.adjust);
    if (Number.isFinite(adjust) && adjust !== 0) {
      adjustSimTime(adjust);
    }
  });
}
if (playButton) {
  playButton.addEventListener('click', () => {
    isPaused = false;
    updateTransportState();
  });
}
if (pauseButton) {
  pauseButton.addEventListener('click', () => {
    isPaused = true;
    updateTransportState();
  });
}

const bodies = buildBodies();
const selectableMeshes = bodies.map((body) => body.mesh);
configureSpeedSlider();
refreshSpeedLabel();
updateFollowState();
updateSelectionPanel();
updateTransportState();

animate();

function resolveTexture(def) {
  const direct = TEXTURE_MAP[def.id];
  if (direct) {
    return direct;
  }

  if (def.type === 'moon') {
    return TEXTURE_MAP[def.id] ?? TEXTURE_MAP.moon;
  }

  if (def.type === 'dwarf-planet') {
    return TEXTURE_MAP[def.id] ?? TEXTURE_MAP.ceres;
  }

  return null;
}

function computeRotationSpeed(hours) {
  if (!hours) return 0;
  return (TWO_PI / (hours * 3600));
}

function computeVisualRadii(definitions) {
  const radii = new Map();
  for (const def of definitions) {
    let radius;
    if (def.renderRadius != null) {
      radius = def.renderRadius;
    } else {
      radius = (def.radiusKm / KM_IN_AU) * DISTANCE_SCALE * SIZE_MULTIPLIER;
    }

    if (def.type === 'moon') {
      if (def.parentId === 'mars') {
        radius *= MARS_MOON_SCALE;
      }
      if (def.parentId === 'jupiter') {
        radius *= JUPITER_MOON_VISUAL_SCALE;
        radius = Math.max(radius, JUPITER_MOON_MIN_RADIUS);
      }
    }

    if (def.renderRadius == null && !(def.type === 'moon' && def.parentId === 'jupiter')) {
      radius = Math.max(radius, MIN_BODY_RADIUS);
    }

    radii.set(def.id, radius);
  }
  return radii;
}

function computeOuterMoonScaling(definitions, visualRadiusMap) {
  const stats = new Map();

  for (const def of definitions) {
    if (def.type !== 'moon' || !def.orbit || !def.parentId) continue;
    if (!OUTER_PLANETS.has(def.parentId)) continue;
    const baseDistance = def.orbit.semiMajorAxisAu * DISTANCE_SCALE;
    if (baseDistance <= 0) continue;

    const entry = stats.get(def.parentId) ?? { min: baseDistance, max: baseDistance };
    entry.min = Math.min(entry.min, baseDistance);
    entry.max = Math.max(entry.max, baseDistance);
    stats.set(def.parentId, entry);
  }

  const mapping = new Map();
  for (const [parentId, { min, max }] of stats) {
    const parentRadius = visualRadiusMap.get(parentId) ?? 1;
    mapping.set(parentId, { min, max, parentRadius });
  }

  return mapping;
}

function buildBodies() {
  const definitions = getBodyDefinitions();
  const visualRadiusMap = computeVisualRadii(definitions);
  const outerMoonScaling = computeOuterMoonScaling(definitions, visualRadiusMap);
  const map = new Map();
  const created = [];

  for (const def of definitions) {
    const parent = def.parentId ? map.get(def.parentId) : null;
    if (def.id === 'earth') {
      def.initialRotationDeg = computeEarthInitialRotation();
    }
    const body = createBody(def, parent, visualRadiusMap, outerMoonScaling);
    map.set(def.id, body);
    created.push(body);
  }

  return created;
}

function computeOrbitPlaneNormal(orbit) {
  if (!orbit) return new THREE.Vector3(0, 1, 0);

  const eccentricity = orbit.eccentricity ?? 0;
  const semiMajorAxis = orbit.semiMajorAxisAu ?? 0;
  if (semiMajorAxis === 0) return new THREE.Vector3(0, 1, 0);

  const sampleAngles = [0, Math.PI / 2];
  const positions = sampleAngles.map((f) => {
    const radiusAu = (semiMajorAxis * (1 - eccentricity ** 2)) / (1 + eccentricity * Math.cos(f));
    return orbitalToCartesian(radiusAu, f, orbit);
  });

  const normal = new THREE.Vector3().copy(positions[0]).cross(positions[1]);
  if (normal.lengthSq() === 0) {
    return new THREE.Vector3(0, 1, 0);
  }
  return normal.normalize();
}

function computeSaturnRingNormal(axialTiltDeg = 0) {
  const normal = new THREE.Vector3(0, 0, 1);
  normal.applyEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  normal.applyEuler(new THREE.Euler(THREE.MathUtils.degToRad(axialTiltDeg), 0, 0));
  return normal.normalize();
}

function computeOrbitCorrection(def, parent) {
  if (!def.orbit || !parent?.data) return null;
  if (parent.data.id !== 'saturn') return null;

  const orbitNormal = computeOrbitPlaneNormal(def.orbit);
  const targetNormal = computeSaturnRingNormal(parent.data.axialTiltDeg ?? 0);

  if (orbitNormal.lengthSq() === 0 || targetNormal.lengthSq() === 0) {
    return null;
  }

  const normalizedOrbit = orbitNormal.clone().normalize();
  const normalizedTarget = targetNormal.clone().normalize();
  const dot = normalizedOrbit.dot(normalizedTarget);
  if (dot >= 0.9999) {
    return null;
  }

  const correction = new THREE.Quaternion();
  if (dot <= -0.9999) {
    const axis = new THREE.Vector3(1, 0, 0).cross(normalizedOrbit);
    if (axis.lengthSq() < 1e-6) {
      axis.set(0, 1, 0);
    }
    axis.normalize();
    correction.setFromAxisAngle(axis, Math.PI);
  } else {
    correction.setFromUnitVectors(normalizedOrbit, normalizedTarget);
  }

  return correction;
}

function createBody(def, parent, visualRadiusMap, outerMoonScaling) {
  const material = new THREE.MeshStandardMaterial({
    color: def.color,
    emissive: def.type === 'star' ? new THREE.Color(0xffad6f) : new THREE.Color(0x0a0a12),
    emissiveIntensity: def.type === 'star' ? 1.0 : 0.45,
    metalness: 0.08,
    roughness: 0.65,
  });

  const textureUrl = resolveTexture(def);
  if (textureUrl) {
    const texture = loadTexture(textureUrl, true);
    if (texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
  }

  const visualRadius = visualRadiusMap.get(def.id) ?? Math.max((def.radiusKm / KM_IN_AU) * DISTANCE_SCALE * SIZE_MULTIPLIER, MIN_BODY_RADIUS);
  const geometry = new THREE.SphereGeometry(visualRadius, 48, 24);
  const surfaceMesh = new THREE.Mesh(geometry, material);
  surfaceMesh.userData.bodyId = def.id;
  surfaceMesh.castShadow = false;
  surfaceMesh.receiveShadow = false;

  const group = new THREE.Object3D();
  scene.add(group);

  const meshPivot = new THREE.Object3D();
  meshPivot.rotation.x = THREE.MathUtils.degToRad(def.axialTiltDeg ?? 0);
  group.add(meshPivot);

  meshPivot.add(surfaceMesh);

  if (def.ring) {
    const ringMesh = createRingMesh(def.ring, visualRadius);
    meshPivot.add(ringMesh);
  }

  if (def.type === 'star') {
    sunLight.position.copy(group.position);
  }

  const parentRadius = parent?.visualRadius ?? 0;
  let orbitScale = def.orbitScale ?? 1;
  let minDistance = 0;

  if (def.type === 'moon' && def.orbit && parent) {
    minDistance = parentRadius + visualRadius + MOON_CLEARANCE;
    const baseDistance = def.orbit.semiMajorAxisAu * DISTANCE_SCALE;
    if (baseDistance > 0) {
      const scalingInfo = outerMoonScaling.get(parent.data.id);
      if (scalingInfo && scalingInfo.max > 0) {
        const { min, max, parentRadius: outerParentRadius } = scalingInfo;
        let targetCenterDistance;

        const jupiterMultiplier =
          parent.data.id === 'jupiter' ? JUPITER_MOON_SURFACE_MULTIPLIERS[def.id] : undefined;

        if (jupiterMultiplier != null) {
          targetCenterDistance = outerParentRadius * (1 + jupiterMultiplier);
        } else {
          let normalized = 0;
          if (max > min) {
            normalized = (baseDistance - min) / (max - min);
          }
          normalized = THREE.MathUtils.clamp(normalized, 0, 1);

          if (parent.data?.ring) {
            const ringOuterScale = parent.data.ring.outerScale ?? 2.25;
            const ringOuterRadius = outerParentRadius * ringOuterScale;
            const ringBuffer = outerParentRadius * 0.2;
            const minDistanceFromCenter = ringOuterRadius + ringBuffer;
            const maxDistanceFromCenter = Math.max(minDistanceFromCenter, outerParentRadius * 6);
            targetCenterDistance = THREE.MathUtils.lerp(minDistanceFromCenter, maxDistanceFromCenter, normalized);
          } else {
            const surfaceFactor = OUTER_SURFACE_FACTOR_MIN + normalized * (OUTER_SURFACE_FACTOR_MAX - OUTER_SURFACE_FACTOR_MIN);
            targetCenterDistance = outerParentRadius + surfaceFactor * outerParentRadius;
          }
        }

        orbitScale = targetCenterDistance / baseDistance;
      }

      const clearanceScale = minDistance / baseDistance;
      orbitScale = Math.max(orbitScale, clearanceScale);
    }

    orbitScale = Math.max(orbitScale, MIN_MOON_ORBIT_SCALE);
    orbitScale = Math.min(orbitScale, MAX_MOON_ORBIT_SCALE);
  }

  const orbitCorrection = computeOrbitCorrection(def, parent);

  let orbitLine = null;
  if (def.orbit) {
    orbitLine = buildOrbitLine(def.orbit, orbitScale, minDistance, orbitCorrection);
    scene.add(orbitLine);
  }

  const body = {
    data: def,
    parent,
    mesh: surfaceMesh,
    surfaceMesh,
    meshPivot,
    group,
    orbitLine,
    position: new THREE.Vector3(),
    visualRadius,
    orbitScale,
    minDistance,
    rotationSpeed: computeRotationSpeed(def.rotationPeriodHours),
    orbitCorrection,
    initialRotationDeg: def.initialRotationDeg ?? 0,
    update(date, simDeltaSeconds) {
      if (!def.orbit) {
        this.position.set(0, 0, 0);
      } else {
        const relative = resolveOrbit(def.orbit, date, this.orbitScale, this.minDistance);
        if (this.orbitCorrection) {
          relative.applyQuaternion(this.orbitCorrection);
        }
        this.position.copy(relative);
        if (parent) {
          this.position.add(parent.position);
        }
      }
      group.position.copy(this.position);

      if (orbitLine) {
        if (parent) {
          orbitLine.position.copy(parent.position);
        } else {
          orbitLine.position.set(0, 0, 0);
        }
      }

      if (def.type === 'star') {
        sunLight.position.copy(group.position);
      }

      if (this.rotationSpeed && simDeltaSeconds) {
        const deltaAngle = this.rotationSpeed * simDeltaSeconds;
        surfaceMesh.rotation.y += deltaAngle;
        surfaceMesh.rotation.y = THREE.MathUtils.euclideanModulo(surfaceMesh.rotation.y, TWO_PI);
      }
    },
  };

  surfaceMesh.rotation.y = THREE.MathUtils.degToRad(body.initialRotationDeg);

  return body;
}

function buildOrbitLine(orbit, scale = 1, minDistance = 0, orientationQuat = null) {
  const segments = 512;
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const f = (i / segments) * TWO_PI;
    const r = (orbit.semiMajorAxisAu * (1 - orbit.eccentricity ** 2)) / (1 + orbit.eccentricity * Math.cos(f));
    const localPos = orbitalToCartesian(r, f, orbit);
    localPos.multiplyScalar(DISTANCE_SCALE * scale);
    if (minDistance > 0 && localPos.length() < minDistance) {
      localPos.setLength(minDistance);
    }
    if (orientationQuat) {
      localPos.applyQuaternion(orientationQuat);
    }
    points.push(localPos);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x6f8bff, transparent: true, opacity: 0.55 });
  return new THREE.LineLoop(geometry, material);
}

function resolveOrbit(orbit, date, scale = 1, minDistance = 0) {
  const days = (date.getTime() - J2000) / 86_400_000;
  const periodDays = orbit.periodDays ?? Math.sqrt(orbit.semiMajorAxisAu ** 3) * 365.256363004;
  const meanAnomaly = THREE.MathUtils.degToRad(normalizeDegrees(orbit.meanAnomalyAtEpochDeg + (360 / periodDays) * days));
  const eccentricity = orbit.eccentricity;

  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 6; i += 1) {
    const delta = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    eccentricAnomaly -= delta / (1 - eccentricity * Math.cos(eccentricAnomaly));
  }

  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2),
  );

  const distanceAu = orbit.semiMajorAxisAu * (1 - eccentricity * Math.cos(eccentricAnomaly));
  const position = orbitalToCartesian(distanceAu, trueAnomaly, orbit);
  position.multiplyScalar(DISTANCE_SCALE * scale);
  if (minDistance > 0 && position.length() < minDistance) {
    position.setLength(minDistance);
  }
  return position;
}

function orbitalToCartesian(rAu, trueAnomaly, orbit) {
  const cosT = Math.cos(trueAnomaly);
  const sinT = Math.sin(trueAnomaly);

  const xOrb = rAu * (cosT);
  const yOrb = rAu * (sinT);

  const omega = THREE.MathUtils.degToRad(orbit.argumentOfPeriapsisDeg);
  const inclination = THREE.MathUtils.degToRad(orbit.inclinationDeg);
  const bigOmega = THREE.MathUtils.degToRad(orbit.longitudeAscendingNodeDeg);

  const cosOmega = Math.cos(bigOmega);
  const sinOmega = Math.sin(bigOmega);
  const cosi = Math.cos(inclination);
  const sini = Math.sin(inclination);
  const cosw = Math.cos(omega);
  const sinw = Math.sin(omega);

  const x = (cosOmega * cosw - sinOmega * sinw * cosi) * xOrb + (-cosOmega * sinw - sinOmega * cosw * cosi) * yOrb;
  const y = (sinOmega * cosw + cosOmega * sinw * cosi) * xOrb + (-sinOmega * sinw + cosOmega * cosw * cosi) * yOrb;
  const z = (sinw * sini) * xOrb + (cosw * sini) * yOrb;

  return new THREE.Vector3(x, z, -y);
}

function addStarfield() {
  const geometry = new THREE.BufferGeometry();
  const starCount = 4_000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    const radius = 500 + Math.random() * 700;
    const theta = Math.random() * TWO_PI;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  const body = pickBodyAt(event);
  if (body) {
    selectBody(body);
  } else {
    if (!event.shiftKey) {
      clearSelection();
    }
  }
}

function onDoubleClick(event) {
  const body = pickBodyAt(event);
  if (!body) return;
  selectBody(body);
  followBody = body;
  updateFollowState();
  controls.target.copy(body.group.position);
  controls.update();
  updateSelectionPanel();
}

function selectBody(body) {
  selectedBody = body;
  updateSelectionPanel();
  updateFollowState();
}

function updateSelectionPanel() {
  if (!selectionPanel) return;
  const locale = getLocale();

  if (!selectedBody) {
    selectionPanel.innerHTML = `<p>${locale.selection.none}</p>`;
    lockButton.disabled = true;
    selectionHighlight.visible = false;
    return;
  }

  const { data } = selectedBody;
  const typeLabel = locale.typeNames[data.type] ?? data.displayType ?? data.type;
  const numberFormatter = new Intl.NumberFormat(locale.numberFormat);
  const info = [];

  info.push(`<strong>${data.name}</strong> (${typeLabel})`);

  const descriptionText = getDescriptionText(data.descriptionKey ?? data.id);
  if (descriptionText) {
    info.push(`<span>${descriptionText}</span>`);
  }

  if (data.orbit) {
    info.push(`<span>${locale.selection.meanDistance}: ${formatAu(data.orbit.semiMajorAxisAu, locale)} AU</span>`);
  }

  if (data.radiusKm) {
    const diameter = numberFormatter.format(data.radiusKm * 2);
    info.push(`<span>${locale.selection.diameter}: ${diameter} km</span>`);
  }

  if (data.rotationPeriodHours) {
    info.push(`<span>${locale.selection.rotation}: ${formatRotationPeriod(data.rotationPeriodHours, locale)}</span>`);
  }

  if (followBody && followBody === selectedBody) {
    info.push(`<em>${locale.selection.cameraLocked}</em>`);
  }

  selectionPanel.innerHTML = info.map((entry) => `<div>${entry}</div>`).join('');
  lockButton.disabled = false;
  updateSelectionHighlight();
}

function updateFollowState() {
  if (!lockButton || !unlockButton) return;
  const locale = getLocale();
  const hasFollow = !!followBody;
  const locked = hasFollow && selectedBody && followBody === selectedBody;
  if (selectedBody) {
    lockButton.textContent = locked ? locale.buttons.following : locale.buttons.lock;
  } else {
    lockButton.textContent = locale.buttons.lock;
  }
  lockButton.disabled = !selectedBody;
  unlockButton.textContent = locale.buttons.unlock;
  unlockButton.disabled = !hasFollow;
}

function updateSelectionHighlight() {
  if (!selectedBody) {
    selectionHighlight.visible = false;
    return;
  }

  const baseRadius = selectedBody.visualRadius ?? selectedBody.mesh.geometry.boundingSphere?.radius ?? 1;
  selectionHighlight.scale.setScalar(baseRadius * 1.35);
  selectionHighlight.visible = true;
  const targetPosition = selectedBody.group?.position ?? selectedBody.mesh?.position;
  if (targetPosition) {
    selectionHighlight.position.copy(targetPosition);
  }
}

function clearSelection() {
  if (!selectedBody) {
    selectionHighlight.visible = false;
    return;
  }
  selectedBody = null;
  updateSelectionPanel();
  updateFollowState();
  selectionHighlight.visible = false;
}

function updateTransportState() {
  if (!(playButton && pauseButton)) return;
  playButton.disabled = !isPaused;
  pauseButton.disabled = isPaused;
}

function configureSpeedSlider() {
  if (!speedSlider) return;
  speedSlider.min = '0';
  speedSlider.max = String(SPEED_STEPS.length - 1);
  speedSlider.step = '1';
  speedSlider.value = String(speedStep);
}

function loadTexture(path, srgb = true) {
  if (!path) return null;
  let texture = textureCache.get(path);
  if (!texture) {
    texture = textureLoader.load(path);
    textureCache.set(path, texture);
  }
  if (srgb) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function createRingMesh(config, planetRadius) {
  const inner = planetRadius * (config.innerScale ?? 1.35);
  const outer = planetRadius * (config.outerScale ?? 2.25);
  const geometry = new THREE.RingGeometry(inner, outer, RING_SEGMENTS);

  const color = new THREE.Color(config.color ?? 0x867859);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: config.opacity ?? 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const ringMesh = new THREE.Mesh(geometry, material);
  ringMesh.userData.isRing = true;
  ringMesh.renderOrder = 2;

  ringMesh.rotation.x = Math.PI / 2;
  if (config.nodeDeg != null) {
    ringMesh.rotation.y = THREE.MathUtils.degToRad(config.nodeDeg);
  }

  return ringMesh;
}

function onKeyDown(event) {
  if (event.repeat) return;

  if (event.key === '[') {
    speedStep = clampSpeedIndex(speedStep - 1);
    speedSlider.value = String(speedStep);
    simSpeed = speedFromStep(speedStep);
    refreshSpeedLabel();
  } else if (event.key === ']') {
    speedStep = clampSpeedIndex(speedStep + 1);
    speedSlider.value = String(speedStep);
    simSpeed = speedFromStep(speedStep);
    refreshSpeedLabel();
  } else {
    const adjustment = resolveTimeAdjustment(event.key);
    if (adjustment !== 0) {
      adjustSimTime(adjustment);
    }
  }
}

function resolveTimeAdjustment(key) {
  switch (key) {
    case 'H':
      return 3_600;
    case 'h':
      return -3_600;
    case 'D':
    case 'P':
      return 86_400;
    case 'd':
    case 'p':
      return -86_400;
    case 'W':
    case 'V':
      return 604_800;
    case 'w':
    case 'v':
      return -604_800;
    case 'M':
    case 'K':
      return 2_592_000; // 30 days approximation
    case 'm':
    case 'k':
      return -2_592_000;
    case 'Y':
      return 31_557_600; // 365.25 days
    case 'y':
      return -31_557_600;
    case 'U': // allow first letter of "VUOSI"
      return 31_557_600;
    case 'u':
      return -31_557_600;
    default:
      return 0;
  }
}

function adjustSimTime(seconds) {
  simTimeMs += seconds * 1000;
  updateHud(new Date(simTimeMs));
}

function refreshSpeedLabel() {
  speedValueElement.textContent = describeSpeed(simSpeed);
}

function speedFromStep(step) {
  return SPEED_STEPS[clampSpeedIndex(step)];
}

function describeSpeed(multiplier) {
  const locale = getLocale();
  if (Math.abs(multiplier - 1) < 1e-6) {
    return locale.stats.realTime;
  }
  const formatter = new Intl.NumberFormat(locale.numberFormat, {
    maximumFractionDigits: multiplier >= 10 ? 0 : 2,
  });
  return `${formatter.format(multiplier)}x`;
}

function clampSpeedIndex(index) {
  return Math.max(0, Math.min(SPEED_STEPS.length - 1, index));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const deltaSeconds = clock.getDelta();
  const simDeltaSeconds = isPaused ? 0 : deltaSeconds * simSpeed;
  if (!isPaused) {
    simTimeMs += simDeltaSeconds * 1000;
  }
  const simDate = new Date(simTimeMs);

  for (const body of bodies) {
    body.update(simDate, simDeltaSeconds);
  }

  if (followBody) {
    controls.target.copy(followBody.group.position);
  }

  if (selectionHighlight.visible && selectedBody) {
    selectionHighlight.position.copy(selectedBody.group.position);
  }

  controls.update();
  renderer.render(scene, camera);
  updateHud(simDate);
}

function updateHud(date) {
  simTimeValueElement.textContent = formatDateTime(date);
}

function formatDateTime(date) {
  const locale = getLocale();
  return new Intl.DateTimeFormat(locale.numberFormat, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

function snapToNow() {
  simTimeMs = Date.now();
  updateHud(new Date(simTimeMs));
}

function pickBodyAt(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.params.Points = { threshold: 0.5 };
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(selectableMeshes, false);
  if (intersects.length === 0) {
    return null;
  }

  const mesh = intersects[0].object;
  return bodies.find((item) => item.data.id === mesh.userData.bodyId) ?? null;
}

function getBodyDefinitions() {
  return [
    {
      id: 'sun',
      name: 'Aurinko',
      type: 'star',
      displayType: 'tähti',
      radiusKm: 695_700,
      color: 0xffd27f,
      descriptionKey: 'sun',
      renderRadius: 1.4,
      rotationPeriodHours: 609.12,
      axialTiltDeg: 7.25,
    },
    {
      id: 'mercury',
      name: 'Merkurius',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 2_439.7,
      color: 0xc1acab,
      parentId: 'sun',
      descriptionKey: 'mercury',
      rotationPeriodHours: 1407.5,
      axialTiltDeg: 0.01,
      orbit: {
        semiMajorAxisAu: 0.38709927,
        eccentricity: 0.20563593,
        inclinationDeg: 7.00497902,
        longitudeAscendingNodeDeg: 48.33076593,
        argumentOfPeriapsisDeg: 29.12427935,
        meanAnomalyAtEpochDeg: 174.79252722,
        periodDays: 87.9691,
      },
    },
    {
      id: 'venus',
      name: 'Venus',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 6_051.8,
      color: 0xe0c080,
      parentId: 'sun',
      descriptionKey: 'venus',
      rotationPeriodHours: -5832.5,
      axialTiltDeg: 177.36,
      orbit: {
        semiMajorAxisAu: 0.72333566,
        eccentricity: 0.00677672,
        inclinationDeg: 3.39467605,
        longitudeAscendingNodeDeg: 76.67984255,
        argumentOfPeriapsisDeg: 54.92246763,
        meanAnomalyAtEpochDeg: 50.37663228,
        periodDays: 224.7008,
      },
    },
    {
      id: 'earth',
      name: 'Maa',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 6_371.0,
      color: 0x4a90e2,
      parentId: 'sun',
      descriptionKey: 'earth',
      rotationPeriodHours: 23.934,
      axialTiltDeg: 23.44,
      orbit: {
        semiMajorAxisAu: 1.00000011,
        eccentricity: 0.01671022,
        inclinationDeg: 0.00005,
        longitudeAscendingNodeDeg: -11.26064,
        argumentOfPeriapsisDeg: 114.20783,
        meanAnomalyAtEpochDeg: 357.51716,
        periodDays: 365.256363,
      },
    },
    {
      id: 'moon',
      name: 'Kuu',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 1_737.4,
      color: 0xbcb8b2,
      parentId: 'earth',
      descriptionKey: 'moon',
      rotationPeriodHours: 655.728,
      axialTiltDeg: 6.68,
      orbit: {
        semiMajorAxisAu: 0.002569555,
        eccentricity: 0.0549,
        inclinationDeg: 5.145,
        longitudeAscendingNodeDeg: 125.08,
        argumentOfPeriapsisDeg: 318.15,
        meanAnomalyAtEpochDeg: 115.3654,
        periodDays: 27.321661,
      },
    },
    {
      id: 'mars',
      name: 'Mars',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 3_389.5,
      color: 0xc8654d,
      parentId: 'sun',
      descriptionKey: 'mars',
      rotationPeriodHours: 24.623,
      axialTiltDeg: 25.19,
      orbit: {
        semiMajorAxisAu: 1.52371034,
        eccentricity: 0.09339410,
        inclinationDeg: 1.84969142,
        longitudeAscendingNodeDeg: 49.55953891,
        argumentOfPeriapsisDeg: 286.502,
        meanAnomalyAtEpochDeg: 19.39019754,
        periodDays: 686.980,
      },
    },
    {
      id: 'phobos',
      name: 'Phobos',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 11.2667,
      color: 0x8f8a86,
      parentId: 'mars',
      descriptionKey: 'phobos',
      renderRadius: 0.25,
      rotationPeriodHours: 7.66,
      orbit: {
        semiMajorAxisAu: 0.000062675,
        eccentricity: 0.0151,
        inclinationDeg: 1.9,
        longitudeAscendingNodeDeg: 49.0,
        argumentOfPeriapsisDeg: 150.1,
        meanAnomalyAtEpochDeg: 80.0,
        periodDays: 0.31891,
      },
    },
    {
      id: 'deimos',
      name: 'Deimos',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 6.2,
      color: 0xb5b0ab,
      parentId: 'mars',
      descriptionKey: 'deimos',
      renderRadius: 0.22,
      rotationPeriodHours: 30.35,
      orbit: {
        semiMajorAxisAu: 0.000156842,
        eccentricity: 0.0002,
        inclinationDeg: 1.8,
        longitudeAscendingNodeDeg: 49.6,
        argumentOfPeriapsisDeg: 70.0,
        meanAnomalyAtEpochDeg: 140.0,
        periodDays: 1.26244,
      },
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 69_911,
      color: 0xd7b37a,
      parentId: 'sun',
      descriptionKey: 'jupiter',
      renderRadius: 2.6,
      rotationPeriodHours: 9.925,
      axialTiltDeg: 3.13,
      orbit: {
        semiMajorAxisAu: 5.20288700,
        eccentricity: 0.04838624,
        inclinationDeg: 1.30439695,
        longitudeAscendingNodeDeg: 100.47390909,
        argumentOfPeriapsisDeg: 274.27305074,
        meanAnomalyAtEpochDeg: 19.66796068,
        periodDays: 4332.589,
      },
    },
    {
      id: 'io',
      name: 'Io',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 1_821.6,
      color: 0xffe276,
      parentId: 'jupiter',
      descriptionKey: 'io',
      orbit: {
        semiMajorAxisAu: 0.002819,
        eccentricity: 0.004879458023067604,
        inclinationDeg: 2.212625896929864,
        longitudeAscendingNodeDeg: 336.8522496700484,
        argumentOfPeriapsisDeg: 67.08346085353269,
        meanAnomalyAtEpochDeg: 334.24284160276244,
        periodDays: 1.7718964834223734,
      },
    },
    {
      id: 'europa',
      name: 'Europa',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 1_560.8,
      color: 0xd9d2c5,
      parentId: 'jupiter',
      descriptionKey: 'europa',
      orbit: {
        semiMajorAxisAu: 0.004484,
        eccentricity: 0.009789867263725448,
        inclinationDeg: 1.7909887092581105,
        longitudeAscendingNodeDeg: 332.6282575700165,
        argumentOfPeriapsisDeg: 254.12181778318993,
        meanAnomalyAtEpochDeg: 345.93160032652116,
        periodDays: 3.5531831164380687,
      },
    },
    {
      id: 'ganymede',
      name: 'Ganymedes',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 2_634.1,
      color: 0xbca48c,
      parentId: 'jupiter',
      descriptionKey: 'ganymede',
      orbit: {
        semiMajorAxisAu: 0.007155,
        eccentricity: 0.0014109763895793213,
        inclinationDeg: 2.214133473599043,
        longitudeAscendingNodeDeg: 343.173070881089,
        argumentOfPeriapsisDeg: 316.987280706706,
        meanAnomalyAtEpochDeg: 279.8660625759672,
        periodDays: 7.156822593270807,
      },
    },
    {
      id: 'callisto',
      name: 'Kallisto',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 2_410.3,
      color: 0x958172,
      parentId: 'jupiter',
      descriptionKey: 'callisto',
      orbit: {
        semiMajorAxisAu: 0.012585,
        eccentricity: 0.007426728567527058,
        inclinationDeg: 2.0169160591039708,
        longitudeAscendingNodeDeg: 337.9427202690351,
        argumentOfPeriapsisDeg: 16.475597133407142,
        meanAnomalyAtEpochDeg: 84.7704510799774,
        periodDays: 16.692158624085896,
      },
    },
    {
      id: 'saturn',
      name: 'Saturnus',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 58_232,
      color: 0xf4c98c,
      parentId: 'sun',
      descriptionKey: 'saturn',
      renderRadius: 2.1,
      ring: {
        texture: 'data/textures/saturn_ring.png',
        innerScale: 1.5,
        outerScale: 2.7,
        nodeDeg: 0,
        opacity: 0.9,
      },
      rotationPeriodHours: 10.656,
      axialTiltDeg: 26.73,
      orbit: {
        semiMajorAxisAu: 9.53667594,
        eccentricity: 0.05386179,
        inclinationDeg: 2.48599187,
        longitudeAscendingNodeDeg: 113.66242448,
        argumentOfPeriapsisDeg: 338.9393318,
        meanAnomalyAtEpochDeg: 317.355366,
        periodDays: 10759.22,
      },
    },
    {
      id: 'mimas',
      name: 'Mimas',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 198.2,
      color: 0xa09d9a,
      parentId: 'saturn',
      descriptionKey: 'mimas',
      renderRadius: 0.45,
      orbit: {
        semiMajorAxisAu: 0.001247966,
        eccentricity: 0.023254490718893114,
        inclinationDeg: 27.00219363533106,
        longitudeAscendingNodeDeg: 172.05495885813778,
        argumentOfPeriapsisDeg: 111.48418723684985,
        meanAnomalyAtEpochDeg: 34.63865465393197,
        periodDays: 0.9524895104243762,
      },
    },
    {
      id: 'enceladus',
      name: 'Enceladus',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 252.1,
      color: 0xd8f0ff,
      parentId: 'saturn',
      descriptionKey: 'enceladus',
      renderRadius: 0.5,
      orbit: {
        semiMajorAxisAu: 0.001598086,
        eccentricity: 0.00782397030001267,
        inclinationDeg: 28.051902047724234,
        longitudeAscendingNodeDeg: 169.5063751089069,
        argumentOfPeriapsisDeg: 135.52198957313303,
        meanAnomalyAtEpochDeg: 6.905304171394682,
        periodDays: 1.3802453328200734,
      },
    },
    {
      id: 'tethys',
      name: 'Tethys',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 531.1,
      color: 0xe2e7ed,
      parentId: 'saturn',
      descriptionKey: 'tethys',
      renderRadius: 0.55,
      orbit: {
        semiMajorAxisAu: 0.001976283,
        eccentricity: 0.0022014883113555092,
        inclinationDeg: 27.22120628492098,
        longitudeAscendingNodeDeg: 167.9993998500507,
        argumentOfPeriapsisDeg: 150.96743452966223,
        meanAnomalyAtEpochDeg: 357.46756390123517,
        periodDays: 1.8981465954591739,
      },
    },
    {
      id: 'dione',
      name: 'Dione',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 561.4,
      color: 0xdad5cf,
      parentId: 'saturn',
      descriptionKey: 'dione',
      renderRadius: 0.55,
      orbit: {
        semiMajorAxisAu: 0.002528997,
        eccentricity: 0.0038068490726938563,
        inclinationDeg: 28.041308782726794,
        longitudeAscendingNodeDeg: 169.4701294979719,
        argumentOfPeriapsisDeg: 155.42367458880864,
        meanAnomalyAtEpochDeg: 341.5604040819433,
        periodDays: 2.747758095465961,
      },
    },
    {
      id: 'rhea',
      name: 'Rhea',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 763.8,
      color: 0xd9d0c8,
      parentId: 'saturn',
      descriptionKey: 'rhea',
      renderRadius: 0.6,
      orbit: {
        semiMajorAxisAu: 0.003520505,
        eccentricity: 0.0013615920996962673,
        inclinationDeg: 28.241507765885782,
        longitudeAscendingNodeDeg: 168.98424305946335,
        argumentOfPeriapsisDeg: 188.92715115459765,
        meanAnomalyAtEpochDeg: 183.7469268557453,
        periodDays: 4.512981388162771,
      },
    },
    {
      id: 'titan',
      name: 'Titan',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 2_574.73,
      color: 0xe3b079,
      parentId: 'saturn',
      descriptionKey: 'titan',
      renderRadius: 0.85,
      orbit: {
        semiMajorAxisAu: 0.008162535,
        eccentricity: 0.029040662450052376,
        inclinationDeg: 27.718340750856644,
        longitudeAscendingNodeDeg: 169.23906927048893,
        argumentOfPeriapsisDeg: 164.15095124297517,
        meanAnomalyAtEpochDeg: 163.69436481455034,
        periodDays: 15.93285571022866,
      },
    },
    {
      id: 'iapetus',
      name: 'Iapetus',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 734.5,
      color: 0xc5b39d,
      parentId: 'saturn',
      descriptionKey: 'iapetus',
      renderRadius: 0.7,
      orbit: {
        semiMajorAxisAu: 0.023810451,
        eccentricity: 0.02813722580864883,
        inclinationDeg: 17.238667187294606,
        longitudeAscendingNodeDeg: 139.68247227332336,
        argumentOfPeriapsisDeg: 229.25704443877794,
        meanAnomalyAtEpochDeg: 208.46801128737624,
        periodDays: 79.37933700695002,
      },
    },
    {
      id: 'uranus',
      name: 'Uranus',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 25_362,
      color: 0x8ad6ff,
      parentId: 'sun',
      descriptionKey: 'uranus',
      rotationPeriodHours: -17.24,
      axialTiltDeg: 97.77,
      orbit: {
        semiMajorAxisAu: 19.18916464,
        eccentricity: 0.04725744,
        inclinationDeg: 0.77263783,
        longitudeAscendingNodeDeg: 74.01692503,
        argumentOfPeriapsisDeg: 96.99835327,
        meanAnomalyAtEpochDeg: 142.28382821,
        periodDays: 30685.4,
      },
    },
    {
      id: 'miranda',
      name: 'Miranda',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 235.8,
      color: 0xced5e4,
      parentId: 'uranus',
      descriptionKey: 'miranda',
      renderRadius: 0.45,
      orbit: {
        semiMajorAxisAu: 0.000864919,
        eccentricity: 0.0013,
        inclinationDeg: 4.2,
        longitudeAscendingNodeDeg: 74.0,
        argumentOfPeriapsisDeg: 68.0,
        meanAnomalyAtEpochDeg: 30.0,
        periodDays: 1.413,
      },
    },
    {
      id: 'ariel',
      name: 'Ariel',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 578.9,
      color: 0xbfcbe1,
      parentId: 'uranus',
      descriptionKey: 'ariel',
      renderRadius: 0.55,
      orbit: {
        semiMajorAxisAu: 0.001276088,
        eccentricity: 0.0012,
        inclinationDeg: 0.3,
        longitudeAscendingNodeDeg: 74.0,
        argumentOfPeriapsisDeg: 175.0,
        meanAnomalyAtEpochDeg: 120.0,
        periodDays: 2.520,
      },
    },
    {
      id: 'umbriel',
      name: 'Umbriel',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 584.7,
      color: 0x9ba8c1,
      parentId: 'uranus',
      descriptionKey: 'umbriel',
      renderRadius: 0.55,
      orbit: {
        semiMajorAxisAu: 0.0017781,
        eccentricity: 0.0039,
        inclinationDeg: 0.4,
        longitudeAscendingNodeDeg: 74.0,
        argumentOfPeriapsisDeg: 80.0,
        meanAnomalyAtEpochDeg: 200.0,
        periodDays: 4.144,
      },
    },
    {
      id: 'titania',
      name: 'Titania',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 788.4,
      color: 0xc7c2c1,
      parentId: 'uranus',
      descriptionKey: 'titania',
      renderRadius: 0.65,
      orbit: {
        semiMajorAxisAu: 0.002913878,
        eccentricity: 0.0011,
        inclinationDeg: 0.1,
        longitudeAscendingNodeDeg: 74.0,
        argumentOfPeriapsisDeg: 220.0,
        meanAnomalyAtEpochDeg: 340.0,
        periodDays: 8.706,
      },
    },
    {
      id: 'oberon',
      name: 'Oberon',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 761.4,
      color: 0xa7a0a1,
      parentId: 'uranus',
      descriptionKey: 'oberon',
      renderRadius: 0.6,
      orbit: {
        semiMajorAxisAu: 0.00390059,
        eccentricity: 0.0014,
        inclinationDeg: 0.1,
        longitudeAscendingNodeDeg: 74.0,
        argumentOfPeriapsisDeg: 160.0,
        meanAnomalyAtEpochDeg: 60.0,
        periodDays: 13.463,
      },
    },
    {
      id: 'neptune',
      name: 'Neptunus',
      type: 'planet',
      displayType: 'planeetta',
      radiusKm: 24_622,
      color: 0x4f6cff,
      parentId: 'sun',
      descriptionKey: 'neptune',
      rotationPeriodHours: 16.11,
      axialTiltDeg: 28.32,
      orbit: {
        semiMajorAxisAu: 30.06992276,
        eccentricity: 0.00859048,
        inclinationDeg: 1.77004347,
        longitudeAscendingNodeDeg: 131.78422574,
        argumentOfPeriapsisDeg: 273.18777979,
        meanAnomalyAtEpochDeg: 259.91520804,
        periodDays: 60190.0,
      },
    },
    {
      id: 'triton',
      name: 'Triton',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 1_353.4,
      color: 0xd0d6e5,
      parentId: 'neptune',
      descriptionKey: 'triton',
      renderRadius: 0.75,
      orbit: {
        semiMajorAxisAu: 0.002371417,
        eccentricity: 0.000016,
        inclinationDeg: 156.8,
        longitudeAscendingNodeDeg: 130.0,
        argumentOfPeriapsisDeg: 20.0,
        meanAnomalyAtEpochDeg: 180.0,
        periodDays: 5.876854,
      },
    },
    {
      id: 'proteus',
      name: 'Proteus',
      type: 'moon',
      displayType: 'kuu',
      radiusKm: 210,
      color: 0x808a9b,
      parentId: 'neptune',
      descriptionKey: 'proteus',
      renderRadius: 0.45,
      orbit: {
        semiMajorAxisAu: 0.000786107,
        eccentricity: 0.0005,
        inclinationDeg: 0.5,
        longitudeAscendingNodeDeg: 130.0,
        argumentOfPeriapsisDeg: 300.0,
        meanAnomalyAtEpochDeg: 45.0,
        periodDays: 1.122,
      },
    },
    {
      id: 'ceres',
      name: 'Ceres',
      type: 'dwarf-planet',
      displayType: 'kääpiöplaneetta',
      radiusKm: 473,
      color: 0xbbbcc5,
      parentId: 'sun',
      descriptionKey: 'ceres',
      rotationPeriodHours: 9.074,
      axialTiltDeg: 4,
      orbit: {
        semiMajorAxisAu: 2.7675,
        eccentricity: 0.0758,
        inclinationDeg: 10.593,
        longitudeAscendingNodeDeg: 80.305,
        argumentOfPeriapsisDeg: 73.597,
        meanAnomalyAtEpochDeg: 95.989,
        periodDays: 1680.0,
      },
    },
  ];
}

function formatAu(value, locale = getLocale()) {
  return new Intl.NumberFormat(locale.numberFormat, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

function normalizeDegrees(value) {
  let result = value % 360;
  if (result < 0) result += 360;
  return result;
}

function formatRotationPeriod(hours, locale) {
  if (hours == null) return '';
  const absHours = Math.abs(hours);
  const sign = hours < 0 ? '-' : '';
  if (absHours >= 24) {
    const days = absHours / 24;
    return `${sign}${days.toFixed(2)} ${locale.units.day}`;
  }
  return `${sign}${absHours.toFixed(2)} ${locale.units.hour}`;
}

function computeEarthInitialRotation() {
  const now = new Date();
  const seconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
  const angularSpeed = TWO_PI / (23.934 * 3600);
  const angle = (-Math.PI / 2 - angularSpeed * seconds + Math.PI) % TWO_PI;
  return THREE.MathUtils.radToDeg(angle);
}
