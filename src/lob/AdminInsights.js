export const courseSelectionConverter = async(data) => {
  const transformedArray = data?.map((item, index) => ({
    index: index,
    name: item?.CourseDetails?.course,
    value: item?.CourseCodeId,
    isInProgress: item?.OnGoing
  }));

  return transformedArray;
}

export const locationTypeConverter = async(data) => {
  const transformedArray = data?.map((item, index) => ({
    index: index,
    name: item?.LocalizationKey ?? item?.LocalizationDescription,
    value: item?.LocationId
  }));

  return transformedArray;
}

export const countrySelectionConverter = async(key, data) => {
  const result = await countriesByLocationExtractor(key, data);
  const transformedArray = result?.map((item, index) => ({
    index: index,
    name: item?.NativeCountryName ?? item?.CountryName,
    value: item?.CountryId,
    alphaKey: item?.CountryAlpha3
  }));
  return transformedArray;
}

export const overviewInfoConvertion = async(data) => {
  // Extract total enrollees
  const totalEnrollees = data?.EnrolleesCount;

  // Extract average age
  const averageAge = data?.AgesAverageCount;

  // Ages distribution
  const agesPercentages = data?.AgesDistribution?.map(item => ({
    label: item?.AgeGroup,
    count: item?.Count
  }));

  // Extract total males and females
  const totalMales = data?.GenderDistribution?.find(item => item.Sex === "M")?.EnrolleeCount ?? 0;
  const totalFemales = data?.GenderDistribution?.find(item => item.Sex === "F")?.EnrolleeCount ?? 0;

  // Generate gender percentages array
  const genderPercentages = data?.GenderDistribution?.map(item => ({
    sex: item.Sex === "M" ? "Male" : "Female",
    percentage: item?.Percentage
  }));

  const genderCount = data?.GenderDistribution?.map(item => ({
    sex: item?.Sex === "M" ? "Male" : "Female",
    count: item?.EnrolleeCount
  }));

  // Extract average female and male ages
  const averageFemaleAge = data?.AgesAverageBySexCount?.find(item => item.Sex === "F")?.AverageAge ?? null;
  const averageMaleAge = data?.AgesAverageBySexCount?.find(item => item.Sex === "M")?.AverageAge ?? null;

  // Create the array similar to genderPercentages
  const ageAveragesBySex = data?.AgesAverageBySexCount?.map(item => ({
    sex: item.Sex === "M" ? "Male" : "Female",
    averageAge: item?.AverageAge,
    percentage: item?.Percentage
  }));

  const totalNewEnrollees = data?.EnrolleeTypeDistribution?.find(item => item.Status === "N")?.Count ?? null;
  const totalReturningEnrollees = data?.EnrolleeTypeDistribution?.find(item => item.Status === "R")?.Count ?? null;

   // Create the array similar to genderPercentages
   const enrolleeTypes = data.EnrolleeTypeDistribution?.map(item => ({
    type: item?.Status === "N" ? "New" : "Returning",
    count: item?.Count,
    percentage: item?.Percentage
  }));


  const enrolleeProficiencyGroups = data?.EnrolleeLanguageProficiencyDistribution?.map(item => ({
    type: item?.LanguageLevelAbbreviation,
    count: item?.Count,
    percentage: item?.Percentage
  }));

  return {
    totalEnrollees: totalEnrollees,
    averageGeneralAge: averageAge,
    totalMales: totalMales,
    totalFemales: totalFemales,
    genderPercentages: genderPercentages,
    averageFemaleAge: averageFemaleAge,
    averageMaleAge: averageMaleAge,
    ageAveragesBySex: ageAveragesBySex,
    totalNewEnrollees: totalNewEnrollees,
    totalReturningEnrollees: totalReturningEnrollees,
    enrolleeTypes: enrolleeTypes,
    agesPercentages: agesPercentages,
    genderCount: genderCount,
    enrolleeProficiencyGroups: enrolleeProficiencyGroups


  };
}

const countriesByLocationExtractor = async (key, data) => {
  if (!key || !data) return [];

  // Normalize key for case-insensitive comparison
  const normalizedKey = key?.toLowerCase();

  // Find and return the correct array if key exists in the data object
  for (const dataKey of Object.keys(data)) {
    if (dataKey?.toLowerCase() === normalizedKey) {
      return data[dataKey];
    }
  }

  return []; // Return empty if no match found
};


// Define a color palette for unique colors
const colorPalette = [
  '#3e82f7', '#04d182', '#ffc542', '#fa8c16', '#ff6b72', '#a461d8', '#13c2c2', '#eb2f96', '#7cb305', 
  '#2d99ff', '#34d399', '#ffd700', '#f97316', '#ff4757', '#9b59b6', '#20c997', '#f5222d', '#73d13d', 
  '#3498db', '#1abc9c', '#f39c12', '#e67e22', '#e74c3c', '#8e44ad', '#16a085', '#ff8c00', '#00bfff'
];

// Helper function to transform demographic data
const transformDemographicArray = (dataArray, nameKey, nativeNameKey, extraKeys = () => ({})) => {
  return dataArray?.map((item, index) => ({
    color: colorPalette[index % colorPalette.length],
    name: item[nameKey],
    value: `${item.Percentage?.toFixed(2)}%`,
    nativeName: item[nativeNameKey],
    count: item?.EnrolleeCount,
    ...extraKeys(item)
  }));
};

// const transformedArray = residencyArray?.map((item, index) => ({
//   color: colorPalette[index % colorPalette?.length], // Rotate through the colors
//   name: item.CountryName, // Map CountryName to name
//   value: `${item.Percentage.toFixed(2)}%`, // Append % to the Percentage
//   nativeName: item?.NativeCountryName, // Append % to the Percentage
//   count: item?.EnrolleeCount,
//   countryId: item?.CountryOfResidencyId
// }));

// Function to transform general demographic data
export const transformEnrolleeGeneralDemographicData = async (data) => {
  return {
    transformedResidencyArray: transformDemographicArray(data?.Residency, 'CountryName', 'NativeCountryName',  item => ({
      countryId: item?.CountryOfResidencyId
    })),
    transformedBirthArray: transformDemographicArray(data?.Birth, 'CountryName', item => ({
      countryId: item?.CountryOfResidencyId
    }))
  };
};

// Function to transform division demographic data
export const transformEnrolleeDivisionDemographicData = async (data) => {
  return {
    transformedResidencyArray: transformDemographicArray(data?.Residency, 'CountryDivisionName', 'CountryDivisionName', item => ({
      divisionId: item?.CountryDivisionId,
      countryId: item?.CountryId
    })),
    transformedBirthArray: transformDemographicArray(data?.Birth, 'CountryDivisionName', 'CountryDivisionName', item => ({
      divisionId: item?.CountryDivisionId,
      countryId: item?.CountryId
    }))
  };
};

export const enrolleeListConvertor = async(data) => {
  // const transformedArray = data?.map((item, index) => ({
  //   index: index,
  //   name: item?.NativeCountryName ?? item?.CountryName,
  //   value: item?.CountryId,
  //   alphaKey: item?.CountryAlpha3
  // }));

  return {
    columnsArray: [],
    dataArray: []
  }
}


const AdminInsights = {
  courseSelectionConverter,
  locationTypeConverter,
  countrySelectionConverter,
  overviewInfoConvertion,
  transformEnrolleeGeneralDemographicData,
  transformEnrolleeDivisionDemographicData,
  enrolleeListConvertor
};

export default AdminInsights;
