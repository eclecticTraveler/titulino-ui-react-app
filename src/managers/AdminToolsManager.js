import TitulinoRestService from "services/TitulinoRestService";
import TitulinoAuthService from "services/TitulinoAuthService";
import LocalStorageService from "services/LocalStorageService";
import AdminInsights from "lob/AdminInsights";

const getTokenFromEmail = async (emailId) => {
  const user = await LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
  return user?.innerToken || null;
};

export const initAdminTools = async (emailId) => {
  const token = await getTokenFromEmail(emailId);
  if (!token) {
    console.warn('[AdminToolsManager] No token found for emailId:', emailId);
    return { allCourses: [], allRoles: [], allEnrollees: [] };
  }
  const [rawCourses, allRoles, allEnrollees] = await Promise.all([
    TitulinoRestService.getAllCourses('AdminToolsManager'),
    TitulinoAuthService.getUserRoles(token, 'AdminToolsManager'),
    TitulinoAuthService.getAllEnrollees(token, 'AdminToolsManager')
  ]);
  const allCourses = await AdminInsights.courseSelectionConverter(rawCourses);
  return { allCourses, allRoles, allEnrollees };
};

export const assignRoleToCourse = async (contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.assignRoleToCourse(contactInternalId, courseCodeId, roleId, contactEmailId, token, 'AdminToolsManager');
};

export const assignGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.assignGlobalRole(contactInternalId, roleId, token, 'AdminToolsManager');
};

export const upsertCourse = async (courseData, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.upsertCourse(courseData, token, 'AdminToolsManager');
};

const AdminToolsManager = {
  initAdminTools,
  assignRoleToCourse,
  assignGlobalRole,
  upsertCourse
};

export default AdminToolsManager;
