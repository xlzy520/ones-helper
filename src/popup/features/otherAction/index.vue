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
      <n-alert title="温馨提示" type="info">
        <div>下载新版本后，需要删除之前的文件夹，然后将新的文件夹<b style="color:#db2777">重命名</b></div>
        <!--        <div>构建系统注入到项目一些配置项，提供编辑用于快速调试（不会保存到项目）！</div>-->
        <!--        <div>下面<b style="color:#22c55e">配置项修改后生效</b>需要点击<b style="color:#db2777">保存</b>按钮</div>-->
      </n-alert>
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4">
          当前插件版本：
          <n-tag type="success">
            {{ currentVersion }}
          </n-tag>
        </div>
        <n-button v-if="hasNewVersion" type="primary" @click="upgrade">
          有新版本，立即更新插件
        </n-button>
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
import { useMessage, NTag, NButton, NAlert, NSwitch, NTooltip } from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'

const message = useMessage()

const hasNewVersion = ref(false)
const currentVersion = ref('')

const getCurrentVersion = () => {
  if (browser.app) {
    const details = browser.app.getDetails()
    return details.version
  }
  return browser.manifest.version
}

const getLatestRelease = () => {
  fetch('https://api.github.com/repos/xlzy520/bilibili-img-uploader/releases/latest').then(res => res.json()).then((res) => {
    console.log(res)
    const latest = res.name
    if (latest !== currentVersion.value) {
      hasNewVersion.value = true
    }
  })
}
//
// const hasNewVersion = () => {
//
// }

const upgrade = () => {
  browser.downloads.download({
    url: 'https://github.com/xlzy520/bilibili-img-uploader/releases/download/v1.1.12/bilibili.zip',
    // url: 'https://dl2.ones.ai/FsnPOlRBkkNI1JmqaLRSpXMhrGTI?e=1638949019&token=b0yYnz4avmO3oveG34Z3pTIjRLG52PUcxxogPYkP:Z2XZBlX3zzu8aOjRP_sUE6be6ZY',
    // filename: 'sss/extension.zip',
    // saveAs: true,
  }).then((res) => {
    browser.downloads.onChanged.addListener(({ id, state, exists }) => {
      console.log(id, state, exists)
      if (id === res) {
        if (state && state.current === 'complete') {
          browser.downloads.open(id)
        }
      }
    })
    console.log(res)
  })
  message.info('开发中...')
}

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
  currentVersion.value = getCurrentVersion()
  getOtherConfig()
  getLatestRelease()
})
</script>

<style lang="scss">
.switch-row {
  border-bottom: 1px solid #eee;
}
</style>
