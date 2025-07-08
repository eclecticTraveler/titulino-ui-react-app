// Create a mapping for theme based courses
const levelMapping = {
  "supermarket": 4,
  "household":5,
  "work-n-jobs":6
};

export const getThemeMappedLevelNo = (level) => {
  if (levelMapping[level]) {
    return levelMapping[level]; // Return mapped level if it exists
  }
  return parseInt(level, 10); // Fallback to parsing it as a number
};

const CentralCourseThemeService = {
  getThemeMappedLevelNo
};

export default CentralCourseThemeService;
