export const setUserCoursePurchasesInAvailableCatalog = async (userCourses = {}, catalog = []) => {
  const modCatalog = catalog.map(courseItem => {
    const userCourse = userCourses?.[courseItem.course_code_id];

    // Clone tiers to avoid mutating original
    const updatedTiers = Object.entries(courseItem.tiers).reduce((acc, [tierName, tierData]) => {
      acc[tierName] = {
        ...tierData,
        isPurchased: userCourse?.courseTierAccess?.toLowerCase() === tierName?.toLowerCase()
      };
      return acc;
    }, {});

    return {
      ...courseItem,
      tiers: updatedTiers
    };
  });

  return modCatalog;
};



const ShopPurchaseExperience = {
  setUserCoursePurchasesInAvailableCatalog
};

export default ShopPurchaseExperience;
