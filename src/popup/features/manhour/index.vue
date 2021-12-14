<template>
  <div class="pb-4 overflow-y-hidden">
    <div class="mb-2 layout-slide ">
      <div class="layout-items-center w-[240px]">
        <div class="whitespace-nowrap">
          状态类型：
        </div>
        <n-select
          v-model:value="filter.statusCategory"
          placeholder="状态"
          class="w-[200px]"
          :options="filterOptions.statusCategoryOptions"
        />
      </div>
      <div class="layout-items-center w-[270px]">
        <div class="whitespace-nowrap">
          所属迭代：
        </div>
        <n-select
          v-model:value="filter.sprint"
          class="w-[200px]"
          placeholder="所属迭代"
          clearable
          :options="filterOptions.sprintOptions"
        />
      </div>
      <div class="layout-items-center w-[240px]">
        <div class="whitespace-nowrap">
          状态：
        </div>
        <n-select
          v-model:value="filter.status"
          placeholder="状态"
          class="w-[200px]"
          clearable
          :options="filterOptions.statusOptions"
        />
      </div>
    </div>
    <div class="mb-2 layout-slide ">
      <div class="layout-items-center">
        <div class="whitespace-nowrap">
          标题：
        </div>
        <n-input
          v-model:value="filter.value"
          placeholder="搜索关键字，支持清空"
          class="mr-4"
          clearable
          @clear="clearFilterKey"
        />
      </div>
    </div>
    <div>
      <n-data-table
        :columns="columns"
        :data="filteredTableData"
        :loading="loading"
        max-height="400"
        size="small"
      />
    </div>
    <n-modal
      v-model:show="recordModalShow"
      :style="{width:'600px'}"
      preset="dialog"
      positive-text="确定"
      :mask-closable="false"
      :title="renderModalTitle"
      :on-close="resetFormData"
      @positive-click="submitRecord"
    >
      <n-form
        ref="formRef"
        label-placement="left"
        :label-width="80"
        :model="recordFormData"
        :rules="rules"
      >
        <n-form-item label="开始时间" path="start_time" required>
          <n-date-picker v-model:value="recordFormData.start_time" type="datetime" class="w-full" />
        </n-form-item>
        <n-form-item label="投入时长" path="hours">
          <n-input-number v-model:value="recordFormData.hours" min="0.1" :step="0.5" placeholder="请输入输入数字">
            <template #suffix>
              小时
            </template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="recordFormData.description"
            type="textarea"
            clearable
            placeholder="在这期间我做了什么"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="tsx">
import {
  useMessage, NButton, NTooltip, NDataTable, NForm, NFormItem, NInput, NInputNumber, NModal, NDatePicker,
  NSelect, NPopconfirm, NTag, NEllipsis,
} from 'naive-ui'
import { format } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'
import { copyToClipboard, isDev } from '~/common/utils'

import { fetchMyTaskList, recordManhours } from '~/service/graphql'

const message = useMessage()

const filter = reactive({
  sprint: null,
  status: null,
  statusCategory: 'in_progress',
  value: '',
})

const filterOptions = reactive({
  sprintOptions: [],
  statusOptions: [],
  statusCategoryOptions: [
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'done' },
  ],
})

const selectTableRow = reactive({
})
const clearFilterKey = () => {
  filter.value = ''
}

const recordModalShow = ref(false)

const timestamp = new Date(format(new Date(), 'yyyy-MM-dd HH:00:00')).getTime()

const formRef = ref(null)

const recordFormData = reactive({
  mode: 'detailed',
  start_time: timestamp,
  hours: 1,
  description: '',
  owner: '',
  task: '',
  type: 'recorded',
})

const rules = {
  hours: {
    required: true,
    validator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (!value) {
          reject(Error('请输入实际投入时长')) // reject with error message
        }
        else {
          resolve()
        }
      })
    },
    trigger: ['input', 'blur'],
  },
}

const tableData = ref([])
const loading = ref(false)

const resetFormData = () => {
  Object.assign(recordFormData, {
    start_time: timestamp,
    hours: 1,
    description: '',
    task: '',
  })
}

const setOptions = (tableData: any) => {
  const sprintSet = new Map()
  const statusSet = new Map()
  tableData.forEach((data: any) => {
    if (data.sprint) {
      const { uuid, name } = data.sprint
      sprintSet.set(uuid, name)
    }
    if (data.status) {
      const { uuid, name } = data.status
      statusSet.set(uuid, name)
    }
  })
  filterOptions.sprintOptions = Array.from(sprintSet).map(value => ({ label: value[1], value: value[0] }))
  filterOptions.statusOptions = Array.from(statusSet).map(value => ({ label: value[1], value: value[0] }))
}

