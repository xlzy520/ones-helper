<template>
  <div class="">
    <div class="mb-2 layout-items-center">
      <div class="layout-items-center w-[200px]">
        <div class="whitespace-nowrap">
          所属迭代：
        </div>
        <n-select
          v-model:value="filter.filter.sprint"
          placeholder="所属迭代"
          clearable
          :options="filter.sprintOptions"
        />
      </div>
      <div class="layout-items-center w-[200px] ml-2">
        <div class="whitespace-nowrap">
          状态：
        </div>
        <n-select
          v-model:value="filter.filter.status"
          placeholder="状态"
          clearable
          :options="filter.statusOptions"
        />
      </div>
      <div class="ml-2">
        <n-input
          v-model:value="filter.filter.value"
          placeholder="搜索关键字，支持清空"
          class="mr-4"
          clearable
          @clear="clearFilterKey"
        />
      </div>
    </div>
    <div class="h-[300px] overflow-auto">
      <n-data-table :columns="columns" :data="filteredTableData" />
      <!--      <n-button type="info" @click="getData">-->
      <!--        获取工作项列表数据-->
      <!--      </n-button>-->
    </div>
    <n-modal
      v-model:show="recordModalShow"
      preset="dialog"
      title="登记工时"
      positive-text="确定"
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
          <n-input v-model:value="recordFormData.hours" placeholder="请输入输入数字">
            <template #suffix>
              小时
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="recordFormData.description" placeholder="在这期间我做了什么" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="tsx">
import {
  useMessage, NButton, NTooltip, NDataTable, NForm, NFormItem, NInput, NModal, NDatePicker,
  NSelect, NPopconfirm,
} from 'naive-ui'
import { format, getMilliseconds } from 'date-fns'
import { copyToClipboard } from '~/common/utils'

import { fetchMyTaskList, recordManhours } from '~/service/graphql'

const message = useMessage()

const filter = reactive({
  filter: {
    sprint: null,
    status: null,
    value: '',
  },
  sprintOptions: [],
  statusOptions: [],
})
const clearFilterKey = () => {
  filter.filter.value = ''
}

watch(filter.filter, () => {

})

const recordModalShow = ref(false)

const timestamp = new Date(format(new Date(), 'yyyy-MM-dd HH:00:00')).getTime()

const formRef = ref(null)
const recordFormData = reactive({
  mode: 'simple',
  start_time: timestamp,
  hours: '',
  description: '',
  owner: '',
  task: '',
  type: 'recorded',
})

const rules = {
  hours: {
    required: true,
    message: '请输入实际投入时长',
    trigger: ['input', 'blur'],
  },
}

const tableData = ref([])

const setOptions = (tableData: any) => {
  const sprintSet = new Set()
  const statusSet = new Set()
  tableData.forEach((data: any) => {
    if (data.sprint) {
      sprintSet.add(data.sprint.name)
    }
    if (data.status) {
      statusSet.add(data.status.name)
    }
  })
  filter.sprintOptions = Array.from(sprintSet).map(value => ({ label: value, value }))
  filter.statusOptions = Array.from(statusSet).map(value => ({ label: value, value }))
}

const getData = () => {
  fetchMyTaskList().then((data) => {
    console.log(data)
    tableData.value = data
    setOptions(data)
  })
}

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
      })
    }
  })
  return validateStatus
}

const columns = [
  {
    title: 'ID',
    key: 'number',
    width: 80,
    render(row: any) {
      const handleClick = () => {
        const text = `#${row.number}  ${row.name}`
        copyToClipboard(text)
        message.success('复制成功')
      }
      return (
        <NTooltip trigger="hover" v-slots={{
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
    render(row: any) {
      const handlePositiveClick = () => {
        const projectUUID = row.project.uuid
        const issueTypeUUID = row.issueType.uuid
        const url = `https://ones.ai/project/#/team/XBUM7Mss/project/${projectUUID}/issue_type/${issueTypeUUID}/task/${row.uuid}`
        window.open(url, '_blank')
      }
      const name = row.name
      return (
        <NPopconfirm onPositiveClick={handlePositiveClick} v-slots={{
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
    render(row: any) {
      const name = row.status?.name
      return <div>{name}</div>
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
    render: (row: any) => {
      const handleClick = () => {
        recordFormData.task = row.uuid
        recordModalShow.value = true
      }
      return <NButton type="info" onClick={handleClick}>登记</NButton>
    },
  },
]

const filteredTableData = computed(() => {
  const { value, sprint, status } = filter.filter
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
