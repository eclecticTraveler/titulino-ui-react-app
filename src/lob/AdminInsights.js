import Flag from "react-world-flags";
import { Tag, Table, Progress, Avatar, Image } from 'antd';
import { UserOutlined, CopyOutlined } from '@ant-design/icons';
import StudentProgress from "lob/StudentProgress";
import AdminProgressEditable from "components/layout-components/AdminProgressEditable";
import IntlMessage from "components/util-components/IntlMessage";

const hasAvatarUrl = (avatarUrl) =>
  typeof avatarUrl === 'string' ? avatarUrl.trim().length > 0 : Boolean(avatarUrl);

const avatarPresenceFilters = [
  { text: 'With Photo', value: 'withPhoto' },
  { text: 'Without Photo', value: 'withoutPhoto' }
];

const avatarPresenceFilter = (value, record) =>
  value === 'withPhoto' ? hasAvatarUrl(record?.avatarUrl) : !hasAvatarUrl(record?.avatarUrl);

const avatarPresenceSorter = (a, b) =>
  Number(hasAvatarUrl(a?.avatarUrl)) - Number(hasAvatarUrl(b?.avatarUrl));

const avatarColumnTitle = (
  <span style={{ whiteSpace: 'nowrap' }}>
    <UserOutlined style={{ fontSize: 12, marginRight: 4 }} />
    Photo
  </span>
);

const renderAvatarCell = (url) => (
  hasAvatarUrl(url) ? (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        src={url}
        alt="profile"
        width={40}
        height={40}
        fallback="data:image/png;"
        style={{ objectFit: 'cover' }}
      />
    </div>
  ) : (
    <Avatar
      shape="square"
      size={40}
      icon={<UserOutlined />}
      style={{ backgroundColor: '#87d068' }}
    />
  )
);

const getLatestProficiencyForCourse = (item, courseCodeId) => {
  if (!item) {
    console.warn("getLatestProficiencyForCourse: item is null");
    return "";
  }

  if (!courseCodeId) {
    console.warn("getLatestProficiencyForCourse: courseCodeId is missing");
    return "";
  }

  // 1️⃣ Find the course
  const course = item?.CoursesHistory?.find(
    c => c?.CourseCodeId === courseCodeId
  );

  if (!course) {
    console.warn("No course found for courseCodeId:", courseCodeId);
    return "";
  }

  const targetLanguageId = course?.TargetLanguageId;
  const nativeLanguageId = course?.NativeLanguageId;

  // 2️⃣ Filter language proficiency history
  const matchingProficiencies = item?.LanguageProficienciesHistory
    ?.filter(lp =>
      lp?.EndDate === null &&
      lp?.LanguageId === targetLanguageId &&
      lp?.LanguageId !== nativeLanguageId
    );

  if (!matchingProficiencies || matchingProficiencies.length === 0) {
    console.warn("No matching proficiency found for language:", targetLanguageId);
    return "";
  }

  // 3️⃣ Order by ProficiencyOrder DESC (same as backend)
  const latest = matchingProficiencies.sort(
    (a, b) => (b?.ProficiencyOrder ?? 0) - (a?.ProficiencyOrder ?? 0)
  )[0];

  return latest?.LanguageLevelAbbreviation ?? "";
}

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

// Session-scoped color registry: ensures the same region always gets the same
// color across all map instances (General demographics, Progress demographics, etc.)
// Resets automatically on page reload (new session).
const sessionColorMap = new Map();
let nextColorIndex = 0;

const getSessionColor = (regionName) => {
  if (!regionName) return colorPalette[0];
  if (sessionColorMap.has(regionName)) return sessionColorMap.get(regionName);
  const color = colorPalette[nextColorIndex % colorPalette.length];
  sessionColorMap.set(regionName, color);
  nextColorIndex++;
  return color;
};

