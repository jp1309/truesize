const LATAM_CAPITALS = [
  { id: "quito", city: "Quito", country: "Ecuador", center: [-0.2299, -78.5249], zoom: 11 },
  { id: "bogota", city: "Bogotá", country: "Colombia", center: [4.711, -74.0721], zoom: 11 },
  { id: "lima", city: "Lima", country: "Perú", center: [-12.0464, -77.0428], zoom: 11 },
  { id: "mexico-city", city: "Ciudad de México", country: "México", center: [19.4326, -99.1332], zoom: 10 },
  { id: "buenos-aires", city: "Buenos Aires", country: "Argentina", center: [-34.6037, -58.3816], zoom: 11 },
  { id: "santiago", city: "Santiago", country: "Chile", center: [-33.4489, -70.6693], zoom: 11 },
  { id: "montevideo", city: "Montevideo", country: "Uruguay", center: [-34.9011, -56.1645], zoom: 11 },
  { id: "asuncion", city: "Asunción", country: "Paraguay", center: [-25.2637, -57.5759], zoom: 11 },
  { id: "la-paz", city: "La Paz", country: "Bolivia", center: [-16.4897, -68.1193], zoom: 11 },
  { id: "caracas", city: "Caracas", country: "Venezuela", center: [10.4806, -66.9036], zoom: 11 },
  { id: "panama", city: "Ciudad de Panamá", country: "Panamá", center: [8.9824, -79.5199], zoom: 11 },
  { id: "san-jose", city: "San José", country: "Costa Rica", center: [9.9281, -84.0907], zoom: 12 },
  { id: "managua", city: "Managua", country: "Nicaragua", center: [12.114, -86.2362], zoom: 11 },
  { id: "tegucigalpa", city: "Tegucigalpa", country: "Honduras", center: [14.0723, -87.1921], zoom: 11 },
  { id: "san-salvador", city: "San Salvador", country: "El Salvador", center: [13.6929, -89.2182], zoom: 12 },
  { id: "guatemala-city", city: "Ciudad de Guatemala", country: "Guatemala", center: [14.6349, -90.5069], zoom: 11 },
  { id: "havana", city: "La Habana", country: "Cuba", center: [23.1136, -82.3666], zoom: 11 },
  { id: "santo-domingo", city: "Santo Domingo", country: "República Dominicana", center: [18.4861, -69.9312], zoom: 11 },
  { id: "san-juan", city: "San Juan", country: "Puerto Rico", center: [18.4655, -66.1057], zoom: 12 },
  { id: "brasilia", city: "Brasília", country: "Brasil", center: [-15.7939, -47.8828], zoom: 10 },
];

const DC_CENTER = [38.9072, -77.0369];

const DC_AREAS = [
  {
    id: "dc",
    name: "Washington D.C.",
    source: "https://raw.githubusercontent.com/unitedstates/districts/gh-pages/states/DC/shape.geojson",
    rawGeometry: true,
    color: "#2f80ed",
    fill: "#56a3ff",
    popup: "Washington D.C.<br>Área aproximada: 159 km²",
  },
  {
    id: "arlington",
    name: "Arlington County",
    source: "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query?where=GEOID%3D%2751013%27&outFields=NAME&f=geojson&outSR=4326",
    color: "#008f8f",
    fill: "#22c7c7",
    popup: "Arlington County, Virginia<br>Área aproximada: 67 km²",
  },
  {
    id: "montgomery-south",
    name: "Montgomery County sur",
    source: "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query?where=GEOID%3D%2724031%27&outFields=NAME&f=geojson&outSR=4326",
    clipLat: 39.1,
    color: "#8c45cf",
    fill: "#b267f0",
    popup: "Montgomery County sur, Maryland<br>Chevy Chase, Bethesda, Silver Spring y Wheaton",
  },
];

const ARLINGTON_NAMES = {
  "22201": "Clarendon / Courthouse",
  "22202": "Crystal City",
  "22203": "Ballston",
  "22204": "Columbia Pike",
  "22205": "Westover",
  "22206": "Shirlington",
  "22207": "N. Arlington",
  "22209": "Rosslyn",
  "22213": "Chesterbrook",
};

const SUBDIVISION_PALETTE = {
  arlington: ["#00d4ff", "#00a7a7", "#35d0ba", "#5cc8ff", "#7ce7e0", "#0b7285"],
  montgomery: ["#d68cff", "#b267f0", "#9b51e0", "#ca6df2", "#e0b3ff", "#7f3fbf"],
};

