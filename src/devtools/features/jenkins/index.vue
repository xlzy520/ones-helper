<template>
  <div class="">
    <div class="layout-slide pb-2 switch-row">
      <div v-if="jenkinsCrumb" class="layout-items-center">
        <n-tag type="success">
          Jenkins已授权
        </n-tag>
        <n-popconfirm @positive-click="getLatestJenkinsCrumb">
          <template #trigger>
            <icon-park-outline-refresh class="ml-2 cursor-pointer" />
          </template>
          重新授权
        </n-popconfirm>
      </div>
      <!--      <n-button type="primary" @click="getLatestJenkinsCrumb">-->
      <!--        授权Jenkins-->
      <!--      </n-button>-->
      <div v-if="jenkinsCrumb" class="">
        <n-tag type="info">
          {{ jenkinsCrumb.substring(0, 16).padEnd(20, '*') }}
        </n-tag>
      </div>
    </div>

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
      </div>
      <div class="">
        <div class="py-1">
          选择要触发构建的项目(开发环境)
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
    <div class="py-2">
      <div class="layout-slide">
        <div class="layout-items-center">
          <div class="font-bold">
            Jenkins立刻 Scan 仓库(dev)
          </div>
          <n-tag type="info" class="ml-2">
            前端版
          </n-tag>
        </div>
      </div>
      <div class="layout-slide">
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
        <n-button type="success" ghost :disabled="!checkedProjects.length" @click="scan">
          🔍️ 立刻 Scan 仓库
        </n-button>
      </div>
    </div>

    <n-button disabled @click="privateDeploy">
      一键私有部署(WIP)
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import Browser from 'webextension-polyfill'
import QuestionIcon from '~/components/question-icon.vue'
import { projectList } from '~/common/constants'

const message = useMessage()

const jenkinsCrumb = ref('')

const mainProjects = projectList.filter(v => v.repo !== 'ones-ai-web-common' && v.type === 'fe').map(v => v.repo)

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

const currentAction = ref(null)

const privateDeploy = () => {
  Browser.runtime.sendMessage({
    type: 'privateDeploy',
  })
}

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

const fetchScan = (repo: string) => {
  return fetch(`https://cd.myones.net/job/development/job/${repo}/build?delay=0sec`, {
    method: 'POST',
    headers: {
      'jenkins-crumb': jenkinsCrumb.value,
    },
  }).then((res) => {
    const status = res.status
    let errorMessage = ErrorCodeMapping[res.status]
    if (status === 404) {
      errorMessage = `项目${repo}${errorMessage}`
    }
    if (status === 403) {
      needGetToken.value = true
    }
    if (errorMessage) {
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    else {
      message.success(`项目${repo} Scan成功`)
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

const scan = () => {
  const apis = checkedProjects.value.map((project) => {
    return fetchScan(project)
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
    if (!res.jenkinsCrumb) {
      getLatestJenkinsCrumb()
    }
  })
  browser.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 'jenkins-crumb') {
      jenkinsCrumb.value = data
      browser.storage.local.set({ jenkinsCrumb: data })
      message.success('Jenkins凭证获取成功, 请重新执行')
    }
  })
})

</script>

<style lang="scss" scoped>

</style>