// Helper function to transform demographic data
const transformDemographicArray = (dataArray, nameKey, nativeNameKey, extraKeys = () => ({})) => {
  return dataArray?.map((item) => ({
    color: getSessionColor(item[nameKey]),
    name: item[nameKey],
    value: `${item.Percentage?.toFixed(2)}%`,
    nativeName: item[nativeNameKey] ?? item[nameKey],
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
    transformedResidencyArray: transformDemographicArray(data?.Residency, 'CountryDivisionName', 'CountryDivisionNativeName', item => ({
      divisionId: item?.CountryDivisionId,
      countryId: item?.CountryId
    })),
    transformedBirthArray: transformDemographicArray(data?.Birth, 'CountryDivisionName', 'CountryDivisionNativeName', item => ({
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

export const handleEnrolleeListConvertor = async (data, locationType, courseCodeId) => {

  if (!data) return { tableData: [], columns: [], enrollmentDates: [] };
  if (!Array.isArray(data)) {
    console.warn("handleEnrolleeListConvertor expected an array", { locationType, data });
    return { tableData: [], columns: [], enrollmentDates: [] };
  }

  const results = [];
  const enrollmentDates = [];
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
    birthdayFilter: new Set(),
    emailFilter: new Set()
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
      regionOfBirthTracker: new Set(),
      birthdayTracker: new Set(),
      emailTracker: new Set()
  };

  const processData = async(item, i) => {
      const daysUntilBday = await getDaysUntilComingBirthday(item?.DateOfBirth);
      const currentLevel = item.LanguageProficienciesHistory.find(entry => entry.EndDate === null)?.LanguageLevelAbbreviation;   
      results.push({
        key: i,
        langLevel: currentLevel,
        enrolleeId: item?.ContactExternalId,
        contactInternalId: item?.ContactInternalId,
        avatarUrl: null,
        names: item?.Names,
        lastNames: item?.LastNames,
        age: item?.Age,
        sex: item?.Sex,
        daysToBday: daysUntilBday,
        birthday: item?.DateOfBirth,
        countryOfResidency: item?.Location?.ResidencyLocation?.CountryOfResidency,
        regionOfResidency: item?.Location?.ResidencyLocation?.CountryDivisionResidencyName,
        countryOfBirth: item?.Location?.BirthLocation?.CountryOfBirth,
        regionOfBirth: item?.Location?.BirthLocation?.CountryDivisionBirthName,

        // NEW FIELDS for expandable row
        emails: item?.Emails?.filter(e => e.IsEmailParseValid).map(e => e.EmailId) || [],
        courses: [
          ...(item?.CoursesHistory?.map(c => c.CourseCodeId) || []),
          ...(item?.UserCourseRoles?.map(c => c.CourseCodeId) || [])
        ].map(courseId => {

          const tierInfo = item?.ContactCourseTiers?.find(t => t.CourseCodeId === courseId);
          let tierTag;
          if (!tierInfo || !tierInfo.TierId) {
            tierTag = <Tag color="blue">Free</Tag>;
          } else if (tierInfo.TierId === "Silver") {
            tierTag = <Tag color="silver">Silver</Tag>;
          } else if (tierInfo.TierId === "Gold") {
            tierTag = <Tag color="gold">Gold</Tag>;
          }
          return { courseId, tier: tierTag };
        })
      });


      const uniqueFilters = [
        { field: currentLevel, filter: 'langLevel' },
        { field: item?.ContactExternalId, filter: 'enrolleeId' },
        { field: item?.Names, filter: 'names' },
        { field: item?.LastNames, filter: 'lastNames' },
        { field: item?.Age, filter: 'age' },
        { field: item?.Sex, filter: 'sex' },
        { field: daysUntilBday, filter: 'daysToBday' },
        { field: item?.DateOfBirth, filter: 'birthday' },
        { field: item?.Location?.ResidencyLocation?.CountryOfResidency, filter: 'countryOfResidency' },
        { field: item?.Location?.ResidencyLocation?.CountryDivisionResidencyName, filter: 'regionOfResidency' },
        { field: item?.Location?.BirthLocation?.CountryOfBirth, filter: 'countryOfBirth' },
        { field: item?.Location?.BirthLocation?.CountryDivisionBirthName, filter: 'regionOfBirth' }
    ];
   
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

  await Promise.all(data.map(processData));

  // Extract enrollment dates from UserCourseRoles
  data.forEach((item) => {
    const role = courseCodeId
      ? item?.UserCourseRoles?.find(r => r.CourseCodeId === courseCodeId)
      : item?.UserCourseRoles?.[0];
    if (role?.CreatedAt) enrollmentDates.push(role.CreatedAt);
  });

  const columns = [
      {
          title: 'Level',
          dataIndex: 'langLevel',
          editable: false,
          filterSearch: true,
          width: 150,
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
              { title: 'Id', width: 100, dataIndex: 'enrolleeId', editable: false, filterSearch: true, filters: Array.from(filters.enrolleeIdFilter), onFilter: (value, record) => record.enrolleeId === value ? true : false, sorter: (a, b) => a.enrolleeId - b.enrolleeId },
              {
                title: avatarColumnTitle,
                dataIndex: 'avatarUrl',
                width: 96,
                align: 'center',
                filters: avatarPresenceFilters,
                filterMultiple: false,
                onFilter: avatarPresenceFilter,
                sorter: avatarPresenceSorter,
                sortDirections: ['descend', 'ascend'],
                render: renderAvatarCell
              },
              { title: 'Names', width: 150, dataIndex: 'names', editable: false, filterSearch: true, filters: Array.from(filters.namesFilter), onFilter: (value, record) => record.names?.indexOf(value) === 0, sorter: (a, b) => a.names.localeCompare(b.names), sortDirections: ["ascend", "descend"] },
              { title: 'Last Names', width: 150, dataIndex: 'lastNames', editable: false, filterSearch: true, filters: Array.from(filters.lastNamesFilter), onFilter: (value, record) => record.lastNames?.indexOf(value) === 0, sorter: (a, b) => a.lastNames.localeCompare(b.lastNames), sortDirections: ["ascend", "descend"] },
              { title: 'Age', width: 60, dataIndex: 'age', editable: false, filterSearch: true, filters: Array.from(filters.ageFilter), onFilter: (value, record) => record.age === value ? true : false, sorter: (a, b) => a.age - b.age },
              { title: 'Days To B-day', width: 110, dataIndex: 'daysToBday', editable: false, filterSearch: true, filters: Array.from(filters.daysToBdayFilter), onFilter: (value, record) => record.daysToBday === value ? true : false, sorter: (a, b) => a.daysToBday - b.daysToBday },
              { title: 'B-day', width: 110, dataIndex: 'birthday', editable: false, filterSearch: true, filters: Array.from(filters.birthdayFilter), onFilter: (value, record) => record.birthday.startsWith(value), sorter: (a, b) => new Date(a.birthday) - new Date(b.birthday) },
              {
                title: 'Gender',
                width: 110,
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
                    const [color, gender] = sexMap[sex] || ['red', 'Unknown'];
                    return <Tag color={color} key={sex}>{gender}</Tag>;
                }
            }
          ]
      },
      ...(locationType === "all" || locationType === "residency" ? [{
          title: 'Residency',
          children: [
              { title: 'Country', width: 130, dataIndex: 'countryOfResidency', editable: false, filters: Array.from(filters.countryOfResidencyFilter), align: "center", onFilter: (value, record) => record.countryOfResidency === value, sorter: (a, b) => a.countryOfResidency - b.countryOfResidency, sortDirections: ["ascend", "descend"], render: (countryOfResidency) => <Flag code={countryOfResidency} style={{ width: 40, marginRight: 10 }} /> },
              { title: 'Region', width: 130, dataIndex: 'regionOfResidency', editable: false, filters: Array.from(filters.regionOfResidencyFilter), align: "center", onFilter: (value, record) => record.regionOfResidency?.indexOf(value) === 0, sorter: (a, b) => a.regionOfResidency - b.regionOfResidency, sortDirections: ["ascend", "descend"] }
          ]
          },
          {
            title: 'Birth',
            children: [
                { title: 'Country', width: 130, dataIndex: 'countryOfBirth', editable: false, filters: Array.from(filters.countryOfBirthFilter), align: "center", onFilter: (value, record) => record.countryOfBirth === value, sorter: (a, b) => a.countryOfBirth - b.countryOfBirth, sortDirections: ["ascend", "descend"], render: (countryOfBirth) => <Flag code={countryOfBirth}  style={{ width: 40, marginRight: 10 }}/> },
                { title: 'Region', width: 130, dataIndex: 'regionOfBirth', editable: false, filters: Array.from(filters.regionOfBirthFilter), align: "center", onFilter: (value, record) => record.regionOfBirth?.indexOf(value) === 0, sorter: (a, b) => a.regionOfBirth - b.regionOfBirth, sortDirections: ["ascend", "descend"] }
            ]
        }
    ] : []),
      ...(locationType === "birth" ? [{
          title: 'Birth',
          children: [
              { title: 'Country', width: 130, dataIndex: 'countryOfBirth', editable: false, filters: Array.from(filters.countryOfBirthFilter), align: "center", onFilter: (value, record) => record.countryOfBirth === value, sorter: (a, b) => a.countryOfBirth - b.countryOfBirth, sortDirections: ["ascend", "descend"], render: (countryOfBirth) => <Flag code={countryOfBirth}  style={{ width: 40, marginRight: 10 }}/> },
              { title: 'Region', width: 130, dataIndex: 'regionOfBirth', editable: false, filters: Array.from(filters.regionOfBirthFilter), align: "center", onFilter: (value, record) => record.regionOfBirth?.indexOf(value) === 0, sorter: (a, b) => a.regionOfBirth - b.regionOfBirth, sortDirections: ["ascend", "descend"] }
          ]
      },
      {
        title: 'Residency',
        children: [
            { title: 'Country', width: 130, dataIndex: 'countryOfResidency', editable: false, filters: Array.from(filters.countryOfResidencyFilter), align: "center", onFilter: (value, record) => record.countryOfResidency === value, sorter: (a, b) => a.countryOfResidency - b.countryOfResidency, sortDirections: ["ascend", "descend"], render: (countryOfResidency) => <Flag code={countryOfResidency} style={{ width: 40, marginRight: 10 }} /> },
            { title: 'Region',  width: 130, dataIndex: 'regionOfResidency', editable: false, filters: Array.from(filters.regionOfResidencyFilter), align: "center", onFilter: (value, record) => record.regionOfResidency?.indexOf(value) === 0, sorter: (a, b) => a.regionOfResidency - b.regionOfResidency, sortDirections: ["ascend", "descend"] }
        ]
      }
    ] : [])
  ];

  return {
    tableData: results,
    columns: columns,
    enrollmentDates: enrollmentDates,
    expandable: {
      expandedRowRender: (record) => {
        // Remove duplicate courses
        const uniqueCourses = record?.courses
          ? Array.from(new Map(record.courses.map(c => [c.courseId, c])).values())
          : [{ courseId: 'No courses', tier: <Tag color="gray">None</Tag> }];

        // Prepare data for nested table
        const nestedData = [
          {
            key: '1',
            emails: record?.emails?.length ? record.emails : ['No valid emails'],
            courses: uniqueCourses,
          }
        ];


        // Nested table columns
        const nestedColumns = [
          {
            title: 'Emails',
            dataIndex: 'emails',
            key: 'emails',
            render: (emails) => (
              <>
                {emails.map((email, idx) => (
                  <Tag color="geekblue" key={idx}>{email}</Tag>
                ))}
              </>
            ),
          },
          {
            title: 'Courses',
            dataIndex: 'courses',
            key: 'courses',
            render: (courses) => (
              <>
                {courses.map(({ courseId, tier }, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <Tag color="purple">{courseId}</Tag> {tier}
                  </div>
                ))}
              </>
            ),
          },
        ];

        return (
          <Table
            columns={nestedColumns}
            dataSource={nestedData}
            pagination={false}
            size="small"
          />
        );
      }
    }
  };
};


export const handleEnrolleeProgressListConvertor = async (data, locationType, progressMap, courseProgressConfigJson, courseCodeId) => {

  if (!data) return { tableData: [], columns: [] };

  const results = [];

  const filters = {
    countryOfResidencyFilter: new Set(),
    countryOfBirthFilter: new Set(),
    enrolleeIdFilter: new Set(),
    proficiencyFilter: new Set()
  };

  const trackers = {
    countryOfResidencyTracker: new Set(),
    countryOfBirthTracker: new Set(),
    enrolleeIdTracker: new Set(),
    proficiencyTracker: new Set()
  };

  await Promise.all(
    data.map(async (item, index) => {

      const contactId = item.ContactInternalId;
      const userProgressRows = progressMap?.[contactId] ?? [];

      const emails = item?.Emails?.filter(e => e.IsEmailParseValid)
                .map(e => e.EmailId) || [];

      // Calculate progress per email
      const emailProgressMap = {};
      for (const email of emails) {
        const emailRows = userProgressRows.filter(r => r.EmailId === email);
        const emailResult =
          await StudentProgress.calculateUserCourseProgressPercentageForCertificates(emailRows);
        emailProgressMap[email] = {
          participationPercent: Number((Number(emailResult?.participationCertificatePercentage ?? 0) * 100).toFixed(1)),
          goldenPercent: Number((Number(emailResult?.goldenCertificatePercentage ?? 0) * 100).toFixed(1))
        };
      }

      // Default to the email with highest combined progress
      let bestEmail = emails[0] || null;
      let bestCombined = -1;
      for (const [email, progress] of Object.entries(emailProgressMap)) {
        const combined = progress.participationPercent + progress.goldenPercent;
        if (combined > bestCombined) {
          bestCombined = combined;
          bestEmail = email;
        }
      }

      const defaultProgress = emailProgressMap[bestEmail] ?? { participationPercent: 0, goldenPercent: 0 };

      const countryOfResidency =
        item?.Location?.ResidencyLocation?.CountryOfResidency || null;

      const countryOfBirth =
        item?.Location?.BirthLocation?.CountryOfBirth || null;

      const courseAbbreviation = getLatestProficiencyForCourse(item, courseCodeId);

      results.push({
        key: index,
        enrolleeId: item?.ContactExternalId,
        contactInternalId: item?.ContactInternalId,
        avatarUrl: null,
        fullName: `${item.LastNames}, ${item.Names}`,
        countryOfResidency,
        countryOfBirth,
        participationPercent: defaultProgress.participationPercent,
        goldenPercent: defaultProgress.goldenPercent,
        rawProgress: userProgressRows,
        emails,
        selectedEmail: bestEmail,
        emailProgressMap,
        contactProficiency: courseAbbreviation
      });

      // Populate filters (same architecture as other function)
    const filterFields = [
      { field: countryOfResidency, filter: "countryOfResidency" },
      { field: countryOfBirth, filter: "countryOfBirth" },
      { field: item?.ContactExternalId, filter: "enrolleeId" },
      { field: courseAbbreviation, filter: "proficiency" }
    ];

    filterFields.forEach(({ field, filter }) => {
      const trackerKey = `${filter}Tracker`;

      if (field && !trackers[trackerKey].has(field)) {

        let valueToAdd;

        // ---- Proficiency filter (USE TAG LIKE TABLE 3) ----
        if (filter === "proficiency") {

          const proficiencyMap = proficiencyMaps;
          const [color, label] = proficiencyMap[field] || ['black', 'Unknown'];

          valueToAdd = {
            key: field,
            text: <Tag color={color}>{label}</Tag>,
            value: field
          };

        }

        // ---- Country filters (USE FLAG ONLY HERE) ----
        else if (filter === "countryOfResidency" || filter === "countryOfBirth") {

          valueToAdd = {
            key: field,
            text: (
              <>
                <Flag code={field} style={{ width: 30, marginRight: 5 }} />
                {field}
              </>
            ),
            value: field
          };

        }

        // ---- Default filters (ID etc) ----
        else {

          valueToAdd = {
            key: field,
            text: field,
            value: field
          };

        }

        filters[`${filter}Filter`].add(valueToAdd);
        trackers[trackerKey].add(field);
      }
    });

    })
  );

  const columns = [
    {
      title: <IntlMessage id="admin.dashboard.insights.progress.profile" />,
      children: [
              {
            title: <IntlMessage id="admin.dashboard.insights.progress.level" />,
            dataIndex: 'contactProficiency',
            editable: false,
            filterSearch: true,
            width: '10%',
            filters: Array.from(filters.proficiencyFilter || []),
            onFilter: (value, record) => record.contactProficiency?.indexOf(value) === 0,
            sorter: (a, b) => a.contactProficiency.localeCompare(b.contactProficiency),
            sortDirections: ["ascend", "descend"],
            render: (contactProficiency) => {
                const proficiencyMap = proficiencyMaps;
                const [color, proficiency] = proficiencyMap[contactProficiency] || ['black', 'Unknown'];
                return <Tag color={color} key={contactProficiency}>{proficiency}</Tag>;
            }
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.id" />,
          dataIndex: "enrolleeId",
          filterSearch: true, 
          filters: Array.from(filters.enrolleeIdFilter || []), 
          onFilter: (value, record) => record.enrolleeId === value ? true : false,
          sorter: (a, b) => a.enrolleeId - b.enrolleeId
        },
        {
          title: avatarColumnTitle,
          dataIndex: 'avatarUrl',
          width: 96,
          align: 'center',
          filters: avatarPresenceFilters,
          filterMultiple: false,
          onFilter: avatarPresenceFilter,
          sorter: avatarPresenceSorter,
          sortDirections: ['descend', 'ascend'],
          render: renderAvatarCell
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.fullName" />,
          dataIndex: "fullName"
        }
      ]
    },

    {
      title: <IntlMessage id="admin.dashboard.insights.progress.studentProgress" />,
      children: [
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.participation" />,
          dataIndex: "participationPercent",
          sorter: (a, b) =>
            a.participationPercent - b.participationPercent,
          defaultSortOrder: "descend",
          sortDirections: ["ascend", "descend"],
          render: (value) =>
            <Progress percent={value} strokeColor="#1677ff" />
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.golden" />,
          dataIndex: "goldenPercent",
          sorter: (a, b) =>
            a.goldenPercent - b.goldenPercent,
          sortDirections: ["ascend", "descend"],
          render: (value) =>
            <Progress percent={value} strokeColor="gold" />
        }
      ]
    },

    ...(locationType === "all" || locationType === "residency"
      ? [
          {
            title: <IntlMessage id="admin.dashboard.dropdown.selection.residency" />,
            children: [
              {
                title: <IntlMessage id="admin.dashboard.insights.progress.country" />,
                dataIndex: "countryOfResidency",
                align: "center",
                filters: Array.from(filters.countryOfResidencyFilter),
                onFilter: (value, record) =>
                  record.countryOfResidency === value,
                sorter: (a, b) =>
                  (a.countryOfResidency || "").localeCompare(
                    b.countryOfResidency || ""
                  ),
                render: (code) =>
                  code ? <Flag code={code} style={{ width: 35 }} /> : "-"
              }
            ]
          }
        ]
      : []),

    ...(locationType === "all" || locationType === "birth"
      ? [
          {
            title: <IntlMessage id="admin.dashboard.dropdown.selection.birth" />,
            children: [
              {
                title: <IntlMessage id="admin.dashboard.insights.progress.country" />,
                dataIndex: "countryOfBirth",
                align: "center",
                filters: Array.from(filters.countryOfBirthFilter),
                onFilter: (value, record) =>
                  record.countryOfBirth === value,
                sorter: (a, b) =>
                  (a.countryOfBirth || "").localeCompare(
                    b.countryOfBirth || ""
                  ),
                render: (code) =>
                  code ? <Flag code={code} style={{ width: 35 }} /> : "-"
              }
            ]
          }
        ]
      : [])
  ];
        

  const expandable = {
    expandedRowRender: (record, injectedSubmit, injectedEmailChange) => {

      const courseConfig = courseProgressConfigJson;
      return (
        <AdminProgressEditable
          categories={courseConfig?.categories}
          progressData={record.rawProgress}
          contactId={record.contactInternalId}
          emails={record.emails}
          defaultEmail={record.selectedEmail}
          emailProgressMap={record.emailProgressMap}
          courseCodeId={courseConfig?.courseId}
          userProficiency={record.contactProficiency}
          onSubmit={injectedSubmit}
          onEmailChange={(email) =>
            injectedEmailChange?.(record.contactInternalId, email, record.emailProgressMap?.[email])
          }
        />
      );
    }
  };

  return {
    tableData: results,
    columns,
    expandable
  };
};

/**
 * Combined table for Facilitador dashboard.
 * Merges enrollee list data with progress data into a single table.
 * Columns: Level, Id, Full Name, Gender, Residency (Country + Region), Emails, Progress bars.
 * Expandable: same AdminProgressEditable as the progress list.
 */
export const handleFacilitadorEnrolleeListConvertor = async (enrolleeData, progressMap, courseProgressConfigJson, courseCodeId) => {

  if (!enrolleeData) return { tableData: [], columns: [], expandable: null };

  const results = [];
  const filters = {
    proficiencyFilter: new Set(),
    enrolleeIdFilter: new Set(),
    sexFilter: new Set(),
    countryOfResidencyFilter: new Set(),
    regionOfResidencyFilter: new Set()
  };
  const trackers = {
    proficiencyTracker: new Set(),
    enrolleeIdTracker: new Set(),
    sexTracker: new Set(),
    countryOfResidencyTracker: new Set(),
    regionOfResidencyTracker: new Set()
  };

  await Promise.all(
    enrolleeData.map(async (item, index) => {
      const contactId = item.ContactInternalId;
      const userProgressRows = progressMap?.[contactId] ?? [];

      const emails = item?.Emails?.filter(e => e.IsEmailParseValid).map(e => e.EmailId) || [];

      // Calculate progress per email
      const emailProgressMap = {};
      for (const email of emails) {
        const emailRows = userProgressRows.filter(r => r.EmailId === email);
        const emailResult = await StudentProgress.calculateUserCourseProgressPercentageForCertificates(emailRows);
        emailProgressMap[email] = {
          participationPercent: Number((Number(emailResult?.participationCertificatePercentage ?? 0) * 100).toFixed(1)),
          goldenPercent: Number((Number(emailResult?.goldenCertificatePercentage ?? 0) * 100).toFixed(1))
        };
      }

      let bestEmail = emails[0] || null;
      let bestCombined = -1;
      for (const [email, progress] of Object.entries(emailProgressMap)) {
        const combined = progress.participationPercent + progress.goldenPercent;
        if (combined > bestCombined) { bestCombined = combined; bestEmail = email; }
      }
      const defaultProgress = emailProgressMap[bestEmail] ?? { participationPercent: 0, goldenPercent: 0 };

      const countryOfResidency = item?.Location?.ResidencyLocation?.CountryOfResidency || null;
      const regionOfResidency = item?.Location?.ResidencyLocation?.CountryDivisionResidencyName || null;
      const courseAbbreviation = getLatestProficiencyForCourse(item, courseCodeId);

      results.push({
        key: index,
        enrolleeId: item?.ContactExternalId,
        contactInternalId: contactId,
        avatarUrl: null,
        fullName: `${item.LastNames}, ${item.Names}`,
        sex: item?.Sex,
        countryOfResidency,
        regionOfResidency,
        emails,
        participationPercent: defaultProgress.participationPercent,
        goldenPercent: defaultProgress.goldenPercent,
        rawProgress: userProgressRows,
        selectedEmail: bestEmail,
        emailProgressMap,
        contactProficiency: courseAbbreviation
      });

      // Populate filters
      const filterFields = [
        { field: courseAbbreviation, filter: 'proficiency' },
        { field: item?.ContactExternalId, filter: 'enrolleeId' },
        { field: item?.Sex, filter: 'sex' },
        { field: countryOfResidency, filter: 'countryOfResidency' },
        { field: regionOfResidency, filter: 'regionOfResidency' }
      ];

      filterFields.forEach(({ field, filter }) => {
        const trackerKey = `${filter}Tracker`;
        if (field && !trackers[trackerKey].has(field)) {
          let valueToAdd;
          if (filter === 'proficiency') {
            const [color, label] = proficiencyMaps[field] || ['black', 'Unknown'];
            valueToAdd = { key: field, text: <Tag color={color}>{label}</Tag>, value: field };
          } else if (filter === 'countryOfResidency') {
            valueToAdd = { key: field, text: <><Flag code={field} style={{ width: 30, marginRight: 5 }} />{field}</>, value: field };
          } else if (filter === 'sex') {
            valueToAdd = {
              key: field,
              text: <Tag color={field === 'M' ? 'geekblue' : 'pink'}>{field === 'M' ? 'Male' : 'Female'}</Tag>,
              value: field
            };
          } else {
            valueToAdd = { key: field, text: field, value: field };
          }
          filters[`${filter}Filter`].add(valueToAdd);
          trackers[trackerKey].add(field);
        }
      });
    })
  );

  const columns = [
    {
      title: <IntlMessage id="admin.dashboard.insights.progress.profile" />,
      children: [
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.level" />,
          dataIndex: 'contactProficiency',
          width: '10%',
          filters: Array.from(filters.proficiencyFilter || []),
          onFilter: (value, record) => record.contactProficiency?.indexOf(value) === 0,
          sorter: (a, b) => (a.contactProficiency || '').localeCompare(b.contactProficiency || ''),
          render: (val) => {
            const [color, label] = proficiencyMaps[val] || ['black', 'Unknown'];
            return <Tag color={color}>{label}</Tag>;
          }
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.id" />,
          dataIndex: 'enrolleeId',
          width: '8%',
          filters: Array.from(filters.enrolleeIdFilter || []),
          onFilter: (value, record) => record.enrolleeId === value,
          sorter: (a, b) => a.enrolleeId - b.enrolleeId
        },
        {
          title: avatarColumnTitle,
          dataIndex: 'avatarUrl',
          width: 96,
          align: 'center',
          filters: avatarPresenceFilters,
          filterMultiple: false,
          onFilter: avatarPresenceFilter,
          sorter: avatarPresenceSorter,
          sortDirections: ['descend', 'ascend'],
          render: renderAvatarCell
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.fullName" />,
          dataIndex: 'fullName',
          width: '15%'
        },
        {
          title: <IntlMessage id="facilitador.dashboard.gender" />,
          dataIndex: 'sex',
          width: '8%',
          filters: Array.from(filters.sexFilter || []),
          onFilter: (value, record) => record.sex === value,
          render: (sex) => <Tag color={sex === 'M' ? 'geekblue' : 'pink'}>{sex === 'M' ? 'Male' : 'Female'}</Tag>
        }
      ]
    },
    {
      title: <IntlMessage id="admin.dashboard.insights.progress.studentProgress" />,
      children: [
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.participation" />,
          dataIndex: 'participationPercent',
          width: '12%',
          sorter: (a, b) => a.participationPercent - b.participationPercent,
          defaultSortOrder: 'descend',
          render: (value) => <Progress percent={value} strokeColor="#1677ff" />
        },
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.golden" />,
          dataIndex: 'goldenPercent',
          width: '12%',
          sorter: (a, b) => a.goldenPercent - b.goldenPercent,
          render: (value) => <Progress percent={value} strokeColor="gold" />
        }
      ]
    },
    {
      title: <IntlMessage id="admin.dashboard.dropdown.selection.residency" />,
      children: [
        {
          title: <IntlMessage id="admin.dashboard.insights.progress.country" />,
          dataIndex: 'countryOfResidency',
          align: 'center',
          width: '8%',
          filters: Array.from(filters.countryOfResidencyFilter || []),
          onFilter: (value, record) => record.countryOfResidency === value,
          render: (code) => code ? <Flag code={code} style={{ width: 35 }} /> : '-'
        },
        {
          title: <IntlMessage id="facilitador.dashboard.region" />,
          dataIndex: 'regionOfResidency',
          width: '10%',
          filters: Array.from(filters.regionOfResidencyFilter || []),
          onFilter: (value, record) => record.regionOfResidency === value
        }
      ]
    }
  ];

  const expandable = {
    expandedRowRender: (record, injectedSubmit, injectedEmailChange) => {
      const courseConfig = courseProgressConfigJson;
      const handleCopyEmail = (email) => {
        if (email && navigator.clipboard) {
          navigator.clipboard.writeText(email);
        }
      };
      return (
        <AdminProgressEditable
          categories={courseConfig?.categories}
          progressData={record.rawProgress}
          contactId={record.contactInternalId}
          emails={record.emails}
          defaultEmail={record.selectedEmail}
          emailProgressMap={record.emailProgressMap}
          courseCodeId={courseConfig?.courseId}
          userProficiency={record.contactProficiency}
          onSubmit={injectedSubmit}
          onEmailChange={(email) =>
            injectedEmailChange?.(record.contactInternalId, email, record.emailProgressMap?.[email])
          }
          onCopyEmail={handleCopyEmail}
        />
      );
    }
  };

  return { tableData: results, columns, expandable };
};

const AdminInsights = {
  courseSelectionConverter,
  locationTypeConverter,
  countrySelectionConverter,
  overviewInfoConvertion,
  transformEnrolleeGeneralDemographicData,
  transformEnrolleeDivisionDemographicData,
  handleEnrolleeListConvertor,
  handleEnrolleeProgressListConvertor,
  handleFacilitadorEnrolleeListConvertor
};

export default AdminInsights;
