<template>
  <div class="">
    <div class="">
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4 w-[180px]">
          工单关联实施版本
        </div>
        <n-switch v-model:value="taskConfig.data.enableRelatedImplementVersion" class="mr-4" />
        <n-tooltip trigger="hover">
          <template #trigger>
            <question-icon />
          </template>
          由于Desk中不方便直接查看该私有云客户的实施版本
        </n-tooltip>
      </div>
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4 w-[180px]">
          去链接复制
        </div>
        <n-switch v-model:value="taskConfig.data.copy" class="mr-4" />
        <n-tooltip trigger="hover">
          <template #trigger>
            <question-icon />
          </template>
          某些情况下复制不需要带上链接
        </n-tooltip>
      </div>
    </div>
    <!--    <div class="layout-around">-->
    <!--      <n-button type="primary" @click="copyAll">-->
    <!--        复制当前页面显示的工作项(带链接)-->
    <!--      </n-button>-->
    <!--      <n-button type="info" @click="copyAll(false)">-->
    <!--        复制当前页面显示的工作项(不带链接)-->
    <!--      </n-button>-->
    <!--    </div>-->
  </div>
</template>

<script setup>
import {
  useMessage, NButton, NSwitch, NTooltip,
} from 'naive-ui'
import QuestionIcon from '~/components/question-icon.vue'

import { getCurrentTab } from '~/common/tabs'
import { onesConfigService } from '~/service'

const taskConfig = reactive({
  data: {
    enableRelatedImplementVersion: false,
    copy: true,
  },
})

watch(taskConfig, () => {
  onesConfigService.saveOtherConfig(toRaw(taskConfig.data))
})

const getOtherConfig = () => {
  onesConfigService.getOtherConfig().then((res) => {
    console.log(res)
    taskConfig.data = { ...taskConfig.data, ...res }
  })
}
const copyAll = (shouldWithLink = true) => {
  getCurrentTab().then((tab) => {
    const { id } = tab
    if (id) {
      browser.tabs.sendMessage(id, {
        type: 'copyAllTasks',
        data: {
          shouldWithLink,
        },
      })
    }
  })
}

onMounted(() => {
  getOtherConfig()
})
</script>

<style lang="scss">
.switch-row{
  border-bottom: 1px solid #eee;
}
</style>
