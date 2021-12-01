import { onesConfigService } from '~/service'
import { copyToClipboard, $, $All, injectScript, isSaas, isDev, isPrivate } from '~/common/utils'
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

    const searchCustomerList = (name: string) => {
      const query = {
        query: '{\n  buckets(groupBy: {tasks: {}}, pagination: {limit: 50, after: \"\", preciseCount: true}) {\n    tasks(filterGroup: $filterGroup, orderBy: $orderBy, includeAncestors: {pathField: \"path\"}, orderByPath: \"path\", limit: 1000) {\n      key\n      name\n      uuid\n      serverUpdateStamp\n      path\n      subTaskCount\n      subTaskDoneCount\n      position\n      status {\n        uuid\n        name\n        category\n      }\n      deadline\n      subTasks {\n        uuid\n      }\n      issueType {\n        uuid\n      }\n      subIssueType {\n        uuid\n      }\n      project {\n        uuid\n      }\n      parent {\n        uuid\n      }\n      estimatedHours\n      remainingManhour\n      issueTypeScope {\n        uuid\n      }\n      relatedTasks {\n        status {\n          category\n        }\n      }\n      number\n      totalManhour\n      name\n      status {\n        uuid\n        name\n      }\n      _PUuiRRim {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _U1Zf7epq\n      _TioFkeZn {\n        key\n        uuid\n        name\n        avatar\n      }\n      assign {\n        key\n        uuid\n        name\n        avatar\n      }\n      _PAySkY4n\n      _WS42UWiW {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      deadline\n      _DMmewrUm\n      serverUpdateStamp\n      issueType {\n        key\n        uuid\n        name\n      }\n      subIssueType {\n        key\n        uuid\n        name\n      }\n      _BPo72n62\n      _N6UcMTLq {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _VK8uFpQv {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _NnAcdq9R\n      priority {\n        bgColor\n        color\n        uuid\n        value\n        position\n      }\n      _ScMa6vje\n      _HLWpxZVo\n      estimateVariance\n      _EbY6vaJR\n    }\n    key\n    pageInfo {\n      count\n      preciseCount\n      totalCount\n      startPos\n      startCursor\n      endPos\n      endCursor\n      hasNextPage\n      unstable\n    }\n  }\n}\n',
        variables: {
          groupBy: null,
          orderBy: { position: 'ASC', deadline: 'DESC', createTime: 'DESC' },
          filterGroup: [{
            project_in: ['YEL8b4LVgWM3n6BK'],
            issueType_in: ['4f89rNoy', 'UQQpmFBi'],
            name_match: name,
          }],
          bucketOrderBy: null,
          search: { keyword: '', aliases: [] },
        },
      }
      fetch('https://ones.ai/project/api/project/team/RDjYMhKq/items/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      }).then(res => res.json()).then((res) => {
        const tasks = res.data.buckets[0].tasks
        if (tasks.length) {
          const targetTask = tasks.find(v => v.status.name === '已完成')
          if (targetTask) {
            const baseUrl = location.origin + location.pathname + location.hash
            const signIndex = baseUrl.indexOf('?')
            const hasQuery = signIndex > -1
            const url = hasQuery ? baseUrl.substring(0, signIndex) : baseUrl
            console.log(url)
            location.href = `${url}?relatedTaskDialog=${targetTask.uuid}&isHideDialog=0`
          }
        }
      })
    }

    const addViewRelateImplementTask = () => {
      const taskDetailMain = $('.ui-task-detail__main')
      console.log(taskDetailMain)
      if (taskDetailMain) {
        const fieldNames = taskDetailMain.querySelectorAll('.task-detail-module.list-module.task-detail-attribute .task-detail-attribute-field-name')
        if (fieldNames) {
          const fieldMap = [
            { name: '反馈类型', key: 'type', value: '' },
            { name: '\b客户信息', key: 'customerInfo', value: '' },
            { name: '实例部署类型', key: 'deployType', value: '' },
          ]
          fieldNames.forEach((fieldName) => {
            fieldMap.forEach((field, index) => {
              if (fieldName.textContent === field.name) {
                // @ts-ignore
                const parentElement = fieldName.parentElement.parentElement
                const value = parentElement?.querySelector('.ones-select-selection-item')
                fieldMap[index].value = <string>value?.textContent
              }
            })
          })
          if (fieldMap[0].value === 'BUG' && fieldMap[2].value === '私有云') {
            const customerInfo = fieldMap[1].value
            if (customerInfo) {
              const taskDetailHeader = $('.ui-task-detail-header')
              const left = $('.task-basic-left')
              if (taskDetailHeader && left) {
                const div = document.createElement('div')
                const text = document.createTextNode('查看关联实施单')
                div.className = 'ones-helper search-task ml-2 ui-important-link'
                div.appendChild(text)
                div.addEventListener('click', () => {
                  searchCustomerList(customerInfo.substr(0, 4))
                })
                left.appendChild(div)
              }
            }
          }
        }

        // const taskDetailMain = $('.ui-task-detail__main')
      }
    }

    onesConfigService.getOtherConfig().then((res) => {
      console.log(res)
      setInterval(() => {
        if (res.copy && !$('.ones-helper.copy-task'))
          addTaskCopyButton()
        if (res.enableRelatedImplementVersion && !$('.ones-helper.search-task'))
          addViewRelateImplementTask()
      }, 3000)
    })
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
    if (isPrivate() || isSaas()) {
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
