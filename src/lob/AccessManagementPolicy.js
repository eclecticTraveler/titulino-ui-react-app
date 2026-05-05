const ROLE_IDS = {
  SUPER_ADMIN: 'titulino_super_admin',
  ADMINISTRATOR: 'titulino_administrator',
  GENERAL_SUPPORT: 'titulino_general_support',
  CUSTOMER_SUPPORT: 'titulino_customer_support',
  PROOFER: 'titulino_proofer',
  REPORT_BUILDER: 'titulino_report_builder',
  FACILITATOR: 'titulino_facilitator',
  USER: 'titulino_user'
};

/*
 * Access-management rules:
 * - titulino_super_admin can grant/revoke all global and course roles.
 * - titulino_administrator can grant/revoke lower-priority global roles and all course roles.
 * - titulino_general_support can grant/revoke titulino_proofer.
 * - titulino_customer_support can grant/revoke course titulino_user.
 * - titulino_proofer and titulino_report_builder cannot grant/revoke permissions.
 *
 * These rules intentionally live in the LOB layer so the dashboard can ask
 * policy questions without hardcoding role-specific behavior in the UI.
 */
const ACCESS_MANAGEMENT_POLICIES = {
  [ROLE_IDS.SUPER_ADMIN]: {
    global: { strategy: 'all' },
    course: { strategy: 'all' }
  },
  [ROLE_IDS.ADMINISTRATOR]: {
    global: { strategy: 'lowerPriority' },
    course: { strategy: 'all' }
  },
  [ROLE_IDS.GENERAL_SUPPORT]: {
    global: { roleIds: [ROLE_IDS.PROOFER] },
    course: { roleIds: [] }
  },
  [ROLE_IDS.CUSTOMER_SUPPORT]: {
    global: { roleIds: [] },
    course: { roleIds: [ROLE_IDS.USER] }
  },
  [ROLE_IDS.PROOFER]: {
    global: { roleIds: [] },
    course: { roleIds: [] }
  },
  [ROLE_IDS.REPORT_BUILDER]: {
    global: { roleIds: [] },
    course: { roleIds: [] }
  }
};

const normalizeRoleId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const getRoleIdFromValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.userRoleId || value.UserRoleId || value.role || value.Role || '';
};

const isActiveGlobalRoleValue = (value) => {
  if (!value || typeof value === 'string') return true;
  if (value.isGlobalAccessUserRole === false || value.IsGlobalAccessUserRole === false) return false;
  if (value.isActive === false || value.IsActive === false) return false;
  if (value.endDate || value.EndDate) return false;
  return true;
};

const normalizeGlobalRoles = (user = {}) => {
  const rawRoles = Array.isArray(user?.globalRoles)
    ? user.globalRoles
    : user?.globalRole
      ? [user.globalRole]
      : [];

  return Array.from(new Set(
    rawRoles
      .filter(isActiveGlobalRoleValue)
      .map(getRoleIdFromValue)
      .map(normalizeRoleId)
      .filter(Boolean)
  ));
};

const getRoleDefinition = (allRoles = [], roleId) => {
  const normalizedRoleId = normalizeRoleId(roleId);
  return (allRoles || []).find(role => normalizeRoleId(role?.UserRoleId) === normalizedRoleId) || null;
};

const getRolePriority = (allRoles = [], roleId) => {
  const roleDefinition = getRoleDefinition(allRoles, roleId);
  const parsedPriority = Number(roleDefinition?.UserRolePriority ?? roleDefinition?.userRolePriority);
  return Number.isFinite(parsedPriority) ? parsedPriority : null;
};

const getIsGlobalRole = (allRoles = [], roleId) => {
  const roleDefinition = getRoleDefinition(allRoles, roleId);
  return roleDefinition?.IsGlobalAccessUserRole === true || roleDefinition?.isGlobalAccessUserRole === true;
};

const canManageByRule = ({
  managerRoleId,
  targetRoleId,
  scope,
  allRoles
}) => {
  const normalizedManagerRoleId = normalizeRoleId(managerRoleId);
  const normalizedTargetRoleId = normalizeRoleId(targetRoleId);
  const managerPolicy = ACCESS_MANAGEMENT_POLICIES[normalizedManagerRoleId];
  const scopePolicy = managerPolicy?.[scope];

  if (!scopePolicy || !normalizedTargetRoleId) {
    return false;
  }

  if (scopePolicy.strategy === 'all') {
    return true;
  }

  if (scopePolicy.strategy === 'lowerPriority') {
    const managerPriority = getRolePriority(allRoles, normalizedManagerRoleId);
    const targetPriority = getRolePriority(allRoles, normalizedTargetRoleId);
    return managerPriority != null && targetPriority != null && targetPriority > managerPriority;
  }

  const allowedRoleIds = (scopePolicy.roleIds || []).map(normalizeRoleId);
  return allowedRoleIds.includes(normalizedTargetRoleId);
};

export const buildAccessManagementPolicy = (user = {}, allRoles = []) => {
  const currentUserGlobalRoles = normalizeGlobalRoles(user);

  const canManageRole = (targetRoleId, scope) => {
    const normalizedTargetRoleId = normalizeRoleId(targetRoleId);
    const normalizedScope = scope === 'global' ? 'global' : 'course';

    if (!user?.isGlobalAccessUser || currentUserGlobalRoles.length === 0) {
      return {
        isAllowed: false,
        reasonKey: 'admin.tools.msg.notEnoughAccessManagementPermissions'
      };
    }

    if (normalizedScope === 'global' && !getIsGlobalRole(allRoles, normalizedTargetRoleId)) {
      return {
        isAllowed: false,
        reasonKey: 'admin.tools.msg.notEnoughAccessManagementPermissions'
      };
    }

    const isAllowed = currentUserGlobalRoles.some(managerRoleId => canManageByRule({
      managerRoleId,
      targetRoleId: normalizedTargetRoleId,
      scope: normalizedScope,
      allRoles
    }));

    return {
      isAllowed,
      reasonKey: isAllowed ? null : 'admin.tools.msg.notEnoughAccessManagementPermissions'
    };
  };

  const canManageAnyRole = (scope) => {
    const normalizedScope = scope === 'global' ? 'global' : 'course';
    return (allRoles || []).some(role => canManageRole(role?.UserRoleId, normalizedScope).isAllowed);
  };

  return {
    currentUserGlobalRoles,
    canManageRole,
    canManageAnyRole
  };
};

const AccessManagementPolicy = {
  ROLE_IDS,
  ACCESS_MANAGEMENT_POLICIES,
  buildAccessManagementPolicy
};

export default AccessManagementPolicy;
