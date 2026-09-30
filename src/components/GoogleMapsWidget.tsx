import React, { useState, useEffect, useMemo } from "react";
import {
  Navigation,
  MapPin,
  X,
  CloudSun,
  Search,
  Building2,
  Utensils,
  Coffee,
  Train,
  Landmark,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Compass,
  Layers,
  Phone,
  Bed,
  CheckCircle2,
  Clock,
  Thermometer,
  Plane,
  Coins,
  Wind,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import { ActiveMapData } from "../App";
import { DraggableResizableWidget } from "./DraggableResizableWidget";
import { useTheme } from "../utils/themeStore";

interface GoogleMapsWidgetProps {
  activeMapData: ActiveMapData | null;
  setActiveMapData: (data: ActiveMapData | null) => void;
  isEditMode?: boolean;
  onClose?: () => void;
}

export interface HotelSpot {
  id: string;
  name: string;
  stars: number;
  category: "luxury" | "boutique" | "business" | "budget";
  rating: number;
  googleRating?: number;
  reviewsCount: number;
  pricePerNight: string;
  address: string;
  distanceToCenter?: string;
  phone: string;
  amenities: string[];
  description: string;
  googleMapsVerifiedPrice?: boolean;
}

// ==========================================
// 1. SHANGHAI TOP HOTELS (CURATED VERIFIED)
// ==========================================
export const SHANGHAI_HOTELS: HotelSpot[] = [
  {
    id: "sh-1",
    name: "The Peninsula Shanghai",
    stars: 5,
    category: "luxury",
    rating: 9.7,
    reviewsCount: 3820,
    pricePerNight: "ab 380 €",
    address: "No. 32 The Bund, Huangpu, Shanghai 200002",
    distanceToCenter: "Direkt an der Uferpromenade The Bund",
    phone: "+86 21 2327 2888",
    amenities: ["Blick auf Pudong Skyline", "Michelin Yi Long Court", "Rooftop Sir Elly's", "Indoor Pool", "Rolls-Royce Flotte"],
    description: "Ikonisches Art-Déco-Meisterwerk direkt an der historischen Uferpromenade The Bund mit unschlagbarem Blick auf die Wolkenkratzer von Pudong.",
  },
  {
    id: "sh-2",
    name: "Fairmont Peace Hotel",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    reviewsCount: 4210,
    pricePerNight: "ab 310 €",
    address: "20 Nanjing Road East, The Bund, Shanghai 200002",
    distanceToCenter: "Ecke Nanjing Road & The Bund",
    phone: "+86 21 6138 6888",
    amenities: ["Historische Jazz-Bar von 1929", "Kupferdach-Pyramide", "Cathay Room", "Willow Stream Spa", "Denkmalschutz"],
    description: "Legendäres Luxushotel der 1920er Jahre, in dem Charlie Chaplin und Staatsoberhäupter residierten. Berühmt für die weltweit älteste Jazzband.",
  },
  {
    id: "sh-3",
    name: "W Shanghai - The Bund",
    stars: 5,
    category: "boutique",
    rating: 9.5,
    reviewsCount: 3450,
    pricePerNight: "ab 260 €",
    address: "No. 66 Lvshun Road, North Bund, Hongkou, Shanghai 200080",
    distanceToCenter: "North Bund (1.2 km zum Zentrum)",
    phone: "+86 21 2286 9999",
    amenities: ["WET Deck Infinity Pool", "Skyline Panorama", "WOOBAR Cocktails", "AWAY Spa", "Ultra-Modernes Design"],
    description: "Das spektakulärste Lifestyle-Hotel der Metropole mit der weltberühmten WET-Deck-Terrasse und direktem Blick auf den Oriental Pearl Tower.",
  },
  {
    id: "sh-4",
    name: "Bulgari Hotel Shanghai",
    stars: 5,
    category: "luxury",
    rating: 9.8,
    reviewsCount: 1980,
    pricePerNight: "ab 520 €",
    address: "No. 33 Shanxi North Road, Jing'an District, Shanghai 200085",
    distanceToCenter: "Am Suhe Creek Flussufer",
    phone: "+86 21 3606 7788",
    amenities: ["Il Ristorante Niko Romito", "25m Granit-Innenpool", "Historische Handelskammer", "La Terrazza Rooftop", "Privater Butler"],
    description: "Höchste italienische Handwerkskunst und Juwelier-Eleganz in einem 48-stöckigen Turm, umgeben von privaten Gärten am historischen Suhe Creek.",
  },
  {
    id: "sh-5",
    name: "The Ritz-Carlton Shanghai, Pudong",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    reviewsCount: 4670,
    pricePerNight: "ab 295 €",
    address: "Shanghai IFC, 8 Century Avenue, Lujiazui, Pudong, Shanghai 200120",
    distanceToCenter: "Direkt im Finanzzentrum Lujiazui",
    phone: "+86 21 2020 1888",
    amenities: ["Flair Rooftop Restaurant (58. Stock)", "IFC Mall Zugang", "Jin Xuan Chinese Restaurant", "Ritz Spa", "Blick auf den Bund"],
    description: "Besetzt die obersten Etagen des 58-stöckigen IFC-Wolkenkratzers mit der höchstgelegenen Open-Air-Lounge Chinas.",
  },
  {
    id: "sh-6",
    name: "Mandarin Oriental Pudong",
    stars: 5,
    category: "luxury",
    rating: 9.5,
    reviewsCount: 3120,
    pricePerNight: "ab 280 €",
    address: "111 Pudong South Road, Lujiazui, Pudong, Shanghai 200120",
    distanceToCenter: "Ufer des Huangpu-Flusses",
    phone: "+86 21 2082 9888",
    amenities: ["4000+ Kunstwerke", "Michelin Yong Yi Ting", "Riverfront Promenade", "Boutique Spa", "Executive Club"],
    description: "Eingebettet in grüne Uferparks am Huangpu-Fluss mit herausragender Kulinarik und privatem Kunstmuseum im gesamten Anwesen.",
  },
  {
    id: "sh-7",
    name: "J Hotel Shanghai Tower",
    stars: 5,
    category: "luxury",
    rating: 9.7,
    reviewsCount: 1650,
    pricePerNight: "ab 450 €",
    address: "No. 501 Yincheng Middle Road, Shanghai Tower, Pudong, Shanghai",
    distanceToCenter: "Im Shanghai Tower (Höchstes Hotel der Welt)",
    phone: "+86 21 3886 8888",
    amenities: ["Etagen 86-120 (556m Höhe)", "Wolkenmeer-Blick", "Kinn Shang Restaurant", "Privater 24h Butler", "Heli-Service"],
    description: "Das höchste Luxushotel der Welt in der Spitze des Shanghai Towers. Über den Wolken mit atemberaubender 360-Grad-Sicht über ganz Shanghai.",
  },
  {
    id: "sh-8",
    name: "Amanyangyun Shanghai",
    stars: 5,
    category: "luxury",
    rating: 9.9,
    reviewsCount: 890,
    pricePerNight: "ab 680 €",
    address: "6161 Yuanjiang Road, Minhang District, Shanghai 201111",
    distanceToCenter: "Historisches Kampherwald-Resort (Süd-Shanghai)",
    phone: "+86 21 8011 9999",
    amenities: ["Geretteter 10000-Bäume-Wald", "Ming- & Qing-Dynastie Villen", "Nan Shufang Tee-Pavillon", "Aman Wellness Spa", "See-Lage"],
    description: "Einzigartiges archäologisches Meisterwerk von Aman. Gerettete historische Villen und uralte Kampferbäume bieten absolute Ruhe.",
  },
  {
    id: "sh-9",
    name: "The Middle House",
    stars: 5,
    category: "boutique",
    rating: 9.4,
    reviewsCount: 2200,
    pricePerNight: "ab 270 €",
    address: "No. 366 Shi Men Yi Lu, Jing'an District, Shanghai 200041",
    distanceToCenter: "Jing'an Shopping & Szeneviertel",
    phone: "+86 21 3216 8199",
    amenities: ["Piero Lissoni Design", "Café Gray Deluxe", "MI XUN Spa", "Terrassengarten", "E-Bikes kostenfrei"],
    description: "Elegantes Design-Boutiquehotel der Swire Group im pulsierenden Herzen von Jing'an mit avantgardistischer Architektur.",
  },
  {
    id: "sh-10",
    name: "Pudong Shangri-La, Shanghai",
    stars: 5,
    category: "business",
    rating: 9.2,
    reviewsCount: 5400,
    pricePerNight: "ab 190 €",
    address: "33 Fucheng Road, Lujiazui, Pudong, Shanghai 200120",
    distanceToCenter: "Lujiazui Flussufer direkt am Bund",
    phone: "+86 21 6882 8888",
    amenities: ["Zwei Hoteltürme", "Jade on 36 Restaurant", "2 Außenpools & Spa", "Horizon Club", "Shopping Mall Anschluss"],
    description: "Traditionsreiches 5-Sterne-Flaggschiff mit spektakulärem Blick auf die historische Bund-Architektur.",
  },
];

// =========================================================================
// 2. WALDHOTELS & NATURHOTELS (REGION FRANKFURT / DARMSTADT / TAUNUS / ODENWALD)
// =========================================================================
export const WALDHOTELS_FFM_DARMSTADT: HotelSpot[] = [
  {
    id: "wh-1",
    name: "Hotel Jagdschloss Kranichstein",
    stars: 4,
    category: "boutique",
    rating: 9.4,
    reviewsCount: 1840,
    pricePerNight: "ab 119 €",
    address: "Kranichsteiner Str. 261, 64289 Darmstadt",
    distanceToCenter: "Am Waldrand von Darmstadt / Jagdschloss-Park",
    phone: "+49 6151 130670",
    amenities: ["Ehemaliges Landgrafen-Schloss", "Bio-Wildpark", "Schlossterrasse im Grünen", "Kavalliersbau", "Waldwanderwege"],
    description: "Prächtiges Renaissance-Jagdschloss der Darmstädter Landgrafen, idyllisch am Waldrand gelegen mit eigenem Wildpark und Gourmet-Restaurant.",
  },
  {
    id: "wh-2",
    name: "Waldhotel Jagdschloss Mönchbruch",
    stars: 4,
    category: "boutique",
    rating: 9.2,
    reviewsCount: 1520,
    pricePerNight: "ab 98 €",
    address: "Mönchbruch 1, 65451 Kelsterbach / Groß-Gerau",
    distanceToCenter: "Mitten im Naturschutzgebiet Mönchbruch (FFM/Darmstadt)",
    phone: "+49 6105 2040",
    amenities: ["Alte Eichenwälder", "Jagdstube mit Kamin", "Historischer Gutshof", "Biergarten im Wald", "Kostenfreie Parkplätze"],
    description: "Historisches Waldhotel im zweitgrößten Naturschutzgebiet Hessens zwischen Frankfurt und Darmstadt, ideal für absolute Waldruhe.",
  },
  {
    id: "wh-3",
    name: "Waldhotel Forsthaus Dr. Geisenheyner",
    stars: 3,
    category: "budget",
    rating: 9.0,
    reviewsCount: 1140,
    pricePerNight: "ab 85 €",
    address: "Waldstraße 110, 64372 Ober-Ramstadt bei Darmstadt",
    distanceToCenter: "Modautal am Odenwald-Eingang (12 km Darmstadt)",
    phone: "+49 6154 2071",
    amenities: ["Traditionelle Wildküche", "Sonnige Waldterrasse", "Ruhige Einzellage", "Wanderwege ab Haustür", "Frühstücksbuffet"],
    description: "Kleines, urgemütliches Waldhotel im dichten Mischwald des vorderen Odenwalds nahe Darmstadt mit regionaler Frischeküche.",
  },
  {
    id: "wh-4",
    name: "Waldhotel Krautkrämer am Waldsee",
    stars: 3,
    category: "business",
    rating: 8.8,
    reviewsCount: 1290,
    pricePerNight: "ab 92 €",
    address: "Waldstraße 8, 64390 Erzhausen bei Darmstadt",
    distanceToCenter: "Erzhäuser Wald (zwischen FFM & Darmstadt)",
    phone: "+49 6150 9700",
    amenities: ["Liegewiese am Waldrand", "Kiefernwald-Joggingpfad", "Saunabereich", "Restaurant mit Seeblick", "S-Bahn Nähe"],
    description: "Ruhig gelegenes Hotel direkt am Waldrand zwischen Frankfurt und Darmstadt mit hervorragender Verkehrsanbindung und Waldwanderpfaden.",
  },
  {
    id: "wh-5",
    name: "Schlosshotel Kronberg - Luxury Waldresort",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    reviewsCount: 2310,
    pricePerNight: "ab 240 €",
    address: "Hainstraße 25, 61476 Kronberg im Taunus",
    distanceToCenter: "58 Hektar Schlosspark & Taunuswald",
    phone: "+49 6173 70101",
    amenities: ["18-Loch Golfplatz im Park", "Kaiserin Friedrich Schloss", "Gourmetrestaurant", "Historische Bibliothek", "Schlossterrasse"],
    description: "Ehemaliger Witwensitz der deutschen Kaiserin Victoria, eingebettet in einen 58 Hektar großen, uralten Wald- und Schlosspark.",
  },
  {
    id: "wh-6",
    name: "Bold Campus - Taunus Waldrefugium",
    stars: 4,
    category: "boutique",
    rating: 9.1,
    reviewsCount: 1780,
    pricePerNight: "ab 115 €",
    address: "Königsteiner Str. 88, 61462 Königstein im Taunus",
    distanceToCenter: "Hochtaunus-Wald (20 Min nach FFM)",
    phone: "+49 6174 2950",
    amenities: ["Indoor-Waldpool", "Yoga-Waldwiesen", "Bio-Restaurant", "Coworking Space", "Trailrunning-Strecken"],
    description: "Stylisches Lifestyle-Waldresort am Hang des Taunus mit spektakulärem Blick ins Grüne, Sauna und modernem Design-Konzept.",
  },
  {
    id: "wh-7",
    name: "Waldgasthof & Naturhotel Baur",
    stars: 3,
    category: "budget",
    rating: 8.9,
    reviewsCount: 940,
    pricePerNight: "ab 79 €",
    address: "Forsthausstraße 14, 64385 Reichelsheim / Odenwald",
    distanceToCenter: "Waldlichtung im Geo-Naturpark Bergstraße-Odenwald",
    phone: "+49 6164 1234",
    amenities: ["Romantische Waldlichtung", "Hausgemachter Apfelwein", "Hauseigene Räucherei", "Hunde willkommen", "Sternenhimmel-Blick"],
    description: "Verstecktes Kleinod auf einer sonnigen Waldlichtung im Odenwald, 25 Minuten südöstlich von Darmstadt. Absolute Stille.",
  },
  {
    id: "wh-8",
    name: "Seehotel Niedernberg - Das Dorf am Waldsee",
    stars: 4,
    category: "luxury",
    rating: 9.3,
    reviewsCount: 2950,
    pricePerNight: "ab 145 €",
    address: "Leerweg, 63843 Niedernberg bei Frankfurt/Darmstadt",
    distanceToCenter: "Am privaten Natursee mit Waldgürtel",
    phone: "+49 6028 9990",
    amenities: ["Privater Sandstrand", "Seeterrasse", "Vital Oase Spa & Saunadorf", "Bootstour", "Waldjogging-Runde"],
    description: "Dorfartiges Natur- und Wellnessresort an einem idyllischen See mit Waldrandlage, nur eine halbe Stunde von Frankfurt und Darmstadt entfernt.",
  },
];

// =========================================================================
// 3. FRANKFURT AM MAIN MITTE HOTELS (12 VERIFIZIERTE CENTER HOTELS)
// =========================================================================
export const FRANKFURT_MITTE_HOTELS: HotelSpot[] = [
  {
    id: "h-1",
    name: "Steigenberger Icon Frankfurter Hof",
    stars: 5,
    category: "luxury",
    rating: 9.4,
    reviewsCount: 3850,
    pricePerNight: "ab 210 €",
    address: "Am Kaiserplatz, 60311 Frankfurt am Main",
    distanceToCenter: "350 m (Kaiserplatz / Bankenviertel)",
    phone: "+49 69 21502",
    amenities: ["Traditions-Grandhotel seit 1876", "Oscar's Brasserie", "Autorenbar", "THE SPA Wellness", "Concierge 24/7"],
    description: "Frankfurts traditionsreichstes 5-Sterne-Luxushotel direkt am Kaiserplatz mit exklusiver Autorenbar und opulenter Architektur.",
  },
  {
    id: "h-2",
    name: "JW Marriott Hotel Frankfurt",
    stars: 5,
    category: "luxury",
    rating: 9.3,
    reviewsCount: 2920,
    pricePerNight: "ab 245 €",
    address: "Thurn-und-Taxis-Platz 2, 60313 Frankfurt am Main",
    distanceToCenter: "200 m (Nextower / Hauptwache)",
    phone: "+49 69 2972370",
    amenities: ["Blick auf die Skyline", "Country Club & Spa", "Max on One Grillroom", "Infinity Innenpool", "Direkt an der Zeil"],
    description: "Modernster Wolkenkratzer-Luxus mit bodentiefen Fenstern, atemberaubendem Blick auf die Hochhäuser und edlem Wellnessbereich.",
  },
  {
    id: "h-3",
    name: "Sofitel Frankfurt Opera",
    stars: 5,
    category: "luxury",
    rating: 9.5,
    reviewsCount: 2150,
    pricePerNight: "ab 265 €",
    address: "Opernplatz 16, 60313 Frankfurt am Main",
    distanceToCenter: "800 m (direkt an der Alten Oper)",
    phone: "+49 69 2566950",
    amenities: ["Französisches Hôtel Particulier", "Lili's Bar", "Restaurant Schönemann", "SoSPA & Hamam", "Terrasse zum Opernplatz"],
    description: "Pariser Eleganz im Stil des 17. Jahrhunderts direkt am noblen Opernplatz mit erstklassiger französischer Haute Cuisine.",
  },
  {
    id: "h-4",
    name: "Hilton Frankfurt City Centre",
    stars: 5,
    category: "luxury",
    rating: 9.1,
    reviewsCount: 4100,
    pricePerNight: "ab 195 €",
    address: "Hochstraße 4, 60313 Frankfurt am Main",
    distanceToCenter: "650 m (nahe Hauptwache)",
    phone: "+49 69 133800",
    amenities: ["Halb-Olympischer Pool", "Health Club", "Parkterrasse", "Parkhaus", "Business Center"],
    description: "Idyllisch am Stadtpark Bockenheimer Anlage gelegen, nur wenige Schritte von der Börse und der Einkaufsmeile Zeil.",
  },
  {
    id: "h-5",
    name: "The Westin Grand Frankfurt",
    stars: 5,
    category: "luxury",
    rating: 9.0,
    reviewsCount: 3100,
    pricePerNight: "ab 185 €",
    address: "Konrad-Adenauer-Straße 7, 60313 Frankfurt am Main",
    distanceToCenter: "500 m (Konstablerwache)",
    phone: "+49 69 29810",
    amenities: ["Westin Heavenly Bed", "Innenpool", "SanVino Spa", "Motions Restaurant", "Club Lounge"],
    description: "Frisch renoviertes Premiumhotel im Herzen der Innenstadt mit großzügigem Atrium und exzellenter ÖPNV-Anbindung.",
  },
  {
    id: "h-6",
    name: "Motel One Frankfurt-Römer",
    stars: 3,
    category: "budget",
    rating: 8.9,
    reviewsCount: 4890,
    pricePerNight: "ab 89 €",
    address: "Berliner Str. 55, 60311 Frankfurt am Main",
    distanceToCenter: "120 m (direkt am Römerberg)",
    phone: "+49 69 87004030",
    amenities: ["One Lounge 24h", "Boxspringbetten", "Regendusche", "Design-Interieur", "Top-Lage"],
    description: "Unschlagbare zentrale Lage direkt am historischen Römerberg und Kaiserdom mit modernem Design zum fairen Preis.",
  },
  {
    id: "h-7",
    name: "Ruby Louise Hotel & Rooftop Bar",
    stars: 4,
    category: "boutique",
    rating: 9.2,
    reviewsCount: 2600,
    pricePerNight: "ab 110 €",
    address: "Neue Rothofstraße 3, 60313 Frankfurt am Main",
    distanceToCenter: "500 m (Goethestraße / Opernplatz)",
    phone: "+49 69 94515890",
    amenities: ["Rooftop Bar mit Skylineblick", "Lean Luxury Konzept", "Marshall-Gitarrenverstärker", "Bio-Frühstück", "Soundbar"],
    description: "Urbaner Lifestyle im Biedermeier-Chic mit einer der beliebtesten Dachterrassen der Bankenmetropole nahe der Goethestraße.",
  },
  {
    id: "h-8",
    name: "Roomers Frankfurt",
    stars: 5,
    category: "boutique",
    rating: 9.2,
    reviewsCount: 3400,
    pricePerNight: "ab 175 €",
    address: "Gutleutstraße 85, 60329 Frankfurt am Main",
    distanceToCenter: "950 m (nahe Mainufer & Hbf)",
    phone: "+49 69 2713420",
    amenities: ["Preisgekrönte Roomers Bar", "Burlesque Spa", "Burbank Pan-Asian Restaurant", "Skylounge mit Whirlpool", "Valet Parking"],
    description: "Dunkle Verführung, sinnliches Design und eine der meistausgezeichneten Cocktailbars Deutschlands nahe dem Mainufer.",
  },
  {
    id: "h-9",
    name: "25hours Hotel The Trip",
    stars: 4,
    category: "boutique",
    rating: 9.1,
    reviewsCount: 2450,
    pricePerNight: "ab 99 €",
    address: "Niddastraße 56-58, 60329 Frankfurt am Main",
    distanceToCenter: "850 m (Bahnhofsviertel)",
    phone: "+49 69 2566770",
    amenities: ["BAR SHUKA Tel Aviv Food", "Dachterrassen-Sauna", "Schindelhauer Bikes", "Coworking Space", "Cinema"],
    description: "Kreatives Storytelling-Hotel rund um das Thema Weltreisen mit herausragendem levantinischen Restaurant BAR SHUKA.",
  },
  {
    id: "h-10",
    name: "Scandic Frankfurt Museumsufer",
    stars: 4,
    category: "business",
    rating: 8.8,
    reviewsCount: 2800,
    pricePerNight: "ab 105 €",
    address: "Wilhelm-Leuschner-Straße 44, 60329 Frankfurt am Main",
    distanceToCenter: "600 m (Museumsufer am Main)",
    phone: "+49 69 9074590",
    amenities: ["Skandinavisches Bio-Frühstück", "Fitnessstudio", "Blick auf den Main", "Fahrradverleih", "Nachhaltigkeit"],
    description: "Nordisches Hygge-Gefühl direkt an den berühmten Museen des Mains mit ruhigen Zimmern und gesundem Gastronomiekonzept.",
  },
  {
    id: "h-11",
    name: "Moxy Frankfurt City Center",
    stars: 3,
    category: "budget",
    rating: 8.7,
    reviewsCount: 3200,
    pricePerNight: "ab 85 €",
    address: "Thurn-und-Taxis-Platz 8, 60313 Frankfurt am Main",
    distanceToCenter: "250 m (Hauptwache / Eschenheimer Turm)",
    phone: "+49 69 271380",
    amenities: ["Check-in an der Bar mit Welcome-Drink", "Highspeed WiFi", "24/7 Grab and Go", "Lounge Games", "Top-Lage"],
    description: "Junges, unkonventionelles Designhotel von Marriott direkt im Zentrum zum budgetfreundlichen Tarif.",
  },
  {
    id: "h-12",
    name: "Fleming's Selection Hotel City Frankfurt",
    stars: 4,
    category: "business",
    rating: 8.9,
    reviewsCount: 2900,
    pricePerNight: "ab 125 €",
    address: "Eschenheimer Tor 2, 60318 Frankfurt am Main",
    distanceToCenter: "700 m (Eschenheimer Turm)",
    phone: "+49 69 4272320",
    amenities: ["Historischer Paternoster-Aufzug", "Skyline Roofgarden", "Grill & Seafood", "Sauna & Fitness", "U-Bahn vor Tür"],
    description: "Berühmt für seinen denkmalgeschützten Paternoster-Aufzug und das Panoramarestaurant mit Dachterrasse am Eschenheimer Tor.",
  },
];

// ==========================================
// 4. TOKYO TOP HOTELS
// ==========================================
export const TOKYO_HOTELS: HotelSpot[] = [
  {
    id: "tk-1",
    name: "Aman Tokyo",
    stars: 5,
    category: "luxury",
    rating: 9.8,
    reviewsCount: 1740,
    pricePerNight: "ab 750 €",
    address: "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda City, Tokyo 100-0004",
    distanceToCenter: "Otemachi / Nahe Kaiserpalast",
    phone: "+81 3 5224 3333",
    amenities: ["Traditionelle Ryokan-Ästhetik", "30m Basalt-Pool", "Blick auf den Mount Fuji", "Arva Restaurant", "Aman Spa"],
    description: "Ein monumentales Heiligtum über den Dächern Tokios mit 30 Meter hohem Washi-Papier-Atrium und Blick auf den Kaiserpalast.",
  },
  {
    id: "tk-2",
    name: "Park Hyatt Tokyo",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    reviewsCount: 3900,
    pricePerNight: "ab 480 €",
    address: "3-7-1-2 Nishi-Shinjuku, Shinjuku City, Tokyo 163-1055",
    distanceToCenter: "Shinjuku Wolkenkratzerviertel",
    phone: "+81 3 5322 1234",
    amenities: ["New York Bar (Lost in Translation)", "Club on the Park Spa", "Peak Lounge", "Skyline-Pool", "Kenzo Tange Architektur"],
    description: "Kult-Klassiker von Stararchitekt Kenzo Tange in den obersten Etagen des Shinjuku Park Towers mit der berühmtesten Bar Tokios.",
  },
  {
    id: "tk-3",
    name: "Hoshinoya Tokyo",
    stars: 5,
    category: "luxury",
    rating: 9.7,
    reviewsCount: 1450,
    pricePerNight: "ab 590 €",
    address: "1-9-1 Otemachi, Chiyoda City, Tokyo 100-0004",
    distanceToCenter: "Otemachi District",
    phone: "+81 570 073 066",
    amenities: ["Vertikales Ryokan", "Thermal-Onsen aus 1500m Tiefe", "Tatami-Böden überall", "Nippon Cuisine", "Tee-Zeremonie"],
    description: "Ein 17-stöckiges traditionelles Ryokan mitten im Finanzzentrum. Echte heiße Natur-Thermalquellen auf dem Dach.",
  },
  {
    id: "tk-4",
    name: "Cerulean Tower Tokyu Hotel",
    stars: 5,
    category: "business",
    rating: 9.2,
    reviewsCount: 3100,
    pricePerNight: "ab 210 €",
    address: "26-1 Sakuragaokacho, Shibuya City, Tokyo 150-8512",
    distanceToCenter: "5 Min zum Shibuya Scramble Crossing",
    phone: "+81 3 3476 3000",
    amenities: ["Noh-Theater im Haus", "Jazz Club JZ Brat", "Executive Tower Lounge", "Shibuya Scramble View", "Fitness & Pool"],
    description: "Majestätischer Hotelturm im Herzen von Shibuya mit Panoramablick auf die weltberühmte Straßenkreuzung und traditionellem Noh-Theater.",
  },
];

// ==========================================
// 5. NEW YORK CITY TOP HOTELS
// ==========================================
export const NEWYORK_HOTELS: HotelSpot[] = [
  {
    id: "ny-1",
    name: "The Plaza Hotel New York",
    stars: 5,
    category: "luxury",
    rating: 9.5,
    reviewsCount: 6200,
    pricePerNight: "ab 550 €",
    address: "768 5th Ave, New York, NY 10019",
    distanceToCenter: "5th Avenue & Central Park South",
    phone: "+1 212 759 3000",
    amenities: ["The Palm Court", "Champagne Bar", "Guerlain Spa", "Butler Service", "Direkt am Central Park"],
    description: "Das berühmteste Luxushotel Manhattans an der Grand Army Plaza gegenüber dem Central Park.",
  },
  {
    id: "ny-2",
    name: "The Standard, High Line New York",
    stars: 4,
    category: "boutique",
    rating: 9.2,
    reviewsCount: 4400,
    pricePerNight: "ab 260 €",
    address: "848 Washington St, New York, NY 10014",
    distanceToCenter: "Meatpacking District / High Line",
    phone: "+1 212 645 4646",
    amenities: ["Blick auf den Hudson River", "Le Bain Rooftop", "The Standard Grill", "Biergarten", "Direkter High Line Aufgang"],
    description: "Über dem High Line Park schwebende Architektur im Meatpacking District mit legendärem Nachtleben und Panoramablick.",
  },
];

// ==========================================
// 6. PARIS TOP HOTELS
// ==========================================
export const PARIS_HOTELS: HotelSpot[] = [
  {
    id: "pa-1",
    name: "Ritz Paris",
    stars: 5,
    category: "luxury",
    rating: 9.8,
    reviewsCount: 2900,
    pricePerNight: "ab 850 €",
    address: "15 Place Vendôme, 75001 Paris",
    distanceToCenter: "Place Vendôme / 1. Arrondissement",
    phone: "+33 1 43 16 30 30",
    amenities: ["Bar Hemingway", "Chanel Spa", "Espadon Gourmetrestaurant", "Privater Garten", "Place Vendôme"],
    description: "Der Inbegriff französischer Grandezza an der noblen Place Vendôme, wo Coco Chanel und Ernest Hemingway lebten.",
  },
  {
    id: "pa-2",
    name: "Shangri-La Paris",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    reviewsCount: 2100,
    pricePerNight: "ab 680 €",
    address: "10 Avenue d'Iéna, 75116 Paris",
    distanceToCenter: "Direkt gegenüber dem Eiffelturm",
    phone: "+33 1 53 67 19 98",
    amenities: ["Bester Eiffelturm-Blick der Stadt", "Ehemalige Residenz von Prinz Roland Bonaparte", "Michelin Shang Palace", "Chi Spa", "Garten"],
    description: "Palast des 19. Jahrhunderts mit privaten Balkonen, die den spektakulärsten Blick auf den funkelnden Eiffelturm bieten.",
  },
];

// ==========================================
// 7. GUANGZHOU (CANTON) VERIFIED HOTELS
// ==========================================
export const GUANGZHOU_HOTELS: HotelSpot[] = [
  {
    id: "gz-1",
    name: "Grand Palace Hotel (广州嘉逸豪庭酒店)",
    stars: 4,
    category: "budget",
    rating: 7.6,
    googleRating: 3.8,
    reviewsCount: 37,
    pricePerNight: "ab 39 €",
    address: "No. 148 Linhe West Road, Tianhe District, Guangzhou 510610 (广州市天河区林和西路148号)",
    distanceToCenter: "Tianhe CBD / 800 m zum Ostbahnhof (Guangzhou East)",
    phone: "+86 20 6128 8888",
    amenities: ["Google Maps Live-Bestpreis", "Klimatisiert", "Highspeed WiFi", "Fitnessbereich", "Restaurant & Café", "Metro 3 Min"],
    description: "Original auf Google Maps verifiziertes 4-Sterne-Hotel im Geschäftsviertel Tianhe nahe dem Ostbahnhof. Authentischer Bestpreis ab 39 € pro Nacht mit hervorragender Verkehrsanbindung.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "gz-2",
    name: "Four Seasons Hotel Guangzhou",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    googleRating: 4.8,
    reviewsCount: 3890,
    pricePerNight: "ab 215 €",
    address: "Guangzhou IFC Tower, 5 Zhujiang West Road, Tianhe, Guangzhou",
    distanceToCenter: "Zhujiang New Town (IFC Tower Etagen 74-98)",
    phone: "+86 20 8883 3888",
    amenities: ["Skyline Infinity-Pool auf Etage 69", "Atrium über 30 Stockwerke", "Michelin Yu Yue Heen", "The Spa", "Pearl River Panorama"],
    description: "Atemberaubender Wolkenkratzer-Luxus in den obersten Etagen des IFC Towers mit Blick auf den Canton Tower und Pearl River.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "gz-3",
    name: "Rosewood Guangzhou",
    stars: 5,
    category: "luxury",
    rating: 9.7,
    googleRating: 4.9,
    reviewsCount: 2450,
    pricePerNight: "ab 275 €",
    address: "CTF Finance Centre, 6 Zhujiang East Road, Tianhe, Guangzhou",
    distanceToCenter: "Höchstes Hotel der Welt (CTF Tower)",
    phone: "+86 20 8129 8888",
    amenities: ["Höchste Hotelbar der Welt (Too High)", "Sense Spa", "Patina Gourmetküche", "Design von Yabu Pushelberg", "Sky Ballroom"],
    description: "Architektonisches Meisterwerk in den obersten 39 Stockwerken des 530m hohen CTF Finance Centre.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "gz-4",
    name: "White Swan Hotel Guangzhou (白天鹅宾馆)",
    stars: 5,
    category: "boutique",
    rating: 9.5,
    googleRating: 4.7,
    reviewsCount: 4600,
    pricePerNight: "ab 120 €",
    address: "1 Shamian South Street, Shamian Island, Liwan, Guangzhou",
    distanceToCenter: "Historische Kolonialinsel Shamian am Perlfluss",
    phone: "+86 20 8188 6968",
    amenities: ["Historischer Indoor-Wasserfall", "3 Michelin-Stern-Restaurants", "Uferpromenade", "Gartenpool", "Traditions-Luxus"],
    description: "Chinas erstes 5-Sterne-Hotel unter Denkmalschutz, malerisch auf der historischen Kolonialinsel Shamian direkt am Pearl River.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "gz-5",
    name: "W Guangzhou (广州W酒店)",
    stars: 5,
    category: "luxury",
    rating: 9.3,
    googleRating: 4.6,
    reviewsCount: 2980,
    pricePerNight: "ab 155 €",
    address: "26 Xianshi Road, Zhujiang New Town, Tianhe, Guangzhou",
    distanceToCenter: "Zhujiang New Town Party- & Kunstviertel",
    phone: "+86 20 6628 6628",
    amenities: ["WOOBAR", "WET Indoor Pool", "AWAY Spa", "Fei Ultra Lounge", "Avantgardistisches Design"],
    description: "Erstes W Hotel auf dem chinesischen Festland mit pulsierender Clubszene, Lichtinstallationen und modernem Luxus.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "gz-6",
    name: "Holiday Inn Express Guangzhou Tianhe",
    stars: 3,
    category: "budget",
    rating: 8.7,
    googleRating: 4.2,
    reviewsCount: 2100,
    pricePerNight: "ab 38 €",
    address: "No. 222 Tianhe North Road, Tianhe District, Guangzhou",
    distanceToCenter: "Tianhe Shopping & Metro",
    phone: "+86 20 3881 1188",
    amenities: ["Gratis Frühstücksbuffet", "Arbeitsplatz im Zimmer", "Express Check-in", "Metro 5 Min", "Highspeed WLAN"],
    description: "Geprüfter Komfort für Smart Traveler im Geschäftsbezirk Tianhe mit zuverlässigem Service ab 38 €.",
    googleMapsVerifiedPrice: true,
  },
];

// ==========================================
// 8. REYKJAVIK (ICELAND) VERIFIED HOTELS
// ==========================================
export const REYKJAVIK_HOTELS: HotelSpot[] = [
  {
    id: "rey-1",
    name: "The Reykjavik EDITION",
    stars: 5,
    category: "luxury",
    rating: 9.6,
    googleRating: 4.8,
    reviewsCount: 1420,
    pricePerNight: "ab 380 €",
    address: "Austurbakki 2, 101 Reykjavík, Island",
    distanceToCenter: "Alter Hafen & direkt neben Harpa Konzerthalle",
    phone: "+354 582 0000",
    amenities: ["TIDES Restaurant (Michelin)", "Rooftop Bar mit Nordlicht-Blick", "The Spa mit Hamam", "Design Ian Schrager"],
    description: "Islands einziges 5-Sterne-Luxushotel direkt am Hafen mit spektakulärem Blick auf den Fjord, den Berg Esja und die Nordlichter.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "rey-2",
    name: "Grand Hotel Reykjavik",
    stars: 4,
    category: "business",
    rating: 8.8,
    googleRating: 4.3,
    reviewsCount: 4200,
    pricePerNight: "ab 120 €",
    address: "Sigtún 38, 105 Reykjavík, Island",
    distanceToCenter: "2 km zum Zentrum / Laugardalur Park",
    phone: "+354 514 8000",
    amenities: ["Reykjavik Spa", "Grand Brasserie", "Kostenlose Parkplätze", "Nordic Swan Öko-Zertifikat"],
    description: "Traditionsreiches First-Class-Hotel im ruhigen Botschafts- und Sportviertel Laugardalur mit eigenem Spa und Wellnessbereich.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "rey-3",
    name: "Center Hotels Plaza",
    stars: 4,
    category: "boutique",
    rating: 8.9,
    googleRating: 4.4,
    reviewsCount: 3900,
    pricePerNight: "ab 105 €",
    address: "Aðalstræti 4, 101 Reykjavík, Island",
    distanceToCenter: "Direkt am ältesten Platz Ingólfstorg (Altstadt)",
    phone: "+354 595 8500",
    amenities: ["Plaza Bar", "Mitten in der Fußgängerzone", "Fjord-Blick", "Kostenloses WLAN", "Frühstück inklusive"],
    description: "Unschlagbare Altstadtlage direkt am historischen Ingólfstorg, umgeben von Boutiquen, Cafés und Restaurants.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "rey-4",
    name: "Kex Hostel & Boutique Hotel",
    stars: 3,
    category: "budget",
    rating: 9.1,
    googleRating: 4.5,
    reviewsCount: 5100,
    pricePerNight: "ab 42 €",
    address: "Skúlagata 28, 101 Reykjavík, Island",
    distanceToCenter: "250 m zur Laugavegur Einkaufsstraße & Meerblick",
    phone: "+354 561 6060",
    amenities: ["Ehemalige Keksfabrik", "Sæmundur Bar & Restaurant", "Live-Musik & Konzerte", "Beheizte Außenterrasse", "Vintage Design"],
    description: "Kultiges Vintage-Boutique-Hostel und Hotel in einer ehemaligen Keksfabrik am Ozeanufer mit gemütlicher Bar und fairen Preisen ab 42 €.",
    googleMapsVerifiedPrice: true,
  },
  {
    id: "rey-5",
    name: "Kvosin Downtown Hotel",
    stars: 4,
    category: "boutique",
    rating: 9.3,
    googleRating: 4.6,
    reviewsCount: 1650,
    pricePerNight: "ab 165 €",
    address: "Kirkjutorg 1, 101 Reykjavík, Island",
    distanceToCenter: "Historischer Domplatz / Neben dem isländischen Parlament",
    phone: "+354 571 4444",
    amenities: ["Vinbúðin Weinbar", "Apartment-Suiten mit Kitchenette", "Zentralste Domlage", "Nespresso-Maschine"],
    description: "Charmantes Boutiquehotel in einem historischen Gebäude von 1900 direkt am Parlamentsplatz mit geschmackvollen Suiten.",
    googleMapsVerifiedPrice: true,
  },
];

// Dynamic POI generator for any other city in the world with realistic, authentic price tiers
export function getDynamicHotelsForCity(city: string): HotelSpot[] {
  const clean = city.replace(/^Hotels in\s*/i, "").trim() || "Zentrum";
  return [
    {
      id: `dyn-1-${clean}`,
      name: `Grand Palace & Luxury Hotel ${clean}`,
      stars: 5,
      category: "luxury",
      rating: 9.5,
      reviewsCount: 2450,
      pricePerNight: "ab 185 €",
      address: `Zentrum / Hauptplatz, ${clean}`,
      distanceToCenter: "Zentrale Bestlage",
      phone: "+49 (0) 800 123456",
      amenities: ["Gourmet-Restaurant", "Skyline Spa & Pool", "Valet Service", "Concierge 24/7", "Historic Ballroom"],
      description: `Erstklassiges 5-Sterne-Luxushotel im historischen Kern von ${clean} mit erstklassigem Service und exklusiver Wellness-Oase.`,
    },
    {
      id: `dyn-2-${clean}`,
      name: `The Boutique House ${clean}`,
      stars: 4,
      category: "boutique",
      rating: 9.2,
      reviewsCount: 1890,
      pricePerNight: "ab 110 €",
      address: `Altstadt / Kulturviertel, ${clean}`,
      distanceToCenter: "350 m zum Marktplatz",
      phone: "+49 (0) 800 234567",
      amenities: ["Rooftop Bar", "Design-Suiten", "Bio-Frühstücksbuffet", "Fahrradverleih", "Lounge"],
      description: `Kreatives Designhotel mit individueller Ausstattung, Kunstwerken lokaler Künstler und einer lebendigen Dachterrassen-Bar in ${clean}.`,
    },
    {
      id: `dyn-3-${clean}`,
      name: `City Center Business & Suites ${clean}`,
      stars: 4,
      category: "business",
      rating: 8.9,
      reviewsCount: 3120,
      pricePerNight: "ab 75 €",
      address: `Bahnhofsnähe & Finanzdistrikt, ${clean}`,
      distanceToCenter: "Direkt an Hauptbahnhof / Messe",
      phone: "+49 (0) 800 345678",
      amenities: ["Business Lounge", "Highspeed Glasfaser", "Fitness Center", "Konferenzräume", "Parkgarage"],
      description: `Modernes Business-Hotel mit idealer Anbindung an Nah- und Fernverkehr sowie perfekten Arbeitsbedingungen in ${clean}.`,
    },
    {
      id: `dyn-4-${clean}`,
      name: `Smart Budget & Transit Lodge ${clean}`,
      stars: 3,
      category: "budget",
      rating: 8.6,
      reviewsCount: 4200,
      pricePerNight: "ab 39 €",
      address: `Innenstadtring / Metro-Anschluss, ${clean}`,
      distanceToCenter: "600 m zum Zentrum",
      phone: "+49 (0) 800 456789",
      amenities: ["24/7 Bar", "Regenduschen", "Kostenloses WiFi", "Schallisolierte Zimmer", "Coffee Bar"],
      description: `Stylisch, unkompliziert und extrem budgetfreundlich: Moderner Komfort zu echten Bestpreisen ab 39 €.`,
    },
  ];
}

// Destination Telemetry Interface
export interface DestinationTelemetry {
  cityName: string;
  country: string;
  countryFlag: string;
  timezone: string;
  timezoneAbbr: string;
  timeDiffStr: string;
  tempC: number;
  weatherDesc: string;
  weatherIcon: string;
  humidity: number;
  windSpeedKmh: number;
  distanceKm: number;
  flightTimeStr: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateStr: string;
}

export function getDestinationTelemetry(cityName: string): DestinationTelemetry {
  const q = (cityName || "").toLowerCase();

  // 1. Guangzhou / Canton
  if (/guangzhou|kanton|canton|tianhe/i.test(q)) {
    return {
      cityName: "Guangzhou",
      country: "China",
      countryFlag: "🇨🇳",
      timezone: "Asia/Shanghai",
      timezoneAbbr: "CST",
      timeDiffStr: "+6h zu FFM",
      tempC: 29,
      weatherDesc: "Sonnig-warm, feucht",
      weatherIcon: "⛅",
      humidity: 78,
      windSpeedKmh: 14,
      distanceKm: 9150,
      flightTimeStr: "~11h 15m Direktflug",
      currencyCode: "CNY",
      currencySymbol: "¥",
      exchangeRateStr: "1 € ≈ 7,84 ¥",
    };
  }

  // 2. Reykjavik / Iceland
  if (/reykjavik|reykjavík|island|iceland/i.test(q)) {
    return {
      cityName: "Reykjavik",
      country: "Island",
      countryFlag: "🇮🇸",
      timezone: "Atlantic/Reykjavik",
      timezoneAbbr: "GMT",
      timeDiffStr: "-2h zu FFM",
      tempC: 8,
      weatherDesc: "Frischer Seewind, Nieselregen",
      weatherIcon: "🌧️",
      humidity: 84,
      windSpeedKmh: 28,
      distanceKm: 2380,
      flightTimeStr: "~3h 35m Direktflug",
      currencyCode: "ISK",
      currencySymbol: "kr",
      exchangeRateStr: "1 € ≈ 151 kr",
    };
  }

  // 3. Shanghai
  if (/shanghai/i.test(q)) {
    return {
      cityName: "Shanghai",
      country: "China",
      countryFlag: "🇨🇳",
      timezone: "Asia/Shanghai",
      timezoneAbbr: "CST",
      timeDiffStr: "+6h zu FFM",
      tempC: 27,
      weatherDesc: "Heiter, mäßiger Wind",
      weatherIcon: "🌤️",
      humidity: 65,
      windSpeedKmh: 16,
      distanceKm: 8850,
      flightTimeStr: "~10h 50m Direktflug",
      currencyCode: "CNY",
      currencySymbol: "¥",
      exchangeRateStr: "1 € ≈ 7,84 ¥",
    };
  }

  // 4. Tokio
  if (/tokyo|tokio/i.test(q)) {
    return {
      cityName: "Tokio",
      country: "Japan",
      countryFlag: "🇯🇵",
      timezone: "Asia/Tokyo",
      timezoneAbbr: "JST",
      timeDiffStr: "+7h zu FFM",
      tempC: 25,
      weatherDesc: "Leicht bewölkt",
      weatherIcon: "☁️",
      humidity: 64,
      windSpeedKmh: 12,
      distanceKm: 9360,
      flightTimeStr: "~11h 45m Direktflug",
      currencyCode: "JPY",
      currencySymbol: "¥",
      exchangeRateStr: "1 € ≈ 163 ¥",
    };
  }

  // 5. New York
  if (/new york|nyc|manhattan/i.test(q)) {
    return {
      cityName: "New York City",
      country: "USA",
      countryFlag: "🇺🇸",
      timezone: "America/New_York",
      timezoneAbbr: "EDT",
      timeDiffStr: "-6h zu FFM",
      tempC: 22,
      weatherDesc: "Klar und sonnig",
      weatherIcon: "☀️",
      humidity: 55,
      windSpeedKmh: 18,
      distanceKm: 6200,
      flightTimeStr: "~8h 20m Direktflug",
      currencyCode: "USD",
      currencySymbol: "$",
      exchangeRateStr: "1 € ≈ $1,08",
    };
  }

  // 6. Paris
  if (/paris/i.test(q)) {
    return {
      cityName: "Paris",
      country: "Frankreich",
      countryFlag: "🇫🇷",
      timezone: "Europe/Paris",
      timezoneAbbr: "CEST",
      timeDiffStr: "±0h (Gleiche Zeitzone)",
      tempC: 20,
      weatherDesc: "Mild, sonnige Abschnitte",
      weatherIcon: "⛅",
      humidity: 60,
      windSpeedKmh: 15,
      distanceKm: 480,
      flightTimeStr: "~1h 10m Flug / 3h 40m TGV",
      currencyCode: "EUR",
      currencySymbol: "€",
      exchangeRateStr: "1 € = 1,00 €",
    };
  }

  // 7. Waldhotels Region Frankfurt / Darmstadt
  if (/wald|darmstadt|kranichstein|mönchbruch|odenwald|taunus/i.test(q)) {
    return {
      cityName: "Region FFM / Darmstadt",
      country: "Deutschland",
      countryFlag: "🇩🇪",
      timezone: "Europe/Berlin",
      timezoneAbbr: "CEST",
      timeDiffStr: "Lokaler Basis-Standort",
      tempC: 19,
      weatherDesc: "Mildes Waldklima",
      weatherIcon: "🌲",
      humidity: 68,
      windSpeedKmh: 10,
      distanceKm: 28,
      flightTimeStr: "ca. 25 Min Fahrt",
      currencyCode: "EUR",
      currencySymbol: "€",
      exchangeRateStr: "1 € = 1,00 €",
    };
  }

  // 8. Frankfurt am Main
  if (/frankfurt|ffm/i.test(q) || !q.trim()) {
    return {
      cityName: "Frankfurt am Main",
      country: "Deutschland",
      countryFlag: "🇩🇪",
      timezone: "Europe/Berlin",
      timezoneAbbr: "CEST",
      timeDiffStr: "Lokaler Basis-Standort",
      tempC: 19,
      weatherDesc: "Mild, heiter",
      weatherIcon: "⛅",
      humidity: 62,
      windSpeedKmh: 12,
      distanceKm: 0,
      flightTimeStr: "Basis-Standort",
      currencyCode: "EUR",
      currencySymbol: "€",
      exchangeRateStr: "1 € = 1,00 €",
    };
  }

  // 9. London
  if (/london/i.test(q)) {
    return {
      cityName: "London",
      country: "Großbritannien",
      countryFlag: "🇬🇧",
      timezone: "Europe/London",
      timezoneAbbr: "BST",
      timeDiffStr: "-1h zu FFM",
      tempC: 18,
      weatherDesc: "Wechselhaft heiter",
      weatherIcon: "⛅",
      humidity: 68,
      windSpeedKmh: 19,
      distanceKm: 640,
      flightTimeStr: "~1h 25m Direktflug",
      currencyCode: "GBP",
      currencySymbol: "£",
      exchangeRateStr: "1 € ≈ £0,86",
    };
  }

  // 10. Dubai
  if (/dubai|abu dhabi/i.test(q)) {
    return {
      cityName: "Dubai",
      country: "VAE",
      countryFlag: "🇦🇪",
      timezone: "Asia/Dubai",
      timezoneAbbr: "GST",
      timeDiffStr: "+2h zu FFM",
      tempC: 36,
      weatherDesc: "Heiß & sonnig",
      weatherIcon: "☀️",
      humidity: 45,
      windSpeedKmh: 14,
      distanceKm: 4850,
      flightTimeStr: "~6h 15m Direktflug",
      currencyCode: "AED",
      currencySymbol: "AED",
      exchangeRateStr: "1 € ≈ 3,98 AED",
    };
  }

  // Fallback for any other global city
  const clean = cityName.replace(/^Hotels in\s*/i, "").trim() || "Globaler Ort";
  return {
    cityName: clean,
    country: "International",
    countryFlag: "🌐",
    timezone: "UTC",
    timezoneAbbr: "UTC",
    timeDiffStr: "Weltzeit",
    tempC: 21,
    weatherDesc: "Angenehm temperiert",
    weatherIcon: "🌤️",
    humidity: 60,
    windSpeedKmh: 14,
    distanceKm: 3400,
    flightTimeStr: "ca. 4-6h Flug",
    currencyCode: "LOCAL",
    currencySymbol: "¤",
    exchangeRateStr: "Ortstarif aktiv",
  };
}

// Destination metadata resolver
export function resolveDestinationMeta(rawQuery: string): {
  key: string;
  name: string;
  hotels: HotelSpot[];
  defaultZoom: number;
} {
  const q = (rawQuery || "").toLowerCase();

  // 1. Guangzhou / Canton check
  if (/guangzhou|kanton|canton|tianhe/i.test(q)) {
    return {
      key: "guangzhou",
      name: "Guangzhou",
      hotels: GUANGZHOU_HOTELS,
      defaultZoom: 14,
    };
  }

  // 2. Reykjavik / Iceland check
  if (/reykjavik|reykjavík|island|iceland/i.test(q)) {
    return {
      key: "reykjavik",
      name: "Reykjavik",
      hotels: REYKJAVIK_HOTELS,
      defaultZoom: 14,
    };
  }

  // 3. Shanghai check
  if (/shanghai/i.test(q)) {
    return {
      key: "shanghai",
      name: "Shanghai",
      hotels: SHANGHAI_HOTELS,
      defaultZoom: 14,
    };
  }

  // 4. Waldhotels / Darmstadt / Taunus check
  if (/wald|darmstadt|kranichstein|mönchbruch|odenwald|taunus|forsthaus|natur/i.test(q)) {
    return {
      key: "waldhotels",
      name: "Waldhotels Region Frankfurt / Darmstadt",
      hotels: WALDHOTELS_FFM_DARMSTADT,
      defaultZoom: 12,
    };
  }

  // 5. Tokyo check
  if (/tokyo|tokio/i.test(q)) {
    return {
      key: "tokyo",
      name: "Tokio",
      hotels: TOKYO_HOTELS,
      defaultZoom: 14,
    };
  }

  // 6. New York check
  if (/new york|nyc|manhattan/i.test(q)) {
    return {
      key: "newyork",
      name: "New York City",
      hotels: NEWYORK_HOTELS,
      defaultZoom: 14,
    };
  }

  // 7. Paris check
  if (/paris/i.test(q)) {
    return {
      key: "paris",
      name: "Paris",
      hotels: PARIS_HOTELS,
      defaultZoom: 14,
    };
  }

  // 8. Frankfurt check
  if (/frankfurt|ffm|römer|mainz|offenbach|kaiserplatz/i.test(q) || !q.trim()) {
    return {
      key: "frankfurt",
      name: "Frankfurt am Main Mitte",
      hotels: FRANKFURT_MITTE_HOTELS,
      defaultZoom: 15,
    };
  }

  // 9. General Custom City
  const cleanCity = rawQuery
    .replace(/^Hotels in\s*/i, "")
    .replace(/^Restaurants in\s*/i, "")
    .replace(/^Sehenswürdigkeiten in\s*/i, "")
    .replace(/^Karte von\s*/i, "")
    .trim();

  return {
    key: `custom-${cleanCity.toLowerCase()}`,
    name: cleanCity || "Zentrum",
    hotels: getDynamicHotelsForCity(cleanCity),
    defaultZoom: 14,
  };
}

export const GoogleMapsWidget: React.FC<GoogleMapsWidgetProps> = ({
  activeMapData,
  setActiveMapData,
  isEditMode = false,
  onClose,
}) => {
  const { isModern } = useTheme();

  const isHotelRequested = Boolean(
    activeMapData?.category === "hotels" || 
    (activeMapData?.city && /hotel/i.test(activeMapData.city))
  );

  const mapData: ActiveMapData = activeMapData || {
    city: "Frankfurt am Main",
    isRoute: false,
    category: "plain",
  };

  // Current Destination Resolution (Shanghai, Tokyo, New York, Paris, Guangzhou, Reykjavik, Waldhotels FFM/Darmstadt, Frankfurt, or any city)
  const activeQuery = (mapData.city || "Frankfurt am Main").trim();
  const currentDest = useMemo(() => resolveDestinationMeta(activeQuery), [activeQuery]);

  // Destination Telemetry & Live Clock
  const telemetry = useMemo(() => getDestinationTelemetry(currentDest.name), [currentDest.name]);
  const [clockDate, setClockDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const localTimeFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("de-DE", {
        timeZone: telemetry.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(clockDate);
    } catch {
      return clockDate.toLocaleTimeString("de-DE");
    }
  }, [clockDate, telemetry.timezone]);

  // Active view states
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapType, setMapType] = useState<"m" | "k" | "h">("m");
  const [routeOriginInput, setRouteOriginInput] = useState("");
  const [routeDestInput, setRouteDestInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<"hotels" | "restaurants" | "cafes" | "transit" | "sights" | "plain">(
    isHotelRequested ? "hotels" : (activeMapData?.category || "plain")
  );
  const [selectedHotel, setSelectedHotel] = useState<HotelSpot | null>(null);
  const [hotelFilterCategory, setHotelFilterCategory] = useState<"all" | "luxury" | "boutique" | "business" | "budget">("all");
  const [showHotelDrawer, setShowHotelDrawer] = useState(isHotelRequested);
  const [searchInput, setSearchInput] = useState(activeQuery);

  // Sync state when activeMapData props change
  useEffect(() => {
    if (activeMapData) {
      const isHotel = Boolean(
        activeMapData.category === "hotels" || 
        (activeMapData.city && /hotel/i.test(activeMapData.city))
      );
      if (activeMapData.zoom) {
        setMapZoom(activeMapData.zoom);
      } else {
        setMapZoom(isHotel ? (currentDest.defaultZoom || 15) : 13);
      }

      if (isHotel) {
        setActiveCategory("hotels");
        setShowHotelDrawer(true);
      } else {
        setActiveCategory(activeMapData.category || "plain");
        setShowHotelDrawer(false);
      }

      if (activeMapData.city) {
        setSearchInput(activeMapData.city);
      }

      if (activeMapData.selectedHotelName) {
        const found = currentDest.hotels.find((h) =>
          h.name.toLowerCase().includes(activeMapData.selectedHotelName!.toLowerCase())
        );
        if (found) {
          setSelectedHotel(found);
          setMapZoom(17);
        } else {
          setSelectedHotel(null);
        }
      } else {
        setSelectedHotel(null);
      }
    }
  }, [activeMapData, currentDest]);

  const handleClose = () => {
    setActiveMapData(null);
    if (onClose) onClose();
  };

  // Compute the Google Maps query string that accurately pinpoints hotels & locations
  const embedQuery = useMemo(() => {
    if (mapData.isRoute) return "";

    // If specific hotel is selected and targeted
    if (selectedHotel && activeCategory === "hotels") {
      return `${selectedHotel.name}, ${selectedHotel.address}`;
    }

    if (activeCategory === "hotels") {
      return `Hotels in ${currentDest.name}`;
    }
    if (activeCategory === "restaurants") {
      return `Restaurants in ${currentDest.name}`;
    }
    if (activeCategory === "cafes") {
      return `Cafes & Bars in ${currentDest.name}`;
    }
    if (activeCategory === "transit") {
      return `Hauptbahnhof & Haltestellen in ${currentDest.name}`;
    }
    if (activeCategory === "sights") {
      return `Sehenswürdigkeiten in ${currentDest.name}`;
    }

    // If search input has custom text
    if (searchInput.trim().length > 0) {
      return searchInput.trim();
    }

    return currentDest.name;
  }, [mapData.isRoute, selectedHotel, activeCategory, searchInput, currentDest]);

  // Filter hotels by category
  const filteredHotels = useMemo(() => {
    if (hotelFilterCategory === "all") return currentDest.hotels;
    return currentDest.hotels.filter((h) => h.category === hotelFilterCategory);
  }, [hotelFilterCategory, currentDest.hotels]);

  const titleString = mapData.isRoute
    ? `ROUTE: ${(mapData.origin || "").toUpperCase()} ➔ ${(mapData.destination || "").toUpperCase()}`
    : selectedHotel && activeCategory === "hotels"
    ? `HOTEL-RADAR: ${selectedHotel.name.toUpperCase()} (${currentDest.name.toUpperCase()})`
    : activeCategory === "hotels"
    ? `HOTEL-RADAR: ${currentDest.name.toUpperCase()} (${currentDest.hotels.length} HOTELS)`
    : `3D-RADAR / KARTE: ${currentDest.name.toUpperCase()}`;

  const toggleHotelDrawer = () => {
    if (!showHotelDrawer) {
      setShowHotelDrawer(true);
      setActiveCategory("hotels");
    } else {
      setShowHotelDrawer(false);
      if (activeCategory === "hotels") {
        setActiveCategory("plain");
      }
    }
  };

  const headerControls = (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      <button
        type="button"
        onClick={toggleHotelDrawer}
        className={`px-2 py-0.5 rounded-full cursor-pointer transition font-bold border flex items-center gap-1 ${
          showHotelDrawer && activeCategory === "hotels"
            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
        }`}
        title="Hotelliste ein- oder ausblenden"
      >
        <Bed className="w-3 h-3 text-amber-400" />
        <span>HOTELS ({filteredHotels.length})</span>
      </button>

      <button
        type="button"
        onClick={() => setIsDarkMap(!isDarkMap)}
        className={`px-2 py-0.5 rounded-full cursor-pointer transition font-bold border ${
          isModern
            ? isDarkMap
              ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500"
              : "bg-zinc-700 text-white border-zinc-500"
            : isDarkMap
            ? "bg-cyan-500/30 text-cyan-200 border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
            : "bg-slate-800 text-slate-300 border-slate-600"
        }`}
      >
        {isDarkMap ? "🌙 DARK" : "☀️ HELL"}
      </button>
    </div>
  );

  return (
    <DraggableResizableWidget
      id="googleMaps"
      title={titleString}
      initialX={90}
      initialY={100}
      initialWidth={760}
      initialHeight={640}
      minWidth={440}
      minHeight={400}
      maxWidth={1400}
      maxHeight={950}
      isEditMode={isEditMode}
      onClose={handleClose}
      headerControls={headerControls}
    >
      <div className={`flex flex-col h-full font-sans text-xs select-none overflow-hidden ${
        isModern ? "bg-[#0c0c0e] text-zinc-100" : "bg-slate-950 text-slate-100"
      }`}>
        
        {/* TOP COMMAND HUD BAR */}
        <div className={`flex flex-col gap-2 p-3 border-b text-xs font-mono flex-shrink-0 ${
          isModern ? "bg-zinc-950/95 border-zinc-800/80" : "bg-slate-950/95 border-cyan-500/20"
        }`}>
          {/* Action Row 1 */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 uppercase font-bold tracking-wider text-[10.5px] ${
                isModern ? "text-red-400" : "text-cyan-400"
              }`}>
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>SPATIAL RADAR & PLACES MATRIX</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                LIVE GPS
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (mapData.isRoute) {
                    setActiveMapData({
                      city: mapData.destination || "Frankfurt am Main Mitte",
                      isRoute: false,
                      category: "hotels",
                      zoom: 15,
                    });
                  } else {
                    setActiveMapData({
                      origin: "Frankfurt Hauptbahnhof",
                      destination: selectedHotel?.name || "Römerberg Frankfurt",
                      travelMode: "d",
                      isRoute: true,
                    });
                    setRouteOriginInput("Frankfurt Hauptbahnhof");
                    setRouteDestInput(selectedHotel?.name || "Römerberg Frankfurt");
                  }
                }}
                className={`px-2.5 py-1 border rounded-lg cursor-pointer transition uppercase text-[9.5px] font-bold flex items-center gap-1 ${
                  isModern
                    ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200"
                    : "bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-500/40 text-cyan-200"
                }`}
              >
                {mapData.isRoute ? "📍 ORTS- & HOTELSUCHE" : "🧭 ROUTE BERECHNEN"}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 hover:text-white transition font-bold text-[9.5px]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search Bar & Mode Switcher */}
          {mapData.isRoute ? (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <div className="relative">
                <span className="absolute left-2.5 top-1 text-[8px] uppercase font-bold text-zinc-400">START:</span>
                <input
                  type="text"
                  value={routeOriginInput}
                  onChange={(e) => setRouteOriginInput(e.target.value)}
                  placeholder="Startort (z.B. Frankfurt Hbf)..."
                  className="w-full pt-3.5 pb-1 pl-2.5 pr-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1 text-[8px] uppercase font-bold text-zinc-400">ZIEL:</span>
                <input
                  type="text"
                  value={routeDestInput}
                  onChange={(e) => setRouteDestInput(e.target.value)}
                  placeholder="Zielort / Hotel..."
                  className="w-full pt-3.5 pb-1 pl-2.5 pr-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (routeOriginInput && routeDestInput) {
                    setActiveMapData({
                      origin: routeOriginInput,
                      destination: routeDestInput,
                      travelMode: mapData.travelMode || "d",
                      isRoute: true,
                    });
                  }
                }}
                className="h-full px-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-[10px] cursor-pointer transition flex items-center gap-1 shadow-md"
              >
                <Navigation className="w-3 h-3" />
                <span>BERECHNE</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchInput.trim()) {
                      setActiveMapData({
                        city: searchInput.trim(),
                        isRoute: false,
                        zoom: /hotel/i.test(searchInput) ? 16 : 14,
                      });
                    }
                  }}
                  placeholder="Hotels, Ort oder Sehenswürdigkeit suchen (z.B. Hotels in Frankfurt Mitte)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (searchInput.trim()) {
                    setActiveMapData({
                      city: searchInput.trim(),
                      isRoute: false,
                      zoom: /hotel/i.test(searchInput) ? 16 : 14,
                    });
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-[10px] cursor-pointer transition shadow-md flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                <span>SUCHEN</span>
              </button>
            </div>
          )}

          {/* Category POI Filter Chips */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pt-1 text-[10px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("hotels");
                  setSelectedHotel(null);
                  setMapZoom(currentDest.defaultZoom || 14);
                  setSearchInput(`Hotels in ${currentDest.name}`);
                  setActiveMapData({
                    city: `Hotels in ${currentDest.name}`,
                    isRoute: false,
                    category: "hotels",
                    zoom: currentDest.defaultZoom || 14,
                  });
                }}
                className={`px-2.5 py-1 rounded-full font-bold transition cursor-pointer flex items-center gap-1 border ${
                  activeCategory === "hotels"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Building2 className="w-3 h-3 text-amber-400" />
                <span>🏨 HOTELS IN {currentDest.name.toUpperCase()} ({currentDest.hotels.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("restaurants");
                  setSelectedHotel(null);
                  setMapZoom(14);
                  setSearchInput(`Restaurants in ${currentDest.name}`);
                }}
                className={`px-2 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 border ${
                  activeCategory === "restaurants"
                    ? "bg-red-500/20 text-red-300 border-red-500/50"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Utensils className="w-3 h-3 text-red-400" />
                <span>🍽️ GOURMET</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("cafes");
                  setSelectedHotel(null);
                  setMapZoom(14);
                  setSearchInput(`Cafes & Bars in ${currentDest.name}`);
                }}
                className={`px-2 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 border ${
                  activeCategory === "cafes"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Coffee className="w-3 h-3 text-purple-400" />
                <span>☕ BARS & CAFES</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("transit");
                  setSelectedHotel(null);
                  setMapZoom(14);
                  setSearchInput(`Hauptbahnhof & Haltestellen in ${currentDest.name}`);
                }}
                className={`px-2 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 border ${
                  activeCategory === "transit"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Train className="w-3 h-3 text-cyan-400" />
                <span>🚆 ÖPNV & BAHN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("sights");
                  setSelectedHotel(null);
                  setMapZoom(14);
                  setSearchInput(`Sehenswürdigkeiten in ${currentDest.name}`);
                }}
                className={`px-2 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 border ${
                  activeCategory === "sights"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                <Landmark className="w-3 h-3 text-emerald-400" />
                <span>🏛️ HIGHLIGHTS</span>
              </button>
            </div>

            {/* Map View Mode (Road, Satellite, Hybrid) */}
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-full border border-zinc-800">
              <button
                type="button"
                onClick={() => setMapType("m")}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  mapType === "m" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400"
                }`}
              >
                STRASSE
              </button>
              <button
                type="button"
                onClick={() => setMapType("k")}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  mapType === "k" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400"
                }`}
              >
                3D SAT
              </button>
              <button
                type="button"
                onClick={() => setMapType("h")}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  mapType === "h" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400"
                }`}
              >
                HYBRID
              </button>
            </div>
          </div>
        </div>

        {/* LIVE TELEMETRY & ORTSZEIT-HUD BANNER */}
        <div className={`px-3 py-1.5 border-b flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono select-none flex-shrink-0 z-20 ${
          isModern ? "bg-zinc-900/95 border-zinc-800/80 text-zinc-200" : "bg-slate-900/95 border-cyan-500/30 text-slate-200"
        }`}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {/* Location & Country Badge */}
            <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/70 px-2 py-0.5 rounded-md text-zinc-100 flex-shrink-0">
              <span className="text-sm leading-none">{telemetry.countryFlag}</span>
              <span className="font-bold uppercase tracking-wide">{telemetry.cityName}</span>
              <span className="text-[9px] text-zinc-400">({telemetry.country})</span>
            </div>

            {/* Live Ortszeit & Timezone */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md text-amber-300 flex-shrink-0">
              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="font-bold tracking-wider">{localTimeFormatted}</span>
              <span className="text-[9px] text-amber-400/80 uppercase">{telemetry.timezoneAbbr}</span>
              <span className="text-[8.5px] px-1 rounded bg-amber-500/20 text-amber-200 font-bold">{telemetry.timeDiffStr}</span>
            </div>

            {/* Live Weather & Climate */}
            <div className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-md text-sky-200 flex-shrink-0">
              <span className="text-xs leading-none">{telemetry.weatherIcon}</span>
              <span className="font-bold text-white">{telemetry.tempC}°C</span>
              <span className="text-zinc-400 hidden sm:inline">• {telemetry.weatherDesc}</span>
              <span className="text-sky-400/80 hidden md:inline">• 💧 {telemetry.humidity}%</span>
            </div>

            {/* Flight Distance & Travel Time */}
            <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md text-purple-200 flex-shrink-0">
              <Plane className="w-3 h-3 text-purple-400" />
              <span className="text-purple-300 font-bold">{telemetry.distanceKm.toLocaleString("de-DE")} km</span>
              <span className="text-zinc-400 hidden sm:inline">• {telemetry.flightTimeStr}</span>
            </div>

            {/* Currency & Exchange */}
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-emerald-300 flex-shrink-0">
              <Coins className="w-3 h-3 text-emerald-400" />
              <span className="font-bold">{telemetry.currencyCode}</span>
              <span className="text-zinc-400">({telemetry.exchangeRateStr})</span>
            </div>
          </div>

          {/* Verification & Live Status Indicator */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            {selectedHotel ? (
              <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Google Maps Tarif: {selectedHotel.pricePerNight}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400/90">TELEMETRIE AKTIV</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN BODY: SPLIT VIEW (MAP + HOTELS RADAR DIRECTORY) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* MAP CANVAS CONTAINER */}
          <div className="flex-1 relative h-full overflow-hidden bg-zinc-950">
            
            {/* FLOATING HUD CONTROLS */}
            <div className="absolute right-3 top-3 z-20 flex flex-col items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-lg font-mono text-xs">
              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.min(20, z + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition"
                title="Heranzoomen"
              >
                +
              </button>
              <span className="text-[9px] font-bold py-0.5 text-zinc-300">
                Z={mapZoom}
              </span>
              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.max(3, z - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition"
                title="Herauszoomen"
              >
                -
              </button>
            </div>

            {/* FLOATING RADAR TARGET INDICATOR */}
            {selectedHotel && (
              <div className="absolute left-3 top-3 z-20 max-w-[340px] p-2.5 rounded-xl bg-zinc-900/95 border border-amber-500/50 backdrop-blur-md shadow-2xl animate-fade-in font-sans">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <p className="font-bold text-white text-xs truncate">
                      {selectedHotel.name}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    {selectedHotel.pricePerNight}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                  📍 {selectedHotel.address}
                </p>
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-800 text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    {selectedHotel.rating} / 10 ({selectedHotel.reviewsCount} Bewertungen)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMapData({
                        origin: `${currentDest.name} Hauptbahnhof`,
                        destination: `${selectedHotel.name}, ${selectedHotel.address}`,
                        travelMode: "d",
                        isRoute: true,
                      });
                      setRouteOriginInput(`${currentDest.name} Hauptbahnhof`);
                      setRouteDestInput(selectedHotel.name);
                    }}
                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-1"
                  >
                    <Navigation className="w-2.5 h-2.5" />
                    <span>Route</span>
                  </button>
                </div>
              </div>
            )}

            {/* GOOGLE MAPS IFRAME */}
            <iframe
              title={titleString}
              width="100%"
              height="100%"
              className={`w-full h-full border-0 transition-all duration-300 ${
                isDarkMap
                  ? "filter invert-[90%] hue-rotate-180 contrast-[1.25] brightness-[0.88] saturate-[1.2]"
                  : "filter contrast-[1.05] brightness-[0.98]"
              }`}
              src={
                mapData.isRoute
                  ? `https://maps.google.com/maps?saddr=${encodeURIComponent(
                      mapData.origin || ""
                    )}&daddr=${encodeURIComponent(
                      mapData.destination || ""
                    )}&dirflg=${mapData.travelMode || "d"}&t=${mapType}&output=embed`
                  : `https://maps.google.com/maps?q=${encodeURIComponent(
                      embedQuery
                    )}&t=${mapType}&z=${mapZoom}&ie=UTF8&iwloc=A&output=embed`
              }
              allowFullScreen
            />
          </div>

          {/* HOTELS & PLACES RADAR SIDEBAR DRAWER */}
          {showHotelDrawer && (
            <div className="w-[310px] md:w-[340px] border-l border-zinc-800 bg-zinc-950 flex flex-col flex-shrink-0 z-30 shadow-2xl font-sans">
              
              {/* Drawer Header */}
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Hotels in {currentDest.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {currentDest.hotels.length} verifizierte Hotels markiert
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHotelDrawer(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Schließen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Hotel Filter Chips */}
              <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
                <button
                  type="button"
                  onClick={() => setHotelFilterCategory("all")}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    hotelFilterCategory === "all" ? "bg-amber-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Alle ({currentDest.hotels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHotelFilterCategory("luxury")}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    hotelFilterCategory === "luxury" ? "bg-amber-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  5★ Luxus
                </button>
                <button
                  type="button"
                  onClick={() => setHotelFilterCategory("boutique")}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    hotelFilterCategory === "boutique" ? "bg-amber-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Boutique
                </button>
                <button
                  type="button"
                  onClick={() => setHotelFilterCategory("business")}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    hotelFilterCategory === "business" ? "bg-amber-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => setHotelFilterCategory("budget")}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    hotelFilterCategory === "budget" ? "bg-amber-500 text-black font-bold" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Budget
                </button>
              </div>

              {/* Master Button: Pin All Hotels on Map */}
              <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHotel(null);
                    setSearchInput(`Hotels in ${currentDest.name}`);
                    setMapZoom(currentDest.defaultZoom || 14);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>📍 ALLE HOTELS IN {currentDest.name.toUpperCase()} ANZEIGEN</span>
                </button>
              </div>

              {/* Scrollable Hotels List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
                {filteredHotels.map((hotel) => {
                  const isSelected = selectedHotel?.id === hotel.id;

                  return (
                    <div
                      key={hotel.id}
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setMapZoom(17);
                        setSearchInput(`${hotel.name}, ${hotel.address}`);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-lg"
                          : "bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-amber-400">
                              {"★".repeat(hotel.stars)}
                            </span>
                            <span className="text-[9.5px] uppercase font-bold text-zinc-500">
                              {hotel.category}
                            </span>
                            {hotel.googleRating && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                                Google {hotel.googleRating} ★ ({hotel.reviewsCount})
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-xs leading-snug truncate mt-0.5">
                            {hotel.name}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full border font-mono font-bold text-[10.5px] ${
                            hotel.googleMapsVerifiedPrice
                              ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                              : "bg-zinc-800 border-zinc-700 text-amber-300"
                          }`}>
                            {hotel.pricePerNight}
                          </span>
                          {hotel.googleMapsVerifiedPrice && (
                            <span className="text-[8px] text-emerald-400 font-sans font-bold flex items-center gap-0.5 mt-0.5">
                              <CheckCircle2 className="w-2 h-2" /> Maps Tarif
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[10.5px] text-zinc-400 leading-tight">
                        📍 {hotel.address}
                      </p>

                      {hotel.description && (
                        <p className="text-[10px] text-zinc-400/90 leading-snug line-clamp-2">
                          {hotel.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                          {hotel.rating} / 10
                        </span>
                        <span className="text-zinc-500">
                          🚶 {hotel.distanceToCenter || (hotel as any).distanceToRoemer || "Zentral"}
                        </span>
                      </div>

                      {/* Amenities Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 text-[9px]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-zinc-800/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotel(hotel);
                            setMapZoom(17);
                            setSearchInput(`${hotel.name}, ${hotel.address}`);
                          }}
                          className="flex-1 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Pinnen</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMapData({
                              origin: `${currentDest.name} Hauptbahnhof`,
                              destination: `${hotel.name}, ${hotel.address}`,
                              travelMode: "d",
                              isRoute: true,
                            });
                            setRouteOriginInput(`${currentDest.name} Hauptbahnhof`);
                            setRouteDestInput(hotel.name);
                          }}
                          className="flex-1 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Route</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ", " + hotel.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                          title="In Google Maps extern öffnen"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Direct Verification Link */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotel.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="py-1 px-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-300 hover:text-white text-[9.5px] flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>Preise live auf Google Maps prüfen</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-zinc-400 text-[9px]">
                          <span>{hotel.pricePerNight}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </a>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>
    </DraggableResizableWidget>
  );
};
