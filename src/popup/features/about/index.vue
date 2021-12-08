<template>
  <div class="">
    <div class="">
      <n-alert title="温馨提示" type="info">
        <div>下载新版本后，需要 <b style="color:#db2777">删除之前的文件夹</b>，然后将新的文件夹 <b style="color:#db2777">重命名</b>， 也就是删除括号及括号里面的内容</div>
        <div>例如：默认解压之后是<b style="color:#22c55e">ONES Helper</b>，下载解压后新的文件夹名为 <b style="color:#22c55e">ONES Helper 2</b>，需要将后面的 <b style="color:#22c55e"> 2 </b>删除 </div>
      </n-alert>
      <div class="layout-items-center py-2 switch-row">
        <div class="mr-4">
          当前插件版本：
          <n-tag type="success">
            {{ currentVersion }}
          </n-tag>
        </div>
        <n-button v-if="newVersion" type="primary" :loading="downloading" @click="upgrade">
          {{ downloadBtnText }}
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

<script setup lang="tsx">
import { useMessage, NTag, NButton, NAlert, NSwitch, NTooltip } from 'naive-ui'

const message = useMessage()

const newVersion = ref('')
const currentVersion = ref('')
const downloading = ref(false)
const ghToken = 'token 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'

const downloadBtnText = computed(() => {
  return downloading.value ? '下载中...' : '有新版本，立即更新插件'
})

const getCurrentVersion = () => {
  if (browser.app) {
    const details = browser.app.getDetails()
    return details.version
  }
  return browser.manifest.version
}

const getLatestRelease = () => {
  fetch('https://api.github.com/repos/xlzy520/ones-helper/releases/latest', {
    headers: {
      authorization: ghToken,
    },
  }).then(res => res.json()).then((res) => {
    console.log(res)
    const latest = res.name
    if (latest !== currentVersion.value) {
      newVersion.value = latest
    }
  })
}

const upgrade = () => {
  downloading.value = true
  browser.downloads.download({
    url: `https://github.com/xlzy520/ones-helper/releases/download/${newVersion.value}/extension.zip`,
    // url: 'https://dl2.ones.ai/FsnPOlRBkkNI1JmqaLRSpXMhrGTI?e=1638949019&token=b0yYnz4avmO3oveG34Z3pTIjRLG52PUcxxogPYkP:Z2XZBlX3zzu8aOjRP_sUE6be6ZY',
    // filename: 'sss/extension.zip',
    // saveAs: true,
  }).then((res) => {
    browser.downloads.onChanged.addListener(({ id, state, exists }) => {
      console.log(id, state, exists)
      if (id === res) {
        if (state && state.current === 'complete') {
          downloading.value = false
          newVersion.value = ''
          message.success('最新版已下载并解压')
          browser.downloads.open(id)
        }
      }
    })
    console.log(res)
  })
}

onMounted(() => {
  currentVersion.value = `v${getCurrentVersion()}`
  getLatestRelease()
})
</script>

<style lang="scss">
.switch-row {
  border-bottom: 1px solid #eee;
}
</style>
