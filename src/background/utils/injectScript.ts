export function injectPageScript(data: any) {
  // console.log(data);
  // const injectPageScriptTag = document.querySelector('#injectPageScript');
  // if (injectPageScriptTag) {
  //   document.dispatchEvent(
  //     new CustomEvent('injectPageScript', {
  //       detail: data,
  //     })
  //   );
  //   return;
  // }
  const script = document.createElement('script');
  script.id = `injectPageScript-${Date.now()}`;

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
    const scriptDom = document.querySelector(`#${script.id}`);
    if (scriptDom) {
      document.head.removeChild(scriptDom);
    }
  };

  document.head.appendChild(script);
}
