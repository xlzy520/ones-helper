document.addEventListener('injectPageScript', (event) => {
  const { code, type } = event.detail;
  // eslint-disable-next-line no-eval
  const result = eval(code);
  // console.log(code);
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
