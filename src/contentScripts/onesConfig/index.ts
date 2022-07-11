import Browser from 'webextension-polyfill';
import { $All, isDevDomain, isPrivate, isSaas, runtimeInjectPageScript } from '~/common/utils';
import { onesConfigService } from '~/service';
import { getFeaturesConfig } from '~/service/featuresConfig';
import { ONESConfig } from '~/common/constants';

export const saveOnesConfig = (onesConfig: any) => {
  const dataStr = JSON.stringify(onesConfig);
  const newOnesConfig = dataStr.includes('onesConfig') ? dataStr : `onesConfig=${dataStr}`;
  runtimeInjectPageScript({
    code: newOnesConfig,
    type: '',
  });
  const path = location.origin + location.pathname;
  onesConfigService.saveOnesConfigApi({ [path]: onesConfig });
};

document.addEventListener('saveOnesConfig', (event) => {
  // @ts-ignore
  const detail = event.detail;
  saveOnesConfig(detail);
});

export const initOnesConfig = () => {
  getFeaturesConfig().then((res) => {
    const onesConfigItem = res.find((v: any) => v.name === 'OnesConfig');
    if (onesConfigItem && onesConfigItem.show) {
      onesConfigService.getOnesConfigApi().then((res) => {
        if (isPrivate() || isSaas()) {
          let onesConfig;
          // 如果用户点击了保存，那就用修改后的，如果没有修改，永远用页面自己的
          if (res?.isUpdate) {
            onesConfig = res;
            // console.log('修改后的onesConfig', onesConfig);
            saveOnesConfig(onesConfig);
          } else {
            const onesConfigScript = $All('script')[1];
            Browser.runtime.sendMessage({
              type: 'injectPageScript',
              data: {
                code: onesConfigScript.innerHTML,
                type: 'saveOnesConfig',
              },
            });
          }
          // eslint-disable-next-line no-eval
        } else if (isDevDomain()) {
          if (res?.isUpdate) {
            saveOnesConfig({ ...ONESConfig, ...res });
          } else {
            Browser.runtime.sendMessage({
              type: 'injectPageScript',
              data: {
                code: `onesConfig=${JSON.stringify(ONESConfig)}`,
                type: 'saveOnesConfig',
              },
            });
            // console.log('%c 🍒 onesConfigDev: ', 'font-size:20px;background-color: #FFDD4D;color:#fff;', onesConfigDev)

            // saveOnesConfig(onesConfig);
          }
        }
      });
    }
  });
};