const map = L.map("map", { center: [14, -77], zoom: 4, zoomControl: true });
L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19,
}).addTo(map);

const sourceLayer = L.layerGroup().addTo(map);
const overlayLayer = L.layerGroup().addTo(map);
const labelLayer = L.layerGroup().addTo(map);
const subdivisionSourceLayer = L.layerGroup().addTo(map);
const subdivisionOverlayLayer = L.layerGroup().addTo(map);

const elements = {
  select: document.querySelector("#capital-select"),
  status: document.querySelector("#status-badge"),
  metricCapital: document.querySelector("#metric-capital"),
  metricLatitude: document.querySelector("#metric-latitude"),
  overlayButton: document.querySelector("#btn-overlay"),
  capitalButton: document.querySelector("#btn-capital"),
  dcButton: document.querySelector("#btn-dc"),
  bothButton: document.querySelector("#btn-both"),
  resetButton: document.querySelector("#btn-reset"),
  sourceToggle: document.querySelector("#toggle-source"),
  subdivisionToggle: document.querySelector("#toggle-subdivisions"),
};

const state = {
  selectedCapital: LATAM_CAPITALS[0],
  areaGeometries: [],
  subdivisionGeometries: [],
  overlayVisible: true,
  sourceVisible: true,
  subdivisionsVisible: true,
  overlayDelta: { lat: 0, lng: 0 },
  dragStart: null,
  dragging: false,
};

function toKm(baseLat, baseLon, lat, lon) {
  const earthRadiusKm = 6371;
  return [
    (lon - baseLon) * (Math.PI / 180) * earthRadiusKm * Math.cos(baseLat * Math.PI / 180),
    (lat - baseLat) * (Math.PI / 180) * earthRadiusKm,
  ];
}

function fromKm(baseLat, baseLon, dx, dy) {
  const earthRadiusKm = 6371;
  return [
    baseLat + (dy / earthRadiusKm) * (180 / Math.PI),
    baseLon + (dx / earthRadiusKm) * (180 / Math.PI) / Math.cos(baseLat * Math.PI / 180),
  ];
}

function projectRing(sourceCenter, targetCenter, ring) {
  return ring.map(([lon, lat]) => {
    const [dx, dy] = toKm(sourceCenter[0], sourceCenter[1], lat, lon);
    const [projectedLat, projectedLng] = fromKm(targetCenter[0], targetCenter[1], dx, dy);
    return [projectedLat + state.overlayDelta.lat, projectedLng + state.overlayDelta.lng];
  });
}

function clipRingAtMaxLat(ring, maxLat) {
  const inside = point => point[1] <= maxLat;
  const intersect = (a, b) => {
    const t = (maxLat - a[1]) / (b[1] - a[1]);
    return [a[0] + t * (b[0] - a[0]), maxLat];
  };
  const out = [];
  const count = ring.length - 1;

  for (let i = 0; i < count; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % count];
    if (inside(a)) {
      out.push(a);
      if (!inside(b)) out.push(intersect(a, b));
    } else if (inside(b)) {
      out.push(intersect(a, b));
    }
  }

  if (out.length > 2) out.push(out[0]);
  return out;
}

function outerRings(geometry, clipLat) {
  if (!geometry) return [];
  const polygons = geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  return polygons
    .map(rings => {
      const outer = rings?.[0];
      if (!outer || outer.length < 3) return null;
      if (!clipLat) return outer;
      const clipped = clipRingAtMaxLat(outer, clipLat);
      return clipped.length >= 3 ? clipped : null;
    })
    .filter(Boolean);
}

function ringToLatLngs(ring) {
  return ring.map(([lng, lat]) => [lat, lng]);
}

function centerOfLatLngs(points) {
  const total = points.reduce((acc, point) => {
    acc.lat += point[0];
    acc.lng += point[1];
    return acc;
  }, { lat: 0, lng: 0 });
  return [total.lat / points.length, total.lng / points.length];
}

function popupFor(area, context) {
  return `<strong style="color:${area.fill}">${area.name}</strong><br>${area.popup}<br><span style="color:#9aa8b8">${context}</span>`;
}

