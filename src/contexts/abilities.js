import { defineAbility } from '@casl/ability';

export const defineAbilitiesFor = (permissions) => {
  return defineAbility((can, cannot) => {

    permissions.forEach(permission => {
      can(permission.action, permission.subject)
    });
  });
};