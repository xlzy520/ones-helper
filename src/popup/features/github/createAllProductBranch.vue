<template>
  <div class="py-2">
    <div class="layout-items-center">
      <div class="font-bold">
        一键获取最后一个ONES稳定大版本的所有产品的Commit Hash值（技术支持组专享）
      </div>
    </div>
    <div class="">
      <n-button type="primary" ghost :loading="loading" @click="getAllCommitHash">
        ✨ 复制全部Hash
      </n-button>
      <n-button type="primary" ghost :loading="loading" @click="getAllCommitHash">
        ✨ 以此创建分支
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { $ref } from 'vue/macros'
import { fetchPublishVersion, fetchTaskInfo, fetchTasksInfo } from '~/service/graphql'
import { Task } from '~/common/types'
import { copyToClipboard } from '~/common/utils'

const message = useMessage()

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
})
let loading = $ref(false)
const commitHashResult = $ref([])
const CommitHashKey = '2C3W6Gvp'
const getAllCommitHash = () => {
  loading = true
  fetchPublishVersion().then((res) => {
    const latestMinor = res.findIndex((item: Task) => item.importantField.find(v => v.value === 'MINOR'))
    if (latestMinor > -1) {
      const lastMinorStableVersionItem = res[latestMinor + 1]
      const taskUUID = lastMinorStableVersionItem.uuid
      fetchTaskInfo(taskUUID).then((res) => {
        console.log(res)
        const related_tasks = res.related_tasks
        const childComponentUUIDs = related_tasks.filter(v => v.sub_issue_type_uuid).map(v => v.uuid)
        fetchTasksInfo(childComponentUUIDs).then((res) => {
          console.log(res)
          const tasks = res.tasks
          tasks.forEach((task) => {
            const fieldValues = task.field_values
            const result = fieldValues.find(v => v.field_uuid === CommitHashKey)
            if (result) {
              commitHashResult.push({ name: task.summary, hash: result.value })
            }
          })
          loading = false
          console.log(unref(commitHashResult))
          const text = commitHashResult.map((v) => {
            return `【${v.name}】: ${v.hash}`
          })
          copyToClipboard(text.join('\r\n'), false)
          message.success('全部复制成功')
        })
        // console.log(childComponentUUIDs)
      })
      // console.log(lastMinorStableVersionItem)
    }
    // console.log(res, latestMinor)
  })
}

</script>

<style lang="scss" scoped>

</style>
