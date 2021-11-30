import { PatternConfig } from '~/service/custom_api'

export const PROJECT_BRANCH_KEY = 'customONESApiProjectBranch'
export const ONES_HOST_KEY = 'customONESApiHost'
export const CUSTOM_API_PATTERNS = 'customApiPatterns'

// -local前端连dev
// -local前端连私有部署
// -local前端连SaaS
// -local前端连局域网
// -dev前端连私有部署
// -dev前端连SaaS
export const DefaultPreset = '默认'
export const DefaultPresetOptions = [
  // {
  //   type: 'group',
  //   label: 'Rubber Soul',
  //   key: 'Rubber Soul',
  //   children: [
  //
  //   ]
  // }
  {
    label: '默认',
    value: '默认',
    config: {
      customONESApiHost: '',
      customONESApiProjectBranch: '',
    },
  },
  {
    label: '本地=>master',
    value: '本地=>master',
    config: {
      customONESApiHost: '',
      customONESApiProjectBranch: 'master',
    },
  },
  {
    label: '本地=>私有部署',
    value: '本地=>私有部署',
    config: {
      customONESApiHost: 'https://mars-dev.myones.net:16416/project/api/project/',
      customONESApiProjectBranch: '',
    },
  },
  {
    label: '本地=>SaaS',
    value: '本地=>SaaS',
    config: {
      customONESApiHost: 'https://ones.ai/project/api/project/',
      customONESApiProjectBranch: '',
    },
  },
  // { label: 'master=>私有部署', value: 'master=>私有部署', config: {} },
  // { label: 'master=>SaaS', value: 'master=>SaaS', config: {} },
  {
    label: '线上=>本地后端',
    value: '线上=>本地后端',
    config: {
      customONESApiHost: 'http://ip:port/',
      customONESApiProjectBranch: '',
    },
  },
  {
    label: '自定义的',
    value: '自定义的',
    config: {
      custom: true,
      customONESApiHost: '',
      customONESApiProjectBranch: '',
    },
  },
]

export const DefaultPatterns: PatternConfig[] = [
  {
    enable: true,
    pattern: 'https://dev.myones.net/*',
  },
  {
    enable: true,
    pattern: 'http://dev.localhost:3000/*',
  },
]
