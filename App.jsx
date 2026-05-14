import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Marker, Popup, Source, Layer, useMap } from "react-map-gl/maplibre";
import Rev from "./Rev";
import "maplibre-gl/dist/maplibre-gl.css";

const DARK_OVERLAY =
  "linear-gradient(90deg,rgba(0,0,0,0.94) 0%,rgba(0,0,0,0.80) 40%,rgba(0,0,0,0.88) 100%)";

const bgPresets = [
  {
    id: "racing",
    name: "Racing Red",
    emoji: "🏁",
    preview: "linear-gradient(135deg,#1a0404 0%,#2d0707 50%,#0a0000 100%)",
    mainStyle: {
      backgroundColor: "#050505",
      backgroundImage: `linear-gradient(90deg,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.84) 22%,rgba(0,0,0,0.80) 52%,rgba(0,0,0,0.94) 100%),radial-gradient(circle at 70% 20%,rgba(220,38,38,0.22),transparent 32%),radial-gradient(circle at 25% 75%,rgba(249,115,22,0.14),transparent 35%),repeating-linear-gradient(-35deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 2px,transparent 2px,transparent 120px)`,
      backgroundAttachment: "fixed",
    },
  },
  {
    id: "night",
    name: "Nachtfahrt",
    emoji: "🌙",
    preview: "linear-gradient(135deg,#020510 0%,#0a0a2e 50%,#020510 100%)",
    mainStyle: {
      backgroundColor: "#020510",
      backgroundImage: `linear-gradient(90deg,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.82) 22%,rgba(0,0,0,0.78) 52%,rgba(0,0,0,0.94) 100%),radial-gradient(circle at 70% 20%,rgba(59,130,246,0.18),transparent 32%),radial-gradient(circle at 25% 75%,rgba(139,92,246,0.12),transparent 35%),repeating-linear-gradient(-35deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 2px,transparent 2px,transparent 120px)`,
      backgroundAttachment: "fixed",
    },
  },
  {
    id: "forest",
    name: "Waldstraße",
    emoji: "🌲",
    preview: "linear-gradient(135deg,#020a05 0%,#051a0a 50%,#020a05 100%)",
    mainStyle: {
      backgroundColor: "#020a05",
      backgroundImage: `linear-gradient(90deg,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.82) 22%,rgba(0,0,0,0.78) 52%,rgba(0,0,0,0.94) 100%),radial-gradient(circle at 70% 20%,rgba(34,197,94,0.16),transparent 32%),radial-gradient(circle at 25% 75%,rgba(16,185,129,0.10),transparent 35%),repeating-linear-gradient(-35deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 2px,transparent 2px,transparent 120px)`,
      backgroundAttachment: "fixed",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    preview: "linear-gradient(135deg,#0a0502 0%,#2a1200 50%,#0a0502 100%)",
    mainStyle: {
      backgroundColor: "#0a0502",
      backgroundImage: `linear-gradient(90deg,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.82) 22%,rgba(0,0,0,0.78) 52%,rgba(0,0,0,0.94) 100%),radial-gradient(circle at 70% 20%,rgba(251,146,60,0.22),transparent 32%),radial-gradient(circle at 25% 75%,rgba(234,179,8,0.14),transparent 35%),repeating-linear-gradient(-35deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 2px,transparent 2px,transparent 120px)`,
      backgroundAttachment: "fixed",
    },
  },
  {
    id: "mono",
    name: "Pure Black",
    emoji: "⬛",
    preview: "linear-gradient(135deg,#050505 0%,#0a0a0a 50%,#050505 100%)",
    mainStyle: {
      backgroundColor: "#030303",
      backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.98) 0%,rgba(0,0,0,0.92) 100%)`,
      backgroundAttachment: "fixed",
    },
  },
  {
    id: "alpine",
    name: "Alpenstraße",
    emoji: "🏔️",
    preview: null,
    imgUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "bergpass",
    name: "Bergpass",
    emoji: "🛣️",
    preview: null,
    imgUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "see",
    name: "See & Berge",
    emoji: "🌊",
    preview: null,
    imgUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "horizon",
    name: "Horizont",
    emoji: "🌄",
    preview: null,
    imgUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80",
  },
];

function buildImgStyle(url) {
  return {
    backgroundColor: "#000",
    backgroundImage: `${DARK_OVERLAY}, url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };
}

