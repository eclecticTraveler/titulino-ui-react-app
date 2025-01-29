const mapCache = {}; // Simple cache for maps

const getJsonGeoMap = async (countryId) => {
  // Return default if no countryId is provided
  if (!countryId) {
    return loadDefaultMap();
  }

  if (mapCache[countryId]) return Promise.resolve(mapCache[countryId]);

  try {
    // Dynamically load the requested country map
    const module = await import(`../assets/maps/gadm41_${countryId}_1.json`);
    mapCache[countryId] = module.default;
    return module.default;
  } catch (error) {
    console.warn(`Map for ${countryId} not found. Loading default map.`);
    return loadDefaultMap();
  }
};

// Helper function to load and cache the default map
const loadDefaultMap = async () => {
  if (!mapCache.default) {
    const defaultModule = await import('../assets/maps/world-countries-sans-antarctica.json');
    mapCache.default = defaultModule.default;
  }
  return mapCache.default;
};

const GeoMapService = {
  getJsonGeoMap
};

export default GeoMapService;
