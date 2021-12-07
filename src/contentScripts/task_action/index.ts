import { $, copyToClipboard } from '~/common/utils'
import { fetchCustomerList } from '~/service/graphql'
import { Task } from '~/common/types'

export const addTaskCopyButton = () => {
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

export const searchCustomerList = (name: string, fromSelf = false) => {
  fetchCustomerList(name).then((res) => {
    const tasks = res.data.buckets[0].tasks
    if (tasks.length) {
      const targetTask = tasks.find((v: Task) => v.status.name === '已完成')
      if (targetTask) {
        const baseUrl = location.origin + location.pathname + location.hash
        const signIndex = baseUrl.indexOf('?')
        const hasQuery = signIndex > -1
        const url = hasQuery ? baseUrl.substring(0, signIndex) : baseUrl
        location.href = `${url}?relatedTaskDialog=${targetTask.uuid}&isHideDialog=0`
      }
    }
    else {
      // 触发重试机制，四个字没有搜到就再搜一次前2个字
      if (fromSelf) {
        return
      }
      const twoWordName = name.substr(0, 2)
      searchCustomerList(twoWordName, true)
    }
  })
}

export const addViewRelateImplementTask = () => {
  const taskDetailMain = $('.ui-task-detail__main')
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
