export const CourseSelectionConverter = async(data) => {
  const transformedArray = data?.map((item, index) => ({
    index: index,
    name: item?.CourseDetails?.course,
    value: item?.CourseCodeId,
    isInProgress: item?.OnGoing
  }));

  return transformedArray;
}

export const LocationTypeConverter = async(data) => {
  console.log("data", data)
  const transformedArray = data?.map((item, index) => ({
    index: index,
    name: item?.LocalizationKey ?? item?.LocalizationDescription,
    value: item?.LocationId
  }));

  return transformedArray;
}

export const CountrySelectionConverter = async(key, data) => {
  const result = await CountriesByLocationExtractor(key, data);
  const transformedArray = result?.map((item, index) => ({
    index: index,
    name: item?.NativeCountryName ?? item?.CountryName,
    value: item?.CountryId,
    alphaKey: item?.CountryAlpha3
  }));
  return transformedArray;
}

export const OverviewInfoConvertion = async(data) => {
  console.log("data", data)
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

const CountriesByLocationExtractor = async (key, data) => {
  if (!key || !data) return [];

  // Normalize key for case-insensitive comparison
  const normalizedKey = key.toLowerCase();

  // Find and return the correct array if key exists in the data object
  for (const dataKey of Object.keys(data)) {
    if (dataKey.toLowerCase() === normalizedKey) {
      return data[dataKey];
    }
  }

  return []; // Return empty if no match found
};


const AdminInsights = {
  CourseSelectionConverter,
  LocationTypeConverter,
  CountrySelectionConverter,
  OverviewInfoConvertion
};

export default AdminInsights;
