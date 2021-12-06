<template>
  <div class="">
    <div class="">
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4">
          Github PR分支选择优化
        </div>
        <n-switch v-model:value="taskConfig.data.branchSelectEnhance" class="mr-4" />
        <n-tooltip trigger="hover">
          <template #trigger>
            <question-icon />
          </template>
          优化preview分支选择，由于preview搜索到的分支很多，不好直接选择
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

<script setup lang="ts">
import {
  useMessage, NButton, NSwitch, NTooltip,
} from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'

const taskConfig = reactive({
  data: {
    branchSelectEnhance: true,
  },
})

watch(taskConfig, () => {
  onesConfigService.saveOtherConfig(toRaw(taskConfig.data))
})

const getOtherConfig = () => {
  onesConfigService.getOtherConfig().then((res) => {
    console.log(res)
    taskConfig.data = res
  })
}

onMounted(() => {
  getOtherConfig()
})
</script>

<style lang="scss">
.switch-row {
  border-bottom: 1px solid #eee;
}
</style>
