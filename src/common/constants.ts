import { PatternConfig } from '~/service/custom_api';

export const PROJECT_BRANCH_KEY = 'customONESApiProjectBranch';
export const ONES_HOST_KEY = 'customONESApiHost';
export const CUSTOM_API_PATTERNS = 'customApiPatterns';

export const DefaultPreset = '自定义(dev)';
export const DefaultPresetOptions = [
  {
    label: '自定义(dev)',
    value: '自定义(dev)',
    config: {
      custom: true,
      customONESApiHost: '',
      customONESApiProjectBranch: 'master',
      isBranch: true,
    },
  },
  {
    label: '自定义(私有部署)',
    value: '自定义(私有部署)',
    config: {
      custom: true,
      customONESApiHost: 'https://mars-dev.myones.net:16416',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '本地后端',
    value: '本地=>本地后端',
    config: {
      custom: true,
      customONESApiHost: 'http://localhost:9001',
      customONESApiProjectBranch: '',
      isHost: true,
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
      customONESApiHost: 'https://mars-dev.myones.net:16416',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: 'ONES团队',
    value: '本地=>ONES团队',
    config: {
      customONESApiHost: 'https://our.ones.pro',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: 'SaaS',
    value: '本地=>SaaS',
    config: {
      customONESApiHost: 'https://ones.ai/project',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
  {
    label: '预发布环境',
    value: '本地=>预发布环境',
    config: {
      customONESApiHost: 'https://onesai.myones.net',
      customONESApiProjectBranch: '',
      isHost: true,
    },
  },
];

export const DefaultPatterns: PatternConfig[] = [
  {
    enable: true,
    pattern: 'http://localhost',
  },
  {
    enable: true,
    pattern: 'http://dev.localhost',
  },
  {
    enable: true,
    pattern: 'https://dev.myones.net',
  },
  {
    enable: true,
    pattern: 'https://our.ones.pro',
  },
  {
    enable: true,
    pattern: 'https://preview1.myones.net',
  },
];

export const ONESConfig = {
  cloudType: 'none',
  ENABLE_HONOR_LOGIN: 'false',
  UNIPORTAL_LOGIN_URL: '',
  needLoopActions: 'all',
  openPlan: 'true',
  ENABLE_CAS: 'false',
  ENABLE_SAML: 'false',
  ENABLE_FEISHU: 'true',
  enableCustomApiSync: 'false',
  disableStatsCollect: 'true',
  ldapSupport: 'public',
  ENABLE_THIRD_PARTY_CONNECT: 'true',
  wechatBindSupport: 'public',
  dingBindSupport: 'public',
  hideInviteMember: 'false',
  hideChangeEmail: 'false',
  hideHelpDocUrl: 'true',
  addMultiAccountsSupport: 'false',
  ES_REFRESH_INTERVAL: 2000,
  ENFORCE_STRONG_PASSWORD_POLICY: 'false',
  ENABLE_PLUGIN: 'false',
  ENABLE_AUDIT_LOG: 'true',
  ENABLE_LOGIN_NOTICE: 'true',
  LEFT_NAV_UPDATED_TIPS_EXPIRATION_TIME: '2019-12-25',
  SENTRY_REPORT_DEV: '',
  CHANGELOG_EXPIRATION_TIME: '2020-12-23',
  ENABLE_CHANGELOG_PROMPT: 'false',
  confluence_backup_max_size: 1073741824,
  jira_backup_max_size: 1073741824,
  attachment_max_size: 1073741824,
  skipSentry: true,
  ENABLE_DATA_ISOLATION_CONTEXT: 'false',
  HIDE_USER_GROUP_AND_DEPT_WITH_CONTEXT: 'false',
  ENABLE_WORKOREDER_FORM_NOTICE: 'false',
  enable_automation: 'true',
  enable_automation_free_tag: 'true',
};

export const featuresList = [
  {
    name: 'API转发',
    show: true,
    component: 'CustomApi',
  },
  {
    name: 'ONESConfig',
    show: true,
    component: 'ones-config',
  },
  {
    name: 'Github',
    show: true,
    component: 'github',
  },
  {
    name: 'Jenkins',
    show: true,
    component: 'jenkins',
  },

  {
    name: '工时',
    show: false,
    component: 'man-hour',
  },
  {
    name: '工作项',
    show: false,
    component: 'task-action',
  },
  {
    name: '批量建数据',
    show: false,
    component: 'batch-request',
  },
  {
    name: '反馈与建议',
    show: true,
    component: 'FeedBack',
  },

  // {
  //   name: '插件更新',
  //   show: false,
  //   component: 'about-me',
  // },
];

export const projectList = [
  {
    repo: 'ones-project-web',
    owner: 'BangWork',
    defaultBranch: 'master',
    type: 'fe',
  },
  {
    repo: 'ones-ai-web-common',
    owner: 'BangWork',
    defaultBranch: 'master',
    type: 'fe',
  },
  {
    repo: 'wiki-web',
    owner: 'BangWork',
    defaultBranch: 'master',
    type: 'fe',
  },
  {
    repo: 'bang-api',
    owner: 'BangWork',
    defaultBranch: 'master',
    type: 'be',
  },
  {
    repo: 'wiki-api',
    owner: 'BangWork',
    defaultBranch: 'master',
    type: 'be',
  },
  // {
  //   repo: 'free-sms-aliyun',
  //   url: 'https://github.com/xlzy520/free-sms-aliyun',
  //   owner: 'xlzy520',
  //   defaultBranch: 'master',
  // },
];

export const ONESConfigTypeMap = {
  none: 'platform',
  public: 'platform',
  private: 'platform',
  null: 'platform',
  SaaS: 'platform',

  true: 'boolean',
  false: 'boolean',

  '"false"': 'boolean',
};

export const NetRequestIDMap = {
  ProjectAPI: 3,
  WikiAPI: 4,
  StipeAPI: 5,
};
