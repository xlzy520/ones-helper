import { useThrottleFn } from '@vueuse/core';
import $message from '../antdMessage/index';
import { $, $All, isEqualAndIgnoreSomeProp } from '~/common/utils';

let kanbanData = [];

let interval;

const getKanbanData = () => {
  const kanbanDragArea = $All('.kanban-board-drag-area');
  const cacheData = [];
  if (kanbanDragArea.length) {
    kanbanDragArea.forEach((area) => {
      const title = area.querySelector('.txt')?.textContent;
      const countText = area.querySelector('.count')?.textContent;
      let count = 0;
      if (countText) {
        const match = countText.match(/\((.+?)\)/);
        if (match) {
          count = Number(match[1]);
        }
      }
      let limit = 0;
      if (title) {
        const match = title.match(/\（(.+?)\）/);
        if (match) {
          limit = Number(match[1]);
        }
      }
      cacheData.push({ title, count, limit, hasExpedite: false });
    });
  }
  // 有可能往下滑然后打开弹窗，就读不到数据了
  if (cacheData.length) {
    kanbanData = cacheData;
  }
  // console.log(kanbanData)
};

const handleTaskDetailDialog = () => {
  const dialog = document.querySelector('.task-detail-dialog');
  if (dialog) {
    if (!interval) {
      interval = setInterval(() => {
        const list = document.querySelectorAll(
          '.transition-select-picker-list .transition-select-picker-cell .transition-select-text'
        );
        list.forEach((v, index) => {
          const target = kanbanData.find((d) => d.title.includes(v.textContent));
          if (target) {
            let isJinji = false;
            const fields = dialog.querySelectorAll('.task-detail-attribute-cell.cell-type-1');
            fields.forEach((v) => {
              if (v.querySelector('.task-detail-attribute-field-name').textContent === 'CoS') {
                if (v.querySelector('.ones-select-selection-item').textContent === '紧急') {
                  isJinji = true;
                }
              }
            });

            const num = isJinji ? 1 : 0;
            if (target.limit && target.count >= target.limit + num) {
              // console.log(v)
              v.style.color = 'red';
              v.parentElement.style.backgroundColor = '#eee';
              v.parentElement.style.pointerEvents = 'none';
            }
          }
        });
      }, 1000);
    }
  } else {
    clearInterval(interval);
    interval = null;
  }
};

const kanbanQuery = {
  with_boards: true,
  boards: [
    { name: '待处理客情单 Top 5', uuid: 'ZCPh1KWB', status_uuids: ['VKr1ju8h'] },
    {
      name: '分诊中（4）',
      uuid: 'IJeKBPTm',
      status_uuids: ['4NAvu5Ly'],
    },
    { name: '分诊完成', uuid: 'omEnExGI', status_uuids: ['Tqtoda88'] },
    {
      name: '确认中（4）',
      uuid: 'RcGr9pTs',
      status_uuids: ['Rt9S5QaP', '7VD6FJga'],
    },
    { name: '处理中（3）', uuid: 'Anc4XcmV', status_uuids: ['D1gi1FT5'] },
    {
      name: '处理完成',
      uuid: '9xAaYX8Z',
      status_uuids: ['DtWy2th2'],
    },
    { name: '测试中（3）', uuid: 'KkPJZgfl', status_uuids: ['FYzpbn4R', 'Q31rhCqT'] },
    {
      name: '测试通过（12）',
      uuid: 'q7c5WCfT',
      status_uuids: ['JGPxA2FE'],
    },
    { name: '待客户确认', uuid: 'YwoIY9Ld', status_uuids: ['SRrEGrTV', 'M6c2Muyw', '3ryJG6HC'] },
  ],
  query: {
    must: [
      {
        must: [
          { in: { 'field_values.field006': ['GL3ysesFPdnAQNIU'] } },
          { in: { 'field_values.field007': ['7sxvwZMY'] } },
        ],
      },
      {
        should: [
          {
            must: [
              { in: { 'field_values.Qr51Lf6j': ['v7GCUFcW'] } },
              {
                in: {
                  'field_values.PjHEiH3d': [
                    'DLMM2DJD',
                    'AdJfghtB',
                    'Jrw6nJ4s',
                    'DY42MTx4',
                    'XQY7VZLK',
                  ],
                },
              },
              { not_in: { 'field_values.field005': ['4xw63FVp'] } },
            ],
          },
          {
            must: [
              { in: { 'field_values.RtoHFr5S': ['Mg4APznQ'] } },
              { in: { 'field_values.PjHEiH3d': ['DLMM2DJD', 'AdJfghtB', 'Jrw6nJ4s', 'DY42MTx4'] } },
              { not_in: { 'field_values.field005': ['4xw63FVp'] } },
            ],
          },
          { must: [{ in: { 'field_values.EeZFYyrW': ['$*department:LNErQe94'] } }] },
        ],
      },
    ],
  },
  group_by: 'field_values.RtoHFr5S',
  sort: [{ 'field_values.field009': { order: 'desc' } }],
  include_subtasks: false,
  include_status_uuid: false,
  include_issue_type: false,
  include_project_uuid: false,
  is_show_derive: false,
  search: { keyword: '', aliases: [] },
};

