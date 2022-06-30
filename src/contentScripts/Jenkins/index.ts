import { isCD } from '~/common/utils';

export const getJenkinsToken = () => {
  if (isCD()) {
    const scripts = document.querySelectorAll('script:not([src])');
    const targetScript = scripts[1];
    const crumb = targetScript.innerHTML.substring(29, 93);
    browser.runtime.sendMessage({
      type: 'jenkins-crumb',
      data: crumb,
    });
  }
};
