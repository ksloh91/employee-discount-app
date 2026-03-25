export const EMPLOYEE_NAV_TUTORIAL_VERSION = "v1";

export function employeeNavTutorialStorageKey(userId) {
  return `employeeNavTutorial:${EMPLOYEE_NAV_TUTORIAL_VERSION}:${userId}`;
}
