<template>
  <div class="py-2">
    <div class="layout-slide">
      <div class="layout-items-center">
        <div class="font-bold">
          Jenkins立即触发构建(dev)
        </div>
        <n-tag type="info" class="ml-2">
          前端版
        </n-tag>
        <n-tooltip trigger="hover">
          <template #trigger>
            <question-icon class="ml-2" />
          </template>
          场景：本次改动只修改了common，没有自动触发构建
        </n-tooltip>
      </div>
      <div v-if="jenkinsCrumb" class="">
        <n-tag type="info">
          Jenkins凭证：{{ jenkinsCrumb.substring(0, 16).padEnd(20, '*') }}
        </n-tag>
      </div>
    </div>
    <div class="">
      <div class="py-1">
        选择要创建分支的项目(基于主分支)
      </div>
      <n-checkbox-group v-model:value="checkedProjects">
        <n-checkbox
          v-for="project in mainProjects"
          :key="project"
          checked
          :value="project"
          :label="project"
          class="mr-2"
        ></n-checkbox>
      </n-checkbox-group>
    </div>

    <div class="layout-slide pt-2">
      <n-input
        v-model:value="JenkinsBuildBranch"
        placeholder="分支名称"
        class="mr-4"
        clearable
        @clear="clearJenkinsBuildBranch"
      />
      <n-button type="success" ghost :disabled="!canDispatch" @click="dispatchBuild">
        立即触发
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import QuestionIcon from '~/components/question-icon.vue'
import { projectList } from '~/common/constants'

const message = useMessage()

const jenkinsCrumb = ref('')

const mainProjects = projectList.filter(v => v.repo !== 'ones-ai-web-common').map(v => v.repo)

const checkedProjects = ref(mainProjects)

const JenkinsBuildBranch = ref('')
const clearJenkinsBuildBranch = () => {
  JenkinsBuildBranch.value = ''
}
const canDispatch = computed(() => {
  return checkedProjects.value.length && JenkinsBuildBranch.value
})

const getLatestJenkinsCrumb = () => {
  browser.tabs.create({
    url: 'https://cd.myones.net/',
    active: false,
  })
}

const ErrorCodeMapping = {
  403: '登录失效，正在自动获取凭证信息...',
  404: '分支不存在',
}

const needGetToken = ref(false)

const fetchBuild = (repo: string) => {
  const branchName = JenkinsBuildBranch.value
  return fetch(`https://cd.myones.net/job/development/job/${repo}/job/${branchName}/build?delay=0sec`, {
    method: 'POST',
    headers: {
      'jenkins-crumb': jenkinsCrumb.value,
    },
  }).then((res) => {
    const status = res.status
    let errorMessage = ErrorCodeMapping[res.status]
    if (status === 404) {
      errorMessage = `项目${repo}的${branchName}${errorMessage}`
    }
    if (status === 403) {
      needGetToken.value = true
    }
    if (errorMessage) {
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    else {
      message.success(`项目${repo}的${branchName}分支触发构建成功`)
      return Promise.resolve()
    }
  })
}

const dispatchBuild = () => {
  const apis = checkedProjects.value.map((project) => {
    return fetchBuild(project)
  })
  Promise.all(apis).catch(() => {
    if (needGetToken.value) {
      getLatestJenkinsCrumb()
    }
  })
}

onMounted(() => {
  browser.storage.local.get('jenkinsCrumb').then((res) => {
    jenkinsCrumb.value = res.jenkinsCrumb
  })
  browser.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 'jenkins-crumb') {
      jenkinsCrumb.value = data
      browser.storage.local.set({ jenkinsCrumb: data })
      message.success('Jenkins凭证获取成功, 正在重新执行触发构建')
      dispatchBuild()
    }
  })
})

</script>

<style lang="scss" scoped>

</style>