// 判断看板内容是否有变化
let currentKanbanData: any;
const fetchKanban = useThrottleFn(() => {
  fetch('https://ones.ai/project/api/project/team/RDjYMhKq/filters/peek', {
    method: 'POST',
    body: JSON.stringify(kanbanQuery),
  }).then((res) => {
    return res.json()
  }).then((res) => {
    const isEqual = isEqualAndIgnoreSomeProp(currentKanbanData, res, ['server_update_stamp'])
    if (!isEqual) {
      currentKanbanData = res
      $message.info('看板内容有变化，正在刷新')
      // @ts-ignore
      $('.ComponentMain-top .url-foldable-tabs-new-link.active').click()
    }
  })
}, 30 * 1000)

export const handleKanban = () => {
  const kanban = $('.kanban-container-advance');
  if (kanban) {
    getKanbanData();
    if (!kanban.hasListener) {
      kanban.addEventListener(
        'DOMNodeInserted',
        (evt) => {
          const target = evt.target;
          if (target) {
            // console.log(target)
            if (target.classList.contains('drag-able-container')) {
              const dragareas = target.querySelectorAll('.kanban-board-dragable-area');
              const dragingContainer = document.querySelector(
                '.kanban-card-drag-able-container.kanban-container-draging-board'
              );
              const boardListBody = kanban.querySelectorAll(
                '.board-list-container .board-list-body'
              );
              let dragingCard; // 当前拖拽的卡片
              let isJinji = false;
              let dragingIndexBoard = -1;
              boardListBody.forEach((v, index) => {
                const cards = v.querySelectorAll(
                  '.ReactVirtualized__Grid__innerScrollContainer>div'
                );
                cards.forEach((v) => {
                  if (v.childElementCount === 0) {
                    // 如果没有子节点，那就是正在拖的卡片所在的看板位置
                    dragingCard = v;
                    dragingIndexBoard = index;
                  }
                });
              });

              dragingContainer.querySelectorAll('.ui-tag-key-field').forEach((v) => {
                if (v.textContent === '紧急') {
                  isJinji = true;
                }
              });

              dragingIndexBoard = dragingIndexBoard % kanbanData.length;

              console.log(
                '是否紧急：',
                isJinji,
                '来自看板索引：',
                dragingIndexBoard,
                dragingCard,
                dragingContainer
              );
              // console.log(dragareas)
              dragareas.forEach((v, index) => {
                if (index !== dragingIndexBoard) {
                  const current = kanbanData[index];
                  const num = isJinji ? 1 : 0;
                  if (current.limit && current.count >= current.limit + num) {
                    v.style.pointerEvents = 'none';
                    v.firstElementChild.innerHTML =
                      '<div class="kanban-board-dragable-area-disabled"><div><svg class="ui-icon icon-drop-disabled-color " viewBox="0 0 32 32"><use xlink:href="#icon_drop-disabled_color"></use></svg>不能到达此状态, 此看板容量已满</div></div>';
                  }
                }
              });
            }
          }
        },
        false
      );
      kanban.hasListener = true;
    }
    handleTaskDetailDialog();
    fetchKanban();
  }
};