const TIRE_DATABASE = [
  // ── MICHELIN ──
  { brand: "Michelin", model: "Power 6",        type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Michelin", model: "Road 6",         type: "Sport-Touring", sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "170/60 ZR17", "180/55 ZR17", "190/50 ZR17", "190/55 ZR17"] },
  { brand: "Michelin", model: "Road 6 GT",      type: "Touring",  sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Michelin", model: "Pilot Street 2", type: "Street",   sizes: ["110/70-17", "130/70-17", "140/70-17"] },
  { brand: "Michelin", model: "Anakee Adventure", type: "Enduro/Adventure", sizes: ["110/80 R19", "120/70 R19", "150/70 R17", "170/60 R17"] },
  // ── PIRELLI ──
  { brand: "Pirelli",  model: "Diablo Rosso IV",       type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Pirelli",  model: "Diablo Supercorsa SP",  type: "Track/Sport", sizes: ["120/70 ZR17", "180/55 ZR17", "180/60 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Pirelli",  model: "Diablo Rosso Corsa II", type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Pirelli",  model: "Angel GT II",           type: "Touring",  sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Pirelli",  model: "Scorpion Trail II",     type: "Enduro/Adventure", sizes: ["110/80 R19", "120/70 R19", "150/70 R17", "170/60 R17"] },
  { brand: "Pirelli",  model: "Scorpion STR",          type: "Enduro/Adventure", sizes: ["110/80 R18", "130/80 R17", "150/70 R17"] },
  // ── BRIDGESTONE ──
  { brand: "Bridgestone", model: "Battlax S23",     type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/50 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Bridgestone", model: "Battlax T32",     type: "Sport-Touring", sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "180/55 ZR17", "190/50 ZR17", "190/55 ZR17"] },
  { brand: "Bridgestone", model: "Battlax T32 GT",  type: "Touring",  sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Bridgestone", model: "Battlax RS11",    type: "Track/Sport", sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Bridgestone", model: "Battlax Adventurecross AX41", type: "Enduro/Adventure", sizes: ["110/80 R19", "150/70 R17", "170/60 R17"] },
  // ── DUNLOP ──
  { brand: "Dunlop", model: "SportSmart TT",    type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Dunlop", model: "RoadSmart IV",     type: "Sport-Touring", sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Dunlop", model: "Roadsmart IV GT",  type: "Touring",  sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Dunlop", model: "GPR-300",          type: "Street",   sizes: ["120/70 ZR17", "140/70 ZR17", "150/60 ZR17", "160/60 ZR17", "180/55 ZR17"] },
  { brand: "Dunlop", model: "Trailmax Mixtour", type: "Enduro/Adventure", sizes: ["110/80 R19", "130/80 R17", "150/70 R17"] },
  // ── METZELER ──
  { brand: "Metzeler", model: "Roadtec 01 SE",   type: "Sport-Touring", sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Metzeler", model: "Sportec M9 RR",   type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Metzeler", model: "Cruisetec",       type: "Cruiser",  sizes: ["130/60 B19", "150/80 B16", "180/65 B16"] },
  { brand: "Metzeler", model: "Tourance Next 2", type: "Enduro/Adventure", sizes: ["110/80 R19", "120/70 R19", "150/70 R17", "170/60 R17"] },
  // ── CONTINENTAL ──
  { brand: "Continental", model: "ContiSportAttack 4", type: "Sport",    sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17", "200/55 ZR17"] },
  { brand: "Continental", model: "ContiRoadAttack 4",  type: "Sport-Touring", sizes: ["120/70 ZR17", "150/70 ZR17", "160/60 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  { brand: "Continental", model: "TKC 70",             type: "Enduro/Adventure", sizes: ["110/80 R19", "130/80 R17", "150/70 R17"] },
  // ── MAXXIS ──
  { brand: "Maxxis", model: "Supermaxx ST",  type: "Sport-Touring", sizes: ["120/70 ZR17", "160/60 ZR17", "180/55 ZR17"] },
  { brand: "Maxxis", model: "Victra Sport 5", type: "Sport",   sizes: ["120/70 ZR17", "180/55 ZR17", "190/55 ZR17"] },
  // ── HEIDENAU ──
  { brand: "Heidenau", model: "K80 SR",  type: "Enduro/Adventure", sizes: ["100/90-19", "130/80-17", "150/70 R17"] },
  { brand: "Heidenau", model: "K73",     type: "Street",   sizes: ["100/80-16", "110/70-16", "120/70-15"] },
];

const demoBikeImage =
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80";

const motoImageLibrary = [
  { id: "sport",     name: "Sportler",  emoji: "🏁", url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80" },
  { id: "naked",     name: "Naked",     emoji: "🔥", url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80" },
  { id: "supermoto", name: "Supermoto", emoji: "⚡", url: "https://images.unsplash.com/photo-1724677230333-45eeca040935?auto=format&fit=crop&w=800&q=80" },
  { id: "tourer",    name: "Tourer",    emoji: "🛣️", url: "https://images.unsplash.com/photo-1690924821089-252e912f9677?auto=format&fit=crop&w=800&q=80" },
  { id: "retro",     name: "Retro",     emoji: "🏛️", url: "https://images.unsplash.com/photo-1648780306637-c0e9f2d91faf?auto=format&fit=crop&w=800&q=80" },
];

const defaultBike = {
  id: crypto.randomUUID(),
  brand: "Honda",
  model: "CB650R",
  year: "2020",
  licensePlate: "RO-JK-46",
  power: "48 PS / A2",
  mileage: 12450,
  tuv: "06/2027",
  photo: "",
  photos: [],
  manualUrl: "",
  tireFront: {
    brand: "Dunlop",
    model: "Sportmax",
    size: "120/70 ZR17",
    profile: "3.5",
    dot: "",
    lastMeasuredKm: 12000,
  },
  tireRear: {
    brand: "Dunlop",
    model: "Sportmax",
    size: "180/55 ZR17",
    profile: "4.0",
    dot: "",
    lastMeasuredKm: 12000,
  },
  lastOilChange: 12000,
  lastChainService: 12200,
  lastBrakesFront: 12000,
  lastBrakesRear: 12000,
  lastCoolant: 10000,
  lastBattery: 8000,
  lastInspection: 12000,
  tours: [],
  fuelLogs: [],
  expenses: [],
  checklist: [
    { id: "reifendruck", label: "Reifendruck geprüft", checked: false },
    { id: "oel", label: "Ölstand geprüft", checked: false },
    { id: "licht", label: "Licht & Blinker", checked: false },
    { id: "kette", label: "Kette geölt", checked: false },
    { id: "bremsen", label: "Bremsen geprüft", checked: false },
    { id: "spiegel", label: "Spiegel eingestellt", checked: false },
  ],
};

const brandManualLinks = [
  {
    brand: "Honda",
    color: "from-red-700 to-red-500",
    url: "https://www.honda.de/motorcycles/owners/owners-manual.html",
  },
  {
    brand: "Yamaha",
    color: "from-blue-800 to-blue-500",
    url: "https://www.yamaha-motor.eu/de/de/service-support/owners-manuals/",
  },
  {
    brand: "Kawasaki",
    color: "from-green-700 to-lime-500",
    url: "https://www.kawasaki.eu/en/service/owners-manuals.html",
  },
  {
    brand: "Suzuki",
    color: "from-blue-700 to-cyan-500",
    url: "https://www.globalsuzuki.com/motorcycle/smgs/",
  },
  {
    brand: "BMW",
    color: "from-sky-700 to-zinc-500",
    url: "https://manuals.bmw-motorrad.com/",
  },
  {
    brand: "Ducati",
    color: "from-red-800 to-red-500",
    url: "https://www.ducati.com/ww/en/service-maintenance/owner-manuals",
  },
  {
    brand: "KTM",
    color: "from-orange-700 to-orange-400",
    url: "https://www.ktm.com/en-int/service/manuals.html",
  },
  {
    brand: "Triumph",
    color: "from-zinc-800 to-zinc-500",
    url: "https://www.triumphmotorcycles.com/owners/manuals",
  },
  {
    brand: "Harley-Davidson",
    color: "from-orange-800 to-zinc-700",
    url: "https://serviceinfo.harley-davidson.com/",
  },
];

const featuredRoutes = [
  // ── BAYERN ──
  {
    id: 1, name: "Sudelfeld Runde", region: "Bayern", distance: 96, duration: "2h 10m",
    elevation: 1450, difficulty: "Mittel", curveFactor: "Hoch",
    description: "Kurvige Feierabendrunde mit Alpenblick, perfekt für Naked Bikes.",
    routePoints: [[47.8015,11.9991],[47.7477,12.1048],[47.6822,12.0227],[47.6617,11.9815],[47.7034,11.8858],[47.7605,11.8296],[47.8015,11.9991]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2, name: "Kesselberg & Walchensee", region: "Bayern", distance: 74, duration: "1h 45m",
    elevation: 980, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Kurven, See-Panorama und kurze knackige Passagen. Klassiker in Oberbayern.",
    routePoints: [[47.7613,11.5586],[47.6722,11.3656],[47.5914,11.3185],[47.6049,11.2842],[47.6722,11.3656],[47.7613,11.5586]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3, name: "Sylvenstein Speicher", region: "Bayern / Tirol", distance: 132, duration: "3h 05m",
    elevation: 1720, difficulty: "Leicht-Mittel", curveFactor: "Mittel",
    description: "Flow-Route mit Wasser, Bergen und entspannten Landstraßen.",
    routePoints: [[47.7613,11.5586],[47.6204,11.4435],[47.5655,11.5484],[47.5736,11.7002],[47.6358,11.5725],[47.7613,11.5586]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4, name: "Deutsche Alpenstraße", region: "Bayern", distance: 450, duration: "9h 00m",
    elevation: 2900, difficulty: "Mittel-Schwer", curveFactor: "Hoch",
    description: "Legendäre Route von Lindau bis Berchtesgaden entlang der Alpen.",
    routePoints: [[47.5456,9.6832],[47.7023,10.3107],[47.7613,11.5586],[47.7477,12.1048],[47.8021,12.5897],[47.6280,13.0014]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5, name: "Allgäu Panorama", region: "Bayern / Allgäu", distance: 145, duration: "3h 20m",
    elevation: 1850, difficulty: "Leicht-Mittel", curveFactor: "Hoch",
    description: "Königsschlösser, grüne Hügel und herrliche Alpenblicke durch das Allgäu.",
    routePoints: [[47.5578,10.7490],[47.6221,10.4801],[47.7023,10.3107],[47.6811,10.1427],[47.5332,10.2018],[47.5578,10.7490]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  // ── SCHWARZWALD ──
  {
    id: 6, name: "Schwarzwald Hochstraße (B500)", region: "Schwarzwald", distance: 106, duration: "2h 30m",
    elevation: 1164, difficulty: "Leicht", curveFactor: "Mittel",
    description: "Die klassische Kammroute über den Schwarzwald. Kurven, Aussichten, Wälder.",
    routePoints: [[48.7606,8.2366],[48.6241,8.1253],[48.4936,8.1016],[48.3625,8.1189],[48.2152,8.1576],[48.0789,8.1904]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7, name: "Schwarzwald Südroute", region: "Schwarzwald", distance: 178, duration: "4h 00m",
    elevation: 1490, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Enge Täler, Weinberge und enge Kurven im südlichen Schwarzwald.",
    routePoints: [[47.9959,7.8494],[48.0789,8.1904],[48.2152,8.1576],[48.0500,7.9800],[47.9959,7.8494]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  // ── EIFEL / NÜRBURGRING ──
  {
    id: 8, name: "Eifel Runde (Nürburg)", region: "Eifel / Rheinland-Pfalz", distance: 120, duration: "2h 45m",
    elevation: 680, difficulty: "Mittel", curveFactor: "Hoch",
    description: "Rund um den Nürburgring durch die Eifel — Motorrad-Mekka Deutschlands.",
    routePoints: [[50.3356,6.9475],[50.4012,6.7848],[50.5124,6.8921],[50.4786,7.0214],[50.3856,7.0987],[50.3356,6.9475]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  // ── HARZ ──
  {
    id: 9, name: "Harz Runde", region: "Harz", distance: 155, duration: "3h 30m",
    elevation: 1142, difficulty: "Leicht-Mittel", curveFactor: "Mittel",
    description: "Über Brocken, Rappbodetalsperre und durch den dichten Harzer Wald.",
    routePoints: [[51.7269,10.6142],[51.7970,10.4680],[51.8590,10.7320],[51.9256,10.9840],[51.8124,11.0521],[51.7269,10.6142]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  // ── MOSEL / RHEIN ──
  {
    id: 10, name: "Moseltal Panorama", region: "Mosel / Rheinland-Pfalz", distance: 198, duration: "4h 15m",
    elevation: 590, difficulty: "Leicht", curveFactor: "Mittel",
    description: "Serpentinen über dem Moseltal, Weinberge und mittelalterliche Burgen.",
    routePoints: [[50.1127,7.1098],[50.0024,7.3214],[49.9124,7.5487],[49.8156,7.8023],[49.7412,7.4521],[50.1127,7.1098]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  // ── ÖSTERREICH ──
  {
    id: 11, name: "Großglockner Hochalpenstraße", region: "Österreich / Kärnten", distance: 48, duration: "1h 30m",
    elevation: 2504, difficulty: "Schwer", curveFactor: "Sehr hoch",
    description: "Die berühmteste Passstraße Österreichs. 36 Kehren, Gletscherblick, Hochalpenromantik.",
    routePoints: [[47.1937,12.8456],[47.1124,12.8369],[47.0739,12.8369],[47.0200,12.7980],[46.9800,12.8100],[47.0739,12.8369]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 12, name: "Silvretta Hochalpenstraße", region: "Österreich / Vorarlberg", distance: 75, duration: "2h 00m",
    elevation: 2036, difficulty: "Mittel-Schwer", curveFactor: "Sehr hoch",
    description: "34 Kehren zur Silvretta-Stausee. Spektakuläre Aussicht auf die Silvrettagruppe.",
    routePoints: [[47.0691,10.0012],[47.0200,10.0845],[46.9812,10.1456],[46.9500,10.1800],[46.9300,10.2100],[46.9812,10.1456]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 13, name: "Timmelsjoch / Passo Rombo", region: "Österreich / Südtirol", distance: 35, duration: "1h 10m",
    elevation: 2509, difficulty: "Schwer", curveFactor: "Sehr hoch",
    description: "Grenzpass zwischen Österreich und Italien. Einer der höchsten befahrbaren Alpenpässe.",
    routePoints: [[47.0456,11.1023],[47.0012,11.1589],[46.9658,11.1980],[46.9412,11.2234],[46.9200,11.2450],[46.9412,11.2234]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 14, name: "Achensee Runde", region: "Tirol", distance: 88, duration: "2h 00m",
    elevation: 930, difficulty: "Leicht-Mittel", curveFactor: "Hoch",
    description: "Schöne Runde um den Achensee mit Blick auf Karwendel und Rofan.",
    routePoints: [[47.4456,11.7023],[47.4800,11.7456],[47.5200,11.7689],[47.5456,11.7234],[47.5000,11.6800],[47.4456,11.7023]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  // ── SCHWEIZ ──
  {
    id: 15, name: "Furkapass", region: "Schweiz / Wallis", distance: 55, duration: "1h 30m",
    elevation: 2429, difficulty: "Mittel-Schwer", curveFactor: "Sehr hoch",
    description: "Ikonischer Pass aus James Bond 'Goldfinger'. Gletscher, weite Kurven, Bergwelt pur.",
    routePoints: [[46.5714,8.4130],[46.5500,8.4456],[46.5300,8.4789],[46.5100,8.5123],[46.4900,8.5456],[46.5300,8.4789]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 16, name: "Sustenpass", region: "Schweiz / Bern", distance: 45, duration: "1h 15m",
    elevation: 2224, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Einer der schönsten Alpenpässe der Schweiz mit Blick auf den Steingletscher.",
    routePoints: [[46.7297,8.4439],[46.7100,8.4800],[46.6900,8.5200],[46.6712,8.5580],[46.6500,8.5900],[46.6900,8.5200]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 17, name: "Grimselpass", region: "Schweiz / Bern", distance: 40, duration: "1h 00m",
    elevation: 2165, difficulty: "Mittel", curveFactor: "Hoch",
    description: "Rauer Hochgebirgspass zwischen Wallis und Berner Oberland.",
    routePoints: [[46.5630,8.3358],[46.5800,8.3589],[46.5980,8.3900],[46.6200,8.4120],[46.6400,8.4350],[46.5980,8.3900]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 18, name: "Gotthard Pass (Tremola)", region: "Schweiz / Uri", distance: 30, duration: "0h 50m",
    elevation: 2091, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Die legendäre Tremola-Pflasterstraße. 24 enge Kehren auf historischem Kopfsteinpflaster.",
    routePoints: [[46.6351,8.5682],[46.6200,8.5500],[46.6012,8.5289],[46.5850,8.5023],[46.5650,8.4812],[46.6012,8.5289]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  // ── ITALIEN ──
  {
    id: 19, name: "Passo dello Stelvio", region: "Südtirol / Italien", distance: 75, duration: "2h 00m",
    elevation: 2758, difficulty: "Schwer", curveFactor: "Extrem",
    description: "Mit 48 Kehren der Motorradpass schlechthin. Weltweit bekannt, unvergesslich.",
    routePoints: [[46.5269,10.4539],[46.5100,10.4200],[46.4900,10.3900],[46.4700,10.3600],[46.4500,10.3300],[46.4900,10.3900]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 20, name: "Dolomiten Sella Ronda", region: "Südtirol / Dolomiten", distance: 55, duration: "1h 45m",
    elevation: 2244, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Rundfahrt um den Sellastock über 4 Pässe. UNESCO Welterbe in den Dolomiten.",
    routePoints: [[46.5080,11.7534],[46.4900,11.8200],[46.4700,11.8700],[46.5100,11.9200],[46.5500,11.8700],[46.5080,11.7534]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 21, name: "Gardasee Runde", region: "Italien / Norditalien", distance: 165, duration: "3h 30m",
    elevation: 1200, difficulty: "Leicht-Mittel", curveFactor: "Hoch",
    description: "Rundfahrt um den Gardasee mit Tunneln, Kurven und spektakulären Seeblicken.",
    routePoints: [[45.6389,10.7051],[45.7200,10.7200],[45.8800,10.8400],[45.9024,10.8947],[45.8600,10.9200],[45.6389,10.7051]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  // ── FRANKREICH ──
  {
    id: 22, name: "Col du Galibier", region: "Frankreich / Alpen", distance: 65, duration: "1h 50m",
    elevation: 2642, difficulty: "Schwer", curveFactor: "Sehr hoch",
    description: "Legende aus der Tour de France. Serpentinen bis fast 2650m über dem Meer.",
    routePoints: [[45.0589,6.3978],[45.0800,6.4200],[45.1000,6.4456],[45.1200,6.4700],[45.1400,6.4950],[45.1000,6.4456]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 23, name: "Col de la Bonette", region: "Frankreich / Alpes-Maritimes", distance: 90, duration: "2h 30m",
    elevation: 2802, difficulty: "Schwer", curveFactor: "Hoch",
    description: "Höchste asphaltierte Straße Europas. Spektakuläre Hochgebirgslandschaft.",
    routePoints: [[44.3256,6.8012],[44.3500,6.8300],[44.3700,6.8600],[44.3900,6.8900],[44.4100,6.9200],[44.3700,6.8600]],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 24, name: "Gorges du Verdon", region: "Frankreich / Provence", distance: 130, duration: "3h 00m",
    elevation: 800, difficulty: "Mittel", curveFactor: "Sehr hoch",
    description: "Europas Grand Canyon. Schmale Straßen an Felswänden, türkisblaues Wasser.",
    routePoints: [[43.7456,6.3012],[43.7200,6.3400],[43.7000,6.3800],[43.6800,6.4200],[43.7200,6.4600],[43.7456,6.3012]],
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  },
  // ── NORWEGEN ──
  {
    id: 25, name: "Trollstigen", region: "Norwegen", distance: 18, duration: "0h 40m",
    elevation: 858, difficulty: "Mittel-Schwer", curveFactor: "Extrem",
    description: "Der Trollpfad — 11 Haarnadelkurven an einem Wasserfall. Pflicht für jeden Biker.",
    routePoints: [[62.4589,7.6701],[62.4700,7.6800],[62.4850,7.6950],[62.4950,7.7100],[62.5100,7.7250],[62.4850,7.6950]],
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  // ── SPANIEN ──
  {
    id: 26, name: "Picos de Europa", region: "Spanien / Asturien", distance: 210, duration: "4h 45m",
    elevation: 2648, difficulty: "Mittel-Schwer", curveFactor: "Sehr hoch",
    description: "Wildes Gebirge im Norden Spaniens. Enge Cañons, einsame Pässe, unvergessen.",
    routePoints: [[43.2089,4.8456],[43.1800,4.9200],[43.1500,5.0100],[43.1200,5.1200],[43.1500,5.2300],[43.2089,4.8456]],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
];

const JAWG_TOKEN = import.meta.env.VITE_JAWG_TOKEN || "";
const MAP_STYLE = JAWG_TOKEN && !JAWG_TOKEN.includes("HIER")
  ? `https://api.jawg.io/styles/jawg-terrain.json?access-token=${JAWG_TOKEN}`
  : "https://demotiles.maplibre.org/style.json";

const MOTO_PASSES = [
  { id: "stelvio",      name: "Stelvio Pass",            country: "IT", lat: 46.5286, lon: 10.4525, alt: 2758 },
  { id: "grossglockner",name: "Großglockner",             country: "AT", lat: 47.0747, lon: 12.8389, alt: 2504 },
  { id: "transfagarasan",name: "Transfăgărășan",          country: "RO", lat: 45.6020, lon: 24.6139, alt: 2042 },
  { id: "galibier",     name: "Col du Galibier",          country: "FR", lat: 45.0643, lon:  6.4078, alt: 2642 },
  { id: "bonette",      name: "Col de la Bonette",        country: "FR", lat: 44.3263, lon:  6.8068, alt: 2802 },
  { id: "timmelsjoch",  name: "Timmelsjoch",              country: "AT", lat: 46.8828, lon: 10.8908, alt: 2509 },
  { id: "silvretta",    name: "Silvretta Hochalpenstr.",  country: "AT", lat: 47.0165, lon: 10.0833, alt: 2036 },
  { id: "nurburgring",  name: "Nürburgring Nordschleife", country: "DE", lat: 50.3356, lon:  6.9475, alt: 473  },
  { id: "sustenpass",   name: "Sustenpass",               country: "CH", lat: 46.7333, lon:  8.4333, alt: 2224 },
  { id: "furkapass",    name: "Furkapass",                country: "CH", lat: 46.5726, lon:  8.4152, alt: 2429 },
  { id: "grimselpass",  name: "Grimselpass",              country: "CH", lat: 46.5611, lon:  8.3333, alt: 2164 },
  { id: "berninapass",  name: "Berninapass",              country: "CH", lat: 46.4104, lon: 10.0278, alt: 2328 },
  { id: "nordkette",    name: "Nordkettenbahn Innsbruck", country: "AT", lat: 47.3070, lon: 11.3923, alt: 1905 },
  { id: "spa",          name: "Spa-Francorchamps",        country: "BE", lat: 50.4372, lon:  5.9714, alt: 400  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const [bikes, setBikes] = useState(() => {
    const saved = localStorage.getItem("mototrack-bikes-v4");
    return saved ? JSON.parse(saved) : [defaultBike];
  });

  const [selectedBikeId, setSelectedBikeId] = useState(() => {
    const saved = localStorage.getItem("mototrack-selected-bike-v4");
    return saved || defaultBike.id;
  });

  const selectedBike =
    bikes.find((bike) => bike.id === selectedBikeId) || bikes[0];

  const [newBikeName, setNewBikeName] = useState("");
  const [tourName, setTourName] = useState("");
  const [tourKm, setTourKm] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelDistance, setFuelDistance] = useState("");
  const [fuelType, setFuelType] = useState("Super");
  const [quickTankOpen, setQuickTankOpen] = useState(false);
  const [openTourIndex, setOpenTourIndex] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("moto-favorites")) || ["service", "fuel", "costs"]; }
    catch { return ["service", "fuel", "costs"]; }
  });
  const [favEditMode, setFavEditMode] = useState(false);

  const [rideStatus, setRideStatus] = useState("idle");
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [rideTime, setRideTime] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);

  const [position, setPosition] = useState([48.1351, 11.582]);
  const [placeName, setPlaceName] = useState("");
  const [waypointNames, setWaypointNames] = useState([]);
  const [route, setRoute] = useState([]);
  const [selectedPlannedRoute, setSelectedPlannedRoute] = useState(null);
  const [routeBuilderActive, setRouteBuilderActive] = useState(true);
  const [customRoutePoints, setCustomRoutePoints] = useState([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [curveStats, setCurveStats] = useState(null);
  const [plannedRouteStats, setPlannedRouteStats] = useState(null);
  const [navigationChoiceOpen, setNavigationChoiceOpen] = useState(false);
  const [waypointPanelOpen, setWaypointPanelOpen] = useState(false);
  const [pendingRouteName, setPendingRouteName] = useState("");
  const [startSearch, setStartSearch] = useState("");
  const [endSearch, setEndSearch] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [passesVisible, setPassesVisible] = useState(false);
  const [elevationData, setElevationData] = useState(null);
  const [elevationLoading, setElevationLoading] = useState(false);
  const [altRoute, setAltRoute] = useState(null);
  const [insertingAtIndex, setInsertingAtIndex] = useState(null);
  const [insertSearch, setInsertSearch] = useState("");
  const [insertSuggestions, setInsertSuggestions] = useState([]);
  const [mapContextMenu, setMapContextMenu] = useState(null);

  const [rideStopped, setRideStopped] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [watchId, setWatchId] = useState(null);
  const [rideInterval, setRideInterval] = useState(null);

  const [leanAngle, setLeanAngle] = useState(0);
  const [maxLeanAngle, setMaxLeanAngle] = useState(0);
  const [maxLeanLeft, setMaxLeanLeft] = useState(0);
  const [maxLeanRight, setMaxLeanRight] = useState(0);
  const [leanDirection, setLeanDirection] = useState("Gerade");
  const [sensorStatus, setSensorStatus] = useState("Nicht aktiv");
  const [sensorError, setSensorError] = useState("");
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [revLoading, setRevLoading] = useState(false);
  const [revAnalysis, setRevAnalysis] = useState("");
  const [revBubbleOpen, setRevBubbleOpen] = useState(false);

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [forecast, setForecast] = useState(null);
  const [forecastError, setForecastError] = useState("");

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Sonstiges");

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [compareBikeId, setCompareBikeId] = useState(null);
  const [manualRideKm, setManualRideKm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", subtitle: "" });
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [bikeImagePickerOpen, setBikeImagePickerOpen] = useState(false);
  const [serviceEditKey, setServiceEditKey] = useState(null);
  const [serviceKmInput, setServiceKmInput] = useState("");
  const [serviceDateInput, setServiceDateInput] = useState("");
  const [tirePickerFor, setTirePickerFor] = useState(null); // "tireFront" | "tireRear"
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [discoverRegion, setDiscoverRegion] = useState("Alle");
  const [tireSearch, setTireSearch] = useState("");
  const [tireTypeFilter, setTireTypeFilter] = useState("Alle");
  const [motoPickerFilter, setMotoPickerFilter] = useState("Alle");

  const [bgId, setBgId] = useState(
    () => localStorage.getItem("mototrack-bg-id") || "racing"
  );
  const [customBgUrl, setCustomBgUrl] = useState(
    () => localStorage.getItem("mototrack-bg-custom") || ""
  );

  useEffect(() => {
    localStorage.setItem("mototrack-bikes-v4", JSON.stringify(bikes));
  }, [bikes]);

  useEffect(() => {
    localStorage.setItem("mototrack-selected-bike-v4", selectedBikeId);
  }, [selectedBikeId]);

  const mainMapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);
        loadWeather(lat, lon);
        reverseGeocode(lat, lon);
      }, () => {
        loadWeather(position[0], position[1]);
        reverseGeocode(position[0], position[1]);
      }, { enableHighAccuracy: true, timeout: 8000 });
    } else {
      loadWeather(position[0], position[1]);
      reverseGeocode(position[0], position[1]);
    }
  }, []);

  useEffect(() => {
    if (activePage === "map" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);
        mainMapRef.current?.flyTo({ center: [lon, lat], zoom: 13, duration: 1200 });
        // Auto-set GPS as start if no route is active
        setCustomRoutePoints((prev) => {
          if (prev.length > 0) return prev;
          setRoute([[lat, lon]]);
          setWaypointNames(["Mein Standort"]);
          setStartSearch("Mein Standort");
          // Reverse geocode in background
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "de" } })
            .then((r) => r.json())
            .then((d) => {
              const name = d.address?.road || d.address?.suburb || d.address?.city || "Mein Standort";
              setStartSearch(name);
              setWaypointNames([name]);
            })
            .catch(() => {});
          return [[lat, lon]];
        });
      }, null, { enableHighAccuracy: true, timeout: 8000 });
    }
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem("mototrack-bg-id", bgId);
  }, [bgId]);

  useEffect(() => {
    if (customBgUrl) localStorage.setItem("mototrack-bg-custom", customBgUrl);
  }, [customBgUrl]);

  const mainBgStyle = useMemo(() => {
    if (bgId === "custom" && customBgUrl) return buildImgStyle(customBgUrl);
    const preset = bgPresets.find((p) => p.id === bgId) || bgPresets[0];
    if (preset.imgUrl) return buildImgStyle(preset.imgUrl);
    return preset.mainStyle;
  }, [bgId, customBgUrl]);

  function updateBike(patch) {
    setBikes((prev) =>
      prev.map((bike) =>
        bike.id === selectedBike.id ? { ...bike, ...patch } : bike
      )
    );
  }

  function updateBikeNested(key, value) {
    updateBike({
      [key]: {
        ...selectedBike[key],
        ...value,
      },
    });
  }

  function showToast(message, subtitle = "") {
    setToast({ show: true, message, subtitle });
    setTimeout(() => setToast({ show: false, message: "", subtitle: "" }), 3200);
  }

  function addBike() {
    if (!newBikeName.trim()) return;

    const bike = {
      ...defaultBike,
      id: crypto.randomUUID(),
      brand: "",
      model: newBikeName,
      year: "",
      licensePlate: "",
      power: "",
      mileage: 0,
      tuv: "",
      photo: "",
      tours: [],
      fuelLogs: [],
    };

    setBikes([bike, ...bikes]);
    setSelectedBikeId(bike.id);
    setNewBikeName("");
    showToast("Motorrad hinzugefügt!", `${bike.brand} ${bike.model} in der Garage`);
  }

  function deleteBike(id) {
    if (bikes.length === 1) return;

    const filtered = bikes.filter((bike) => bike.id !== id);
    setBikes(filtered);
    setSelectedBikeId(filtered[0].id);
  }

  function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateBike({ photo: reader.result });
    };

    reader.readAsDataURL(file);
  }

  function useDemoImage() {
    updateBike({ photo: demoBikeImage });
  }

  function getRideStatusText() {
    if (rideStatus === "searching") return "🟡 GPS wird gesucht";
    if (rideStatus === "active") return "🟢 Fahrt aktiv";
    if (rideStatus === "error") return "⚠️ GPS Fehler";
    return "🔴 Nicht aktiv";
  }

  function formatRideTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs}h ${mins}m ${secs}s`;
  }

  function calculateDistanceInKm(points) {
    if (points.length < 2) return 0;

    let distance = 0;

    for (let i = 1; i < points.length; i++) {
      const [lat1, lon1] = points[i - 1];
      const [lat2, lon2] = points[i];

      const earthRadius = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;

      distance +=
        earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return Number(distance.toFixed(2));
  }

  const routeDistance = calculateDistanceInKm(route);

  async function fetchElevation(coords, totalDistKm) {
    setElevationData(null);
    setElevationLoading(true);
    try {
      const step = Math.max(1, Math.floor(coords.length / 60));
      const sampled = coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
      const locations = sampled.map((c) => ({ latitude: c[1], longitude: c[0] }));
      const res = await fetch("https://api.open-elevation.com/api/v1/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations }),
      });
      const data = await res.json();
      const results = data.results || [];
      const distStep = totalDistKm / (results.length - 1);
      setElevationData(results.map((r, i) => ({ dist: +(i * distStep).toFixed(2), elev: r.elevation })));
    } catch {
      // elevation optional, no error shown
    } finally {
      setElevationLoading(false);
    }
  }

  async function calculateRoadRoute(points) {
    if (points.length < 2) return;

    const coordinates = points.map((p) => `${p[1]},${p[0]}`).join(";");

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=3`
      );
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) return;

      const main = data.routes[0];
      const mainDistKm = main.distance / 1000;
      const mainCurves = analyzeCurviness(main.geometry.coordinates, mainDistKm);

      setRoute(main.geometry.coordinates.map((c) => [c[1], c[0]]));
      setPlannedRouteStats({ distance: mainDistKm.toFixed(1), duration: Math.round(main.duration / 60), points: points.length });
      setCurveStats(mainCurves);
      fetchElevation(main.geometry.coordinates, mainDistKm);
      setSelectedPlannedRoute((prev) => prev ? { ...prev, distance: mainDistKm.toFixed(1), duration: `${Math.round(main.duration / 60)} min` } : prev);

      // Find curviest alternative that is not >60% longer in time
      setAltRoute(null);
      const alts = data.routes.slice(1);
      if (alts.length > 0) {
        const scored = alts.map((r) => {
          const dk = r.distance / 1000;
          const cs = analyzeCurviness(r.geometry.coordinates, dk);
          return { r, dk, cs, score: cs ? parseFloat(cs.curvesPerKm) : 0 };
        });
        const best = scored.sort((a, b) => b.score - a.score)[0];
        const mainCurvesPerKm = mainCurves ? parseFloat(mainCurves.curvesPerKm) : 0;
        const tooLong = best.r.duration > main.duration * 1.6;
        const notCurvier = best.score <= mainCurvesPerKm + 1;
        if (!tooLong && !notCurvier) {
          setAltRoute({
            route: best.r.geometry.coordinates.map((c) => [c[1], c[0]]),
            distance: best.dk.toFixed(1),
            duration: Math.round(best.r.duration / 60),
            extraMin: Math.round((best.r.duration - main.duration) / 60),
            extraKm: (best.dk - mainDistKm).toFixed(1),
            curveStats: best.cs,
          });
        }
      }
    } catch (err) {
      console.error("Route konnte nicht berechnet werden:", err);
    }
  }

  function showFeaturedRouteOnMap(routeItem) {
    if (!routeItem.routePoints) return;

    const plannedRoute = {
      ...routeItem,
      routePoints: routeItem.routePoints,
    };

    setRouteBuilderActive(false);
    setCustomRoutePoints([]);
    setPlannedRouteStats(null);
    setNavigationChoiceOpen(false);
    setSelectedPlannedRoute(plannedRoute);
    setRoute(routeItem.routePoints);
    calculateRoadRoute(routeItem.routePoints);
    setPosition(routeItem.routePoints[0]);
    setActivePage("map");
  }

  function loadFeaturedRoute(routeItem) {
    const newTour = {
      id: crypto.randomUUID(),
      name: routeItem.name,
      km: routeItem.distance,
      date: "Vorgeschlagene Route",
      planned: true,
      duration: routeItem.duration,
      elevation: routeItem.elevation,
      difficulty: routeItem.difficulty,
      curveFactor: routeItem.curveFactor,
      routePoints: routeItem.routePoints,
    };

    updateBike({
      tours: [newTour, ...selectedBike.tours],
    });

    setActivePage("tours");
  }

  function handleOrientation(event) {
    const gamma = event.gamma;
    if (gamma === null) return;

    const angle = Math.round(gamma);
    const absoluteAngle = Math.abs(angle);

    setLeanAngle(absoluteAngle);
    setMaxLeanAngle((prev) => Math.max(prev, absoluteAngle));

    if (angle > 3) {
      setLeanDirection("Rechts");
      setMaxLeanRight((prev) => Math.max(prev, absoluteAngle));
    } else if (angle < -3) {
      setLeanDirection("Links");
      setMaxLeanLeft((prev) => Math.max(prev, absoluteAngle));
    } else {
      setLeanDirection("Gerade");
    }
  }

  async function enableLeanSensor() {
    setSensorError("");

    if (!window.DeviceOrientationEvent) {
      setSensorError("Schräglagen-Sensor wird nicht unterstützt.");
      setSensorStatus("Fehler");
      return;
    }

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          setSensorError("Sensor-Zugriff wurde nicht erlaubt.");
          setSensorStatus("Fehler");
          return;
        }
      }

      window.addEventListener("deviceorientation", handleOrientation);
      setSensorStatus("Aktiv");
    } catch {
      setSensorError("Sensor konnte nicht aktiviert werden.");
      setSensorStatus("Fehler");
    }
  }

  function disableLeanSensor() {
    window.removeEventListener("deviceorientation", handleOrientation);
    setSensorStatus("Nicht aktiv");
    setLeanAngle(0);
    setLeanDirection("Gerade");
  }

  function resetLean() {
    setLeanAngle(0);
    setMaxLeanAngle(0);
    setMaxLeanLeft(0);
    setMaxLeanRight(0);
    setLeanDirection("Gerade");
    showToast("Zurückgesetzt!", "Schräglage-Werte gelöscht");
  }

  async function askRev(rideData) {
    const key = import.meta.env.VITE_ANTHROPIC_KEY;
    if (!key) return;
    setRevAnalysis("");
    setRevLoading(true);
    setRevModalOpen(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-allow-browser": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 220,
          messages: [{
            role: "user",
            content: `Du bist REV, ein KI-Assistent für Motorradfahrer. Analysiere diese Fahrt auf Deutsch in maximal 3 kurzen Sätzen. Sei direkt, motivierend und sprich den Fahrer persönlich an (du).

Fahrtdaten:
- Strecke: ${rideData.km} km
- Fahrzeit: ${rideData.time}
- Max. Geschwindigkeit: ${rideData.maxSpeed} km/h
- Durchschnitt: ${rideData.averageSpeed} km/h
- Max. Schräglage: ${rideData.maxLeanAngle}° (Links: ${rideData.maxLeanLeft}°, Rechts: ${rideData.maxLeanRight}°)
- Fahrstil: ${rideData.rideStyle}

Gib ein kurzes persönliches Fahrer-Feedback.`,
          }],
        }),
      });
      const data = await res.json();
      setRevAnalysis(data.content?.[0]?.text ?? "Keine Analyse verfügbar.");
    } catch {
      setRevAnalysis("Verbindung zu REV fehlgeschlagen. Prüfe deinen API-Key.");
    }
    setRevLoading(false);
  }

  function startRide() {
    setGpsError("");
    setRideStatus("searching");
    setRideTime(0);
    setMaxSpeed(0);
    setAverageSpeed(0);
    setRoute([]);
    setRideStopped(false);
    setSelectedPlannedRoute(null);
    setPlannedRouteStats(null);
    setNavigationChoiceOpen(false);

    if (!navigator.geolocation) {
      setGpsError("GPS wird von deinem Browser nicht unterstützt.");
      setRideStatus("error");
      return;
    }

    const interval = setInterval(() => {
      setRideTime((prev) => prev + 1);
    }, 1000);

    setRideInterval(interval);

    const id = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const gpsSpeed = geoPosition.coords.speed;

        const newPosition = [
          geoPosition.coords.latitude,
          geoPosition.coords.longitude,
        ];

        setPosition(newPosition);
        setRoute((prev) => [...prev, newPosition]);
        reverseGeocode(newPosition[0], newPosition[1]);

        if (gpsSpeed !== null) {
          const kmh = Math.round(gpsSpeed * 3.6);

          setSpeed(kmh);
          setMaxSpeed((prev) => Math.max(prev, kmh));
          setAverageSpeed((prev) =>
            prev === 0 ? kmh : Math.round((prev + kmh) / 2)
          );
        } else {
          setSpeed(0);
        }

        setRideStatus("active");
      },
      () => {
        setGpsError("GPS-Zugriff wurde blockiert oder ist nicht verfügbar.");
        setRideStatus("error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);
  }

  function stopRide() {
    const wasRiding = rideStatus === "active" || rideStatus === "searching";

    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (rideInterval !== null) clearInterval(rideInterval);

    setWatchId(null);
    setRideInterval(null);
    setRideStatus("idle");
    setSpeed(0);

    if (wasRiding) setRideStopped(true);
  }

  function clearRoute() {
    setRoute([]);
    setRideStopped(false);
    setSelectedPlannedRoute(null);
    setCustomRoutePoints([]);
    setPlannedRouteStats(null);
    setNavigationChoiceOpen(false);
    setWaypointNames([]);
    setCurveStats(null);
    setWaypointPanelOpen(false);
    setPendingRouteName("");
    setElevationData(null);
    setAltRoute(null);
    setStartSearch("");
    setEndSearch("");
    setStartSuggestions([]);
    setEndSuggestions([]);
  }

  function getBearing(p1, p2) {
    const dLng = (p2[0] - p1[0]) * Math.PI / 180;
    const lat1 = p1[1] * Math.PI / 180;
    const lat2 = p2[1] * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  function analyzeCurviness(coords, distanceKm) {
    if (coords.length < 3) return null;
    const MILD = 15, SHARP = 30, EXTREME = 45;
    let curveCount = 0;
    const segments = [];
    let currentSeg = null;
    let currentMaxAngle = 0;
    for (let i = 1; i < coords.length - 1; i++) {
      const b1 = getBearing(coords[i - 1], coords[i]);
      const b2 = getBearing(coords[i], coords[i + 1]);
      let diff = Math.abs(b2 - b1);
      if (diff > 180) diff = 360 - diff;
      if (diff > MILD) {
        curveCount++;
        if (!currentSeg) { currentSeg = [coords[i - 1], coords[i]]; currentMaxAngle = diff; }
        else { currentSeg.push(coords[i]); currentMaxAngle = Math.max(currentMaxAngle, diff); }
      } else {
        if (currentSeg && currentSeg.length >= 2) {
          currentSeg.push(coords[i]);
          const severity = currentMaxAngle >= EXTREME ? "extreme" : currentMaxAngle >= SHARP ? "sharp" : "mild";
          segments.push({ coords: currentSeg, severity, maxAngle: Math.round(currentMaxAngle) });
        }
        currentSeg = null; currentMaxAngle = 0;
      }
    }
    if (currentSeg && currentSeg.length >= 2) {
      const severity = currentMaxAngle >= EXTREME ? "extreme" : currentMaxAngle >= SHARP ? "sharp" : "mild";
      segments.push({ coords: currentSeg, severity, maxAngle: Math.round(currentMaxAngle) });
    }
    const curvySegments = segments.map((s) => s.coords);
    const perKm = distanceKm > 0 ? curveCount / distanceKm : 0;
    const { label, emoji, color } =
      perKm < 3  ? { label: "Eher gerade",  emoji: "→",  color: "#94a3b8" } :
      perKm < 8  ? { label: "Leicht kurvig", emoji: "〜", color: "#fbbf24" } :
      perKm < 15 ? { label: "Kurvig",        emoji: "🏁", color: "#f97316" } :
                   { label: "Sehr kurvig",   emoji: "🔥", color: "#ef4444" };
    return { label, emoji, color, count: curveCount, curvesPerKm: perKm.toFixed(1), curvySegments, segments };
  }

  async function searchPlaces(query) {
    if (!query || query.length < 2) { setSearchSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4&addressdetails=1`,
        { headers: { "Accept-Language": "de" } }
      );
      const data = await res.json();
      setSearchSuggestions(data.map((d) => ({
        name: d.display_name.split(",").slice(0, 2).join(", ").trim(),
        lat: Number(d.lat),
        lon: Number(d.lon),
      })));
    } catch { setSearchSuggestions([]); }
  }

  async function addSearchWaypoint(lat, lon, name) {
    const point = [lat, lon];
    setRouteBuilderActive(true);
    setCustomRoutePoints((prev) => {
      const newPoints = [...prev, point];
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      else setRoute(newPoints);
      return newPoints;
    });
    setWaypointNames((prev) => [...prev, name]);
    setRouteSearch("");
    setSearchSuggestions([]);
    setPosition([lat, lon]);
    setSelectedPlannedRoute(null);
  }

  function saveTrackedRide() {
    const km = routeDistance > 0 ? routeDistance : Number(manualRideKm);
    if (km <= 0) return;

    let rideStyle = "Smooth Ride";
    let rideScore = 100;

    if (maxSpeed > 160 || maxLeanAngle > 50) {
      rideStyle = "Aggressiv";
      rideScore = 45;
    } else if (maxSpeed > 120 || maxLeanAngle > 35) {
      rideStyle = "Sportlich";
      rideScore = 72;
    } else if (averageSpeed > 90) {
      rideStyle = "Touring";
      rideScore = 85;
    }

    const newTour = {
      id: crypto.randomUUID(),
      name: `Fahrt vom ${new Date().toLocaleDateString("de-DE")}`,
      km,
      date: new Date().toLocaleDateString("de-DE"),
      time: formatRideTime(rideTime),
      maxSpeed: maxSpeed || 0,
      averageSpeed: averageSpeed || 0,
      maxLeanAngle: maxLeanAngle || 0,
      gpsPoints: route.length,
      rideStyle,
      rideScore,
      route: route.length > 1 ? route : [],
    };

    updateBike({
      tours: [newTour, ...selectedBike.tours],
      mileage: Math.round(Number(selectedBike.mileage) + km),
    });

    setRideStopped(false);
    setManualRideKm("");
    showToast("Fahrt gespeichert!", "Tour in deiner Tourenliste");
    askRev({
      km,
      time: formatRideTime(rideTime),
      maxSpeed: maxSpeed || 0,
      averageSpeed: averageSpeed || 0,
      maxLeanAngle: maxLeanAngle || 0,
      maxLeanLeft: maxLeanLeft || 0,
      maxLeanRight: maxLeanRight || 0,
      rideStyle,
    });
  }

  function addTour() {
    if (!tourName || !tourKm) return;

    const newTour = {
      id: crypto.randomUUID(),
      name: tourName,
      km: Number(tourKm),
      date: new Date().toLocaleDateString("de-DE"),
    };

    updateBike({
      tours: [newTour, ...selectedBike.tours],
      mileage: Number(selectedBike.mileage) + Number(tourKm),
    });

    setTourName("");
    setTourKm("");
    showToast("Tour gespeichert!", `${Number(tourKm)} km · ${tourName}`);
  }

  function deleteTour(indexToDelete) {
    const tourToDelete = selectedBike.tours[indexToDelete];

    updateBike({
      tours: selectedBike.tours.filter((_, index) => index !== indexToDelete),
      mileage: Math.max(
        0,
        Math.round(Number(selectedBike.mileage) - Number(tourToDelete.km || 0))
      ),
    });
  }

  function addFuelLog() {
    if (!fuelLiters || !fuelPrice || !fuelDistance) return;

    const liters = Number(fuelLiters);
    const price = Number(fuelPrice);
    const distance = Number(fuelDistance);

    const consumption = ((liters / distance) * 100).toFixed(1);
    const totalCost = (liters * price).toFixed(2);
    const costPer100 = ((totalCost / distance) * 100).toFixed(2);

    const newFuelLog = {
      id: crypto.randomUUID(),
      liters,
      price,
      distance,
      consumption,
      totalCost,
      costPer100,
      fuelType,
      date: new Date().toLocaleDateString("de-DE"),
    };

    updateBike({
      fuelLogs: [newFuelLog, ...selectedBike.fuelLogs],
    });

    setFuelLiters("");
    setFuelPrice("");
    setFuelDistance("");
    showToast("Tankvorgang gespeichert!", `${consumption} L/100km · ${totalCost} €`);
  }

  function deleteFuelLog(indexToDelete) {
    updateBike({
      fuelLogs: selectedBike.fuelLogs.filter(
        (_, index) => index !== indexToDelete
      ),
    });
  }

  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "Accept-Language": "de" } }
      );
      const data = await res.json();
      const a = data.address || {};
      const city = a.city || a.town || a.village || a.municipality || a.county || "";
      const road = a.road || a.pedestrian || "";
      setPlaceName(road ? `${road}, ${city}` : city);
    } catch { /* ignore */ }
  }

  async function geocodeCity(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "Accept-Language": "de" } }
      );
      const data = await res.json();
      const a = data.address || {};
      return a.city || a.town || a.village || a.municipality || a.county || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    } catch {
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  }

  async function loadWeather(lat, lon) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day&timezone=auto`
      );

      const data = await response.json();
      const c = data.current;

      setWeather({
        temperature: Math.round(c.temperature_2m),
        apparent: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        precipitation: c.precipitation,
        weathercode: c.weather_code,
        windspeed: Math.round(c.wind_speed_10m),
        gusts: Math.round(c.wind_gusts_10m),
        is_day: c.is_day,
      });
    } catch {
      setWeatherError("Wetterdaten konnten nicht geladen werden.");
    }
  }

  function useCurrentLocationForWeather() {
    if (!navigator.geolocation) {
      setWeatherError("GPS wird nicht unterstützt.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadWeather(pos.coords.latitude, pos.coords.longitude);
        loadForecast(pos.coords.latitude, pos.coords.longitude);
      },
      () => setWeatherError("Standort für Wetter nicht verfügbar.")
    );
  }

  async function loadForecast(lat, lon) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode&forecast_days=5&timezone=auto`
      );
      const data = await res.json();
      setForecast(data.daily);
    } catch {
      setForecastError("Vorhersage nicht verfügbar.");
    }
  }

  function weatherCodeToIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  }

  function weatherCodeToLabel(code) {
    if (code === 0) return "Sonnig";
    if (code <= 2) return "Leicht bewölkt";
    if (code <= 3) return "Bewölkt";
    if (code <= 48) return "Neblig";
    if (code <= 55) return "Nieselregen";
    if (code <= 67) return "Regen";
    if (code <= 77) return "Schnee";
    if (code <= 82) return "Regenschauer";
    return "Gewitter";
  }

  function calcRideScore(w) {
    if (!w) return null;
    let score = 100;
    const t = w.temperature;
    if (t < 2) score -= 50;
    else if (t < 5) score -= 35;
    else if (t < 10) score -= 15;
    else if (t > 38) score -= 25;
    else if (t > 32) score -= 10;
    if (w.windspeed > 70) score -= 40;
    else if (w.windspeed > 50) score -= 25;
    else if (w.windspeed > 35) score -= 10;
    if (w.precipitation > 2) score -= 40;
    else if (w.precipitation > 0.5) score -= 20;
    else if (w.precipitation > 0) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  function getRideAdvice(w) {
    if (!w) return "";
    if (w.precipitation > 2) return "Nasse Fahrbahn — Fahren nicht empfohlen.";
    if (w.precipitation > 0) return "Leichter Niederschlag — vorsichtig fahren.";
    if (w.windspeed > 60) return "Sehr starker Wind — erhöhte Gefahr.";
    if (w.windspeed > 40) return "Starker Wind — Seitenwind möglich.";
    if (w.temperature < 5) return "Sehr kalt — Reifengriff eingeschränkt.";
    if (w.temperature < 10) return "Kalt — warme Ausrüstung empfohlen.";
    if (w.temperature > 35) return "Sehr heiß — ausreichend trinken.";
    return "Gute Bedingungen — viel Spaß auf der Strecke!";
  }

  function exportGPX(routePoints, name) {
    const pts = routePoints
      .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
      .join("\n");
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="MotoTrack">\n  <trk>\n    <name>${name}</name>\n    <trkseg>\n${pts}\n    </trkseg>\n  </trk>\n</gpx>`;
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importGPX(file) {
    const text = await file.text();
    const xml = new DOMParser().parseFromString(text, "application/xml");
    const nodes = xml.querySelectorAll("trkpt, rtept, wpt");
    const points = Array.from(nodes)
      .map((n) => [parseFloat(n.getAttribute("lat")), parseFloat(n.getAttribute("lon"))])
      .filter(([a, b]) => !isNaN(a) && !isNaN(b));
    if (points.length < 2) {
      alert("Ungültige GPX-Datei oder zu wenig Punkte.");
      return;
    }
    setCustomRoutePoints(points);
    setRoute(points);
    setPosition(points[0]);
    setRouteBuilderActive(false);
    setSelectedPlannedRoute(null);
    setPlannedRouteStats(null);
    setActivePage("map");
    calculateRoadRoute(points);
  }

  function shareRoute() {
    const points =
      customRoutePoints.length > 1
        ? customRoutePoints
        : selectedPlannedRoute?.routePoints || [];
    if (points.length < 2) {
      alert("Keine Route zum Teilen vorhanden.");
      return;
    }
    const slim = points.map(([a, b]) => [+(a.toFixed(5)), +(b.toFixed(5))]);
    const encoded = btoa(JSON.stringify(slim));
    const url = `${window.location.origin}?route=${encoded}`;
    if (navigator.share) {
      navigator.share({ title: "MotoTrack Route", url });
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Link in Zwischenablage kopiert!"))
        .catch(() => alert(url));
    }
  }

  function addExpense() {
    if (!expenseName.trim() || !expenseAmount) return;
    const entry = {
      id: crypto.randomUUID(),
      name: expenseName,
      amount: Number(expenseAmount),
      category: expenseCategory,
      date: new Date().toLocaleDateString("de-DE"),
    };
    updateBike({ expenses: [entry, ...(selectedBike.expenses || [])] });
    setExpenseName("");
    setExpenseAmount("");
    showToast("Ausgabe gespeichert!", `${expenseName} · ${Number(expenseAmount).toFixed(2)} €`);
  }

  function deleteExpense(idx) {
    updateBike({
      expenses: (selectedBike.expenses || []).filter((_, i) => i !== idx),
    });
  }

  function toggleChecklistItem(itemId) {
    const list = (selectedBike.checklist || []).map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    updateBike({ checklist: list });
  }

  function resetChecklist() {
    const list = (selectedBike.checklist || []).map((item) => ({
      ...item,
      checked: false,
    }));
    updateBike({ checklist: list });
    showToast("Checkliste zurückgesetzt!", "Alle Punkte wieder offen");
  }

  function addChecklistItem() {
    if (!newChecklistItem.trim()) return;
    const item = {
      id: crypto.randomUUID(),
      label: newChecklistItem.trim(),
      checked: false,
    };
    updateBike({ checklist: [...(selectedBike.checklist || []), item] });
    setNewChecklistItem("");
    showToast("Punkt hinzugefügt!", newChecklistItem.trim());
  }

  function deleteChecklistItem(itemId) {
    updateBike({
      checklist: (selectedBike.checklist || []).filter((i) => i.id !== itemId),
    });
  }

  function handlePhotoUploadMulti(event) {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setBikes((prev) =>
          prev.map((bike) =>
            bike.id === selectedBike.id
              ? { ...bike, photos: [...(bike.photos || []), reader.result] }
              : bike
          )
        );
      };
      reader.readAsDataURL(file);
    });
  }

  function deletePhoto(idx) {
    updateBike({ photos: (selectedBike.photos || []).filter((_, i) => i !== idx) });
  }

  function undoLastRoutePoint() {
    setCustomRoutePoints((prev) => {
      const newPoints = prev.slice(0, -1);
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      else { setRoute(newPoints); setPlannedRouteStats(null); }
      return newPoints;
    });
    setWaypointNames((prev) => prev.slice(0, -1));
  }

  function deleteWaypointAt(index) {
    setCustomRoutePoints((prev) => {
      const newPoints = prev.filter((_, i) => i !== index);
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      else { setRoute(newPoints); setPlannedRouteStats(null); setCurveStats(null); }
      return newPoints;
    });
    setWaypointNames((prev) => prev.filter((_, i) => i !== index));
  }

  async function searchField(query, field) {
    if (!query || query.length < 2) { field === "start" ? setStartSuggestions([]) : setEndSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4&addressdetails=1`,
        { headers: { "Accept-Language": "de" } }
      );
      const data = await res.json();
      const sugg = data.map((d) => ({ name: d.display_name.split(",").slice(0, 2).join(", ").trim(), lat: Number(d.lat), lon: Number(d.lon) }));
      field === "start" ? setStartSuggestions(sugg) : setEndSuggestions(sugg);
    } catch { /* ignore */ }
  }

  function setRouteStart(lat, lon, name) {
    setStartSearch(name);
    setStartSuggestions([]);
    setCustomRoutePoints((prev) => {
      const rest = prev.length > 1 ? prev.slice(1) : (prev.length === 1 ? [] : []);
      const newPoints = [[lat, lon], ...rest];
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      else setRoute(newPoints);
      return newPoints;
    });
    setWaypointNames((prev) => {
      const rest = prev.length > 1 ? prev.slice(1) : (prev.length === 1 ? [] : []);
      return [name, ...rest];
    });
    setSelectedPlannedRoute(null);
  }

  function setRouteEnd(lat, lon, name) {
    setEndSearch(name);
    setEndSuggestions([]);
    setCustomRoutePoints((prev) => {
      const base = prev.length === 0 ? [] : prev.length === 1 ? prev : prev.slice(0, -1);
      const newPoints = [...base, [lat, lon]];
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      else setRoute(newPoints);
      return newPoints;
    });
    setWaypointNames((prev) => {
      const base = prev.length <= 1 ? prev : prev.slice(0, -1);
      return [...base, name];
    });
    setSelectedPlannedRoute(null);
  }

  async function snapToRoad(lat, lon) {
    try {
      const res = await fetch(`https://router.project-osrm.org/nearest/v1/driving/${lon},${lat}?number=1`);
      const data = await res.json();
      if (data.waypoints?.[0]?.location) {
        const [snapLon, snapLat] = data.waypoints[0].location;
        return { lat: snapLat, lon: snapLon };
      }
    } catch { /* fallback */ }
    return { lat, lon };
  }

  async function searchInsert(query) {
    if (!query || query.length < 2) { setInsertSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4`, { headers: { "Accept-Language": "de" } });
      const data = await res.json();
      setInsertSuggestions(data.map((d) => ({ name: d.display_name.split(",").slice(0, 2).join(", ").trim(), lat: Number(d.lat), lon: Number(d.lon) })));
    } catch { /* ignore */ }
  }

  function confirmInsert(lat, lon, name) {
    const idx = insertingAtIndex;
    setInsertSearch(""); setInsertSuggestions([]); setInsertingAtIndex(null);
    setCustomRoutePoints((prev) => {
      const newPoints = [...prev.slice(0, idx), [lat, lon], ...prev.slice(idx)];
      if (newPoints.length >= 2) calculateRoadRoute(newPoints);
      return newPoints;
    });
    setWaypointNames((prev) => [...prev.slice(0, idx), name, ...prev.slice(idx)]);
  }

  async function contextMenuAction(action, lat, lon) {
    setMapContextMenu(null);
    const snapped = await snapToRoad(lat, lon);
    const name = await geocodeCity(snapped.lat, snapped.lon);
    if (action === "end") setRouteEnd(snapped.lat, snapped.lon, name);
    else if (action === "start") setRouteStart(snapped.lat, snapped.lon, name);
    else if (action === "waypoint") {
      const insertIdx = findInsertIndex([lat, lon], customRoutePoints);
      setCustomRoutePoints((prev) => {
        const newPoints = [...prev.slice(0, insertIdx), [snapped.lat, snapped.lon], ...prev.slice(insertIdx)];
        if (newPoints.length >= 2) calculateRoadRoute(newPoints);
        return newPoints;
      });
      setWaypointNames((prev) => [...prev.slice(0, insertIdx), name, ...prev.slice(insertIdx)]);
    }
  }

  function findInsertIndex(clickedPt, waypoints) {
    if (waypoints.length < 2) return waypoints.length;
    let minDist = Infinity;
    let insertAt = waypoints.length;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const mid = [(waypoints[i][0] + waypoints[i + 1][0]) / 2, (waypoints[i][1] + waypoints[i + 1][1]) / 2];
      const d = (clickedPt[0] - mid[0]) ** 2 + (clickedPt[1] - mid[1]) ** 2;
      if (d < minDist) { minDist = d; insertAt = i + 1; }
    }
    return insertAt;
  }

  async function useMyLocationAsStart() {
    if (!navigator.geolocation) { showToast("GPS nicht verfügbar", ""); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      let name = "Mein Standort";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "de" } });
        const data = await res.json();
        name = (data.address?.road || data.address?.suburb || data.address?.city || "Mein Standort");
      } catch { /* keep default name */ }
      setRouteStart(lat, lon, name);
    }, () => showToast("Standort nicht verfügbar", "GPS-Zugriff verweigert"));
  }

  function switchToAltRoute() {
    if (!altRoute) return;
    setRoute(altRoute.route);
    setPlannedRouteStats({ distance: altRoute.distance, duration: altRoute.duration, points: customRoutePoints.length });
    setCurveStats(altRoute.curveStats);
    fetchElevation(altRoute.route.map((p) => [p[1], p[0]]), parseFloat(altRoute.distance));
    setAltRoute(null);
  }

  function closeRouteAsLoop() {
    if (customRoutePoints.length < 2) return;
    const start = customRoutePoints[0];
    const startName = waypointNames[0] || "Start";
    setCustomRoutePoints((prev) => {
      const newPoints = [...prev, start];
      calculateRoadRoute(newPoints);
      return newPoints;
    });
    setWaypointNames((prev) => [...prev, startName]);
  }

  function savePlannedRoute() {
    if (route.length < 2 || !plannedRouteStats) return;
    const name = pendingRouteName.trim() ||
      (waypointNames.length >= 2
        ? `${waypointNames[0]} → ${waypointNames[waypointNames.length - 1]}`
        : `Route vom ${new Date().toLocaleDateString("de-DE")}`);

    const newTour = {
      id: crypto.randomUUID(),
      name,
      km: plannedRouteStats.distance,
      date: "Geplante Route",
      planned: true,
      duration: `${plannedRouteStats.duration} min`,
      elevation: "-",
      difficulty: "Benutzerdefiniert",
      curveFactor: curveStats ? `${curveStats.emoji} ${curveStats.label}` : "-",
      routePoints: customRoutePoints,
      routeLine: route,
    };

    updateBike({ tours: [newTour, ...selectedBike.tours] });
    showToast("Route gespeichert!", name);
    setPendingRouteName("");
  }

  function openNavigation(app) {
    const navigationPoints =
      customRoutePoints.length > 1
        ? customRoutePoints
        : selectedPlannedRoute?.routePoints?.length > 1
        ? selectedPlannedRoute.routePoints
        : [];

    if (navigationPoints.length < 2) {
      alert("Bitte zuerst eine Route mit mindestens Start und Ziel erstellen.");
      return;
    }

    const start = navigationPoints[0];
    const destination = navigationPoints[navigationPoints.length - 1];
    const waypoints = navigationPoints.slice(1, -1);

    const startText = `${start[0]},${start[1]}`;
    const destinationText = `${destination[0]},${destination[1]}`;

    if (app === "google") {
      const waypointText = waypoints
        .map((point) => `${point[0]},${point[1]}`)
        .join("|");

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${startText}` +
        `&destination=${destinationText}` +
        `&travelmode=driving` +
        (waypointText ? `&waypoints=${waypointText}` : "");

      window.open(url, "_blank");
    }

    if (app === "apple") {
      window.open(
        `https://maps.apple.com/?saddr=${startText}&daddr=${destinationText}&dirflg=d`,
        "_blank"
      );
    }
  }

  function MapController({ center, follow }) {
    const { current: map } = useMap();
    useEffect(() => {
      if (follow && map) map.flyTo({ center: [center[1], center[0]], zoom: map.getZoom() });
    }, [center[0], center[1], follow]);
    return null;
  }

  function MarkerPin({ type = "waypoint", label = "" }) {
    const cfg = {
      start:    { bg: "#22c55e", text: "S", size: 34, fs: 14 },
      end:      { bg: "#ef4444", text: "Z", size: 34, fs: 14 },
      waypoint: { bg: "#f97316", text: label, size: 28, fs: 11 },
      position: { bg: "#3b82f6", text: "●", size: 34, fs: 16 },
    };
    const s = cfg[type] || cfg.waypoint;
    return (
      <div style={{
        background: s.bg, width: s.size, height: s.size, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: s.fs, color: "white",
        border: "2.5px solid rgba(0,0,0,0.45)", boxShadow: "0 3px 14px rgba(0,0,0,0.55)",
      }}>{s.text}</div>
    );
  }

  async function handleMapClick(e) {
    if (!routeBuilderActive) return;
    const clickedPt = [e.lngLat.lat, e.lngLat.lng];

    // If clicked on the route line and route exists → insert intermediate waypoint
    let onRoute = [];
    if (route.length > 1) {
      try { onRoute = e.target.queryRenderedFeatures(e.point, { layers: ["map-route-line"] }); } catch { /* layer not yet in style */ }
    }
    if (onRoute.length > 0 && customRoutePoints.length >= 2) {
      const insertIdx = findInsertIndex(clickedPt, customRoutePoints);
      const name = await geocodeCity(clickedPt[0], clickedPt[1]);
      setCustomRoutePoints((prev) => {
        const newPoints = [...prev.slice(0, insertIdx), clickedPt, ...prev.slice(insertIdx)];
        calculateRoadRoute(newPoints);
        return newPoints;
      });
      setWaypointNames((prev) => [...prev.slice(0, insertIdx), name, ...prev.slice(insertIdx)]);
      return;
    }

    // If points already exist → show context menu
    if (customRoutePoints.length > 0) {
      setMapContextMenu({ lat: clickedPt[0], lon: clickedPt[1], x: e.point.x, y: e.point.y });
      return;
    }

    // No points yet → set as start
    const snapped = await snapToRoad(clickedPt[0], clickedPt[1]);
    const name = await geocodeCity(snapped.lat, snapped.lon);
    setCustomRoutePoints([[snapped.lat, snapped.lon]]);
    setWaypointNames([name]);
    setStartSearch(name);
    setRoute([[snapped.lat, snapped.lon]]);
    setSelectedPlannedRoute(null);
  }

  function handleWaypointDrag(index, e) {
    const { lng, lat } = e.lngLat;
    setCustomRoutePoints((prev) => {
      const updated = [...prev];
      updated[index] = [lat, lng];
      if (updated.length >= 2) calculateRoadRoute(updated);
      return updated;
    });
  }

  function MiniMap({ height = "420px", follow = false }) {
    const routeGeoJSON = route.length > 1 ? {
      type: "Feature",
      geometry: { type: "LineString", coordinates: route.map((p) => [p[1], p[0]]) },
    } : null;

    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10" style={{ height }}>
        {placeName && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl shadow-xl">
              <span className="text-red-400 text-sm">📍</span>
              <span className="text-white text-sm font-bold whitespace-nowrap">{placeName}</span>
            </div>
          </div>
        )}
        <MapGL
          initialViewState={{ longitude: position[1], latitude: position[0], zoom: follow ? 15 : 11 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          scrollZoom={false}
          attributionControl={false}
        >
          <MapController center={position} follow={follow} />
          <Marker longitude={position[1]} latitude={position[0]} anchor="center">
            <MarkerPin type="position" />
          </Marker>
          {routeGeoJSON && (
            <Source id="minimap-route" type="geojson" data={routeGeoJSON}>
              <Layer id="minimap-route-shadow" type="line" paint={{ "line-color": "#000", "line-width": 9, "line-opacity": 0.3 }} layout={{ "line-cap": "round", "line-join": "round" }} />
              <Layer id="minimap-route-line" type="line" paint={{ "line-color": "#ef4444", "line-width": 5 }} layout={{ "line-cap": "round", "line-join": "round" }} />
            </Source>
          )}
        </MapGL>
      </div>
    );
  }

  function Card({ children, className = "" }) {
    return (
      <div className={`bg-black/40 backdrop-blur-2xl border border-white/8 rounded-[1.5rem] p-6 ${className}`}>
        {children}
      </div>
    );
  }

  function Stat({ label, value, color = "text-white" }) {
    return (
      <div className="rounded-xl bg-white/4 border border-white/6 px-4 py-3">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.15em] font-bold">{label}</p>
        <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
      </div>
    );
  }

  const oilServiceIn =
    16000 - (Number(selectedBike.mileage) - Number(selectedBike.lastOilChange));

  const chainServiceIn =
    13000 -
    (Number(selectedBike.mileage) - Number(selectedBike.lastChainService));

  const latestFuelLog = selectedBike.fuelLogs[0];
  const latestRide = selectedBike.tours.find((tour) => tour.time);

  const analytics = useMemo(() => {
    const totalKm = selectedBike.tours.reduce(
      (sum, tour) => sum + Number(tour.km || 0),
      0
    );

    const highestLean = selectedBike.tours.reduce(
      (max, tour) => Math.max(max, Number(tour.maxLeanAngle || 0)),
      0
    );

    const highestSpeed = selectedBike.tours.reduce(
      (max, tour) => Math.max(max, Number(tour.maxSpeed || 0)),
      0
    );

    return {
      totalKm,
      highestLean,
      highestSpeed,
      averageTour:
        selectedBike.tours.length > 0
          ? (totalKm / selectedBike.tours.length).toFixed(1)
          : 0,
    };
  }, [selectedBike]);

  // ── Chart helpers ──────────────────────────────────────────────────────────
  function SimpleBar({ label, value, max, unit = "", color = "#ef4444" }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 text-xs w-24 shrink-0 truncate">{label}</span>
        <div className="flex-1 bg-zinc-900 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-white font-bold text-xs w-16 text-right shrink-0">
          {value}{unit}
        </span>
      </div>
    );
  }

  function MiniLineChart({ values, color = "#ef4444", labels = [] }) {
    if (values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const W = 100;
    const H = 50;
    const pts = values.map((v, i) => ({
      x: (i / (values.length - 1)) * W,
      y: H - ((v - min) / range) * H * 0.85 - H * 0.075,
    }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return (
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
          <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
          ))}
        </svg>
        {labels.length > 0 && (
          <div className="flex justify-between mt-1">
            {labels.map((l, i) => (
              <span key={i} className="text-zinc-500 text-[10px]">{l}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function TireWearBar({ profile, lastMeasuredKm, currentKm }) {
    const measured = parseFloat(profile) || 0;
    const kmSince = Math.max(0, Number(currentKm || 0) - Number(lastMeasuredKm || 0));
    const estimated = Math.max(0, measured - (kmSince / 1000) * 0.2);
    const isEstimated = kmSince > 200;
    const depth = isEstimated ? estimated : measured;
    const max = 7;
    const pct = Math.min((depth / max) * 100, 100);
    const color = depth < 2 ? "#ef4444" : depth < 4 ? "#f97316" : "#22c55e";
    const label = depth < 2 ? "Dringend erneuern!" : depth < 4 ? "Bald erneuern" : "OK";
    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-zinc-400">Profiltiefe</span>
          <div className="flex items-center gap-2">
            {isEstimated && <span className="text-zinc-500 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">geschätzt</span>}
            <span style={{ color }} className="font-black">{depth.toFixed(1)} mm — {label}</span>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
          <span>0 mm</span><span>Minimum 1.6 mm</span><span>Neu 7 mm</span>
        </div>
        {isEstimated && (
          <p className="text-zinc-600 text-[10px] mt-1.5">
            Letzte Messung: {measured}mm @ {Number(lastMeasuredKm).toLocaleString()} km · +{kmSince.toLocaleString()} km gefahren
          </p>
        )}
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const brakeFrontIn = 20000 - (Number(selectedBike.mileage) - Number(selectedBike.lastBrakesFront || 0));
  const brakeRearIn  = 15000 - (Number(selectedBike.mileage) - Number(selectedBike.lastBrakesRear  || 0));
  const coolantIn    = 30000 - (Number(selectedBike.mileage) - Number(selectedBike.lastCoolant     || 0));
  const batteryIn    = 50000 - (Number(selectedBike.mileage) - Number(selectedBike.lastBattery     || 0));
  const inspectionIn = 12000 - (Number(selectedBike.mileage) - Number(selectedBike.lastInspection  || 0));

  const totalFuelCost = (selectedBike.fuelLogs || []).reduce(
    (s, l) => s + Number(l.totalCost || 0), 0
  );

  const now = new Date();
  const thisWeekFuelCost = (selectedBike.fuelLogs || []).reduce((s, l) => {
    const parts = (l.date || "").split(".");
    if (parts.length !== 3) return s;
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return (now - d) / (1000 * 60 * 60 * 24) <= 7 ? s + Number(l.totalCost || 0) : s;
  }, 0);
  const thisMonthFuelCost = (selectedBike.fuelLogs || []).reduce((s, l) => {
    const parts = (l.date || "").split(".");
    if (parts.length !== 3) return s;
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      ? s + Number(l.totalCost || 0) : s;
  }, 0);
  const fuelTrend = useMemo(() => {
    const logs = selectedBike.fuelLogs || [];
    if (logs.length < 2) return null;
    const last = Number(logs[0].consumption);
    const prev = Number(logs[1].consumption);
    if (last > prev + 0.3) return "up";
    if (last < prev - 0.3) return "down";
    return "stable";
  }, [selectedBike.fuelLogs]);

  const totalExpenses = (selectedBike.expenses || []).reduce(
    (s, e) => s + Number(e.amount || 0), 0
  );

  const monthlyKm = useMemo(() => {
    const map = {};
    (selectedBike.tours || []).forEach((t) => {
      const parts = (t.date || "").split(".");
      if (parts.length === 3) {
        const key = `${parts[1]}/${parts[2].slice(-2)}`;
        map[key] = (map[key] || 0) + Number(t.km || 0);
      }
    });
    return Object.entries(map)
      .slice(-6)
      .map(([label, value]) => ({ label, value: Math.round(value) }));
  }, [selectedBike.tours]);

  const navItems = [
    ["dashboard", "Dashboard"],
    ["ride", "Live Ride"],
    ["map", "Karte"],
    ["discover", "Entdecken"],
    ["tours", "Touren"],
    ["garage", "Garage"],
    ["service", "Service"],
    ["fuel", "Tanken"],
    ["stats", "Statistiken"],
    ["costs", "Kosten"],
    ["checklist", "Checkliste"],
    ["weather", "Wetter"],
    ["documents", "Handbücher"],
  ];

  const PAGE_META = {
    ride:      { label: "Live Ride",    emoji: "▶️",  color: "from-red-600 to-orange-500" },
    map:       { label: "Karte",        emoji: "📍",  color: "from-emerald-600 to-green-500" },
    discover:  { label: "Entdecken",    emoji: "🗺️",  color: "from-blue-600 to-sky-500" },
    tours:     { label: "Touren",       emoji: "🏁",  color: "from-orange-600 to-amber-500" },
    garage:    { label: "Garage",       emoji: "🔧",  color: "from-zinc-600 to-zinc-500" },
    service:   { label: "Service",      emoji: "⚙️",  color: "from-yellow-600 to-amber-500" },
    fuel:      { label: "Tanken",       emoji: "⛽",  color: "from-red-700 to-rose-500" },
    stats:     { label: "Statistiken",  emoji: "📊",  color: "from-blue-700 to-indigo-500" },
    costs:     { label: "Kosten",       emoji: "💰",  color: "from-emerald-700 to-teal-500" },
    checklist: { label: "Checkliste",   emoji: "✅",  color: "from-teal-600 to-cyan-500" },
    weather:   { label: "Wetter",       emoji: "🌤️",  color: "from-sky-600 to-blue-400" },
    documents: { label: "Handbücher",   emoji: "📖",  color: "from-indigo-600 to-purple-500" },
  };

  function toggleFavorite(page) {
    setFavorites((prev) => {
      const next = prev.includes(page) ? prev.filter((p) => p !== page) : prev.length < 3 ? [...prev, page] : prev;
      localStorage.setItem("moto-favorites", JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="min-h-screen text-white" style={mainBgStyle}>
      <div className="flex">
        <aside className="hidden xl:flex fixed left-0 top-0 h-screen w-72 border-r border-white/8 bg-black/50 backdrop-blur-3xl flex-col p-6 z-50">
          <div>
            <p className="text-red-500 font-black tracking-[0.35em] text-sm">
              MOTOTRACK
            </p>

            <h1 className="text-4xl font-black mt-3">Ride Dashboard</h1>

            <p className="text-zinc-500 mt-3">
              Alles für dein Motorrad in einer App.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 overflow-auto">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActivePage(key)}
                className={`rounded-2xl px-5 py-4 text-left font-bold transition ${
                  activePage === key
                    ? "bg-red-600 text-white shadow-xl shadow-red-600/30"
                    : "bg-white/5 hover:bg-white/10 text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* REV Button in Sidebar */}
          <div className="mt-auto pt-6">
            <div className="relative"
              onMouseEnter={() => setRevBubbleOpen(true)}
              onMouseLeave={() => setRevBubbleOpen(false)}
            >
              {/* Sprechblase */}
              {revBubbleOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-3 z-10">
                  <div className="bg-zinc-900 border border-white/12 rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <Rev size={40} animate={true} />
                      <div>
                        <p className="text-white font-black text-sm">Hey, ich bin REV!</p>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">Dein KI-Mechaniker. Nach jeder Fahrt analysiere ich deinen Fahrstil, Speed und Schräglage — und gebe dir persönliches Feedback.</p>
                        <p className="text-red-400 text-xs font-bold mt-2">Klick mich um die Analyse zu sehen →</p>
                      </div>
                    </div>
                    {/* Pfeil nach unten */}
                    <div className="absolute bottom-[-6px] left-8 w-3 h-3 bg-zinc-900 border-r border-b border-white/12 rotate-45" />
                  </div>
                </div>
              )}

              <button
                onClick={() => setRevModalOpen(true)}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-red-600/15 border border-white/8 hover:border-red-500/30 px-4 py-3 rounded-2xl transition group"
              >
                <Rev size={36} animate={true} />
                <div className="text-left">
                  <p className="text-xs font-black tracking-widest text-red-400">KI</p>
                  <p className="text-white font-black text-sm leading-none">REV</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </button>
            </div>
          </div>
        </aside>

        <div className="xl:ml-72 w-full">
          <div className="xl:hidden sticky top-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/8 p-4 flex items-center justify-between">
            <div>
              <p className="text-red-500 font-black tracking-[0.25em] text-xs">
                MOTOTRACK
              </p>

              <h1 className="text-2xl font-black">Ride Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevModalOpen(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-red-600/15 border border-white/8 px-3 py-2 rounded-2xl transition"
              >
                <Rev size={28} animate={true} />
                <div className="text-left leading-none">
                  <p className="text-[9px] font-black tracking-widest text-red-400">KI</p>
                  <p className="text-white font-black text-xs">REV</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-12 w-12 rounded-2xl bg-white/10 text-2xl"
              >
                ☰
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="xl:hidden p-4 bg-black/60 backdrop-blur-2xl border-b border-white/8 flex flex-col gap-3">
              {navItems.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActivePage(key);
                    setMenuOpen(false);
                  }}
                  className={`rounded-2xl px-5 py-4 text-left font-bold transition ${
                    activePage === key
                      ? "bg-red-600 text-white"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="max-w-[1700px] mx-auto p-5 md:p-8">
            <div key={activePage} className={activePage === "map" ? "map-enter" : "page-enter"}>
            {activePage === "dashboard" && (
              <div className="space-y-6">
                {/* Hero — kein Card-Wrapper, direkt auf dem Hintergrund */}
                <div className="pt-2 pb-4">
                  <div className="max-w-3xl">
                    <p className="text-red-400 font-black tracking-[0.3em] text-xs mb-4">
                      READY TO RIDE
                    </p>
                    <h2 className="text-5xl md:text-7xl font-black leading-none drop-shadow-2xl">
                      {selectedBike.brand}
                      <br />
                      <span className="text-white/80">{selectedBike.model}</span>
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-5 text-zinc-400 text-sm font-semibold">
                      <span className="bg-white/8 backdrop-blur px-3 py-1 rounded-full border border-white/10">{selectedBike.year}</span>
                      <span className="bg-white/8 backdrop-blur px-3 py-1 rounded-full border border-white/10">{selectedBike.power}</span>
                      <span className="bg-white/8 backdrop-blur px-3 py-1 rounded-full border border-white/10">{selectedBike.licensePlate}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-8">
                      {/* Fahrt starten */}
                      <button
                        onClick={() => setActivePage("ride")}
                        className="group relative overflow-hidden rounded-[1.5rem] px-7 py-4 transition duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: "linear-gradient(135deg, #dc2626 0%, #f97316 60%, #ef4444 100%)", boxShadow: "0 8px 32px rgba(220,38,38,0.55), 0 2px 8px rgba(0,0,0,0.4)" }}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-[1.5rem]" />
                        <div className="relative flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/25">
                            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-0.5"><polygon points="5,3 19,12 5,21" /></svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-black text-white tracking-wide">Fahrt starten</p>
                            <p className="text-orange-100/80 text-xs font-semibold mt-0.5">Live Tracking aktivieren</p>
                          </div>
                        </div>
                      </button>

                      {/* Design */}
                      <button
                        onClick={() => setShowDesignPanel(true)}
                        className="flex items-center gap-2 bg-white/8 hover:bg-white/15 backdrop-blur-xl border border-white/12 px-5 py-4 rounded-[1.5rem] font-bold text-sm transition"
                      >
                        <span>🎨</span> Design
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-5">
                  <Stat label="Kilometerstand" value={`${selectedBike.mileage} km`} />
                  <Stat label="TÜV" value={selectedBike.tuv || "--"} color="text-green-400" />
                  <Stat
                    label="Ölwechsel"
                    value={`${oilServiceIn} km`}
                    color={oilServiceIn < 1000 ? "text-red-400" : "text-yellow-400"}
                  />
                  <Stat
                    label="Kette"
                    value={`${chainServiceIn} km`}
                    color={chainServiceIn < 500 ? "text-red-400" : "text-green-400"}
                  />
                </div>

                {/* Favoriten */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-400 text-xs font-black tracking-[0.25em] uppercase">Schnellzugriff</p>
                    <button
                      onClick={() => setFavEditMode((v) => !v)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${favEditMode ? "bg-white text-black" : "bg-white/8 text-zinc-400 hover:text-white"}`}
                    >
                      {favEditMode ? "Fertig" : "✏️ Anpassen"}
                    </button>
                  </div>

                  {favEditMode ? (
                    <div className="bg-black/40 border border-white/8 rounded-[1.2rem] p-4">
                      <p className="text-zinc-500 text-sm mb-4">Wähle bis zu <span className="text-white font-bold">3 Favoriten</span></p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PAGE_META).map(([page, meta]) => {
                          const active = favorites.includes(page);
                          const disabled = !active && favorites.length >= 3;
                          return (
                            <button
                              key={page}
                              onClick={() => !disabled && toggleFavorite(page)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                                active ? "bg-white text-black border-white"
                                : disabled ? "opacity-30 border-white/5 cursor-not-allowed text-zinc-500"
                                : "bg-white/5 text-zinc-300 border-white/8 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{meta.emoji}</span>{meta.label}
                              {active && <span className="text-xs opacity-60">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {(favorites.length === 0 ? ["service", "fuel", "costs"] : favorites).map((page) => {
                        const meta = PAGE_META[page];
                        if (!meta) return null;
                        return (
                          <button
                            key={page}
                            onClick={() => setActivePage(page)}
                            className="group relative rounded-2xl bg-black/40 hover:bg-white/6 border border-white/8 hover:border-white/15 p-5 text-left transition-all duration-200 active:scale-[0.97]"
                          >
                            <div className="absolute top-0 left-0 right-0 h-px bg-white/8 rounded-t-2xl group-hover:bg-white/20 transition-colors" />
                            <span className="text-2xl block mb-3">{meta.emoji}</span>
                            <p className="font-bold text-sm text-zinc-400 group-hover:text-white transition-colors">{meta.label}</p>
                          </button>
                        );
                      })}
                      {favorites.length < 3 && Array.from({ length: 3 - favorites.length }).map((_, i) => (
                        <button
                          key={`empty-${i}`}
                          onClick={() => setFavEditMode(true)}
                          className="rounded-2xl border border-dashed border-white/8 p-5 text-center text-zinc-600 hover:border-white/20 hover:text-zinc-400 transition-all"
                        >
                          <span className="text-xl block mb-1">+</span>
                          <p className="text-xs font-bold">Hinzufügen</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-3xl font-black">Deine letzte Fahrt</h2>
                      <button
                        onClick={() => setActivePage("tours")}
                        className="text-red-400 font-bold"
                      >
                        Alle Touren
                      </button>
                    </div>

                    {latestRide ? (
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">{latestRide.date} · {latestRide.time}</p>
                        <h3 className="text-xl font-black text-white">{latestRide.name}</h3>
                        <div className="flex flex-wrap gap-6 mt-5">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Strecke</p>
                            <p className="text-2xl font-black text-white">{latestRide.km} km</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Top Speed</p>
                            <p className="text-2xl font-black text-red-400">{latestRide.maxSpeed} km/h</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Max Lean</p>
                            <p className="text-2xl font-black text-orange-400">{latestRide.maxLeanAngle}°</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Score</p>
                            <p className="text-2xl font-black text-green-400">{latestRide.rideScore ?? "—"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center text-center">
                        <p className="text-zinc-500 text-sm">Noch keine Fahrt aufgezeichnet.</p>
                        <button
                          onClick={() => setActivePage("ride")}
                          className="mt-4 bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-xl font-bold text-sm transition"
                        >
                          Erste Fahrt starten
                        </button>
                      </div>
                    )}
                  </Card>

                  <Card>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">Gesamtstatistik</p>
                    <div className="space-y-3">
                      {[
                        { label: "Touren", value: selectedBike.tours.length, suffix: "" },
                        { label: "Gesamtstrecke", value: analytics.totalKm.toFixed(0), suffix: " km" },
                        { label: "Top Speed", value: analytics.highestSpeed, suffix: " km/h", color: "text-red-400" },
                        { label: "Max Lean", value: `${analytics.highestLean}°`, suffix: "", color: "text-orange-400" },
                      ].map(({ label, value, suffix, color }) => (
                        <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                          <span className="text-zinc-400 text-sm">{label}</span>
                          <span className={`font-black text-sm ${color || "text-white"}`}>{value}{suffix}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-red-400 text-xs font-black tracking-[0.25em]">
                        ROUTE PLANNER
                      </p>

                      <h2 className="text-3xl font-black mt-1">
                        Route planen
                      </h2>

                      <p className="text-zinc-400 text-sm mt-1">
                        Eigene Route erstellen oder gespeicherte Strecke anzeigen.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setActivePage("map");
                          setRouteBuilderActive(true);
                          setSelectedPlannedRoute(null);
                          setRoute([]);
                          setCustomRoutePoints([]);
                          setPlannedRouteStats(null);
                        }}
                        className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-black"
                      >
                        Route erstellen
                      </button>

                      <button
                        onClick={() => setActivePage("discover")}
                        className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-2xl font-black"
                      >
                        Strecken entdecken
                      </button>
                    </div>
                  </div>

                  <MiniMap height="320px" />
                </Card>
              </div>
            )}

            {activePage === "ride" && (
              <div className="space-y-6">
                <Card>
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="font-black tracking-[0.25em] text-xs text-red-400">
                        LIVE TELEMETRY
                      </p>
                      <h2 className="text-5xl font-black mt-2 text-white">Live Ride</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${rideStatus === "active" ? "bg-green-400 animate-pulse" : rideStatus === "searching" ? "bg-yellow-400 animate-pulse" : "bg-zinc-600"}`} />
                        <p className="text-zinc-400 text-sm font-semibold">{getRideStatusText()}</p>
                      </div>
                    </div>

                    {/* Geschwindigkeit groß */}
                    <div className="flex items-end gap-2">
                      <span className="text-8xl font-black text-white leading-none">{speed}</span>
                      <span className="text-2xl font-bold text-zinc-400 mb-2">km/h</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                    <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Fahrzeit</p>
                      <p className="text-white font-black text-lg mt-1">{formatRideTime(rideTime)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Strecke</p>
                      <p className="text-white font-black text-lg mt-1">{routeDistance} <span className="text-zinc-400 text-sm">km</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Max Speed</p>
                      <p className="text-orange-400 font-black text-lg mt-1">{maxSpeed} <span className="text-zinc-400 text-sm">km/h</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Durchschnitt</p>
                      <p className="text-blue-400 font-black text-lg mt-1">{averageSpeed} <span className="text-zinc-400 text-sm">km/h</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Max Lean</p>
                      <p className="text-red-400 font-black text-lg mt-1">{maxLeanAngle}<span className="text-zinc-400 text-sm">°</span></p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      onClick={startRide}
                      disabled={rideStatus === "active" || rideStatus === "searching"}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3.5 rounded-2xl font-black text-white transition"
                    >
                      Start
                    </button>
                    <button
                      onClick={stopRide}
                      disabled={rideStatus === "idle"}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3.5 rounded-2xl font-black text-white transition"
                    >
                      Stop
                    </button>
                    <button
                      onClick={clearRoute}
                      className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3.5 rounded-2xl font-black text-zinc-300 transition"
                    >
                      Reset
                    </button>
                  </div>

                  {rideStopped && (
                    <div className="mt-5 bg-white/5 rounded-2xl p-5 border border-white/10">
                      <p className="font-black text-lg mb-3 text-white">Fahrt speichern</p>

                      {routeDistance > 0 ? (
                        <p className="text-zinc-400 mb-4">
                          GPS-Strecke: <span className="font-black text-white">{routeDistance} km</span>
                        </p>
                      ) : (
                        <div className="mb-4">
                          <p className="text-zinc-400 text-sm mb-2">
                            Kein GPS-Signal — km manuell eingeben:
                          </p>
                          <input
                            value={manualRideKm}
                            onChange={(e) => setManualRideKm(e.target.value)}
                            placeholder="z.B. 45"
                            type="number"
                            className="bg-zinc-800 border border-white/15 rounded-xl px-4 py-2.5 outline-none text-white font-bold w-36 focus:border-white/30"
                          />
                          <span className="ml-2 text-zinc-500">km</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={saveTrackedRide}
                          disabled={routeDistance <= 0 && !manualRideKm}
                          className="bg-green-600 hover:bg-green-500 disabled:opacity-30 px-6 py-3 rounded-2xl font-black text-white transition"
                        >
                          Fahrt speichern
                        </button>
                        <button
                          onClick={() => { setRideStopped(false); setManualRideKm(""); }}
                          className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl font-bold text-zinc-300 transition"
                        >
                          Verwerfen
                        </button>
                      </div>
                    </div>
                  )}


                  {gpsError && (
                    <p className="mt-4 bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                      {gpsError}
                    </p>
                  )}
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <h2 className="text-2xl font-black mb-5">
                      Live Schräglage
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Stat label="Aktuell" value={`${leanAngle}°`} />
                      <Stat label="Richtung" value={leanDirection} />
                      <Stat label="Sensor" value={sensorStatus} color={sensorStatus === "Aktiv" ? "text-green-400" : "text-zinc-400"} />
                      <Stat label="Max Links" value={`${maxLeanLeft}°`} color="text-blue-400" />
                      <Stat label="Max Rechts" value={`${maxLeanRight}°`} color="text-orange-400" />
                      <Stat label="Max Gesamt" value={`${maxLeanAngle}°`} color="text-red-400" />
                    </div>

                    <p className="text-zinc-400 text-sm mt-5">
                      Für präzisere Werte sollte das Smartphone fest am Lenker
                      oder Motorrad montiert sein.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5">
                      {sensorStatus === "Aktiv" ? (
                        <button
                          onClick={disableLeanSensor}
                          className="bg-green-700 hover:bg-green-800 px-5 py-3 rounded-xl font-bold"
                        >
                          Sensor deaktivieren
                        </button>
                      ) : (
                        <button
                          onClick={enableLeanSensor}
                          className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-bold"
                        >
                          Sensor aktivieren
                        </button>
                      )}

                      <button
                        onClick={resetLean}
                        className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-bold"
                      >
                        Zurücksetzen
                      </button>
                    </div>

                    {sensorError && (
                      <p className="mt-4 text-red-400">{sensorError}</p>
                    )}
                  </Card>

                  <Card>
                    <h2 className="text-2xl font-black mb-5">Live Route</h2>
                    <MiniMap height="360px" follow={rideStatus === "active"} />
                  </Card>
                </div>
              </div>
            )}

            {activePage === "map" && (() => {
              const makeGeo = (segs) => segs.length > 0 ? {
                type: "FeatureCollection",
                features: segs.map((s) => ({ type: "Feature", geometry: { type: "LineString", coordinates: s.coords ?? s } })),
              } : null;
              const mildGeo    = curveStats?.segments ? makeGeo(curveStats.segments.filter((s) => s.severity === "mild"))    : null;
              const sharpGeo   = curveStats?.segments ? makeGeo(curveStats.segments.filter((s) => s.severity === "sharp"))   : null;
              const extremeGeo = curveStats?.segments ? makeGeo(curveStats.segments.filter((s) => s.severity === "extreme")) : null;

              return (
              <div
                className="relative rounded-[2rem] overflow-hidden border border-white/10"
                style={{ height: "calc(100vh - 150px)", minHeight: "580px" }}
              >
                {/* ── FULL MAP ── */}
                <MapGL
                  ref={mainMapRef}
                  initialViewState={{ longitude: position[1], latitude: position[0], zoom: 13 }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle={MAP_STYLE}
                  cursor="crosshair"
                  onClick={handleMapClick}
                  attributionControl={false}
                  interactiveLayerIds={route.length > 1 ? ["map-route-line"] : []}
                >
                  {/* Alternative Route (kurvenreicher) */}
                  {altRoute && (
                    <Source id="alt-route" type="geojson" data={{ type: "Feature", geometry: { type: "LineString", coordinates: altRoute.route.map((p) => [p[1], p[0]]) } }}>
                      <Layer id="alt-route-line" type="line" paint={{ "line-color": "#a78bfa", "line-width": 4, "line-opacity": 0.5, "line-dasharray": [6, 3] }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  )}

                  {/* Gespeicherte Touren als Linien */}
                  {(selectedBike.tours || []).filter((t) => t.planned && t.routeLine?.length > 1).map((t) => (
                    <Source
                      key={`saved-${t.id}`}
                      id={`saved-${t.id}`}
                      type="geojson"
                      data={{ type: "Feature", geometry: { type: "LineString", coordinates: t.routeLine.map((p) => [p[1], p[0]]) } }}
                    >
                      <Layer id={`saved-${t.id}-line`} type="line" paint={{ "line-color": "#a78bfa", "line-width": 3, "line-opacity": 0.55 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  ))}

                  {/* Motorrad-Pässe */}
                  {passesVisible && MOTO_PASSES.map((p) => (
                    <Marker key={p.id} longitude={p.lon} latitude={p.lat} anchor="bottom">
                      <div
                        title={`${p.name} (${p.alt}m)`}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => setPosition([p.lat, p.lon])}
                      >
                        <div className="bg-orange-500 border-2 border-orange-300 rounded-xl px-2 py-1 shadow-lg group-hover:bg-orange-400 transition-colors">
                          <span className="text-white text-[10px] font-black leading-none whitespace-nowrap">{p.name}</span>
                          <span className="text-orange-200 text-[9px] block text-center">{p.alt}m</span>
                        </div>
                        <div className="w-0.5 h-2 bg-orange-400" />
                        <div className="w-2 h-2 bg-orange-500 rounded-full border border-orange-300" />
                      </div>
                    </Marker>
                  ))}

                  <Marker longitude={position[1]} latitude={position[0]} anchor="center">
                    <MarkerPin type="position" />
                  </Marker>

                  {customRoutePoints.map((point, index) => (
                    <Marker
                      key={`wp-${index}-${point[0]}-${point[1]}`}
                      longitude={point[1]}
                      latitude={point[0]}
                      anchor="center"
                      draggable
                      onDragEnd={(e) => handleWaypointDrag(index, e)}
                    >
                      <MarkerPin
                        type={index === 0 ? "start" : index === customRoutePoints.length - 1 ? "end" : "waypoint"}
                        label={String(index + 1)}
                      />
                    </Marker>
                  ))}

                  {/* Base route — weiß/grau */}
                  {route.length > 1 && (
                    <Source id="map-route" type="geojson" data={{ type: "Feature", geometry: { type: "LineString", coordinates: route.map((p) => [p[1], p[0]]) } }}>
                      <Layer id="map-route-shadow" type="line" paint={{ "line-color": "#000", "line-width": 12, "line-opacity": 0.25 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                      <Layer id="map-route-line" type="line" paint={{ "line-color": "#ffffff", "line-width": 4, "line-opacity": 0.6 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  )}

                  {/* Kurvenreiche Abschnitte — orange/rot hervorgehoben */}
                  {mildGeo && (
                    <Source id="map-mild" type="geojson" data={mildGeo}>
                      <Layer id="map-mild-glow" type="line" paint={{ "line-color": "#facc15", "line-width": 10, "line-opacity": 0.2 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                      <Layer id="map-mild-line" type="line" paint={{ "line-color": "#facc15", "line-width": 4 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  )}
                  {sharpGeo && (
                    <Source id="map-sharp" type="geojson" data={sharpGeo}>
                      <Layer id="map-sharp-glow" type="line" paint={{ "line-color": "#f97316", "line-width": 12, "line-opacity": 0.25 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                      <Layer id="map-sharp-line" type="line" paint={{ "line-color": "#f97316", "line-width": 5 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  )}
                  {extremeGeo && (
                    <Source id="map-extreme" type="geojson" data={extremeGeo}>
                      <Layer id="map-extreme-glow" type="line" paint={{ "line-color": "#ef4444", "line-width": 16, "line-opacity": 0.35 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                      <Layer id="map-extreme-line" type="line" paint={{ "line-color": "#ef4444", "line-width": 6 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                    </Source>
                  )}
                </MapGL>

                {/* ── TOP PANEL: Start + Ziel ── */}
                <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex flex-col gap-2">

                  {/* Waypoints Card — Start + Intermediates + Ziel */}
                  <div className="bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-visible pointer-events-auto">

                    {/* START */}
                    <div className="relative flex items-center gap-3 px-4 py-3">
                      <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 shadow-[0_0_6px_#4ade80]" />
                      <input
                        value={startSearch}
                        onChange={(e) => { setStartSearch(e.target.value); searchField(e.target.value, "start"); }}
                        onFocus={() => { if (!startSearch) setStartSuggestions([]); }}
                        placeholder="Start — Wo geht's los?"
                        className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500 text-sm font-semibold min-w-0"
                      />
                      <button onClick={useMyLocationAsStart} title="GPS als Start" className="text-zinc-500 hover:text-green-400 text-base transition-colors flex-shrink-0">📍</button>
                      {startSearch && <button onClick={() => { setStartSearch(""); setStartSuggestions([]); }} className="text-zinc-600 hover:text-white text-lg leading-none">×</button>}
                      {startSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                          {startSuggestions.map((s, i) => (
                            <button key={i} onClick={() => setRouteStart(s.lat, s.lon, s.name)} className="w-full text-left px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 border-b border-white/5 last:border-0 flex items-center gap-3">
                              <span className="text-green-400 text-xs">●</span><span className="truncate">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC MIDDLE: intermediates + insert slots */}
                    {(() => {
                      const n = customRoutePoints.length;
                      const rows = [];

                      const InsertSlot = ({ idx }) => (
                        insertingAtIndex === idx ? (
                          <div className="relative flex items-center gap-2 px-4 py-2 border-t border-white/8">
                            <div className="w-3 flex justify-center shrink-0"><div className="w-0.5 h-4 bg-zinc-700 mx-auto" /></div>
                            <input
                              autoFocus
                              value={insertSearch}
                              onChange={(e) => { setInsertSearch(e.target.value); searchInsert(e.target.value); }}
                              placeholder="Zwischenstopp suchen…"
                              className="flex-1 bg-white/8 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-400/50 min-w-0"
                            />
                            <button onClick={() => { setInsertingAtIndex(null); setInsertSearch(""); setInsertSuggestions([]); }} className="text-zinc-500 hover:text-white text-sm shrink-0">×</button>
                            {insertSuggestions.length > 0 && (
                              <div className="absolute top-full left-14 right-0 mt-1 bg-black/95 border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                                {insertSuggestions.map((s, i) => (
                                  <button key={i} onClick={() => confirmInsert(s.lat, s.lon, s.name)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 border-b border-white/5 last:border-0 flex items-center gap-2">
                                    <span className="text-orange-400 text-xs">●</span><span className="truncate">{s.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setInsertingAtIndex(idx); setInsertSearch(""); setInsertSuggestions([]); }}
                            className="w-full flex items-center gap-3 px-4 py-1 border-t border-white/5 hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-3 flex justify-center shrink-0"><div className="w-0.5 h-3 bg-zinc-700 mx-auto" /></div>
                            <span className="text-zinc-600 group-hover:text-orange-400 text-[10px] transition-colors">+ Zwischenstopp</span>
                          </button>
                        )
                      );

                      if (n <= 1) {
                        rows.push(<InsertSlot key="ins-0" idx={1} />);
                      } else {
                        // intermediates are indices 1..n-2
                        for (let i = 1; i <= n - 1; i++) {
                          rows.push(<InsertSlot key={`ins-${i}`} idx={i} />);
                          if (i < n - 1) {
                            rows.push(
                              <div key={`mid-${i}`} className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5">
                                <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0 shadow-[0_0_4px_#fb923c]" />
                                <span className="flex-1 text-sm text-white/80 truncate min-w-0">{waypointNames[i] || `Punkt ${i + 1}`}</span>
                                <button onClick={() => deleteWaypointAt(i)} className="text-zinc-600 hover:text-red-400 text-sm transition-colors shrink-0">✕</button>
                              </div>
                            );
                          }
                        }
                      }
                      return rows;
                    })()}

                    {/* ZIEL */}
                    <div className="relative flex items-center gap-3 px-4 py-3 border-t border-white/8">
                      <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0 shadow-[0_0_6px_#f87171]" />
                      <input
                        value={endSearch}
                        onChange={(e) => { setEndSearch(e.target.value); searchField(e.target.value, "end"); }}
                        placeholder="Ziel — Wohin?"
                        className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500 text-sm font-semibold min-w-0"
                      />
                      {endSearch && <button onClick={() => { setEndSearch(""); setEndSuggestions([]); }} className="text-zinc-600 hover:text-white text-lg leading-none">×</button>}
                      {endSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                          {endSuggestions.map((s, i) => (
                            <button key={i} onClick={() => setRouteEnd(s.lat, s.lon, s.name)} className="w-full text-left px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 border-b border-white/5 last:border-0 flex items-center gap-3">
                              <span className="text-red-400 text-xs">●</span><span className="truncate">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sekundär-Buttons */}
                  <div className="flex gap-2 pointer-events-auto">
                    <button
                      onClick={() => {
                        navigator.geolocation?.getCurrentPosition((pos) => {
                          const lat = pos.coords.latitude;
                          const lon = pos.coords.longitude;
                          setPosition([lat, lon]);
                          mainMapRef.current?.flyTo({ center: [lon, lat], zoom: 15, duration: 1000 });
                        }, null, { enableHighAccuracy: true, timeout: 6000 });
                      }}
                      title="Meine Position"
                      className="bg-black/85 backdrop-blur-xl border border-white/15 text-white px-3 py-2 rounded-2xl text-sm shadow-xl hover:bg-white/10"
                    >⊕</button>
                    <button onClick={() => setPassesVisible((v) => !v)} title="Motorrad-Pässe"
                      className={`backdrop-blur-xl border px-3 py-2 rounded-2xl text-sm font-black shadow-xl whitespace-nowrap transition-colors ${passesVisible ? "bg-orange-500/80 border-orange-400/50 text-white" : "bg-black/85 border-white/15 text-white hover:bg-white/10"}`}>🏔️</button>
                    <button onClick={() => setActivePage("discover")} className="bg-black/85 backdrop-blur-xl border border-white/15 text-white px-3 py-2 rounded-2xl text-sm font-black shadow-xl hover:bg-white/10 whitespace-nowrap">Strecken</button>
                    <label className="cursor-pointer bg-black/85 backdrop-blur-xl border border-white/15 text-white px-3 py-2 rounded-2xl text-sm font-black shadow-xl hover:bg-white/10 whitespace-nowrap">
                      GPX<input type="file" accept=".gpx" className="hidden" onChange={(e) => e.target.files[0] && importGPX(e.target.files[0])} />
                    </label>
                    {(route.length > 0 || customRoutePoints.length > 0) && (
                      <button onClick={clearRoute} className="ml-auto bg-black/85 backdrop-blur-xl border border-red-500/30 text-red-400 px-3 py-2 rounded-2xl text-sm font-black shadow-xl hover:bg-red-500/15">✕ Löschen</button>
                    )}
                  </div>
                </div>

                {/* ── MAP CONTEXT MENU ── */}
                {mapContextMenu && (
                  <>
                    <div className="absolute inset-0 z-[1500]" onClick={() => setMapContextMenu(null)} />
                    <div
                      className="absolute z-[1600] bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                      style={{ left: Math.min(mapContextMenu.x, window.innerWidth - 200), top: Math.min(mapContextMenu.y, window.innerHeight - 160), minWidth: 180 }}
                    >
                      <button onClick={() => contextMenuAction("end", mapContextMenu.lat, mapContextMenu.lon)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 border-b border-white/8 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_6px_#f87171] shrink-0" />
                        Als Ziel setzen
                      </button>
                      <button onClick={() => contextMenuAction("waypoint", mapContextMenu.lat, mapContextMenu.lon)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 border-b border-white/8 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_4px_#fb923c] shrink-0" />
                        Zwischenstopp
                      </button>
                      <button onClick={() => contextMenuAction("start", mapContextMenu.lat, mapContextMenu.lon)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] shrink-0" />
                        Als Start setzen
                      </button>
                    </div>
                  </>
                )}

                {/* ── Vorhandene geplante Strecke Info ── */}
                {selectedPlannedRoute && customRoutePoints.length === 0 && (
                  <div className="absolute top-16 left-4 z-[1000] max-w-[230px]">
                    <div className="bg-black/85 border border-white/15 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
                      <p className="text-red-400 text-[10px] font-black tracking-widest">STRECKE</p>
                      <h3 className="text-white font-black mt-1 leading-tight">{selectedPlannedRoute.name}</h3>
                      <p className="text-zinc-400 text-xs mt-0.5">{selectedPlannedRoute.region}</p>
                      <div className="flex gap-4 mt-3">
                        <div><p className="text-zinc-500 text-[10px]">KM</p><p className="text-white font-black text-sm">{selectedPlannedRoute.distance}</p></div>
                        <div><p className="text-zinc-500 text-[10px]">DAUER</p><p className="text-white font-black text-sm">{selectedPlannedRoute.duration}</p></div>
                        <div><p className="text-zinc-500 text-[10px]">KURVEN</p><p className="text-white font-black text-sm">{selectedPlannedRoute.curveFactor}</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Kurven-Legende ── */}
                {curveStats?.segments?.length > 0 && (
                  <div className="absolute top-16 right-3 z-[1000] pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2.5 shadow-xl space-y-1.5">
                      {extremeGeo && <div className="flex items-center gap-2"><div className="w-5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"/><span className="text-red-400 text-[10px] font-bold">Extrem</span></div>}
                      {sharpGeo   && <div className="flex items-center gap-2"><div className="w-5 h-1.5 rounded-full bg-orange-500"/><span className="text-orange-400 text-[10px] font-bold">Scharf</span></div>}
                      {mildGeo    && <div className="flex items-center gap-2"><div className="w-5 h-1.5 rounded-full bg-yellow-400"/><span className="text-yellow-300 text-[10px] font-bold">Leicht</span></div>}
                    </div>
                  </div>
                )}

                {/* ── BOTTOM STATS ── */}
                {customRoutePoints.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-col gap-2">

                    {/* Wegpunkte-Panel */}
                    {waypointPanelOpen && (
                      <div className="bg-black/90 border border-white/15 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                          <p className="text-zinc-400 text-xs font-black tracking-widest">WEGPUNKTE — {customRoutePoints.length}</p>
                          <button onClick={() => setWaypointPanelOpen(false)} className="text-zinc-500 hover:text-white text-lg leading-none">×</button>
                        </div>
                        <div className="max-h-44 overflow-y-auto divide-y divide-white/5">
                          {customRoutePoints.map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                              <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-green-400" : i === customRoutePoints.length - 1 ? "text-red-400" : "text-orange-400"}`}>
                                {i === 0 ? "A" : i === customRoutePoints.length - 1 ? "B" : i}
                              </span>
                              <span className="flex-1 text-sm text-white truncate">{waypointNames[i] || `Punkt ${i + 1}`}</span>
                              <button
                                onClick={() => deleteWaypointAt(i)}
                                className="text-zinc-600 hover:text-red-400 text-sm px-1 transition-colors"
                              >✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kurvige Alternative */}
                    {altRoute && (
                      <div className="bg-black/85 border border-violet-500/30 backdrop-blur-xl rounded-2xl shadow-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-0.5 bg-violet-400 opacity-60" style={{ backgroundImage: "repeating-linear-gradient(90deg,#a78bfa 0 6px,transparent 6px 9px)" }} />
                              <p className="text-violet-400 text-[10px] font-black tracking-widest">KURVIGE ALTERNATIVE</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <div>
                                <p className="text-zinc-500 text-[10px]">Distanz</p>
                                <p className="text-white font-black text-sm">{altRoute.distance} km</p>
                              </div>
                              <div>
                                <p className="text-zinc-500 text-[10px]">Fahrzeit</p>
                                <p className="text-white font-black text-sm">{altRoute.duration} min</p>
                              </div>
                              <div>
                                <p className="text-zinc-500 text-[10px]">Mehr</p>
                                <p className="text-violet-300 font-black text-sm">+{altRoute.extraMin} min · +{altRoute.extraKm} km</p>
                              </div>
                              {altRoute.curveStats && (
                                <div>
                                  <p className="text-zinc-500 text-[10px]">Kurvigkeit</p>
                                  <p className="font-black text-sm" style={{ color: altRoute.curveStats.color }}>{altRoute.curveStats.emoji} {altRoute.curveStats.label}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setAltRoute(null)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400">✕</button>
                            <button onClick={switchToAltRoute} className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-xl text-xs font-black text-white">Diese wählen</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Haupt-Panel */}
                    <div className="bg-black/85 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl">

                      {/* Name-Input beim Speichern */}
                      {plannedRouteStats && (
                        <div className="mb-3">
                          <input
                            value={pendingRouteName}
                            onChange={(e) => setPendingRouteName(e.target.value)}
                            placeholder={
                              waypointNames.length >= 2
                                ? `${waypointNames[0]} → ${waypointNames[waypointNames.length - 1]}`
                                : "Routenname…"
                            }
                            className="w-full bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-white placeholder-zinc-500 outline-none focus:border-white/25"
                          />
                        </div>
                      )}

                      {/* Höhenprofil */}
                      {(elevationData || elevationLoading) && (
                        <div className="mb-3">
                          {elevationLoading && !elevationData && (
                            <p className="text-zinc-500 text-xs text-center py-2">Höhenprofil wird geladen…</p>
                          )}
                          {elevationData && elevationData.length > 2 && (() => {
                            const elevs = elevationData.map((d) => d.elev);
                            const minE = Math.min(...elevs);
                            const maxE = Math.max(...elevs);
                            const rangeE = maxE - minE || 1;
                            const W = 400;
                            const H = 52;
                            const pts = elevationData.map((d, i) => {
                              const x = (i / (elevationData.length - 1)) * W;
                              const y = H - ((d.elev - minE) / rangeE) * H;
                              return `${x},${y}`;
                            }).join(" ");
                            const fillPts = `0,${H} ${pts} ${W},${H}`;
                            return (
                              <div>
                                <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5 px-0.5">
                                  <span>↑ {maxE}m</span>
                                  <span className="text-zinc-600">Höhenprofil</span>
                                  <span>↓ {minE}m</span>
                                </div>
                                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
                                    </linearGradient>
                                  </defs>
                                  <polygon points={fillPts} fill="url(#elevGrad)" />
                                  <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex items-end justify-between gap-3">
                        {/* Stats */}
                        <div className="flex gap-4 flex-wrap">
                          <div>
                            <p className="text-zinc-500 text-xs">Distanz</p>
                            <p className="text-white font-black">{plannedRouteStats ? `${plannedRouteStats.distance} km` : "…"}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs">Fahrzeit</p>
                            <p className="text-white font-black">{plannedRouteStats ? `${plannedRouteStats.duration} min` : "…"}</p>
                          </div>
                          {curveStats && (
                            <div>
                              <p className="text-zinc-500 text-xs">Kurvigkeit</p>
                              <p className="font-black text-sm" style={{ color: curveStats.color }}>{curveStats.emoji} {curveStats.label}</p>
                              <p className="text-zinc-600 text-[10px]">{curveStats.count} Kurven · {curveStats.curvesPerKm}/km</p>
                            </div>
                          )}
                        </div>

                        {/* Aktionen */}
                        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                          {/* Wegpunkte-Liste */}
                          <button
                            onClick={() => setWaypointPanelOpen((v) => !v)}
                            className={`px-3 py-2 rounded-xl font-bold text-sm transition-colors ${waypointPanelOpen ? "bg-white/15 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}`}
                            title="Wegpunkte anzeigen"
                          >≡ {customRoutePoints.length}</button>
                          {/* Rundtour */}
                          {customRoutePoints.length >= 2 && (
                            <button
                              onClick={closeRouteAsLoop}
                              className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl font-bold text-sm"
                              title="Rundtour — zurück zum Start"
                            >🔄</button>
                          )}
                          <button onClick={undoLastRoutePoint} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl font-bold text-sm" title="Letzten Punkt rückgängig">↩</button>
                          {route.length > 1 && (
                            <button onClick={shareRoute} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl font-bold text-sm">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                            </button>
                          )}
                          {plannedRouteStats && (
                            <button onClick={savePlannedRoute} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold text-sm">Speichern</button>
                          )}
                          {route.length > 1 && (
                            <button onClick={() => setNavigationChoiceOpen(true)} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold text-sm">Los →</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ortsname floating (nur wenn keine route aktiv) */}
                {placeName && customRoutePoints.length === 0 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/15 px-5 py-2.5 rounded-2xl shadow-xl">
                      <span className="text-red-400 text-sm">📍</span>
                      <span className="text-white text-sm font-bold whitespace-nowrap">{placeName}</span>
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {activePage === "discover" && (() => {
              const regions = ["Alle", ...Array.from(new Set(featuredRoutes.map((r) => r.region.split(" /")[0].trim())))];
              const filteredRoutes = featuredRoutes.filter((r) => {
                const q = discoverSearch.toLowerCase();
                const matchSearch = !q || r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
                const matchRegion = discoverRegion === "Alle" || r.region.includes(discoverRegion);
                return matchSearch && matchRegion;
              });
              return (
              <div className="space-y-5">
                <div>
                  <h2 className="text-5xl font-black">Entdecken</h2>
                  <p className="text-zinc-400 mt-2">Beliebte Motorradstrecken als Vorlage.</p>
                </div>

                {/* Suchleiste + Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                    </svg>
                    <input
                      value={discoverSearch}
                      onChange={(e) => setDiscoverSearch(e.target.value)}
                      placeholder="Strecke suchen (z.B. Stelvio, Schwarzwald, Österreich...)"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none text-white placeholder-zinc-500 focus:border-white/25 transition"
                    />
                    {discoverSearch && (
                      <button onClick={() => setDiscoverSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition">✕</button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {regions.map((r) => (
                      <button key={r} onClick={() => setDiscoverRegion(r)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${discoverRegion === r ? "bg-red-600 text-white" : "bg-white/6 text-zinc-400 hover:text-white border border-white/8"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-zinc-600 text-xs">{filteredRoutes.length} Strecken</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {filteredRoutes.length === 0 && (
                    <div className="lg:col-span-2 text-center py-16 text-zinc-500">Keine Strecken gefunden.</div>
                  )}
                  {filteredRoutes.map((routeItem) => (
                    <div
                      key={routeItem.id}
                      className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50"
                    >
                      <div className="h-72 overflow-hidden">
                        <img
                          src={routeItem.image}
                          alt={routeItem.name}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-red-400 font-bold">
                          {routeItem.region}
                        </p>

                        <h3 className="text-3xl font-black mt-1">
                          {routeItem.name}
                        </h3>

                        <p className="text-zinc-300 mt-2">
                          {routeItem.description}
                        </p>

                        <div className="grid grid-cols-4 gap-3 mt-5 text-sm">
                          <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-zinc-400">KM</p>
                            <p className="font-black">{routeItem.distance}</p>
                          </div>

                          <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-zinc-400">Dauer</p>
                            <p className="font-black">{routeItem.duration}</p>
                          </div>

                          <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-zinc-400">HM</p>
                            <p className="font-black">{routeItem.elevation}</p>
                          </div>

                          <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-zinc-400">Kurven</p>
                            <p className="font-black">
                              {routeItem.curveFactor}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-5">
                          <button
                            onClick={() => showFeaturedRouteOnMap(routeItem)}
                            className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl font-black"
                          >
                            Auf Karte ansehen
                          </button>

                          <button
                            onClick={() => loadFeaturedRoute(routeItem)}
                            className="bg-gradient-to-r from-red-600 to-orange-500 hover:scale-105 transition px-5 py-3 rounded-xl font-black"
                          >
                            Route merken
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {activePage === "tours" && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-3xl font-black mb-5">
                    Tour hinzufügen
                  </h2>

                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      placeholder="Tourname"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />

                    <input
                      value={tourKm}
                      onChange={(e) => setTourKm(e.target.value)}
                      placeholder="Kilometer"
                      type="number"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />

                    <button
                      onClick={addTour}
                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                    >
                      Tour speichern
                    </button>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-3xl font-black mb-5">Touren</h2>

                  <div className="space-y-4">
                    {selectedBike.tours.length === 0 && (
                      <p className="text-zinc-400">
                        Noch keine Touren gespeichert.
                      </p>
                    )}

                    {selectedBike.tours.map((tour, index) => (
                      <div
                        key={tour.id || index}
                        className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-black text-xl">{tour.name}</h3>

                            <p className="text-zinc-400">{tour.km} km</p>

                            <p className="text-zinc-500 text-sm mt-1">
                              {tour.date}
                            </p>

                            {tour.planned && (
                              <p className="text-orange-400 text-sm mt-1">
                                Geplante Route • {tour.duration} •{" "}
                                {tour.elevation} hm
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteTour(index)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl text-sm font-bold h-fit"
                          >
                            Löschen
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setOpenTourIndex(
                              openTourIndex === index ? null : index
                            )
                          }
                          className="mt-3 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-xl text-sm font-bold"
                        >
                          {openTourIndex === index
                            ? "Details ausblenden"
                            : "Details anzeigen"}
                        </button>

                        {openTourIndex === index && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {tour.time && <Stat label="Fahrzeit" value={tour.time} />}
                              {tour.maxSpeed !== undefined && <Stat label="Max Speed" value={`${tour.maxSpeed} km/h`} color="text-red-400" />}
                              {tour.averageSpeed !== undefined && <Stat label="Durchschnitt" value={`${tour.averageSpeed} km/h`} />}
                              {tour.maxLeanAngle !== undefined && <Stat label="Max Lean" value={`${tour.maxLeanAngle}°`} color="text-orange-400" />}
                              {tour.rideScore !== undefined && <Stat label="Score" value={`${tour.rideScore}/100`} color="text-green-400" />}
                              {tour.rideStyle && <Stat label="Fahrstil" value={tour.rideStyle} />}
                              {tour.difficulty && <Stat label="Schwierigkeit" value={tour.difficulty} />}
                              {tour.gpsPoints !== undefined && <Stat label="GPS-Punkte" value={tour.gpsPoints} />}
                            </div>
                            {(tour.route?.length > 1 || tour.routePoints?.length > 1) && (() => {
                              const pts = tour.route?.length > 1 ? tour.route : tour.routePoints;
                              return (
                                <div>
                                  <p className="text-zinc-500 text-xs mb-2">Route</p>
                                  <div className="relative h-56 rounded-2xl overflow-hidden border border-zinc-800">
                                    <MapGL
                                      initialViewState={{ longitude: pts[Math.floor(pts.length / 2)][1], latitude: pts[Math.floor(pts.length / 2)][0], zoom: 10 }}
                                      style={{ width: "100%", height: "100%" }}
                                      mapStyle={MAP_STYLE}
                                      interactive={false}
                                      attributionControl={false}
                                    >
                                      <Source id="tour-route" type="geojson" data={{ type: "Feature", geometry: { type: "LineString", coordinates: pts.map((p) => [p[1], p[0]]) } }}>
                                        <Layer id="tour-route-line" type="line" paint={{ "line-color": "#ef4444", "line-width": 4 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                                      </Source>
                                      <Marker longitude={pts[0][1]} latitude={pts[0][0]} anchor="center"><MarkerPin type="start" /></Marker>
                                      <Marker longitude={pts[pts.length - 1][1]} latitude={pts[pts.length - 1][0]} anchor="center"><MarkerPin type="end" /></Marker>
                                    </MapGL>
                                  </div>
                                  <button
                                    onClick={() => exportGPX(pts, tour.name)}
                                    className="mt-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-bold"
                                  >
                                    GPX exportieren
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activePage === "garage" && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-3xl font-black mb-5">Meine Garage</h2>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <input
                      value={newBikeName}
                      onChange={(e) => setNewBikeName(e.target.value)}
                      placeholder="Neues Fahrzeug"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />

                    <button
                      onClick={addBike}
                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold px-4 py-3"
                    >
                      Fahrzeug hinzufügen
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {bikes.map((bike) => (
                      <div
                        key={bike.id}
                        className={`bg-zinc-900 rounded-2xl p-4 border ${
                          bike.id === selectedBike.id
                            ? "border-red-500"
                            : "border-zinc-800"
                        }`}
                      >
                        <h3 className="text-xl font-black">
                          {bike.brand} {bike.model}
                        </h3>

                        <p className="text-zinc-400">{bike.licensePlate}</p>
                        <p className="text-zinc-400">{bike.mileage} km</p>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setSelectedBikeId(bike.id)}
                            className="bg-red-600 px-3 py-2 rounded-xl font-bold"
                          >
                            Auswählen
                          </button>

                          <button
                            onClick={() => deleteBike(bike.id)}
                            className="bg-zinc-700 px-3 py-2 rounded-xl font-bold"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h2 className="text-3xl font-black mb-5">Fahrzeug bearbeiten</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      ["brand", "Marke"],
                      ["model", "Modell"],
                      ["year", "Baujahr"],
                      ["licensePlate", "Kennzeichen"],
                      ["power", "Leistung / Klasse"],
                      ["tuv", "TÜV"],
                      ["mileage", "Kilometerstand"],
                      ["manualUrl", "Eigener Handbuch-Link"],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        value={selectedBike[key]}
                        onChange={(e) =>
                          updateBike({ [key]: key === "mileage" ? Number(e.target.value) : e.target.value })
                        }
                        placeholder={label}
                        type={key === "mileage" ? "number" : "text"}
                        className="bg-zinc-900 rounded-xl p-3 outline-none"
                      />
                    ))}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <button
                      onClick={useDemoImage}
                      className="bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold px-4 py-3"
                    >
                      Demo-Bild verwenden
                    </button>
                  </div>
                </Card>

                {/* Fotogalerie */}
                <Card>
                  <h2 className="text-3xl font-black mb-5">Fotogalerie</h2>
                  <label className="cursor-pointer inline-block bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-bold mb-5">
                    Fotos hinzufügen
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUploadMulti}
                    />
                  </label>
                  {(selectedBike.photos || []).length === 0 ? (
                    <p className="text-zinc-500">Noch keine Fotos hochgeladen.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(selectedBike.photos || []).map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-full h-36 object-cover rounded-2xl" />
                          <button
                            onClick={() => deletePhoto(i)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 rounded-full h-7 w-7 font-black text-sm opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Bike-Vergleich */}
                {bikes.length > 1 && (
                  <Card>
                    <h2 className="text-3xl font-black mb-5">Bike-Vergleich</h2>
                    <div className="mb-5">
                      <p className="text-zinc-400 text-sm mb-3">Vergleiche mit:</p>
                      <div className="flex flex-wrap gap-2">
                        {bikes.filter((b) => b.id !== selectedBike.id).map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setCompareBikeId(compareBikeId === b.id ? null : b.id)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm ${
                              compareBikeId === b.id ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                          >
                            {b.brand} {b.model}
                          </button>
                        ))}
                      </div>
                    </div>
                    {compareBikeId && (() => {
                      const cmp = bikes.find((b) => b.id === compareBikeId);
                      if (!cmp) return null;
                      const rows = [
                        ["Kilometerstand", `${selectedBike.mileage} km`, `${cmp.mileage} km`],
                        ["Baujahr", selectedBike.year || "–", cmp.year || "–"],
                        ["Leistung", selectedBike.power || "–", cmp.power || "–"],
                        ["Touren", selectedBike.tours.length, cmp.tours.length],
                        ["TÜV", selectedBike.tuv || "–", cmp.tuv || "–"],
                        ["Tankfüllungen", selectedBike.fuelLogs.length, cmp.fuelLogs.length],
                      ];
                      return (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-zinc-800">
                                <th className="text-left py-2 text-zinc-500 font-bold w-1/3">Eigenschaft</th>
                                <th className="text-left py-2 font-black text-red-400">{selectedBike.brand} {selectedBike.model}</th>
                                <th className="text-left py-2 font-black text-zinc-300">{cmp.brand} {cmp.model}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map(([label, a, b]) => (
                                <tr key={label} className="border-b border-zinc-900">
                                  <td className="py-3 text-zinc-400">{label}</td>
                                  <td className="py-3 font-bold text-white">{a}</td>
                                  <td className="py-3 font-bold text-zinc-400">{b}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </Card>
                )}

                {/* ── REIFEN ── */}
                <Card>
                  <h2 className="text-2xl font-black mb-5">Reifen</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[["tireFront", "Vorderreifen"], ["tireRear", "Hinterreifen"]].map(([key, label]) => {
                      const tire = selectedBike[key] || {};
                      return (
                        <div key={key} className="border border-white/8 rounded-2xl p-4 space-y-3">
                          <p className="text-xs font-black tracking-widest text-zinc-500 uppercase">{label}</p>

                          {tire.brand ? (
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-white">{tire.brand} {tire.model}</p>
                                <p className="text-zinc-400 text-sm">{tire.size}</p>
                                <p className="text-zinc-500 text-xs mt-1">DOT {tire.dot || "—"} · {tire.profile ? `${tire.profile} mm Profil` : "Profiltiefe nicht eingetragen"}</p>
                              </div>
                              <button onClick={() => { setTirePickerFor(key); setTireSearch(""); setTireTypeFilter("Alle"); }}
                                className="text-xs text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition flex-shrink-0">
                                Ändern
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => { setTirePickerFor(key); setTireSearch(""); setTireTypeFilter("Alle"); }}
                              className="w-full border border-dashed border-white/15 hover:border-white/30 rounded-xl py-4 text-zinc-500 hover:text-white text-sm font-bold transition">
                              + Reifen auswählen
                            </button>
                          )}

                          {/* DOT + Profiltiefe immer editierbar */}
                          {tire.brand && (
                            <div className="flex gap-2 pt-1">
                              <input value={tire.dot || ""} onChange={(e) => updateBikeNested(key, { dot: e.target.value })}
                                placeholder="DOT (z.B. 2324)" className="flex-1 bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-xs outline-none text-white placeholder-zinc-600" />
                              <input value={tire.profile || ""} onChange={(e) => updateBikeNested(key, { profile: e.target.value, lastMeasuredKm: Number(selectedBike.mileage) })}
                                placeholder="Profil mm" type="number" step="0.1" className="w-28 bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-xs outline-none text-white placeholder-zinc-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {activePage === "service" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-5xl font-black">Service</h2>
                  <p className="text-zinc-400 mt-2">Wartungsübersicht — dokumentiere jeden Service.</p>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[
                    { title: "Ölwechsel",   key: "lastOilChange",    interval: 16000, value: oilServiceIn,   warn: 1000, accent: "#eab308" },
                    { title: "Kettenpflege", key: "lastChainService", interval: 1300,  value: chainServiceIn, warn: 200,  accent: "#f97316" },
                    { title: "Inspektion",   key: "lastInspection",   interval: 12000, value: inspectionIn,   warn: 1000, accent: "#a1a1aa" },
                  ].map(({ title, key, interval, value, warn, accent }) => {
                    const isOverdue = value <= 0;
                    const isWarn = value > 0 && value < warn;
                    const statusColor = isOverdue ? "#ef4444" : isWarn ? "#f97316" : "#22c55e";
                    const pct = Math.max(0, Math.min(100, (value / interval) * 100));
                    const lastKm = Number(selectedBike[key] || 0);
                    const lastDate = selectedBike[key + "Date"] || null;
                    const isEditing = serviceEditKey === key;

                    return (
                      <Card key={key} className="flex flex-col gap-0 p-0 overflow-hidden">
                        {/* Farbiger Top-Indikator */}
                        <div className="h-1 w-full" style={{ background: statusColor }} />

                        <div className="p-5 flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <h3 className="font-black text-base text-white">{title}</h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ color: statusColor, background: statusColor + "22" }}>
                              {isOverdue ? "Überfällig" : isWarn ? "Bald fällig" : "OK"}
                            </span>
                          </div>

                          {/* Km bis fällig */}
                          <div>
                            <p className="text-3xl font-black" style={{ color: statusColor }}>
                              {isOverdue ? `+${Math.abs(value).toLocaleString()}` : value.toLocaleString()} km
                            </p>
                            <p className="text-zinc-500 text-xs mt-0.5">
                              {isOverdue ? "überfällig" : "bis zur Fälligkeit"}
                            </p>
                          </div>

                          {/* Fortschrittsbalken */}
                          <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: accent }} />
                          </div>

                          {/* Letzter Service */}
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span>
                              {lastKm > 0
                                ? <>Zuletzt: <span className="text-zinc-300 font-bold">{lastKm.toLocaleString()} km</span>{lastDate && <span className="ml-1">· {lastDate}</span>}</>
                                : "Noch kein Service eingetragen"
                              }
                            </span>
                          </div>

                          {/* Inline-Formular oder Button */}
                          {isEditing ? (
                            <div className="border border-white/10 rounded-xl p-3 bg-white/3 space-y-2">
                              <p className="text-xs text-zinc-400 font-bold mb-1">Service eintragen</p>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={serviceKmInput}
                                  onChange={(e) => setServiceKmInput(e.target.value)}
                                  placeholder="km-Stand"
                                  className="flex-1 bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-sm outline-none text-white placeholder-zinc-500"
                                />
                                <input
                                  type="date"
                                  value={serviceDateInput}
                                  onChange={(e) => setServiceDateInput(e.target.value)}
                                  className="flex-1 bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-sm outline-none text-white"
                                />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    const km = Number(serviceKmInput) || Number(selectedBike.mileage);
                                    const date = serviceDateInput
                                      ? new Date(serviceDateInput).toLocaleDateString("de-DE")
                                      : new Date().toLocaleDateString("de-DE");
                                    updateBike({ [key]: km, [key + "Date"]: date });
                                    setServiceEditKey(null);
                                    showToast("Service dokumentiert!", `${title} bei ${km.toLocaleString()} km`);
                                  }}
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-black py-2 rounded-lg transition"
                                >
                                  Speichern
                                </button>
                                <button
                                  onClick={() => setServiceEditKey(null)}
                                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold py-2 rounded-lg transition"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setServiceEditKey(key);
                                setServiceKmInput(String(selectedBike.mileage));
                                setServiceDateInput(new Date().toISOString().split("T")[0]);
                              }}
                              className="w-full border border-white/8 hover:border-white/20 bg-white/3 hover:bg-white/6 text-zinc-300 hover:text-white text-sm font-bold py-2.5 rounded-xl transition"
                            >
                              + Service eintragen
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reifen-Seite entfernt — jetzt in Garage integriert */}

            {activePage === "fuel" && (
              <div className="space-y-6">
                {/* Cost summary */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Diese Woche", value: thisWeekFuelCost, color: "text-blue-400" },
                    { label: "Dieser Monat", value: thisMonthFuelCost, color: "text-yellow-400" },
                    { label: "Gesamt", value: totalFuelCost, color: "text-red-400" },
                  ].map(({ label, value, color }) => (
                    <Card key={label} className="text-center">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                      <p className={`text-2xl font-black ${color}`}>{value.toFixed(2)} €</p>
                    </Card>
                  ))}
                </div>

                {/* Entry form */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black">Tanken eintragen</h2>
                    <button
                      onClick={() => {
                        const lastTour = (selectedBike.tours || []).find((t) => t.km);
                        if (lastTour) { setFuelDistance(String(lastTour.km)); }
                        setQuickTankOpen(true);
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-bold text-yellow-400 border border-yellow-400/20"
                    >
                      ⚡ Schnell-Tanken
                    </button>
                  </div>

                  {/* Fuel type selector */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {["Super", "Super+", "E10", "V-Power"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFuelType(type)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          fuelType === type
                            ? "bg-red-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <input
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      placeholder="Liter"
                      type="number"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <input
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(e.target.value)}
                      placeholder="Preis pro Liter (€)"
                      type="number"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <input
                      value={fuelDistance}
                      onChange={(e) => setFuelDistance(e.target.value)}
                      placeholder="Gefahrene km"
                      type="number"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <button
                      onClick={() => { addFuelLog(); setQuickTankOpen(false); }}
                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                    >
                      Speichern
                    </button>
                  </div>
                  {fuelLiters && fuelPrice && (
                    <p className="text-zinc-500 text-sm mt-3">
                      Gesamtkosten: <span className="text-white font-black">{(Number(fuelLiters) * Number(fuelPrice)).toFixed(2)} €</span>
                      {fuelDistance && <span className="ml-3">Verbrauch: <span className="text-white font-black">{((Number(fuelLiters) / Number(fuelDistance)) * 100).toFixed(1)} L/100km</span></span>}
                    </p>
                  )}
                </Card>

                {/* History */}
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-black">Tankhistorie</h2>
                    {fuelTrend && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${
                        fuelTrend === "up" ? "bg-red-500/15 text-red-400" :
                        fuelTrend === "down" ? "bg-green-500/15 text-green-400" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        {fuelTrend === "up" ? "↑ Verbrauch steigt" : fuelTrend === "down" ? "↓ Verbrauch sinkt" : "→ Stabil"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedBike.fuelLogs.length === 0 && (
                      <p className="text-zinc-400">Noch keine Tankdaten vorhanden.</p>
                    )}
                    {selectedBike.fuelLogs.map((log, index) => (
                      <div
                        key={log.id || index}
                        className="bg-zinc-900 rounded-2xl p-4 flex justify-between gap-4 border border-zinc-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-lg">{log.consumption} L/100km</h3>
                            {index === 0 && fuelTrend === "up" && <span className="text-red-400 text-xs font-bold">↑</span>}
                            {index === 0 && fuelTrend === "down" && <span className="text-green-400 text-xs font-bold">↓</span>}
                            {log.fuelType && (
                              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg font-bold">{log.fuelType}</span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-sm">
                            {log.liters} L · {log.distance} km · <span className="text-white font-bold">{log.totalCost} €</span>
                          </p>
                          <p className="text-zinc-600 text-xs mt-1">{log.date}</p>
                        </div>
                        <button
                          onClick={() => deleteFuelLog(index)}
                          className="bg-zinc-800 hover:bg-red-600 px-3 py-2 rounded-xl text-xs font-bold h-fit text-zinc-400 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activePage === "stats" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-5xl font-black">Statistiken</h2>
                  <p className="text-zinc-400 mt-2">Auswertung deiner Fahrten und Daten.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-5">
                  <Stat label="Touren gesamt" value={selectedBike.tours.length} />
                  <Stat label="Gesamtstrecke" value={`${analytics.totalKm.toFixed(0)} km`} />
                  <Stat label="Top Speed" value={`${analytics.highestSpeed} km/h`} color="text-red-400" />
                  <Stat label="Max Lean" value={`${analytics.highestLean}°`} color="text-orange-400" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="text-xl font-black mb-1">km pro Monat</h3>
                    <p className="text-zinc-500 text-sm mb-5">Letzte 6 Monate</p>
                    {monthlyKm.length > 0 ? (
                      <>
                        <MiniLineChart
                          values={monthlyKm.map((m) => m.value)}
                          labels={monthlyKm.map((m) => m.label)}
                        />
                        <div className="mt-4 space-y-2.5">
                          {[...monthlyKm].reverse().map((m, i) => (
                            <SimpleBar
                              key={i}
                              label={m.label}
                              value={m.value}
                              max={Math.max(...monthlyKm.map((x) => x.value))}
                              unit=" km"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500">Noch keine Touren mit Datum.</p>
                    )}
                  </Card>

                  <Card>
                    <h3 className="text-xl font-black mb-1">Verbrauch pro Tankfüllung</h3>
                    <p className="text-zinc-500 text-sm mb-5">L / 100 km</p>
                    {selectedBike.fuelLogs.length > 0 ? (
                      <>
                        <MiniLineChart
                          values={[...selectedBike.fuelLogs].reverse().map((l) => Number(l.consumption))}
                          color="#f97316"
                          labels={[...selectedBike.fuelLogs].reverse().map((l) => l.date?.split(".").slice(0, 2).join("."))}
                        />
                        <div className="mt-4 space-y-2.5">
                          {selectedBike.fuelLogs.slice(0, 6).map((l, i) => (
                            <SimpleBar
                              key={i}
                              label={l.date}
                              value={Number(l.consumption)}
                              max={Math.max(...selectedBike.fuelLogs.map((x) => Number(x.consumption)))}
                              unit=" L"
                              color="#f97316"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500">Noch keine Tankdaten.</p>
                    )}
                  </Card>

                  <Card>
                    <h3 className="text-xl font-black mb-4">Top Speeds der Touren</h3>
                    {selectedBike.tours.filter((t) => t.maxSpeed).length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedBike.tours
                          .filter((t) => t.maxSpeed)
                          .slice(0, 8)
                          .map((t, i) => (
                            <SimpleBar
                              key={i}
                              label={t.name?.slice(0, 16) || `Tour ${i + 1}`}
                              value={t.maxSpeed}
                              max={Math.max(...selectedBike.tours.filter((x) => x.maxSpeed).map((x) => x.maxSpeed))}
                              unit=" km/h"
                              color="#ef4444"
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500">Noch keine GPS-Touren mit Speed-Daten.</p>
                    )}
                  </Card>

                  <Card>
                    <h3 className="text-xl font-black mb-4">Ride Score Verlauf</h3>
                    {selectedBike.tours.filter((t) => t.rideScore !== undefined).length > 0 ? (
                      <>
                        <MiniLineChart
                          values={[...selectedBike.tours].filter((t) => t.rideScore !== undefined).reverse().map((t) => t.rideScore)}
                          color="#22c55e"
                        />
                        <div className="mt-4 space-y-2.5">
                          {selectedBike.tours
                            .filter((t) => t.rideScore !== undefined)
                            .slice(0, 6)
                            .map((t, i) => (
                              <SimpleBar
                                key={i}
                                label={t.name?.slice(0, 16) || `Tour ${i + 1}`}
                                value={t.rideScore}
                                max={100}
                                unit="/100"
                                color="#22c55e"
                              />
                            ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500">Noch keine Scores vorhanden.</p>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {activePage === "costs" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-5xl font-black">Kosten</h2>
                  <p className="text-zinc-400 mt-2">Übersicht aller Ausgaben für dein Motorrad.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <Stat label="Tankkosten gesamt" value={`${totalFuelCost.toFixed(2)} €`} color="text-orange-400" />
                  <Stat label="Sonstige Ausgaben" value={`${totalExpenses.toFixed(2)} €`} color="text-red-400" />
                  <Stat label="Gesamt" value={`${(totalFuelCost + totalExpenses).toFixed(2)} €`} color="text-white" />
                </div>

                <Card>
                  <h3 className="text-2xl font-black mb-5">Ausgabe eintragen</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <input
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      placeholder="Beschreibung"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <input
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Betrag (€)"
                      type="number"
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    />
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="bg-zinc-900 rounded-xl p-3 outline-none"
                    >
                      {["Versicherung", "TÜV", "Service", "Reifen", "Zubehör", "Reparatur", "Sonstiges"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={addExpense}
                      className="bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                    >
                      Speichern
                    </button>
                  </div>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <h3 className="text-2xl font-black mb-5">Ausgaben</h3>
                    <div className="space-y-3">
                      {(selectedBike.expenses || []).length === 0 && (
                        <p className="text-zinc-400">Noch keine Ausgaben.</p>
                      )}
                      {(selectedBike.expenses || []).map((e, i) => (
                        <div key={e.id || i} className="flex items-center justify-between bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                          <div>
                            <p className="font-black">{e.name}</p>
                            <p className="text-zinc-400 text-sm">{e.category} • {e.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-red-400">{Number(e.amount).toFixed(2)} €</span>
                            <button
                              onClick={() => deleteExpense(i)}
                              className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl text-sm font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-2xl font-black mb-5">Tankkosten</h3>
                    <div className="space-y-3">
                      {selectedBike.fuelLogs.length === 0 && (
                        <p className="text-zinc-400">Noch keine Tankdaten.</p>
                      )}
                      {selectedBike.fuelLogs.slice(0, 8).map((l, i) => (
                        <div key={l.id || i} className="flex items-center justify-between bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                          <div>
                            <p className="font-black">{l.liters} L · {l.distance} km</p>
                            <p className="text-zinc-400 text-sm">{l.consumption} L/100km • {l.date}</p>
                          </div>
                          <span className="font-black text-orange-400">{Number(l.totalCost).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activePage === "checklist" && (() => {
              const open = (selectedBike.checklist || []).filter((i) => !i.checked);
              const done = (selectedBike.checklist || []).filter((i) => i.checked);
              const total = open.length + done.length;
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-5xl font-black">Checkliste</h2>
                      <p className="text-zinc-400 mt-1">Vor jeder Fahrt abchecken.</p>
                    </div>
                    {done.length > 0 && (
                      <button
                        onClick={resetChecklist}
                        className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-2xl font-bold text-sm"
                      >
                        Alle zurücksetzen
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="bg-white/4 border border-white/6 rounded-2xl px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${(done.length / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-zinc-400 text-sm font-bold whitespace-nowrap">
                        {done.length} / {total}
                      </span>
                    </div>
                  )}

                  {/* Offene Punkte */}
                  <Card>
                    <p className="text-xs font-black tracking-widest text-zinc-400 mb-4">OFFEN — {open.length}</p>
                    {open.length === 0 ? (
                      <p className="text-zinc-500 text-sm py-4 text-center">Alle Punkte erledigt 🎉</p>
                    ) : (
                      <div className="space-y-2">
                        {open.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-3">
                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className="h-6 w-6 rounded-lg border-2 border-zinc-600 hover:border-green-400 flex items-center justify-center flex-shrink-0 transition-colors"
                            />
                            <span className="flex-1 font-semibold">{item.label}</span>
                            <button
                              onClick={() => deleteChecklistItem(item.id)}
                              className="text-zinc-700 hover:text-red-400 text-sm px-1 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      <input
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                        placeholder="Neuen Punkt hinzufügen..."
                        className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 outline-none text-sm"
                      />
                      <button
                        onClick={addChecklistItem}
                        className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </Card>

                  {/* Erledigte Punkte */}
                  {done.length > 0 && (
                    <Card>
                      <p className="text-xs font-black tracking-widest text-green-400 mb-4">ERLEDIGT — {done.length}</p>
                      <div className="space-y-2">
                        {done.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3">
                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className="h-6 w-6 rounded-lg bg-green-500 border-2 border-green-400 flex items-center justify-center flex-shrink-0 text-white text-xs font-black transition-colors"
                            >
                              ✓
                            </button>
                            <span className="flex-1 text-zinc-500 line-through text-sm">{item.label}</span>
                            <button
                              onClick={() => deleteChecklistItem(item.id)}
                              className="text-zinc-700 hover:text-red-400 text-sm px-1 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              );
            })()}

            {activePage === "weather" && (() => {
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-5xl font-black">Wetter</h2>
                      <p className="text-zinc-400 mt-1">Fahrwetter & Vorhersage</p>
                    </div>
                    <button
                      onClick={useCurrentLocationForWeather}
                      className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-bold flex items-center gap-2"
                    >
                      <span>📍</span> Standort laden
                    </button>
                  </div>

                  {!weather && !weatherError && (
                    <Card>
                      <div className="text-center py-14">
                        <div className="text-7xl mb-5">🌤️</div>
                        <p className="text-white font-black text-xl mb-1">Kein Standort geladen</p>
                        <p className="text-zinc-400">Klicke auf "Standort laden" für aktuelles Fahrwetter</p>
                      </div>
                    </Card>
                  )}

                  {weather && (
                    <>
                      {/* Hero */}
                      <div className="bg-gradient-to-br from-sky-900/70 via-blue-900/50 to-indigo-950/60 rounded-[2rem] border border-sky-500/20 p-8 overflow-hidden relative">
                        <div className="absolute top-4 right-6 text-[7rem] opacity-20 select-none leading-none">{weatherCodeToIcon(weather.weathercode)}</div>
                        <div className="relative z-10 flex items-end gap-8 flex-wrap">
                          <div>
                            <p className="text-sky-400 text-xs font-black tracking-[0.25em] mb-2">AKTUELL</p>
                            <div className="text-8xl font-black text-white leading-none">{weather.temperature}°</div>
                            <div className="text-sky-300 text-xl font-bold mt-2">{weatherCodeToLabel(weather.weathercode)}</div>
                            <div className="text-zinc-400 text-sm mt-1">
                              Gefühlt {weather.apparent}° · {weather.is_day ? "Tagsüber" : "Nachts"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { icon: "💨", label: "Wind", value: `${weather.windspeed} km/h` },
                          { icon: "🌬️", label: "Böen", value: `${weather.gusts} km/h` },
                          { icon: "💧", label: "Luftfeuchte", value: `${weather.humidity}%` },
                          { icon: "🌧️", label: "Niederschlag", value: `${weather.precipitation} mm` },
                        ].map((s) => (
                          <div key={s.label} className="bg-white/4 border border-white/6 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-white font-black text-lg">{s.value}</div>
                            <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Ride advice */}
                      <Card>
                        <p className="text-zinc-400 text-sm">{getRideAdvice(weather)}</p>
                      </Card>
                    </>
                  )}

                  {/* 5-day forecast */}
                  {forecast && (
                    <Card>
                      <h3 className="text-xl font-black mb-5">5-Tage-Vorhersage</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {forecast.time.map((date, i) => {
                          const d = new Date(date);
                          const dayName = d.toLocaleDateString("de-DE", { weekday: "short" });
                          const icon = weatherCodeToIcon(forecast.weathercode[i]);
                          const rain = forecast.precipitation_probability_max[i];
                          const wind = forecast.windspeed_10m_max[i];
                          const maxT = Math.round(forecast.temperature_2m_max[i]);
                          const minT = Math.round(forecast.temperature_2m_min[i]);
                          const goodDay = rain < 40 && wind < 50 && maxT > 8;
                          return (
                            <div
                              key={date}
                              className={`rounded-2xl p-3 border text-center transition-all ${
                                goodDay
                                  ? "bg-green-500/10 border-green-500/25"
                                  : "bg-white/3 border-white/6"
                              }`}
                            >
                              <p className="text-zinc-400 text-[11px] font-bold uppercase">{dayName}</p>
                              <div className="text-3xl my-2">{icon}</div>
                              <p className="font-black text-base">{maxT}°</p>
                              <p className="text-zinc-500 text-xs">{minT}°</p>
                              <div className="mt-2 text-[10px] text-blue-400">💧 {rain}%</div>
                              {goodDay && (
                                <div className="mt-1.5 w-2 h-2 bg-green-400 rounded-full mx-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-zinc-600 text-xs mt-4">
                        Grüner Punkt = Regen &lt; 40% · Wind &lt; 50 km/h · Temp &gt; 8°C
                      </p>
                    </Card>
                  )}

                  {(weatherError || forecastError) && (
                    <p className="text-red-400">{weatherError || forecastError}</p>
                  )}
                </div>
              );
            })()}

            {activePage === "documents" && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-3xl font-black mb-5">
                    Handbücher
                  </h2>

                  <p className="text-zinc-400 mb-5">
                    Offizielle Herstellerseiten als Einstieg. PDFs speichern wir
                    nicht automatisch in der App.
                  </p>

                  <input
                    value={selectedBike.manualUrl}
                    onChange={(e) => updateBike({ manualUrl: e.target.value })}
                    placeholder="Eigener Handbuch-Link"
                    className="bg-zinc-900 rounded-xl p-3 outline-none w-full mb-4"
                  />

                  {selectedBike.manualUrl && (
                    <a
                      href={selectedBike.manualUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-bold"
                    >
                      Eigenes Handbuch öffnen
                    </a>
                  )}
                </Card>

                <div className="grid md:grid-cols-3 gap-5">
                  {brandManualLinks.map((item) => (
                    <a
                      key={item.brand}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`rounded-3xl p-6 bg-gradient-to-br ${item.color} shadow-2xl shadow-black/40 hover:scale-[1.02] transition-transform`}
                    >
                      <p className="text-sm opacity-80 font-bold">
                        OFFICIAL MANUALS
                      </p>

                      <h3 className="text-3xl font-black mt-2">
                        {item.brand}
                      </h3>

                      <p className="mt-4 opacity-90">
                        Handbuch / Service öffnen
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            </div>{/* end page-enter wrapper */}
          </div>
        </div>
      </div>

      {navigationChoiceOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-xl rounded-[2rem] bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-red-400 text-xs font-black tracking-[0.3em]">
                  NAVIGATION
                </p>

                <h2 className="text-3xl font-black mt-2">
                  Womit möchtest du navigieren?
                </h2>

                <p className="text-zinc-400 mt-2">
                  Deine geplante Route wird an die ausgewählte Karten-App
                  übergeben.
                </p>
              </div>

              <button
                onClick={() => setNavigationChoiceOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 rounded-full h-10 w-10 font-black"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setNavigationChoiceOpen(false);
                  openNavigation("apple");
                }}
                className="group rounded-3xl bg-white text-black p-6 text-left hover:scale-[1.02] transition shadow-xl"
              >
                <div className="text-5xl mb-5"></div>

                <h3 className="text-2xl font-black">
                  Apple Karten
                </h3>

                <p className="text-zinc-600 mt-2">
                  Ideal für iPhone und iOS Navigation.
                </p>
              </button>

              <button
                onClick={() => {
                  setNavigationChoiceOpen(false);
                  openNavigation("google");
                }}
                className="group rounded-3xl bg-blue-600 text-white p-6 text-left hover:scale-[1.02] transition shadow-xl shadow-blue-600/20"
              >
                <div className="text-5xl mb-5">G</div>

                <h3 className="text-2xl font-black">
                  Google Maps
                </h3>

                <p className="text-blue-100 mt-2">
                  Gut für Routen mit mehreren Wegpunkten.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOTORRAD BILD PICKER ── */}
      {bikeImagePickerOpen && (
        <>
          <style>{`
            @keyframes pickerIn { from { opacity:0; transform:scale(0.96) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
            .picker-modal { animation: pickerIn 0.3s cubic-bezier(0.34,1.1,0.64,1) forwards; }
          `}</style>
          <div
            className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setBikeImagePickerOpen(false)}
          >
            <div
              className="picker-modal w-full max-w-3xl max-h-[90vh] flex flex-col bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-black">Motorrad-Bild auswählen</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">Stil-Fotos zur Inspiration — oder lade dein eigenes Bild hoch</p>
                </div>
                <button
                  onClick={() => setBikeImagePickerOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center font-black text-lg transition"
                >×</button>
              </div>

              {/* Bild-Grid — 5 Kategorien */}
              <div className="px-6 pb-2 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {motoImageLibrary.map((moto) => (
                    <button
                      key={moto.id}
                      onClick={() => {
                        updateBike({ photo: moto.url });
                        setBikeImagePickerOpen(false);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedBike.photo === moto.url
                          ? "border-red-500 ring-2 ring-red-500/40"
                          : "border-white/8 hover:border-white/25"
                      }`}
                    >
                      <img
                        src={moto.url}
                        alt={moto.name}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/85 to-transparent flex items-center gap-2">
                        <span className="text-xl">{moto.emoji}</span>
                        <p className="text-white text-sm font-black drop-shadow-lg">{moto.name}</p>
                        {selectedBike.photo === moto.url && (
                          <span className="ml-auto text-red-400 font-black">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eigenes Foto hochladen */}
              <div className="px-6 pb-6 pt-2 border-t border-white/8 flex-shrink-0 flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-3 bg-white/6 hover:bg-white/12 border border-white/10 px-5 py-3 rounded-2xl font-bold text-sm transition flex-1 justify-center">
                  <span>📁</span> Eigenes Foto hochladen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateBike({ photo: ev.target.result });
                        setBikeImagePickerOpen(false);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {selectedBike.photo && (
                  <button
                    onClick={() => {
                      updateBike({ photo: "" });
                      setBikeImagePickerOpen(false);
                    }}
                    className="flex items-center gap-2 bg-white/6 hover:bg-red-600/20 border border-white/10 px-5 py-3 rounded-2xl font-bold text-sm text-zinc-400 hover:text-red-400 transition"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DESIGN PANEL ── */}
      {showDesignPanel && (
        <>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
            .design-panel { animation: slideInRight 0.3s cubic-bezier(0.34,1.1,0.64,1) forwards; }
          `}</style>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[5000] bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDesignPanel(false)}
          />

          {/* Side panel */}
          <div className="design-panel fixed right-0 top-0 bottom-0 z-[5001] w-full max-w-sm bg-black/90 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <p className="text-red-400 text-xs font-black tracking-widest">DESIGN</p>
                <h2 className="text-2xl font-black mt-0.5">Hintergrund</h2>
              </div>
              <button
                onClick={() => setShowDesignPanel(false)}
                className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-black"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Gradient presets */}
              <div>
                <p className="text-zinc-400 text-xs font-bold tracking-wider mb-3">FARBTHEMEN</p>
                <div className="grid grid-cols-2 gap-3">
                  {bgPresets.filter((p) => !p.imgUrl).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setBgId(preset.id)}
                      className={`relative rounded-2xl overflow-hidden h-20 border-2 transition-all hover:scale-[1.02] ${
                        bgId === preset.id ? "border-white" : "border-transparent hover:border-white/30"
                      }`}
                      style={{ background: preset.preview }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl">{preset.emoji}</span>
                        <span className="text-white font-black text-xs">{preset.name}</span>
                      </div>
                      {bgId === preset.id && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-white flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image presets */}
              <div>
                <p className="text-zinc-400 text-xs font-bold tracking-wider mb-3">STRASSEN & LANDSCHAFTEN</p>
                <div className="grid grid-cols-2 gap-3">
                  {bgPresets.filter((p) => p.imgUrl).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setBgId(preset.id)}
                      className={`relative rounded-2xl overflow-hidden h-24 border-2 transition-all hover:scale-[1.02] ${
                        bgId === preset.id ? "border-white" : "border-transparent hover:border-white/30"
                      }`}
                    >
                      <img src={preset.imgUrl} alt={preset.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-1.5">
                        <span>{preset.emoji}</span>
                        <span className="text-white font-black text-xs">{preset.name}</span>
                      </div>
                      {bgId === preset.id && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-white flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom upload */}
              <div>
                <p className="text-zinc-400 text-xs font-bold tracking-wider mb-3">EIGENES BILD</p>
                <label className="cursor-pointer flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 border-dashed rounded-2xl h-20 font-bold text-sm transition">
                  <span className="text-xl">+</span> Bild hochladen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => { setCustomBgUrl(reader.result); setBgId("custom"); };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {customBgUrl && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden h-24 border-2 border-white/30">
                    <img src={customBgUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setBgId("custom")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black ${bgId === "custom" ? "bg-white text-black" : "bg-white/20 hover:bg-white/30"}`}
                      >
                        Verwenden
                      </button>
                      <button
                        onClick={() => { setCustomBgUrl(""); localStorage.removeItem("mototrack-bg-custom"); if (bgId === "custom") setBgId("racing"); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-600/80 hover:bg-red-600"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <p className="text-zinc-500 text-xs text-center">Änderungen werden sofort & dauerhaft gespeichert</p>
            </div>
          </div>
        </>
      )}

      {/* ── REIFEN PICKER MODAL ── */}
      {tirePickerFor && (() => {
        const types = ["Alle", ...Array.from(new Set(TIRE_DATABASE.map((t) => t.type)))];
        const filtered = TIRE_DATABASE.filter((t) => {
          const matchType = tireTypeFilter === "Alle" || t.type === tireTypeFilter;
          const q = tireSearch.toLowerCase();
          const matchSearch = !q || t.brand.toLowerCase().includes(q) || t.model.toLowerCase().includes(q);
          return matchType && matchSearch;
        });
        return (
          <div className="fixed inset-0 z-[7000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setTirePickerFor(null)}>
            <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-black">Reifen auswählen</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">{tirePickerFor === "tireFront" ? "Vorderreifen" : "Hinterreifen"}</p>
                </div>
                <button onClick={() => setTirePickerFor(null)} className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center font-black transition">×</button>
              </div>

              {/* Suche + Filter */}
              <div className="px-6 py-3 border-b border-white/8 flex-shrink-0 space-y-2">
                <input value={tireSearch} onChange={(e) => setTireSearch(e.target.value)}
                  placeholder="Suchen (z.B. Michelin, Power 6...)"
                  className="w-full bg-zinc-900 border border-white/8 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder-zinc-500" />
                <div className="flex gap-2 flex-wrap">
                  {types.map((t) => (
                    <button key={t} onClick={() => setTireTypeFilter(t)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition ${tireTypeFilter === t ? "bg-red-600 text-white" : "bg-white/6 text-zinc-400 hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste */}
              <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
                {filtered.map((tire, i) => (
                  <div key={i} className="rounded-xl border border-white/6 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-black text-sm text-white">{tire.brand} <span className="text-zinc-300">{tire.model}</span></p>
                        <p className="text-zinc-500 text-xs">{tire.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 px-4 pb-3">
                      {tire.sizes.map((size) => (
                        <button key={size} onClick={() => {
                          updateBikeNested(tirePickerFor, { brand: tire.brand, model: tire.model, size, type: tire.type });
                          setTirePickerFor(null);
                          showToast("Reifen gespeichert!", `${tire.brand} ${tire.model} · ${size}`);
                        }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-600 border border-white/8 hover:border-red-500 text-zinc-300 hover:text-white transition">
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-zinc-500 text-sm text-center py-8">Keine Reifen gefunden.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── REV KI-ANALYSE MODAL ── */}
      {revModalOpen && (
        <>
          <style>{`
            @keyframes revSlideIn {
              0%   { opacity: 0; transform: translateY(40px) scale(0.95); }
              60%  { opacity: 1; transform: translateY(-6px) scale(1.01); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes revTyping {
              0%, 100% { opacity: 0.3; } 50% { opacity: 1; }
            }
            .rev-modal-anim { animation: revSlideIn 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) forwards; }
            .rev-dot-1 { animation: revTyping 1.2s ease-in-out infinite 0s; }
            .rev-dot-2 { animation: revTyping 1.2s ease-in-out infinite 0.2s; }
            .rev-dot-3 { animation: revTyping 1.2s ease-in-out infinite 0.4s; }
          `}</style>
          <div
            className="fixed inset-0 z-[8000] bg-black/60 backdrop-blur-sm flex items-end justify-center p-6"
            onClick={() => setRevModalOpen(false)}
          >
            <div
              className="rev-modal-anim w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-4 px-6 pt-5 pb-4 border-b border-white/8"
                style={{ background: "linear-gradient(135deg, #18181b 0%, #1a0a0a 100%)" }}
              >
                <Rev size={72} animate={true} />
                <div className="flex-1">
                  <p className="text-xs font-black tracking-[0.25em] text-red-400 uppercase">KI-Fahranalyse</p>
                  <p className="text-white font-black text-xl leading-tight">REV</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Dein persönlicher Rennfahrer-Assistent</p>
                </div>
                <button
                  onClick={() => setRevModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center font-black text-lg transition"
                >×</button>
              </div>

              {/* Analyse */}
              <div className="px-6 py-5">
                {revLoading ? (
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-sm font-semibold">REV analysiert deine Fahrt</span>
                    <span className="flex gap-1 items-center">
                      <span className="rev-dot-1 w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      <span className="rev-dot-2 w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      <span className="rev-dot-3 w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                    </span>
                  </div>
                ) : (
                  <p className="text-white text-base leading-relaxed font-medium">{revAnalysis}</p>
                )}
              </div>

              {/* Footer */}
              {!revLoading && (
                <div className="px-6 pb-5">
                  <button
                    onClick={() => setRevModalOpen(false)}
                    className="w-full bg-white/8 hover:bg-white/15 border border-white/10 py-3 rounded-2xl font-bold text-sm transition"
                  >
                    Schließen
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── RIDE SAVED ANIMATION ── */}
      {toast.show && (
        <>
          <style>{`
            @keyframes toastPopIn {
              0%   { opacity: 0; transform: translateY(60px) scale(0.85); }
              60%  { opacity: 1; transform: translateY(-8px) scale(1.03); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes checkDraw {
              from { stroke-dashoffset: 60; }
              to   { stroke-dashoffset: 0; }
            }
            .app-toast { animation: toastPopIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          `}</style>
          <div className="fixed inset-0 z-[9998] flex items-end justify-center pb-12 pointer-events-none">
            <div className="app-toast bg-green-500 text-black px-8 py-5 rounded-2xl flex items-center gap-4 shadow-2xl shadow-green-500/40">
              <div className="h-10 w-10 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" strokeDasharray="60" style={{ animation: "checkDraw 0.4s 0.3s ease forwards", strokeDashoffset: 60 }} />
                </svg>
              </div>
              <div>
                <p className="font-black text-lg leading-tight">{toast.message}</p>
                {toast.subtitle && <p className="text-black/60 text-sm font-semibold mt-0.5">{toast.subtitle}</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}