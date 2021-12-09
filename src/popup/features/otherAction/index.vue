<template>
  <div class="">
    <div class="">
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4">
          Github PR分支选择优化
        </div>
        <n-switch v-model:value="otherConfig.data.branchSelectEnhance" class="mr-4" />
        <n-tooltip trigger="hover">
          <template #trigger>
            <question-icon />
          </template>
          优化preview分支选择，由于preview搜索到的分支很多，不好直接选择
        </n-tooltip>
      </div>
      <!--      由于tabGroups只支持manifest V3，所以暂时不做这个自动分组功能-->

      <!--      <div class="layout-items-center py-2 switch-row">-->
      <!--        <div class="mr-4">-->
      <!--          是否开启自动分组：-->
      <!--        </div>-->
      <!--        <n-switch v-model:value="otherConfig.data.enableAutoGroup" class="mr-4" />-->
      <!--        <n-tooltip trigger="hover">-->
      <!--          <template #trigger>-->
      <!--            <question-icon />-->
      <!--          </template>-->
      <!--          根据域名自动对浏览器标签页进行分组-->
      <!--        </n-tooltip>-->
      <!--        <n-button type="primary" @click="groupTabs ">-->
      <!--          👏 一键分组所有Tabs-->
      <!--        </n-button>-->
      <!--      </div>-->
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
import { useMessage, NTag, NButton, NAlert, NSwitch, NTooltip } from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'

const message = useMessage()
const otherConfig = reactive({
  data: {
    branchSelectEnhance: true,
    // enableAutoGroup: true,
  },
})

watch(otherConfig, () => {
  onesConfigService.saveOtherConfig(toRaw(otherConfig.data))
})

const getOtherConfig = () => {
  onesConfigService.getOtherConfig().then((res) => {
    otherConfig.data = { ...otherConfig.data, ...res }
  })
}

const groupTabs = () => {
  browser.runtime.sendMessage({
    type: 'groupRightNow',
  })
}

onMounted(() => {
  getOtherConfig()
})
</script>

<style lang="scss">

</style>
