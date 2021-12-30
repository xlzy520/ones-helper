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
export const DefaultPreset = '用户自定义(dev)'
export const DefaultPresetOptions = [
  {
    label: '用户自定义(dev)',
    value: '用户自定义(dev)',
    config: {
      custom: true,
      customONESApiHost: '',
      customONESApiProjectBranch: 'master',
      isBranch: true,
    },
  },
  {
    label: '用户自定义(SaaS)',
    value: '用户自定义(SaaS)',
    config: {
      custom: true,
      customONESApiHost: 'https://ones.ai/project/api/project/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '用户自定义(私有部署)',
    value: '用户自定义(私有部署)',
    config: {
      custom: true,
      customONESApiHost: 'https://mars-dev.myones.net:16416/project/api/project/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '默认(不篡改任何请求，走项目自己的默认配置)',
    value: '默认',
    config: {
      customONESApiHost: '',
      customONESApiProjectBranch: '',
    },
  },
  {
    label: 'master',
    value: '本地=>master',
    config: {
      customONESApiHost: '',
      customONESApiProjectBranch: 'master',
      isBranch: true,
    },
  },
  {
    label: '私有部署',
    value: '本地=>私有部署',
    config: {
      customONESApiHost: 'https://mars-dev.myones.net:16416/project/api/project/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: 'SaaS',
    value: '本地=>SaaS',
    config: {
      customONESApiHost: 'https://ones.ai/project/api/project/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '预发布环境',
    value: '本地=>预发布环境',
    config: {
      customONESApiHost: 'https://onesai.myones.net/project/api/project/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '本地后端(后端开发专用，只允许修改端口，必须使用localhost)',
    value: '本地=>本地后端',
    config: {
      custom: true,
      customONESApiHost: 'http://localhost:9001/',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
]

export const DefaultPatterns: PatternConfig[] = [
  {
    enable: true,
    pattern: 'http://localhost/*',
  },
  {
    enable: true,
    pattern: 'https://dev.myones.net/*',
  },
  {
    enable: true,
    pattern: 'http://dev.localhost:3000/*',
  },
  {
    enable: true,
    pattern: 'http://dev.localhost/*',
  },
]

export const ONESConfig = {
  // LOGIN_ROOT: '',
  // PROJECT_ROOT: '',
  // WIKI_ROOT: '',
  // OFFICIAL_ROOT: '',
  cloudType: 'none', // 'none'不支持, 'public'公有云, 'private'私有云
  ENABLE_HONOR_LOGIN: 'false', // 是否开启荣耀特殊登录
  UNIPORTAL_LOGIN_URL: '', // 是否开启荣耀特殊登录
  MOBILE_ROOT: 'https://dev.myones.net/mobile/hotfix_20211128',
  PURCHASE_ROOT: 'https://purchasedev.myones.net/P1037',
  wechatCorpId: 'wwa76530a1feeaaab1',
  wechatSuiteId: 'wwd21680c4d7f7ec11',
  dingAppId: 'dingoacnmtfosre2zet6ft',
  needLoopActions: 'all',
  openPlan: 'true',
  ENABLE_CAS: 'false', // 开启 cas 认证，必须配置下边的 AUTH_REDIRECT_BASE_URL
  ENABLE_SAML: 'false',
  ENABLE_FEISHU: 'true', // 开启 feishu 配置入口
  AUTH_REDIRECT_BASE_URL: 'https://devapi.myones.net/project/S2022', // cas 或其他认证服务登录界面的 base url
  enableCustomApiSync: 'false', // 开启API
  disableStatsCollect: 'true', // 禁用第三方数据收集，如神策、udesk
  ldapSupport: 'public',
  ENABLE_THIRD_PARTY_CONNECT: 'true',
  wechatBindSupport: 'public', // 'none'不支持, 'public'公有云, 'private'私有云
  dingBindSupport: 'public',
  // googleAccountSuppprt: 'private',
  // googleClientId: '1062585556333-l7ru5inu03tsvcb1k97v5rqlkjhplf31.apps.googleusercontent.com',
  // googleApiSrc: 'https://apis.google.com/js/platform.js?onload=init',
  hideInviteMember: 'false',
  hideChangeEmail: 'false',
  hideHelpDocUrl: 'true', // 私有部署想要隐藏所有跳转外链的节点
  addMultiAccountsSupport: 'false',
  ES_REFRESH_INTERVAL: 2000, // milliseconds
  ENFORCE_STRONG_PASSWORD_POLICY: 'false', // 禁用强密码
  ENABLE_PLUGIN: 'false',
  ENABLE_AUDIT_LOG: 'true',
  ENABLE_LOGIN_NOTICE: 'true',
  LEFT_NAV_UPDATED_TIPS_EXPIRATION_TIME: '2019-12-25', // 侧栏更新提示过期时间

  ONES_MINI_APP_AUTH_ADDRESS:
    'https://wechat-mini.myones.net/api/authorization/get_auth_login_page',
  // ONES_V2_ADDRESS: 'https://dev.ones.team/project/F1119O',
  // ONES_V3_ADDRESS: 'https://dev.ones.team/project/F1119',

  // hideInviteMember: 'true',
  // hideChangeEmail: 'true',
  // googleAccountSuppprt: 'public',
  // googleClientId: '1062585556333-l7ru5inu03tsvcb1k97v5rqlkjhplf31.apps.googleusercontent.com',
  // googleApiSrc: 'https://apis.google.com/js/platform.js?onload=init',

  // turn on dev sentry report
  // 关闭dev环境的sentry的上报渠道
  // LOGGER_URL: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_PROJECT: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_WIKI: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_TESTCASE: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_PIPELINE: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_PLAN: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  // SENTRY_URL_RICH_EDITOR: 'https://78a87b107abd47f0a88f9545c5046e24@sentry.io/1370766',
  SENTRY_REPORT_DEV: '', // '' or 'true'

  // value for oauth of gitlab and github
  gitlab_client_id:
    '8351463ebcc0cb7d7447bc846898216f4ba1ed2705dcc2cc067b753597b449db',
  github_client_id: '385a15378a83264b3aa7',
  scm_call_back_url: 'https://dev.myones.net/project/P3006',

  CHANGELOG_EXPIRATION_TIME: '2020-12-23', // ChangeLog弹窗过期时间
  ENABLE_CHANGELOG_PROMPT: 'false', // 开启ChangeLog弹窗

  confluence_backup_max_size: 1073741824, // confluence导入页面组，单个文件大小限制（默认1G=1073741824）
  jira_backup_max_size: 1073741824, // jira导入
  attachment_max_size: 1073741824, // 附件上传，单个文件大小限制（默认1G=1073741824）
  skipSentry: true,
  // 数据隔离开关，如果关闭则不在redux中存相关context数据
  ENABLE_DATA_ISOLATION_CONTEXT: 'false',
  // 根据context与此开关2重判断是否要隐藏部门与用户组
  HIDE_USER_GROUP_AND_DEPT_WITH_CONTEXT: 'false',
  // 通知是否显示「工单相关」tab
  // todo: 上车前改为false
  ENABLE_WORKOREDER_FORM_NOTICE: 'false',
  // 自动工作流开关
  enable_automation: 'true',
  enable_automation_free_tag: 'true',
}

export const featuresList = [
  {
    name: 'API转发', show: true, component: 'CustomApi',
  },
  {
    name: 'OnesConfig', show: true, component: 'ones-config',
  },
  {
    name: '工时', show: true, component: 'man-hour',
  },
  {
    name: '工作项', show: true, component: 'task-action',
  },
  {
    name: 'Github', show: true, component: 'other-action',
  },
  {
    name: '插件更新', show: true, component: 'about-me',
  },
]

export const projectList = [
  {
    repo: 'ones-project-web',
    owner: 'BangWork',
    defaultBranch: 'master',
  },
  {
    repo: 'ones-ai-web-common',
    owner: 'BangWork',
    defaultBranch: 'master',
  },
  {
    repo: 'wiki-web123',
    owner: 'BangWork',
    defaultBranch: 'master',
  },
  // {
  //   repo: 'free-sms-aliyun',
  //   url: 'https://github.com/xlzy520/free-sms-aliyun',
  //   owner: 'xlzy520',
  //   defaultBranch: 'master',
  // },
]

export const GithubOAuthClientID = 'dcb6fb9f42ca21dba6ba'
export const GithubOAuthClientSecrets = '72642603097212871b011ca2f4c9c4affe3127cc'
