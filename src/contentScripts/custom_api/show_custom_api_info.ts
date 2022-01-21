import interact from 'interactjs';
import {
  DefaultPreset,
  DefaultPresetOptions,
  ONES_HOST_KEY,
  PROJECT_BRANCH_KEY,
} from '~/common/constants';
const DOM_SCOPE = 'och__';
const WRAPPER_EL_ID = 'och__custom-api-info';
export const UniClassName = `${DOM_SCOPE}api-info-wrapper`;

function createOptionEl({ name, value }: { name: string; value: string }) {
  const optionEl = document.createElement('div');
  optionEl.className = `${DOM_SCOPE}api-info-option`;
  optionEl.textContent = `${name}：${value}`;
  return optionEl;
}

function getInfoOptionElList(): Promise<HTMLElement[]> {
  return new Promise((resolve) => {
    browser.storage.local.get('customApiData').then(({ customApiData = {} as any }) => {
      // browser.storage.local.get([ONES_HOST_KEY, PROJECT_BRANCH_KEY]).then((data) => {
      // 兼容火狐，第一次拿到customApiData的时候是undefined
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions } = customApiData;
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config;
      const onesHost = selectedConfig[ONES_HOST_KEY];
      const onesHostInfoEL = createOptionEl({
        name: 'API Host',
        value: onesHost || '默认',
      });

      const projectBranch = selectedConfig[PROJECT_BRANCH_KEY];
      const projectBranchInfoEl = createOptionEl({
        name: 'API 分支',
        value: projectBranch || '默认',
      });
      if (projectBranch) console.log('通过 ONES Helper 设定分支：', projectBranch);

      resolve([onesHostInfoEL, projectBranchInfoEl]);
    });
  });
}

function dragMoveListener(event: Event) {
  const target: HTMLElement = event.target;
  // keep the dragged position in the data-x/data-y attributes
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.transform = `translate(${x}px, ${y}px)`;

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

window.dragMoveListener = dragMoveListener;

function divDrag(elmClass: string) {
  const elm = document.querySelector(`.${elmClass}`);
  if (elm) {
    interact(`.${elmClass}`).draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      // enable autoScroll
      autoScroll: true,

      listeners: {
        // call this function on every dragmove event
        move: dragMoveListener,

        // call this function on every dragend event
        end(event) {
          const textEl = event.target.querySelector('p');

          textEl &&
            (textEl.textContent = `moved a distance of ${Math.sqrt(
              (Math.pow(event.pageX - event.x0, 2) + Math.pow(event.pageY - event.y0, 2)) | 0
            ).toFixed(2)}px`);
        },
      },
    });
  }
}

export async function showCustomApiInfo(): Promise<void> {
  const oldElement = document.querySelector(`#${WRAPPER_EL_ID}`);
  if (oldElement) {
    divDrag(UniClassName);
    return;
  }
  const wrapperEl = document.createElement('div');
  wrapperEl.className = UniClassName;
  wrapperEl.id = WRAPPER_EL_ID;
  const optionElList = await getInfoOptionElList();
  wrapperEl.append(...optionElList);
  document.body.append(wrapperEl);
  divDrag(UniClassName);
}

export async function syncCustomApiInfo(): Promise<void> {
  const wrapperEl = document.querySelector(`#${WRAPPER_EL_ID}`);
  if (wrapperEl) {
    const optionElList = await getInfoOptionElList();
    wrapperEl.innerHTML = '';
    wrapperEl.append(...optionElList);
  }
}

export async function hideCustomApiInfo(): Promise<void> {
  const wrapperEl = document.querySelector(`#${WRAPPER_EL_ID}`);
  if (wrapperEl) {
    document.body.removeChild(wrapperEl);
  }
}
