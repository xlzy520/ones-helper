export default function getBuildOnesProcessEnv() {
  const buildOnesProcessEnvStr = JSON.stringify(window.buildOnesProcessEnv)
  const script = document.createElement('script')
  script.innerHTML = `buildOnesProcessEnv=${buildOnesProcessEnvStr}`
  script.id = 'realBuildOnesProcessEnv'
  document.body.appendChild(script)
}
