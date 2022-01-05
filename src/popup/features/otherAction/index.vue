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
      <n-popconfirm
        v-else
        @positive-click="auth"
      >
        <template #trigger>
          <n-button type="primary">
            授权GitHub
          </n-button>
        </template>
        请注意！跳转之后的链接显示 <b class="text-red-500 px-2">无法访问此网站</b> 是正常的，重新打开插件即可
      </n-popconfirm>
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
    <n-divider title-placement="left">
      一键辅助功能
    </n-divider>

    <div :class="needGithubTokenClass">
      <n-alert v-if="!code" title="请点击上方Github授权" type="default">
        <p>该区域功能依赖Github Token授权信息，授权后即可使用！</p>
      </n-alert>
      <div class="py-2 ">
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
            一键获取项目分支Commit Hash值
          </div>
          <n-tag type="info" class="ml-2">
            前端版
          </n-tag>
        </div>
        <div class="">
          <div class="py-1">
            默认项目列表
          </div>
          <n-tag
            v-for="project in projectList"
            :key="project.repo"
            class="mr-2"
          >
            {{ project.repo }}
          </n-tag>
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
          <n-button type="primary" ghost :loading="copyHashLoading" :disabled="copyHashLoading" @click="getAllCommitHashAndCopy">
            ✨ 复制全部Hash
          </n-button>
        </div>
      </div>
    </div>
    <n-divider title-placement="left">
      Jenkins辅助
    </n-divider>

    <jenkins />
  </div>
</template>

<script setup lang="ts">
import { useMessage, NTooltip, NAlert, NDivider } from 'naive-ui'
import { onesConfigService } from '~/service'
import QuestionIcon from '~/components/question-icon.vue'
import { createNewBranch, fetchBranchSHA, getGithubOAuthToken } from '~/service/github'
import { projectList } from '~/common/constants'
import { copyToClipboard } from '~/common/utils'
import Jenkins from '~/popup/features/otherAction/Jenkins.vue'

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

const needGithubTokenClass = computed(() => {
  return !code.value ? ['cursor-not-allowed', 'p-2'] : ['p-2']
})

const checkedProjects = ref(projectList.map(v => v.repo))
const projectMapping = projectList.reduce((pre, cur) => {
  pre[cur.repo] = cur
  return pre
}, {})
const branchName = ref('')

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
}

const commitHash = reactive({
  branch: 'preview2',
  branchOptions: [
    { label: 'preview2', value: 'preview2' },
    { label: 'master', value: 'master' },
  ],
})

const copyHashLoading = ref(false)
const getAllCommitHashAndCopy = () => {
  copyHashLoading.value = true
  const apis = projectList.map((project) => {
    return fetchBranchSHA({ ...project, head: commitHash.branch })
  })
  Promise.allSettled(apis).then((res) => {
    const text = projectList.map((project, index) => {
      if (res[index].value) {
        return `${project.repo}(${commitHash.branch}): ${res[index].value}`
      }
      return `${project.repo}(${commitHash.branch}): 无权限`
    })
    copyToClipboard(text.join('\r\n'))
    message.success('复制成功')
    copyHashLoading.value = false
  }).catch((err) => {
    if (err) {
      copyHashLoading.value = false
    }
  })
}

const JenkinsBuildBranch = ref('')
const clearJenkinsBuildBranch = () => {
  JenkinsBuildBranch.value = ''
}

const dispatchBuild = () => {
  fetch('https://cd.myones.net/job/development/job/ones-project-web/job/S5075/build?delay=0sec', {
    method: 'POST',
    headers: {
      'jenkins-crumb': '2ed5473409fb2165d4eb72ab9cbd7ab73c355689b3655e660007129694a68c7c',
    },
  }).then((res) => {
    if (res.ok) {
      return res.json()
    }
    else {
      return Promise.reject(new Error('登录失效，1秒后获取凭证信息...'))
    }
  }).then((res) => {
    message.success('触发')
    console.log(123, res)
  }).catch((err) => {
    message.error(err.message)
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
  window.open('https://github.com/login/oauth/authorize?scope=repo,user:email&client_id=dcb6fb9f42ca21dba6ba')
}

const clearAuth = () => {
  browser.storage.local.remove('githubAccessToken').then((res) => {
    message.success('清除授权成功')
  })
}

onMounted(() => {
  getOtherConfig()
  getGithubOAuthToken().then((res) => {
    if (res) {
      console.log(res)
      code.value = res
    }
  })
})
</script>

<style lang="scss">

</style>
