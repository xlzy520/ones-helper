<template>
  <div class="pb-4">
    <div class="layout-slide pb-2 switch-row">
      <div v-if="code" class="layout-items-center">
        <n-tag type="success">
          Github Oauth已授权
        </n-tag>
        <n-tooltip trigger="hover">
          <template #trigger>
            <icon-park-outline-close class="ml-2 cursor-pointer" @click="clearAuth" />
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
    <div class="py-2">
      <div class="layout-items-center">
        <div class="font-bold">
          一键创建分支
        </div>
        <n-tag type="info" class="ml-2">
          前端版
        </n-tag>
      </div>
      <div class="">
        <div class="py-1">
          选择要创建分支的项目(基于主分支)
        </div>
        <n-checkbox-group v-model:value="checkedProjects">
          <n-checkbox
            v-for="project in projectList"
            :key="project.repo"
            checked
            :value="project.repo"
            :label="project.repo"
            class="mr-2"
          ></n-checkbox>
        </n-checkbox-group>
      </div>
      <div class="">
        <div class="py-1">
          输入要创建分支的名称
        </div>
        <div class="layout-slide">
          <n-input
            v-model:value="branchName"
            placeholder="分支名称"
            class="mr-4"
            clearable
            @clear="clearBranchName"
          />
          <n-button type="primary" ghost :disabled="!canCreateBranches" @click="create">
            👏 确定
          </n-button>
          <n-modal
            v-model:show="showModal"
            preset="dialog"
            title="创建分支"
            positive-text="确认"
            @positive-click="createBranches"
          >
            确定要在以下项目：
            <div class="">
              <div v-for="item in checkedProjects" :key="item" class="py-1 font-bold">
                {{ item }}
              </div>
            </div>

            中创建 <n-tag type="primary">
              {{ branchName }}
            </n-tag> 分支吗？
            <!--            <n-input v-model:value="newPreset.name" placeholder="输入新的预设名" />-->
          </n-modal>
        </div>
      </div>
    </div>
    <div class="py-2">
      <div class="layout-items-center">
        <div class="font-bold">
          一键获取项目Hash值
        </div>
        <n-tag type="info" class="ml-2">
          前端版
        </n-tag>
      </div>
      <div class="">
        <div class="py-1">
          默认项目列表
        </div>
        <span
          v-for="project in projectList"
          :key="project.repo"
          class="mr-2"
        >{{ project.repo }}</span>
      </div>
      <div class="layout-slide">
        <div class="layout-items-center">
          <div class="py-1">
            选择查询分支：
          </div>
          <n-radio-group v-model:value="commitHash.branch" name="radiogroup">
            <n-space>
              <n-radio
                v-for="branch in commitHash.branchOptions"
                :key="branch.value"
                :value="branch.value"
              >
                {{ branch.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
          <!--          <n-select-->
          <!--            v-model:value="commitHash.branch"-->
          <!--            class="w-[200px]"-->
          <!--            placeholder="选择分支"-->
          <!--            clearable-->
          <!--            :options="commitHash.branchOptions"-->
          <!--          />-->
        </div>
        <n-button type="primary" ghost @click="getAllCommitHashAndCopy">
          ✨ 确定
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useMessage, NInput, NTag, NButton, NAlert, NSwitch, NTooltip,
  NCheckboxGroup, NCheckbox, NRadioGroup, NRadio, NModal,
} from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'
import { createNewBranch, fetchBranchSHA, getGithubOAuthToken } from '~/service/github'
import { projectList } from '~/common/constants'
import { copyToClipboard } from '~/common/utils'

const message = useMessage()
const otherConfig = reactive({
  data: {
    branchSelectEnhance: true,
    // enableAutoGroup: true,
  },
})

const code = ref('')
const privateCode = computed(() => {
  return code.value.substring(0, 16)
})

const checkedProjects = ref(projectList.map(v => v.repo))
const projectMapping = projectList.reduce((pre, cur) => {
  pre[cur.repo] = cur
  return pre
}, {})
const branchName = ref('test')

const clearBranchName = () => {
  branchName.value = ''
}
const canCreateBranches = computed(() => {
  return branchName.value && checkedProjects.value.length
})
const showModal = ref(false)
const create = () => {
  showModal.value = true
}

const getBranch = (project) => {
  fetchBranchSHA(project)
}

const createBranches = () => {
  checkedProjects.value.forEach((v) => {
    const project = projectMapping[v]
    fetchBranchSHA({ ...project, head: project.defaultBranch }).then((res) => {
      message.success(`获取${project.repo} ${project.defaultBranch}分支sha信息成功`)
      createNewBranch({ ...project, ref: branchName.value, sha: res }).then((res) => {
        message.success(`创建${project.repo} ${branchName.value}分支成功`)
      }).catch((err) => {
        message.error(err)
      })
    })
  })
  nextTick(() => {
    clearBranchName()
  })
}

const commitHash = reactive({
  branch: 'preview2',
  branchOptions: [
    { label: 'preview2', value: 'preview2' },
    { label: 'master', value: 'master' },
  ],
})
const getAllCommitHashAndCopy = () => {
  const apis = projectList.map((project) => {
    return fetchBranchSHA({ ...project, head: commitHash.branch })
  })
  Promise.all(apis).then((res) => {
    console.log(res)
    const text = projectList.map((project, index) => {
      return `${project.repo}(${commitHash.branch}): ${res[index]}`
    })
    copyToClipboard(text.join('\r\n'))
    message.success('复制成功')
  })
}

watch(otherConfig, () => {
  onesConfigService.saveOtherConfig(toRaw(otherConfig.data))
})

const getOtherConfig = () => {
  onesConfigService.getOtherConfig().then((res) => {
    otherConfig.data = { ...otherConfig.data, ...res }
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
  getGithubOAuthToken().then((res) => {
    if (res) {
      code.value = res
    }
  })
})
</script>

<style lang="scss">

</style>
