export const getCategoriesObtainedByEmailForSupermarketCourse = async(userProgressByEmailId) => {
  const userProgress = [...userProgressByEmailId];

  const totalClasses = 8;

    // Filter by category
    const category1Progress = userProgress?.filter(record => record?.Category === 1);
    const category2Progress = userProgress?.filter(record => record?.Category === 2);
    const category3Progress = userProgress?.filter(record => record?.Category === 3);
  
    // Get unique classes for each category
    const uniqueClassesCategory1 = new Set(category1Progress.map(record => record?.Class));
    const uniqueClassesCategory2 = new Set(category2Progress.map(record => record?.Class));
    const category3Completed = category3Progress.length >= 1 ? 1 : 0; // Either 0 or 1

    return {
      category1Total: uniqueClassesCategory1?.size,
      category2Total: uniqueClassesCategory2?.size,
      category3Total: category3Completed
    }

}

export const calculatePercentageForSupermarketCertificates = async(userProgressByEmailId) => {
  const userProgress = [...userProgressByEmailId];

  const totalClasses = 8;
  
  // Filter by category
  const category1Progress = userProgress?.filter(record => record?.Category === 1);
  const category2Progress = userProgress?.filter(record => record?.Category === 2);
  const category3Progress = userProgress?.filter(record => record?.Category === 3);

  // Get unique classes for each category
  const uniqueClassesCategory1 = new Set(category1Progress.map(record => record?.Class));
  const uniqueClassesCategory2 = new Set(category2Progress.map(record => record?.Class));
  
  // Calculate Golden Certificate percentage
  const goldenCertClassesInCategory1 = Math.min(uniqueClassesCategory1?.size, totalClasses); // Max of 8
  const goldenCertClassesInCategory2 = Math.min(uniqueClassesCategory2?.size, totalClasses); // Max of 8
  const category3Completed = category3Progress.length >= 1 ? 1 : 0; // Either 0 or 1
  
  const goldenCertificatePercentage = 
    ((goldenCertClassesInCategory1 / totalClasses) * 0.4 + // 40% for Category 1
    (goldenCertClassesInCategory2 / totalClasses) * 0.4 + // 40% for Category 2
    (category3Completed * 0.2)) * 100; // 20% for Category 3
  
  // Calculate Participation Certificate percentage (only Category 1)
  const participationCertClassesInCategory1 = Math.min(uniqueClassesCategory1.size, totalClasses); // Max of 8
  const participationCertificatePercentage = (participationCertClassesInCategory1 / totalClasses) * 100;

  return {
    goldenCertificatePercentage: (goldenCertificatePercentage.toFixed(2) / 100), // Return percentage in decimal
    participationCertificatePercentage: (participationCertificatePercentage.toFixed(2) / 100),
  };
};


const StudentProgress = {
  calculatePercentageForSupermarketCertificates,
  getCategoriesObtainedByEmailForSupermarketCourse
};

export default StudentProgress;
