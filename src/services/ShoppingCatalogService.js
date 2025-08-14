import localShoppingCatalogData from '../assets/data/course-shopping-catalog-data.json';

const loadLocalShoppingData = async() => {
  const rawData = localShoppingCatalogData;
  return rawData;
}

const loadRequestedShoppingCatalog = async(nativeLanguage, course) => {  
  const rawShoppingData = await loadLocalShoppingData();
  const filteredShoppingData = rawShoppingData?.filter(c => (c.course === course && c.nativeLanguage === nativeLanguage))
                                              ?.sort((a, b) => a.display_order - b.display_order);
  return filteredShoppingData ?? [];
}

export const getProductCatalog = async(nativeLanguage, course) => {
    const catalog = await loadRequestedShoppingCatalog(nativeLanguage, course);
    return catalog;
}

const ShoppingCatalogService = {
  getProductCatalog
};

export default ShoppingCatalogService;
