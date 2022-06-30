import { $, injectHead, isDevDomain, isLocal, runtimeInjectPageScript } from '~/common/utils';
import styles from '~/contentScripts/style.scss';
import {
  getBuildOnesProcessEnv,
  getHostWindowObject,
} from '~/contentScripts/other_script/getBuildOnesProcessEnv';

export const initInjectContent = () => {
  const isFEOnesDev = isDevDomain() || isLocal();

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  injectHead(styleEl);

  // 开发环境注入特殊脚本获取环境变量
  if (isFEOnesDev) {
    if (!$('#buildOnesProcessEnv')) {
      runtimeInjectPageScript({
        code: `${getBuildOnesProcessEnv};getBuildOnesProcessEnv()`,
        type: '',
      });
      runtimeInjectPageScript({
        code: `${getHostWindowObject};getHostWindowObject();`,
        type: '',
      });
    }
  }
};
