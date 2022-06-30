import { isObject } from 'lodash-es';
// @ts-ignore
import $message from '../contentScripts/antdMessage/index';
import { getCurrentTab } from '~/common/tabs';

export function copyToClipboard(input: string, needMessage = true) {
  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement;

  element.value = input;

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '');

  element.style.contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt'; // Prevent zooming on iOS

  const selection = document.getSelection();
  if (!selection) {
    return;
  }
  const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);

  document.body.append(element);
  element.select();

  // Explicit selection workaround for iOS
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch {}

  element.remove();

  if (originalRange) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  // Get the focus back on the previously focused element, if any
  // @ts-ignore
  if (previouslyFocusedElement?.focus) {
    // @ts-ignore
    previouslyFocusedElement.focus();
  }

  const message = $message;
  if (needMessage && message) {
    message.success(isSuccess ? '复制成功' : '复制失败');
  }

  return isSuccess;
}

export const $ = function (query: string) {
  return document.querySelector(query);
};
export const $All = function (query: string) {
  return document.querySelectorAll(query);
};

export const injectHead = (content: HTMLElement) => {
  const head = $('head');
  if (head) {
    head.appendChild(content);
  }
};

export const injectScriptLink = function (src: string) {
  const scriptTag = document.createElement('script');
  scriptTag.src = src;
  injectHead(scriptTag);
};

export const injectScript = function (scriptContent: string, id = '') {
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('id', id);
  scriptTag.innerHTML = scriptContent;
  injectHead(scriptTag);
};
export const runtimeInjectPageScript = (data) => {
  browser.runtime.sendMessage({
    type: 'injectPageScript',
    data,
  });
};

export const isSaas = () => {
  return location.href.includes('https://our.ones.pro/');
};

export const isDevDomain = () => {
  return location.href.includes('https://dev.myones.net');
};

export const isLocal = () => {
  return location.origin.includes('localhost');
};

export const isGitHub = () => {
  return location.origin.includes('github.com');
};

export const isPrivate = () => {
  return location.href.includes('https://mars-dev.myones.net:');
};

export const isCD = () => {
  return location.href.includes('https://cd.myones.net');
};

export const isInLimitedKanban = () => {
  return location.href.includes(
    'https://ones.ai/project/#/team/RDjYMhKq/project/GL3ysesFPdnAQNIU/'
  );
};

export const isGithubOAuthUrl = () => {
  return location.href.includes('http://localhost:9030/githubAuth?code=');
};

export const sendMessage = (message: any) => {
  getCurrentTab().then((tab) => {
    const { id } = tab;
    if (id) {
      browser.tabs.sendMessage(id, message);
    }
  });
};

export const isDev = () => {
  return process.env.NODE_ENV !== 'production';
};

export const isEqualAndIgnoreSomeProp = (
  objValue: any,
  srcValue: any,
  ignoreProps: string[]
): boolean => {
  if (objValue === srcValue) {
    return true;
  }

  let flag = true;
  if (isObject(objValue) && isObject(srcValue)) {
    for (const key in objValue) {
      if (!ignoreProps.includes(key)) {
        const item = objValue[key];
        const srcItem = srcValue[key];
        if (isObject(item)) {
          flag = isEqualAndIgnoreSomeProp(item, srcItem, ignoreProps);
        } else {
          flag = item === srcItem;
          if (!flag) {
            console.log(item, srcItem);
          }
        }
      }
    }
  }
  return flag;
};

export const getUid = () => {
  return browser.cookies
    .get({
      name: 'ones-uid',
      url: 'https://our.ones.pro',
    })
    .then((res) => {
      return res.value;
    });
};

export const generateUUID = (userId: string) => {
  const sourceStr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const uuidStrings = [];
  const stringLength = 8;
  for (let i = 0; i < stringLength; i += 1) {
    const digit = Math.floor(Math.random() * (sourceStr.length - 1));
    uuidStrings.push(sourceStr.charAt(digit));
  }
  return (userId || '') + uuidStrings.join('');
};
