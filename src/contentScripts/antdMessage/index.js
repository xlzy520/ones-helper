/* 添加样式 */
// var link = document.createElement('link')
// link.rel = 'stylesheet'
// var jsPath = document.currentScript.src
// link.href = `${jsPath.substring(0, jsPath.lastIndexOf('/') + 1)}/theme/message.css`
// document.head.appendChild(link)

let index = 0;
const msgElObj = {};

/**
 * message函数
 * @param {String} type message类型
 * @param {String} content message内容
 * @param {Number} duration 持续时间，默认3s，传0则不自动关闭
 * @param {Function} onClose 关闭message回调
 */
function show(type, content, duration, onClose) {
  type = type || 'info';
  content = content || '';
  duration = typeof duration === 'number' ? duration * 1000 : 3000;

  const contentDiv = document.createElement('div');
  contentDiv.setAttribute('class', 'msg-like-ant-content');
  contentDiv.innerHTML =
    `<div class="msg-content msg-${type}">` +
    `<i class="iconfont icon-${type}"></i>` +
    `<span class="msg-txt">${content}</span>` +
    '</div>';

  let wrapper = document.getElementById('msg-like-ant');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'msg-like-ant';
    wrapper.setAttribute('class', 'msg-like-ant');

    document.body.appendChild(wrapper);
  }
  wrapper.appendChild(contentDiv);

  const _index = index;
  // contentDiv存到msgElObj中
  msgElObj[index++] = contentDiv;

  contentDiv.classList.remove('move-up-leave');
  contentDiv.classList.add('move-up-enter');
  setTimeout(() => {
    contentDiv.classList.remove('move-up-enter');
  }, 300);
  if (duration !== 0) {
    setTimeout(() => {
      contentDiv.classList.add('move-up-leave');
      setTimeout(() => {
        contentDiv.classList.remove('move-up-leave');
        contentDiv.remove();
        msgElObj[_index] = null;
      }, 300);
      typeof onClose === 'function' && onClose();
    }, duration);
  }

  return function destory() {
    const el = msgElObj[_index];
    if (el) {
      el.classList.add('move-up-leave');
      setTimeout(() => {
        el.classList.remove('move-up-leave');
        el.remove();
        msgElObj[_index] = null;
      }, 300);
    }
  };
}

/* 暴露访问对象 */
const $message = {
  /**
   * 销毁所有message
   */
  destroy() {
    const contentDivs = document.querySelectorAll('.msg-like-ant .msg-like-ant-content');
    if (contentDivs.length) {
      for (let i = 0; i < contentDivs.length; i++) {
        const contentDiv = contentDivs[i];
        contentDiv.classList.add('move-up-leave');
        (function (contentDiv) {
          setTimeout(() => {
            contentDiv.classList.remove('move-up-leave');
            contentDiv.remove();
          }, 300);
        })(contentDiv);
      }
    }
  },
};
['success', 'info', 'warning', 'error', 'loading'].forEach((type) => {
  $message[type] = function (content, duration, onClose) {
    return show(type, content, duration, onClose);
  };
});

export default $message;
