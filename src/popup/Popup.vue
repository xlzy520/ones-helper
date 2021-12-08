<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <main class="w-[800px] h-[360px] px-4">
        <n-tabs :default-value="defaultTab" type="line">
          <n-tab-pane name="自定义API" tab="自定义API">
            <custom-api />
          </n-tab-pane>
          <n-tab-pane name="OnesConfig" tab="OnesConfig">
            <ones-config />
          </n-tab-pane>
          <n-tab-pane name="工时" tab="工时">
            <man-hour />
          </n-tab-pane>
          <n-tab-pane name="工作项" tab="工作项">
            <task-action />
          </n-tab-pane>
          <n-tab-pane name="其他" tab="其他">
            <other-action />
          </n-tab-pane>
          <n-tab-pane name="插件更新" tab="插件更新">
            <about-me />
          </n-tab-pane>
        </n-tabs>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NTabs, NTabPane, NConfigProvider, zhCN, dateZhCN } from 'naive-ui'
import CustomApi from '~/popup/features/custom_api/index.vue'
import OnesConfig from '~/popup/features/onesConfig/index.vue'
import TaskAction from '~/popup/features/taskAction/index.vue'
import OtherAction from '~/popup/features/otherAction/index.vue'
import ManHour from '~/popup/features/manhour/index.vue'
import AboutMe from '~/popup/features/about/index.vue'

const defaultTab = ref('自定义API')

// todo
// 一键切换账号

// 模拟抛出错误

// 请求结果拦截

// function openOptionsPage() {
//   browser.runtime.openOptionsPage()
// }
</script>
