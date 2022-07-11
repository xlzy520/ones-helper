import { NetRequestIDMap } from '~/common/constants';

export const updateSessionRules = (rules: any): void => {
  browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [NetRequestIDMap.WikiAPI, NetRequestIDMap.ProjectAPI, NetRequestIDMap.StipeAPI],
    addRules: rules,
  });
};