function addDraggable(layer) {
  layer.on("mousedown", event => startDrag(event.latlng, event));
  layer.on("touchstart", event => {
    const touches = event.originalEvent?.touches;
    if (!touches || touches.length !== 1) return;
    startDrag(map.mouseEventToLatLng(touches[0]), event);
  });
}

function startDrag(latlng, rawEvent) {
  state.dragging = true;
  state.dragStart = latlng;
  map.dragging.disable();
  map.getContainer().style.cursor = "grabbing";
  L.DomEvent.stop(rawEvent);
}

function stopDrag() {
  if (!state.dragging) return;
  state.dragging = false;
  state.dragStart = null;
  map.dragging.enable();
  map.getContainer().style.cursor = "";
}

function applyLayerVisibility() {
  if (state.sourceVisible) {
    sourceLayer.addTo(map);
  } else {
    sourceLayer.removeFrom(map);
  }

  if (state.overlayVisible) {
    overlayLayer.addTo(map);
  } else {
    overlayLayer.removeFrom(map);
  }

  if (state.subdivisionsVisible && state.sourceVisible) {
    subdivisionSourceLayer.addTo(map);
  } else {
    subdivisionSourceLayer.removeFrom(map);
  }

  if (state.subdivisionsVisible && state.overlayVisible) {
    subdivisionOverlayLayer.addTo(map);
    labelLayer.addTo(map);
  } else {
    subdivisionOverlayLayer.removeFrom(map);
    labelLayer.removeFrom(map);
  }
}

function renderSourceAreas() {
  sourceLayer.clearLayers();
  state.areaGeometries.forEach(area => {
    const rings = outerRings(area.geometry, area.clipLat);
    rings.forEach(ring => {
      L.polygon(ringToLatLngs(ring), {
        color: area.color,
        fillColor: area.fill,
        fillOpacity: 0.42,
        weight: 2,
      }).bindPopup(popupFor(area, "Ubicación real en el área metropolitana de DC")).addTo(sourceLayer);
    });
  });
}

function renderOverlayAreas() {
  overlayLayer.clearLayers();
  const target = state.selectedCapital.center;

  state.areaGeometries.forEach(area => {
    const rings = outerRings(area.geometry, area.clipLat);
    rings.forEach(ring => {
      const projected = projectRing(DC_CENTER, target, ring);
      const layer = L.polygon(projected, {
        color: area.color,
        fillColor: area.fill,
        fillOpacity: 0.5,
        weight: 2,
        dashArray: "8 5",
        cursor: "grab",
      }).bindPopup(popupFor(area, `Tamaño real sobre ${state.selectedCapital.city}`));
      addDraggable(layer);
      layer.addTo(overlayLayer);
    });
  });
}

function renderSubdivisions() {
  subdivisionSourceLayer.clearLayers();
  subdivisionOverlayLayer.clearLayers();
  labelLayer.clearLayers();

  const target = state.selectedCapital.center;
  state.subdivisionGeometries.forEach(item => {
    const rings = outerRings(item.geometry, item.clipLat);
    const projectedPoints = [];

    rings.forEach(ring => {
      const realLatLngs = ringToLatLngs(ring);
      L.polygon(realLatLngs, {
        color: item.color,
        fillColor: item.color,
        fillOpacity: 0.16,
        weight: 1,
      }).bindPopup(`<strong style="color:${item.color}">${item.name}</strong><br>${item.parent}`).addTo(subdivisionSourceLayer);

      const projected = projectRing(DC_CENTER, target, ring);
      projectedPoints.push(...projected);
      const overlay = L.polygon(projected, {
        color: item.color,
        fillColor: item.color,
        fillOpacity: 0.22,
        weight: 1,
        dashArray: "4 4",
        cursor: "grab",
      }).bindPopup(`<strong style="color:${item.color}">${item.name}</strong><br>${item.parent}<br>Tamaño real sobre ${state.selectedCapital.city}`);
      addDraggable(overlay);
      overlay.addTo(subdivisionOverlayLayer);
    });

    if (projectedPoints.length > 0) {
      const center = centerOfLatLngs(projectedPoints);
      const label = L.circleMarker(center, {
        radius: 5,
        color: item.color,
        fillColor: item.color,
        fillOpacity: 0.95,
        weight: 2,
        cursor: "grab",
      }).bindTooltip(item.name, { className: "area-label", direction: "top", offset: [0, -5] });
      addDraggable(label);
      label.addTo(labelLayer);
    }
  });
}

