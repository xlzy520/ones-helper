import { $, $All } from '~/common/utils';

interface PROption {
  name: string;
  from: string;
  to: string;
}

const data: PROption[] = [
  {
    name: 'master <= preview2 ',
    from: 'preview2',
    to: 'master',
  },
  {
    name: 'preview1',
    from: 'preview1',
    to: 'preview1',
  },
  {
    name: 'preview2',
    from: 'preview2',
    to: 'preview2',
  },
  {
    name: 'preview3',
    from: 'preview3',
    to: 'preview3',
  },
];

const getButton = (option: PROption) => {
  const { name, from, to } = option;
  const button = document.createElement('a');
  const text = document.createTextNode(name);
  button.className = 'btn btn-sm btn-primary mr-2 ones-helper';
  button.appendChild(text);
  const pathname = location.pathname;
  const index = pathname.indexOf('compare/');
  const prePathName = pathname.substring(0, index);
  button.href = `${prePathName}compare/${to}...${from}`;
  return button;
};

const addCompareButtons = () => {
  const onesHelper = $('.ones-helper');
  if (onesHelper) return;

  const comparePanel = $('.range-editor.color-fg-muted.js-range-editor ');
  if (comparePanel) {
    const pair = $All('.range-cross-repo-pair');
    const last = pair[1];
    data.forEach((item: PROption) => {
      last.appendChild(getButton(item));
    });
  }
};

export const branchSelectEnhance = () => {
  if (location.href.includes('https://github.com/BangWork/')) {
    addCompareButtons();
  }
};
