<template>
  <div class="">
    <div class="layout-slide py-2 switch-row">
      <div v-if="code" class="layout-items-center">
        <n-tag type="success">
          Github已授权
        </n-tag>
        <n-tooltip trigger="hover">
          <template #trigger>
            <IconClose class="ml-2 cursor-pointer" @click="clearAuth" />
          </template>
          清除授权
        </n-tooltip>
      </div>
      <n-button v-else type="primary" @click="auth">
        授权GitHub
      </n-button>
      <n-tag v-if="code" type="info">
        {{ privateCode }}
      </n-tag>
      <!--          <n-button type="primary" @click="copyAll">-->
      <!--            复制当前页面显示的工作项(带链接)-->
      <!--          </n-button>-->
      <!--          <n-button type="info" @click="copyAll(false)">-->
      <!--            复制当前页面显示的工作项(不带链接)-->
      <!--          </n-button>-->
    </div>

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
</template>

<script setup lang="ts">
import { useMessage, NTag, NButton, NAlert, NSwitch, NTooltip } from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'
import IconClose from '~icons/icon-park-outline/close'

const message = useMessage()
const otherConfig = reactive({
  data: {
    branchSelectEnhance: true,
    // enableAutoGroup: true,
  },
})

const code = ref('')
const privateCode = computed(() => {
  return code.value.substr(0, 16)
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

const auth = () => {
  if (code.value) {
    return
  }
  window.open('https://github.com/login/oauth/authorize?scope=repo,user:email&client_id=86195e808441e12f0de9')
}

const clearAuth = () => {
  browser.storage.local.remove('githubAccessToken')
}

onMounted(() => {
  getOtherConfig()
  browser.storage.local.get('githubAccessToken').then((res) => {
    const token = res.githubAccessToken
    if (token) {
      code.value = token
    }
  })
})
</script>

<style lang="scss">

</style>