function renderAll() {
  renderSourceAreas();
  renderOverlayAreas();
  renderSubdivisions();
  applyLayerVisibility();
  updateMetrics();
}

function updateMetrics() {
  const capital = state.selectedCapital;
  elements.metricCapital.textContent = `${capital.city}, ${capital.country}`;
  elements.metricLatitude.textContent = `${Math.abs(capital.center[0]).toFixed(1)}° ${capital.center[0] >= 0 ? "N" : "S"}`;
  elements.status.textContent = state.overlayVisible
    ? `DC + Arlington + Montgomery sur sobre ${capital.city}. Arrastra el overlay para ajustar la comparación.`
    : `Overlay oculto. Capital activa: ${capital.city}.`;
}

function flyToCapital() {
  map.flyTo(state.selectedCapital.center, state.selectedCapital.zoom, { duration: 1.1 });
}

function flyToDc() {
  map.flyToBounds(L.latLngBounds([38.78, -77.38], [39.13, -76.86]), { padding: [40, 40], duration: 1.1 });
}

function flyToBoth() {
  const bounds = L.latLngBounds([DC_CENTER, state.selectedCapital.center]);
  map.flyToBounds(bounds.pad(0.25), { padding: [44, 44], duration: 1.1 });
}

function populateCapitalSelect() {
  LATAM_CAPITALS.forEach(capital => {
    const option = document.createElement("option");
    option.value = capital.id;
    option.textContent = `${capital.city}, ${capital.country}`;
    elements.select.append(option);
  });
  elements.select.value = state.selectedCapital.id;
}

function initEvents() {
  elements.select.addEventListener("change", () => {
    const next = LATAM_CAPITALS.find(capital => capital.id === elements.select.value);
    if (!next) return;
    state.selectedCapital = next;
    state.overlayDelta = { lat: 0, lng: 0 };
    renderOverlayAreas();
    renderSubdivisions();
    applyLayerVisibility();
    updateMetrics();
    flyToCapital();
  });

  elements.overlayButton.addEventListener("click", () => {
    state.overlayVisible = !state.overlayVisible;
    elements.overlayButton.textContent = state.overlayVisible ? "Ocultar overlay" : "Superponer DC";
    applyLayerVisibility();
    updateMetrics();
    if (state.overlayVisible) flyToCapital();
  });

  elements.capitalButton.addEventListener("click", flyToCapital);
  elements.dcButton.addEventListener("click", flyToDc);
  elements.bothButton.addEventListener("click", flyToBoth);

  elements.resetButton.addEventListener("click", () => {
    state.overlayDelta = { lat: 0, lng: 0 };
    renderOverlayAreas();
    renderSubdivisions();
    applyLayerVisibility();
    updateMetrics();
  });

  elements.sourceToggle.addEventListener("change", () => {
    state.sourceVisible = elements.sourceToggle.checked;
    applyLayerVisibility();
  });

  elements.subdivisionToggle.addEventListener("change", () => {
    state.subdivisionsVisible = elements.subdivisionToggle.checked;
    applyLayerVisibility();
  });

  map.on("mousemove", event => {
    if (!state.dragging || !state.dragStart) return;
    state.overlayDelta.lat += event.latlng.lat - state.dragStart.lat;
    state.overlayDelta.lng += event.latlng.lng - state.dragStart.lng;
    state.dragStart = event.latlng;
    renderOverlayAreas();
    renderSubdivisions();
    applyLayerVisibility();
  });

  map.getContainer().addEventListener("touchmove", event => {
    if (!state.dragging || event.touches.length !== 1 || !state.dragStart) return;
    event.preventDefault();
    const latlng = map.mouseEventToLatLng(event.touches[0]);
    state.overlayDelta.lat += latlng.lat - state.dragStart.lat;
    state.overlayDelta.lng += latlng.lng - state.dragStart.lng;
    state.dragStart = latlng;
    renderOverlayAreas();
    renderSubdivisions();
    applyLayerVisibility();
  }, { passive: false });

  map.on("mouseup", stopDrag);
  map.on("mouseleave", stopDrag);
  map.getContainer().addEventListener("touchend", stopDrag);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
  return response.json();
}

async function loadMainAreas() {
  const loaded = await Promise.all(DC_AREAS.map(async area => {
    const data = await fetchJson(area.source);
    const geometry = area.rawGeometry ? data : data.features?.[0]?.geometry;
    return { ...area, geometry };
  }));
  state.areaGeometries = loaded.filter(area => area.geometry);
}

