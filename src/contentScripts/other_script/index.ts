import { onesConfigService } from '~/service'
import { copyToClipboard, $, $All, injectScript, isSaas, isDev } from '~/common/utils'
import { ONESConfig } from '~/common/constants'

export function run(): void {
  // logic here

  if (isSaas()) {
    const addTaskCopyButton = () => {
      const taskDetailHeader = $('.ui-task-detail-header')
      const left = $('.task-basic-left')
      if (taskDetailHeader && left) {
        const div = document.createElement('div')
        const text = document.createTextNode('去链接复制')
        div.className = 'ones-helper copy-task ml-2 ui-important-link'
        div.appendChild(text)
        div.addEventListener('click', () => {
          const number = taskDetailHeader.querySelector('.task-basic-task-number')?.textContent
          const taskName = taskDetailHeader.querySelector('.task-base-title')?.textContent
          const result = `${number}  ${taskName}`
          copyToClipboard(result)
        })
        left.appendChild(div)
      }
    }
    setInterval(() => {
      if (!$('.ones-helper.copy-task'))
        addTaskCopyButton()
    }, 3000)
  }

  const saveOnesConfig = (onesConfig: any) => {
    const dataStr = JSON.stringify(onesConfig)
    const newOnesConfig = `onesConfig=${dataStr}`
    injectScript(newOnesConfig)
    const path = location.origin + location.pathname
    onesConfigService.saveOnesConfigApi({ [path]: onesConfig })
    console.log(onesConfig)
  }

  onesConfigService.getOnesConfigApi().then((res) => {
    console.log(res)
    if (location.href.includes('https://mars-dev.myones.net:') || isSaas()) {
      const onesConfigScript = $All('script')[1]
      // eslint-disable-next-line no-eval
      const innerOnesConfig = eval(onesConfigScript.innerHTML)
      const onesConfig = res?.wechatBindSupport ? res : innerOnesConfig
      saveOnesConfig(onesConfig)
    }
    else {
      const onesConfig = res?.wechatBindSupport ? res : ONESConfig
      saveOnesConfig(onesConfig)
    }
  })

  const handleCopyAllTasks = (data: any) => {
    const href = location.href
    const searchReg = /\/team\/(\w+)\/project\/(\w+).*?\/sprint\/(\w+)\/?/
    const match = href.match(searchReg)
    if (match) {
      const teamUUID = match[1]
      const projectUUID = match[2]
      const sprintUUID = match[3]
      const query = { query: '{\n  buckets(groupBy: {tasks: {}}, pagination: {limit: 50, after: "", preciseCount: true}) {\n    tasks(filterGroup: $filterGroup, orderBy: $orderBy, limit: 1000) {\n      key\n      name\n      uuid\n      serverUpdateStamp\n      path\n      subTaskCount\n      subTaskDoneCount\n      position\n      status {\n        uuid\n        name\n        category\n      }\n      deadline\n      subTasks {\n        uuid\n      }\n      issueType {\n        uuid\n      }\n      subIssueType {\n        uuid\n      }\n      project {\n        uuid\n      }\n      parent {\n        uuid\n      }\n      estimatedHours\n      remainingManhour\n      issueTypeScope {\n        uuid\n      }\n      publishContentCount\n      publishContentDoneCount\n      number\n      name\n      status {\n        uuid\n        name\n      }\n      assign {\n        key\n        uuid\n        name\n        avatar\n      }\n      owner {\n        key\n        uuid\n        name\n        avatar\n      }\n      createTime\n      estimatedHours\n      totalManhour\n      remainingManhour\n      deadline\n      priority {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n    }\n    key\n    pageInfo {\n      count\n      totalCount\n      startPos\n      startCursor\n      endPos\n      endCursor\n      hasNextPage\n      unstable\n    }\n  }\n}\n', variables: { groupBy: { tasks: { assign: {} } }, orderBy: { createTime: 'DESC' }, filterGroup: [{ project_in: [projectUUID], sprint_in: [sprintUUID], parent: { uuid_in: [''] } }], bucketOrderBy: { assign: { namePinyin: 'ASC' } }, search: { keyword: '', aliases: [] } } }
      fetch('https://ones.ai/project/api/project/team/RDjYMhKq/items/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }).then(res => res.json()).then((res) => {
        const tasks = res.data.buckets[0].tasks
        const { origin, pathname } = location
        const baseUrl = `${origin + pathname}#/team/${teamUUID}/task/`
        const copyItems = tasks.map((task: any) => {
          const { number, name, uuid } = task
          const url = data.shouldWithLink ? baseUrl + uuid : ''
          return `#${number} ${name}\n${url}`
        })
        const result = copyItems.join('\r\n')
        console.log(result)
        copyToClipboard(result)
      })
    }
  }

  browser.runtime.onMessage.addListener((request) => {
    const { type, data } = request
    if (type === 'onesConfig')
      saveOnesConfig(data)
    else if (type === 'copyAllTasks')
      handleCopyAllTasks(data)

    console.log('接收消息：', request)
  })
}
