export function getBuildOnesProcessEnv() {
  const buildOnesProcessEnvStr = JSON.stringify(window.buildOnesProcessEnv);
  const script = document.createElement('script');
  script.innerHTML = `buildOnesProcessEnv=${buildOnesProcessEnvStr}`;
  script.id = 'realBuildOnesProcessEnv';
  document.body.appendChild(script);
}
export function getHostWindowObject() {
  const hostWindow = JSON.stringify(window);
  const script = document.createElement('script');
  script.innerHTML = `hostWindow=${hostWindow}`;
  script.id = 'ONESHostWindow';
  document.body.appendChild(script);
}
