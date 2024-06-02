import { defineAbility } from '@casl/ability';

export const defineAbilitiesFor = (permissions) => {
  return defineAbility((can, cannot) => {
    console.log("can I?1", permissions)

    permissions.forEach(permission => {
      console.log("permission.action",permission)
      can(permission.action, permission.subject)
    });
  });
};