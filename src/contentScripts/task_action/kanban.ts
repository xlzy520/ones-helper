import { $, $All } from '~/common/utils'

let kanbanData = []

let interval

const getKanbanData = () => {
  const kanbanDragArea = $All('.kanban-board-drag-area')
  const cacheData = []
  if (kanbanDragArea.length) {
    kanbanDragArea.forEach((area) => {
      const title = area.querySelector('.txt')?.textContent
      const countText = area.querySelector('.count')?.textContent
      let count = 0
      if (countText) {
        const match = countText.match(/\((.+?)\)/)
        if (match) {
          count = Number(match[1])
        }
      }
      let limit = 0
      if (title) {
        const match = title.match(/\（(.+?)\）/)
        if (match) {
          limit = Number(match[1])
        }
      }
      cacheData.push({ title, count, limit, hasExpedite: false })
    })
  }
  // 有可能往下滑然后打开弹窗，就读不到数据了
  if (cacheData.length) {
    kanbanData = cacheData
  }
  console.log(kanbanData)
}

const handleTaskDetailDialog = () => {
  const dialog = document.querySelector('.task-detail-dialog')
  if (dialog) {
    if (!interval) {
      interval = setInterval(() => {
        const list = document.querySelectorAll('.transition-select-picker-list .transition-select-picker-cell .transition-select-text')
        console.log(list)
        list.forEach((v, index) => {
          const target = kanbanData.find(d => d.title.includes(v.textContent))
          if (target) {
            let isJinji = false
            const fields = dialog.querySelectorAll('.task-detail-attribute-cell.cell-type-1')
            fields.forEach((v) => {
              if (v.querySelector('.task-detail-attribute-field-name').textContent === 'CoS') {
                if (v.querySelector('.ones-select-selection-item').textContent === '紧急') {
                  isJinji = true
                }
              }
            })

            const num = isJinji ? 1 : 0
            if (target.limit && target.count >= target.limit + num) {
              // console.log(v)
              v.style.color = 'red'
              v.parentElement.style.backgroundColor = '#eee'
              v.parentElement.style.pointerEvents = 'none'
            }
          }
        })
      }, 1000)
    }
  }
  else {
    clearInterval(interval)
    interval = null
  }
}

export const handleKanban = () => {
  const kanban = $('.kanban-container-advance')
  if (kanban) {
    getKanbanData()
    if (!kanban.hasListener) {
      kanban.addEventListener('DOMNodeInserted', (evt) => {
        const target = evt.target
        if (target) {
          // console.log(target)
          if (target.classList.contains('drag-able-container')) {
            const dragareas = target.querySelectorAll('.kanban-board-dragable-area')
            const dragingContainer = document.querySelector('.kanban-card-drag-able-container.kanban-container-draging-board')
            const boardListBody = kanban.querySelectorAll('.board-list-container .board-list-body')
            let dragingCard // 当前拖拽的卡片
            let isJinji = false
            let dragingIndexBoard = -1
            boardListBody.forEach((v, index) => {
              const cards = v.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer>div')
              cards.forEach((v) => {
                if (v.childElementCount === 0) { // 如果没有子节点，那就是正在拖的卡片所在的看板位置
                  dragingCard = v
                  dragingIndexBoard = index
                }
              })
            })

            dragingContainer.querySelectorAll('.ui-tag-key-field').forEach((v) => {
              if (v.textContent === '紧急') {
                isJinji = true
              }
            })

            dragingIndexBoard = dragingIndexBoard % kanbanData.length

            console.log('是否紧急：', isJinji, '来自看板索引：', dragingIndexBoard, dragingCard, dragingContainer)
            // console.log(dragareas)
            dragareas.forEach((v, index) => {
              if (index !== dragingIndexBoard) {
                const current = kanbanData[index]
                const num = isJinji ? 1 : 0
                if (current.limit && current.count >= current.limit + num) {
                  v.style.pointerEvents = 'none'
                  v.firstElementChild.innerHTML = '<div class="kanban-board-dragable-area-disabled"><div><svg class="ui-icon icon-drop-disabled-color " viewBox="0 0 32 32"><use xlink:href="#icon_drop-disabled_color"></use></svg>不能到达此状态, 此看板容量已满</div></div>'
                }
              }
            })
          }
        }
      }, false)
      kanban.hasListener = true
    }
    handleTaskDetailDialog()
  }
}
