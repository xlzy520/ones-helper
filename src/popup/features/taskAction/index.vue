<template>
  <div class="layout-around">
    <n-button type="primary" @click="copyAll">
      复制当前页面显示的工作项(带链接)
    </n-button>
    <n-button type="info" @click="copyAll(false)">
      复制当前页面显示的工作项(不带链接)
    </n-button>
  </div>
</template>

<script setup>
import {
  useMessage, NButton,
} from 'naive-ui'
import { getCurrentTab } from '~/common/tabs'

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

// onMounted(() => {
// })
</script>

<style lang="scss">

</style>