function centroidFromRing(ring) {
  const points = ring.slice(0, -1);
  const total = points.reduce((acc, [lng, lat]) => {
    acc.lat += lat;
    acc.lng += lng;
    return acc;
  }, { lat: 0, lng: 0 });
  return { lat: total.lat / points.length, lng: total.lng / points.length };
}

function isInMontgomerySouth(geometry) {
  const ring = outerRings(geometry)[0];
  if (!ring) return false;
  const center = centroidFromRing(ring);
  return center.lat >= 38.87 && center.lat <= 39.11 && center.lng >= -77.35 && center.lng <= -77.0;
}

function featuresFromResponse(response, nameField) {
  return (response?.features || [])
    .filter(feature => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type))
    .map(feature => ({
      geometry: feature.geometry,
      name: String(feature.properties?.[nameField] || "").replace(/\s+CDP$/i, "").trim(),
    }))
    .filter(feature => feature.name);
}

async function loadSubdivisions() {
  const tigerBase = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer";
  const zctaBase = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer";
  const montgomeryBbox = "-77.35,38.85,-77.00,39.10";
  const arlingtonBbox = "-77.20,38.82,-77.00,38.95";

  const query = (base, layer, params) => fetchJson(`${base}/${layer}/query?${new URLSearchParams(params)}`);
  const [cdps, incorporated, arlington] = await Promise.allSettled([
    query(tigerBase, 5, {
      where: "GEOID LIKE '24%'",
      outFields: "NAME,GEOID",
      returnGeometry: "true",
      f: "geojson",
      outSR: "4326",
      geometry: montgomeryBbox,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
    }),
    query(tigerBase, 4, {
      where: "GEOID LIKE '24%'",
      outFields: "NAME,GEOID",
      returnGeometry: "true",
      f: "geojson",
      outSR: "4326",
      geometry: montgomeryBbox,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
    }),
    query(zctaBase, 1, {
      where: "1=1",
      outFields: "ZCTA5,GEOID",
      returnGeometry: "true",
      f: "geojson",
      outSR: "4326",
      geometry: arlingtonBbox,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
    }),
  ]);

  const subdivisions = [];
  const arlingtonFeatures = arlington.status === "fulfilled" ? arlington.value.features || [] : [];
  const seen = new Set();

  arlingtonFeatures.forEach((feature, index) => {
    const zip = feature.properties?.ZCTA5 || feature.properties?.GEOID || "";
    const name = ARLINGTON_NAMES[zip];
    if (!name || seen.has(name)) return;
    seen.add(name);
    subdivisions.push({
      name,
      parent: "Arlington County, VA",
      geometry: feature.geometry,
      color: SUBDIVISION_PALETTE.arlington[index % SUBDIVISION_PALETTE.arlington.length],
    });
  });

  const montgomeryFeatures = [
    ...featuresFromResponse(cdps.status === "fulfilled" ? cdps.value : null, "NAME"),
    ...featuresFromResponse(incorporated.status === "fulfilled" ? incorporated.value : null, "NAME"),
  ].filter(feature => isInMontgomerySouth(feature.geometry));

  montgomeryFeatures.forEach((feature, index) => {
    if (!feature.name || seen.has(feature.name)) return;
    seen.add(feature.name);
    subdivisions.push({
      name: feature.name,
      parent: "Montgomery County sur, MD",
      geometry: feature.geometry,
      clipLat: 39.1,
      color: SUBDIVISION_PALETTE.montgomery[index % SUBDIVISION_PALETTE.montgomery.length],
    });
  });

  state.subdivisionGeometries = subdivisions;
}

async function init() {
  populateCapitalSelect();
  initEvents();

  try {
    await loadMainAreas();
    renderAll();
    flyToBoth();
    elements.overlayButton.textContent = "Ocultar overlay";
    elements.status.textContent = "Áreas principales cargadas. Cargando subdivisiones...";
    loadSubdivisions()
      .then(() => {
        renderSubdivisions();
        applyLayerVisibility();
        updateMetrics();
      })
      .catch(error => {
        console.warn(error);
        elements.status.textContent = "Áreas principales cargadas. Algunas subdivisiones no respondieron.";
      });
  } catch (error) {
    console.error(error);
    elements.status.textContent = "No se pudieron cargar los datos geográficos. Revisa la conexión.";
  }
}

init();
