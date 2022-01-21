import { CustomApiChange } from '~/common/message_type';
import { getCurrentTab } from '~/common/tabs';
import {
  DefaultPatterns,
  DefaultPresetOptions,
  CUSTOM_API_PATTERNS,
  DefaultPreset,
} from '~/common/constants';

export interface PatternConfig {
  enable: boolean;
  pattern: string;
}

export interface PresetOptionConfig {
  custom: boolean;
  customONESApiHost: string;
  customONESApiProjectBranch: string;
  isBranch: boolean;
  websocket?: string;
}

export interface PresetOption {
  config: PresetOptionConfig;
  label: string;
  value: string;
}

export interface CustomApiData {
  presetOptions: PresetOption[];
  preset: string;
  customApiPatterns: PatternConfig[];
}

export function getCustomApi(): Promise<any> {
  return new Promise((resolve) => {
    browser.storage.local.get('customApiData').then(({ customApiData = {} }) => {
      const result = {
        ...customApiData,
        preset: customApiData.preset || DefaultPreset,
        [CUSTOM_API_PATTERNS]: customApiData[CUSTOM_API_PATTERNS] || DefaultPatterns,
        presetOptions: customApiData.presetOptions || DefaultPresetOptions,
      };
      resolve(result);
    });
  });
}

export function saveCustomApi(customApiData: any): Promise<void> {
  return browser.storage.local.set({ customApiData }).then(() => {
    getCurrentTab().then((tab) => {
      const { id } = tab;
      if (id) {
        browser.tabs.sendMessage(id, {
          type: CustomApiChange,
          customApiData,
        });
        browser.runtime.sendMessage({
          type: CustomApiChange,
          customApiData,
        });
      }
    });
  });
}
