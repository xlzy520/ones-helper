import { onesConfigService } from '~/service'
import {
  $,
  $All,
  copyToClipboard,
  injectScript,
  isPrivate,
  isSaas,
  isCD,
  isGitHub,
} from '~/common/utils'
import { ONESConfig } from '~/common/constants'
import { getFeaturesConfig } from '~/service/featuresConfig'

export function run(): void {
  // logic here

  const saveOnesConfig = (onesConfig: any) => {
    const dataStr = JSON.stringify(onesConfig);
    const newOnesConfig = `onesConfig=${dataStr}`;
    injectScript(newOnesConfig);
    const path = location.origin + location.pathname;
    onesConfigService.saveOnesConfigApi({ [path]: onesConfig });
    // console.log(onesConfig)
  };

  getFeaturesConfig().then((res) => {
    const onesConfigItem = res.find((v) => v.name === 'OnesConfig');
    if (onesConfigItem && onesConfigItem.show) {
      onesConfigService.getOnesConfigApi().then((res) => {
        if (isPrivate() || isSaas()) {
          const onesConfigScript = $All('script')[1];
          // eslint-disable-next-line no-eval
          let onesConfig = eval(onesConfigScript.innerHTML);
          // 如果用户点击了保存，那就用修改后的，如果没有修改，永远用页面自己的
          if (res?.isUpdate) {
            onesConfig = res
          }
          saveOnesConfig(onesConfig)
        }
        else if (!isGitHub()) {
          let onesConfigDev = {}
          if ($('#realBuildOnesProcessEnv')) {
            const onesConfigScript = ($('#realBuildOnesProcessEnv') as Element).innerHTML;
            // eslint-disable-next-line no-eval
            onesConfigDev = eval(onesConfigScript);
          }
          // console.log('%c 🍒 onesConfigDev: ', 'font-size:20px;background-color: #FFDD4D;color:#fff;', onesConfigDev)
          const onesConfig = res?.wechatBindSupport
            ? { ...ONESConfig, ...onesConfigDev, ...res }
            : ONESConfig;
          saveOnesConfig(onesConfig);
        }
      });
    }
  });

  // Jenkins
  if (isCD()) {
    const scripts = document.querySelectorAll('script:not([src])');
    const targetScript = scripts[1];
    const crumb = targetScript.innerHTML.substring(29, 93);
    browser.runtime.sendMessage({
      type: 'jenkins-crumb',
      data: crumb,
    });
  }

  const handleCopyAllTasks = (data: any) => {
    const href = location.href;
    const searchReg = /\/team\/(\w+)\/project\/(\w+).*?\/sprint\/(\w+)\/?/;
    const match = href.match(searchReg);
    if (match) {
      const teamUUID = match[1];
      const projectUUID = match[2];
      const sprintUUID = match[3];
      const query = {
        query:
          '{\n  buckets(groupBy: {tasks: {}}, pagination: {limit: 50, after: "", preciseCount: true}) {\n    tasks(filterGroup: $filterGroup, orderBy: $orderBy, limit: 1000) {\n      key\n      name\n      uuid\n      serverUpdateStamp\n      path\n      subTaskCount\n      subTaskDoneCount\n      position\n      status {\n        uuid\n        name\n        category\n      }\n      deadline\n      subTasks {\n        uuid\n      }\n      issueType {\n        uuid\n      }\n      subIssueType {\n        uuid\n      }\n      project {\n        uuid\n      }\n      parent {\n        uuid\n      }\n      estimatedHours\n      remainingManhour\n      issueTypeScope {\n        uuid\n      }\n      publishContentCount\n      publishContentDoneCount\n      number\n      name\n      status {\n        uuid\n        name\n      }\n      assign {\n        key\n        uuid\n        name\n        avatar\n      }\n      owner {\n        key\n        uuid\n        name\n        avatar\n      }\n      createTime\n      estimatedHours\n      totalManhour\n      remainingManhour\n      deadline\n      priority {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n    }\n    key\n    pageInfo {\n      count\n      totalCount\n      startPos\n      startCursor\n      endPos\n      endCursor\n      hasNextPage\n      unstable\n    }\n  }\n}\n',
        variables: {
          groupBy: { tasks: { assign: {} } },
          orderBy: { createTime: 'DESC' },
          filterGroup: [
            { project_in: [projectUUID], sprint_in: [sprintUUID], parent: { uuid_in: [''] } },
          ],
          bucketOrderBy: { assign: { namePinyin: 'ASC' } },
          search: { keyword: '', aliases: [] },
        },
      };
      fetch('https://ones.ai/project/api/project/team/RDjYMhKq/items/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      })
        .then((res) => res.json())
        .then((res) => {
          const tasks = res.data.buckets[0].tasks;
          const { origin, pathname } = location;
          const baseUrl = `${origin + pathname}#/team/${teamUUID}/task/`;
          const copyItems = tasks.map((task: any) => {
            const { number, name, uuid } = task;
            const url = data.shouldWithLink ? baseUrl + uuid : '';
            return `#${number} ${name}\n${url}`;
          });
          const result = copyItems.join('\r\n');
          console.log(result);
          copyToClipboard(result);
        });
    }
  };

  browser.runtime.onMessage.addListener((request: any) => {
    const { type, data } = request;
    if (type === 'onesConfig') {
      saveOnesConfig(data);
      const newOnesConfig = 'window && window.location.reload()';
      injectScript(newOnesConfig);
    } else if (type === 'copyAllTasks') {
      handleCopyAllTasks(data);
    }

    console.log('接收消息：', request);
  });
}
