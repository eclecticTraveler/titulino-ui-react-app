import Flag from "react-world-flags";
import { Tag } from 'antd';


const getDaysUntilComingBirthday = async(birthday) => {
  // Parse the provided birthday
  const targetDate = new Date(birthday);
  if (isNaN(targetDate)) {
    throw new Error("Invalid date format");
  }

  // Get today's UTC date without time
  const todayUTC = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));

  // Set the target year to this year
  let comingBirthday = new Date(Date.UTC(
    todayUTC.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate()
  ));

  // If the birthday has already passed this year, use the next year
  if (comingBirthday < todayUTC) {
    comingBirthday.setUTCFullYear(todayUTC.getUTCFullYear() + 1);
  }

  // Calculate the difference in days
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.ceil((comingBirthday - todayUTC) / msPerDay);

  return daysUntil;
}

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

const proficiencyMaps = {
  'be': ['purple', 'Beginner'],
  'ba': ['yellow', 'Basic'],
  'in': ['orange', 'Intermediate'],
  'ad': ['green', 'Advanced']
};

export const handleEnrolleeListConvertor = async (data, locationType) => {

  if (!data) return { tableData: [], columns: [] };

  const results = [];
  const filters = {
    langLevelFilter: new Set(),
    enrolleeIdFilter: new Set(),
    namesFilter: new Set(),
    lastNamesFilter: new Set(),
    ageFilter: new Set(),
    daysToBdayFilter: new Set(),
    sexFilter: new Set(),
    countryOfResidencyFilter: new Set(),
    regionOfResidencyFilter: new Set(),
    countryOfBirthFilter: new Set(),
    regionOfBirthFilter: new Set(),
  };

  const trackers = {
      langLevelTracker: new Set(),
      enrolleeIdTracker: new Set(),
      namesTracker: new Set(),
      lastNamesTracker: new Set(),
      ageTracker: new Set(),
      sexTracker: new Set(),
      daysToBdayTracker: new Set(),
      countryOfResidencyTracker: new Set(),
      regionOfResidencyTracker: new Set(),
      countryOfBirthTracker: new Set(),
      regionOfBirthTracker: new Set()
  };

  const processData = async(item, i) => {
      const daysUntilBday = await getDaysUntilComingBirthday(item?.DateOfBirth);
      const currentLevel = item.LanguageProficienciesHistory.find(entry => entry.EndDate === null)?.LanguageLevelAbbreviation;   
      console.log("AGE", item?.Age, item?.ContactExternalId, daysUntilBday) 
      results.push({
          key: i,
          langLevel: currentLevel,
          enrolleeId: item?.ContactExternalId,
          names: item?.Names,
          lastNames: item?.LastNames,
          age: item?.Age,
          sex: item?.Sex,
          daysToBday: daysUntilBday,
          countryOfResidency: item?.Location?.ResidencyLocation?.CountryOfResidency,
          regionOfResidency: item?.Location?.ResidencyLocation?.CountryDivisionResidencyName,
          countryOfBirth: item?.Location?.BirthLocation?.CountryOfBirth,
          regionOfBirth: item?.Location?.BirthLocation?.CountryDivisionBirthName
      });

      const uniqueFilters = [
        { field: currentLevel, filter: 'langLevel' },
        { field: item?.ContactExternalId, filter: 'enrolleeId' },
        { field: item?.Names, filter: 'names' },
        { field: item?.LastNames, filter: 'lastNames' },
        { field: item?.Age, filter: 'age' },
        { field: item?.Sex, filter: 'sex' },
        { field: daysUntilBday, filter: 'daysToBday' },
        { field: item?.Location?.ResidencyLocation?.CountryOfResidency, filter: 'countryOfResidency' },
        { field: item?.Location?.ResidencyLocation?.CountryDivisionResidencyName, filter: 'regionOfResidency' },
        { field: item?.Location?.BirthLocation?.CountryOfBirth, filter: 'countryOfBirth' },
        { field: item?.Location?.BirthLocation?.CountryDivisionBirthName, filter: 'regionOfBirth' }
    ];
   

      // uniqueFilters.forEach(({ field, filter }) => {
      //   const trackerKey = `${filter}Tracker`;
      
      //   // Skip if field already exists in tracker
      //   if (field && !trackers[trackerKey]?.has(field)) {
      //     const valueToAdd =
      //       filter === "countryOfBirth" || filter === "countryOfResidency"
      //         ? { 
      //             key: field, 
      //             text: <Flag code={field} style={{ width: 35, marginLeft: 5 }} />, 
      //             value: field 
      //           }
      //         : { key: field, text: field, value: field };
      
      //     filters[`${filter}Filter`]?.add(valueToAdd); // Use `add()` for Sets
      //     trackers[trackerKey]?.add(field); // Track the unique field
      //   }
      // });

      uniqueFilters.forEach(({ field, filter }) => {
        const trackerKey = `${filter}Tracker`;
      
        if (field && !trackers[trackerKey]?.has(field)) {
          let valueToAdd;
      
          if (filter === "langLevel") {
            // Handling langLevel with proficiency map
            const proficiencyMap = proficiencyMaps;
      
            const [color, proficiency] = proficiencyMap[field] || ['black', 'Unknown'];
      
            valueToAdd = {
              key: field,
              text: <Tag color={color}>{proficiency}</Tag>,
              value: field
            };
          } else if (filter === "countryOfBirth" || filter === "countryOfResidency") {
            // Handling country filters with Flag component
            valueToAdd = {
              key: field,
              text: (
                <>
                  <Flag code={field} style={{ width: 35, marginLeft: 5 }} /> {field}
                </>
              ),
              value: field
            };
          } else {
            // Default handling for other filters
            valueToAdd = { key: field, text: field, value: field };
          }
      
          filters[`${filter}Filter`]?.add(valueToAdd);
          trackers[trackerKey]?.add(field);
        }
      });
      
      
  };

  await data?.forEach(processData);

  const columns = [
      {
          title: 'Level',
          dataIndex: 'langLevel',
          editable: false,
          filterSearch: true,
          filters: Array.from(filters.langLevelFilter),
          onFilter: (value, record) => record.langLevel?.indexOf(value) === 0,
          sorter: (a, b) => a.langLevel.localeCompare(b.langLevel),
          sortDirections: ["ascend", "descend"],
          render: (langLevel) => {
              const proficiencyMap = proficiencyMaps;
              const [color, proficiency] = proficiencyMap[langLevel] || ['black', 'Unknown'];
              return <Tag color={color} key={langLevel}>{proficiency}</Tag>;
          }
      },
      {
          title: 'Profile',
          children: [
              { title: 'Id', dataIndex: 'enrolleeId', editable: false, filterSearch: true, filters: Array.from(filters.enrolleeIdFilter), onFilter: (value, record) => record.enrolleeId === value ? true : false, sorter: (a, b) => a.enrolleeId - b.enrolleeId },
              { title: 'Names', dataIndex: 'names', editable: false, filterSearch: true, filters: Array.from(filters.namesFilter), onFilter: (value, record) => record.names?.indexOf(value) === 0, sorter: (a, b) => a.names.localeCompare(b.names), sortDirections: ["ascend", "descend"] },
              { title: 'Last Names', dataIndex: 'lastNames', editable: false, filterSearch: true, filters: Array.from(filters.lastNamesFilter), onFilter: (value, record) => record.lastNames?.indexOf(value) === 0, sorter: (a, b) => a.lastNames.localeCompare(b.lastNames), sortDirections: ["ascend", "descend"] },
              { title: 'Age', dataIndex: 'age', editable: false, filterSearch: true, filters: Array.from(filters.ageFilter), onFilter: (value, record) => record.age === value ? true : false, sorter: (a, b) => a.age - b.age },
              { title: 'Days To B-day', dataIndex: 'daysToBday', editable: false, filterSearch: true, filters: Array.from(filters.daysToBdayFilter), onFilter: (value, record) => record.daysToBday === value ? true : false, sorter: (a, b) => a.daysToBday - b.daysToBday },
              {
                title: 'Gender',
                dataIndex: 'sex',
                editable: false,
                filterSearch: true,
                filters: Array.from(filters.sexFilter),
                onFilter: (value, record) => record.sex?.indexOf(value) === 0,
                sorter: (a, b) => a.sex.localeCompare(b.sex),
                sortDirections: ["ascend", "descend"],
                render: (sex) => {
                    const sexMap = {
                      'M': ['geekblue', 'Male'],
                      'F': ['pink', 'Female']
                    };
                    const [color, gender] = sexMap[sex] || ['black', 'Unknown'];
                    return <Tag color={color} key={sex}>{gender}</Tag>;
                }
            }
          ]
      },
      ...(locationType === "all" || locationType === "residency" ? [{
          title: 'Residency',
          children: [
              { title: 'Country', dataIndex: 'countryOfResidency', editable: false, filters: Array.from(filters.countryOfResidencyFilter), align: "center", onFilter: (value, record) => record.countryOfResidency === value, sorter: (a, b) => a.countryOfResidency - b.countryOfResidency, sortDirections: ["ascend", "descend"], render: (countryOfResidency) => <Flag code={countryOfResidency} style={{ width: 40, marginRight: 10 }} /> },
              { title: 'Region', dataIndex: 'regionOfResidency', editable: false, filters: Array.from(filters.regionOfResidencyFilter), align: "center", onFilter: (value, record) => record.regionOfResidency?.indexOf(value) === 0, sorter: (a, b) => a.regionOfResidency - b.regionOfResidency, sortDirections: ["ascend", "descend"] }
          ]
      }] : []),
      ...(locationType === "all" || locationType === "birth" ? [{
          title: 'Birth',
          children: [
              { title: 'Country', dataIndex: 'countryOfBirth', editable: false, filters: Array.from(filters.countryOfBirthFilter), align: "center", onFilter: (value, record) => record.countryOfBirth === value, sorter: (a, b) => a.countryOfBirth - b.countryOfBirth, sortDirections: ["ascend", "descend"], render: (countryOfBirth) => <Flag code={countryOfBirth}  style={{ width: 40, marginRight: 10 }}/> },
              { title: 'Region', dataIndex: 'regionOfBirth', editable: false, filters: Array.from(filters.regionOfBirthFilter), align: "center", onFilter: (value, record) => record.regionOfBirth?.indexOf(value) === 0, sorter: (a, b) => a.regionOfBirth - b.regionOfBirth, sortDirections: ["ascend", "descend"] }
          ]
      }] : [])
  ];

  return {
      tableData: results,
      columns: columns
  };
};

const AdminInsights = {
  courseSelectionConverter,
  locationTypeConverter,
  countrySelectionConverter,
  overviewInfoConvertion,
  transformEnrolleeGeneralDemographicData,
  transformEnrolleeDivisionDemographicData,
  handleEnrolleeListConvertor
};

export default AdminInsights;
