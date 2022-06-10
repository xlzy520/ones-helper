document.addEventListener('injectPageScript', (event) => {
  const { code, type } = event.detail;
  // eslint-disable-next-line no-eval
  // console.log(code);
  const result = eval(code);
  switch (type) {
    case 'saveOnesConfig':
      document.dispatchEvent(
        new CustomEvent('saveOnesConfig', {
          detail: result,
        })
      );
      break;
    default:
      break;
  }
});