const getData = useDebounceFn(() => {
  loading.value = true
  fetchMyTaskList(filter).then((data) => {
    console.log(data)
    tableData.value = data
    setOptions(data)
  }).finally(() => {
    loading.value = false
  })
}, 500)

watch(filter, () => {
  getData()
})

const submitRecord = () => {
  console.log(recordFormData)
  const validateStatus = formRef.value && formRef.value.validate((errors: any) => {
    if (!errors) {
      const data = toRaw(recordFormData)
      const payload = {
        ...data,
        hours: Number(data.hours) * 100000,
      }
      recordManhours(payload).then((res) => {
        message.success('登记成功')
        recordModalShow.value = false
        getData()
        resetFormData()
      })
    }
  })
  return validateStatus
}

const renderModalTitle = () => {
  return <NEllipsis style="max-width: 460px;" tooltip={{ placement: 'bottom' }}>
    <NTag type="info" size="small" round={true} bordered={false}>#{selectTableRow.number}</NTag>
    <span className="text-sm pt-2"> {selectTableRow.name}</span>
  </NEllipsis>
}

const columns = [
  {
    title: 'ID',
    key: 'number',
    width: 80,
    align: 'center',
    render(row: any) {
      const handleClick = () => {
        const text = `#${row.number}  ${row.name}`
        copyToClipboard(text)
        message.success('复制成功')
      }
      return (
        <NTooltip trigger="hover" placement="right" v-slots={{
          trigger: () => {
            return <div className="task-number cursor-pointer" onClick={handleClick}>#{row.number}</div>
          },
        }}>
          点击复制ID+标题
        </NTooltip>
      )
    },
  },
  {
    title: '标题',
    key: 'name',
    width: 285,
    align: 'left',
    render(row: any) {
      const handlePositiveClick = () => {
        const projectUUID = row.project.uuid
        const issueTypeUUID = row.issueType.uuid
        const url = `https://ones.ai/project/#/team/RDjYMhKq/project/${projectUUID}/issue_type/${issueTypeUUID}/task/${row.uuid}`
        window.open(url, '_blank')
      }
      const name = row.name
      return (
        <NPopconfirm onPositiveClick={handlePositiveClick} placement="right" v-slots={{
          trigger: () => {
            return <div className="cursor-pointer summary">{name}</div>
          },
        }}>
          是否前往工作项页面
        </NPopconfirm>
      )
    },
  },
  {
    title: '所属迭代',
    key: 'sprint',
    width: 80,
    align: 'center',
    render(row: any) {
      const name = row.sprint?.name || '无'
      return <div>{name}</div>
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row: any) {
      const name = row.status?.name
      return <NTag size="small">{name}</NTag>
    },
  },
  {
    title: '已登记',
    key: 'totalManhour',
    width: 70,
    align: 'center',
    render(row: any) {
      let totalManhour = row.totalManhour
      if (!totalManhour) {
        return '无'
      }
      totalManhour /= 100000
      return <div>{totalManhour}</div>
    },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    render: (row: any) => {
      const handleClick = () => {
        recordFormData.task = row.uuid
        recordModalShow.value = true
        selectTableRow.name = row.name
        selectTableRow.number = row.number
      }
      return <NButton type="info" onClick={handleClick} size="small">登记工时</NButton>
    },
  },
]

const filteredTableData = computed(() => {
  return tableData.value
  const { value, sprint, status } = filter
  const lowCaseFilterKey = value.toLowerCase()
  return tableData.value.filter((data: any) => {
    const name = data.name
    const sprintName = data.sprint?.name
    const statusName = data.status?.name
    return name.toLowerCase().includes(lowCaseFilterKey)
        && (!sprint || sprint === sprintName)
        && (!status || status === statusName)
  })
})

const getUid = () => {
  browser.cookies.get({
    name: 'ones-uid',
    url: 'https://ones.ai',
  }).then((res) => {
    recordFormData.owner = res.value
  })
}

onMounted(() => {
  getData()
  getUid()
})
</script>

<style lang="scss">
.n-data-table .n-data-table-td{
  padding: 10px 5px;
}
.task-number{
  &:hover{
    color: #338fe5;
  }
}
.summary{
  text-decoration: underline;
  color: #338fe5;
}
</style>
