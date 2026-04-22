import AdminToolsManager from 'managers/AdminToolsManager';
import {
  ON_LOADING_ADMIN_TOOLS_INIT,
  ON_ASSIGNING_ROLE_TO_COURSE,
  ON_ASSIGNING_GLOBAL_ROLE,
  ON_CLEAR_SELECTED_CONTACT,
  ON_UPSERTING_COURSE,
  ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY
} from '../constants/AdminTools';

export const onLoadingAdminToolsInit = async (emailId) => {
  const { allCourses, allRoles, allEnrollees, allRawCourses } = await AdminToolsManager.initAdminTools(emailId);
  return { type: ON_LOADING_ADMIN_TOOLS_INIT, allCourses, allRoles, allEnrollees, allRawCourses };
};

export const onAssigningRoleToCourse = async (contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId) => {
  const result = await AdminToolsManager.assignRoleToCourse(contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId);
  return { type: ON_ASSIGNING_ROLE_TO_COURSE, assignResult: result };
};

export const onAssigningGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  const result = await AdminToolsManager.assignGlobalRole(contactInternalId, roleId, adminEmailId);
  return { type: ON_ASSIGNING_GLOBAL_ROLE, assignResult: result };
};

export const onUpsertingCourse = async (courseDataArray, adminEmailId) => {
  const result = await AdminToolsManager.upsertCourse(courseDataArray, adminEmailId);
  return { type: ON_UPSERTING_COURSE, upsertResult: result };
};

export const onLoadingContactCourseProgressActivity = async (contactInternalId, courseIds, emailId, contactEmails) => {
  const contactCourseProgressActivity = await AdminToolsManager.getContactCourseProgressActivity(
    contactInternalId,
    courseIds,
    emailId,
    contactEmails
  );
  return { type: ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY, contactCourseProgressActivity };
};

export const onClearSelectedContact = () => {
  return { type: ON_CLEAR_SELECTED_CONTACT };
};
