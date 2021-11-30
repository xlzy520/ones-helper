import { onesConfigService } from '~/service'
import { copyToClipboard } from '~/common/utils'

export function run(): void {
  // logic here

  const $ = function(query: string) {
    return document.querySelector(query)
  }
  const $All = function(query: string) {
    return document.querySelectorAll(query)
  }

  // injectScriptLink
  const injectScriptLink = function(src: string) {
    const head = $('head')
    const scriptTag = document.createElement('script')
    scriptTag.src = src
    head.appendChild(scriptTag)
  }

  // injectScript
  const injectScript = function(scriptContent: string) {
    const head = $('head')
    const scriptTag = document.createElement('script')
    scriptTag.innerHTML = scriptContent
    head.appendChild(scriptTag)
  }

  const handleCopyAllTasks = (data) => {
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
        const copyItems = tasks.map((task) => {
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
    if (type === 'onesConfig') {
      const dataStr = JSON.stringify(data)
      const newOnesConfig = `onesConfig=${dataStr}`
      injectScript(newOnesConfig)
      console.log(dataStr)
    }
    else if (type === 'copyAllTasks') {
      handleCopyAllTasks(data)
    }
    console.log('接收消息：', request)
  })

  // console.log(localStorage)
  const onesConfigScript = $All('script')[1]
  const onesConfig = eval(onesConfigScript.innerHTML)
  onesConfigService.saveOnesConfigApi(onesConfig)
  console.log(onesConfig)

  // const onesConfig13 = 'console.log(window.onesConfig);chrome.runtime.sendMessage(\'oldmdafdokhkafkajeokoniookpagnlf\', { onesConfig: \'312\' })'
  // injectScript(onesConfig)
}
