export function injectPageScript(data: any) {
  const injectPageScriptTag = document.querySelector('#injectPageScript');
  if (injectPageScriptTag) {
    document.dispatchEvent(
      new CustomEvent('injectPageScript', {
        detail: data,
      })
    );
    return;
  }
  const script = document.createElement('script');
  script.id = 'injectPageScript';

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', browser.runtime.getURL('/evalScript/page-script.js'));

  script.onload = () => {
    /*
     * Using document.dispatchEvent instead window.postMessage by security reason
     * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
     */
    document.dispatchEvent(
      new CustomEvent('injectPageScript', {
        detail: data,
      })
    );
    // document.head.removeChild(script);
  };

  document.head.appendChild(script);
}
