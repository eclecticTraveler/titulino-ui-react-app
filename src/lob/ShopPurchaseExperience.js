export const setUserCoursePurchasesInAvailableCatalog = async (userCourses = {}, catalog = []) => {
  const modCatalog = catalog?.map(courseItem => {
    const userCourse = userCourses?.[courseItem.course_code_id];

    // Clone tiers to avoid mutating original
    const updatedTiers = Object.entries(courseItem.tiers || {}).reduce((acc, [tierName, tierData]) => {
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

export const setCourseTierAccessPurchasedInUserCourses = async (
  userCourses = {},
  courseCodeId = "",
  courseTierAccess = "Free"
) => {
  if (!courseCodeId || !userCourses || typeof userCourses !== "object") {
    return userCourses;
  }

  const existing = userCourses[courseCodeId];
  if (!existing) {
    // course not present; return unchanged (or create it if you prefer)
    return userCourses;
  }

  // Immutable update
  return {
    ...userCourses,
    [courseCodeId]: {
      ...existing,
      courseTierAccess,
    },
  };
};


const ShopPurchaseExperience = {
  setUserCoursePurchasesInAvailableCatalog,
  setCourseTierAccessPurchasedInUserCourses
};

export default ShopPurchaseExperience;
