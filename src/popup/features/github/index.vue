<template>
  <div class="pb-4">
    <div class="layout-slide pb-2 switch-row">
      <div v-if="code" class="layout-items-center">
        <n-tag type="success"> Github Oauth已授权 </n-tag>
        <n-popconfirm @positive-click="clearAuth">
          <template #trigger>
            <icon-park-outline-close class="ml-2 cursor-pointer" />
          </template>
          确定清除授权吗？
        </n-popconfirm>
      </div>
      <n-popconfirm v-else @positive-click="auth">
        <template #trigger>
          <n-button type="primary"> 授权GitHub </n-button>
        </template>
        请注意！跳转之后的链接显示
        <b class="text-red-500 px-2">无法访问此网站</b> 是正常的，重新打开插件即可
      </n-popconfirm>
      <n-tag v-if="code" type="info">
        {{ privateCode.substring(0, 16).padEnd(20, '*') }}
      </n-tag>
    </div>
    <div class="layout-items-center py-2 switch-row">
      <div class="mr-4">Github PR分支选择优化</div>
      <n-switch v-model:value="otherConfig.data.branchSelectEnhance" class="mr-4" />
      <n-tooltip trigger="hover">
        <template #trigger>
          <question-icon />
        </template>
        优化preview分支选择，由于preview搜索到的分支很多，不好直接选择
      </n-tooltip>
    </div>
    <n-divider title-placement="left"> 一键辅助功能 </n-divider>
    <div class="layout-items-center pb-2 switch-row">
      <div class="mr-4">我的角色是</div>
      <n-radio-group :value="role" name="radiogroup" :on-update:value="saveRole">
        <n-space>
          <n-radio value="fe"> 前端 </n-radio>
          <n-radio value="be"> 后端 </n-radio>
        </n-space>
      </n-radio-group>
    </div>

    <div class="p-2">
      <n-alert v-if="!code" title="请点击上方Github授权" type="default">
        <p>该区域功能依赖Github Token授权信息，授权后即可使用！</p>
      </n-alert>
      <div class=" ">
        <div class="pb-2">
          <div class="font-bold">一键创建分支</div>
        </div>
        <div class="layout-items-center">
          <div class="py-1 flex-shrink-0">基于的分支（可搜索）：</div>
          <n-select
            v-model:value="baseRef"
            placeholder="请输入基于的分支, 可搜索"
            class="mr-4"
            clearable
            :loading="branchLoading"
            filterable
            :options="allBranchOptions"
            @search="handleBranchSearch"
          />
          <!--          <n-select-->
          <!--            v-model:value="fastBranch"-->
          <!--            placeholder="状态"-->
          <!--            class="w-[200px]"-->
          <!--            clearable-->
          <!--            :options="allBranchOptions"-->
          <!--          />-->
        </div>
        <div class="layout-items-center h-[34px]">
          <div class="py-1 mr-2">选择要创建分支的项目：</div>
          <n-checkbox-group v-model:value="checkedProjects">
            <n-checkbox
              v-for="project in filterProjectList"
              :key="project.repo"
              checked
              :value="project.repo"
              :label="project.repo"
              class="mr-2"
            ></n-checkbox>
          </n-checkbox-group>
        </div>
        <div class="layout-items-center">
          <div class="py-1 flex-shrink-0">输入要创建分支的名称：</div>
          <n-input
            v-model:value="branchName"
            placeholder="请输入新的分支名称"
            class="mr-4"
            clearable
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
              <div v-for="item in checkedProjectsByRole" :key="item" class="py-1 font-bold">
                {{ item }}
              </div>
            </div>

            中创建
            <n-tag type="primary">
              {{ branchName }}
            </n-tag>
            分支吗？
          </n-modal>
        </div>
      </div>
      <div class="py-2">
        <div class="layout-items-center">
          <div class="font-bold">一键获取项目分支Commit Hash值</div>
        </div>
        <div class="layout-items-center">
          <div class="py-1">默认项目列表：</div>
          <n-tag v-for="project in filterProjectList" :key="project.repo" class="mr-2">
            {{ project.repo }}
          </n-tag>
        </div>
        <div class="layout-slide">
          <div class="layout-items-center">
            <div class="py-1">选择查询分支：</div>
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
          <n-button
            type="primary"
            ghost
            :loading="copyHashLoading"
            :disabled="copyHashLoading"
            @click="getAllCommitHashAndCopy"
          >
            ✨ 复制全部Hash
          </n-button>
        </div>
      </div>
      <create-all-product-branch :code="code" />
    </div>
    <div v-if="!code" class="disabled-area"></div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';
import browser from 'webextension-polyfill';
import { $ref } from 'vue/macros';
import { useDebounceFn } from '@vueuse/core';
import { onesConfigService } from '~/service';
import QuestionIcon from '~/components/question-icon.vue';
import {
  createNewBranch,
  fetchBranchList,
  fetchBranchSHA,
  getGithubOAuthToken,
  searchBranch,
} from '~/service/github';
import { projectList } from '~/common/constants';
import { copyToClipboard } from '~/common/utils';
import CreateAllProductBranch from '~/popup/features/github/createAllProductBranch.vue';
import { fetchTaskInfo } from '~/service/graphql';

const message = useMessage();
const state = reactive({
  GithubOAuthClientID: '',
});
const otherConfig = reactive({
  data: {
    branchSelectEnhance: true,
  },
});

const code = ref('');
const privateCode = computed(() => {
  return code.value.substring(0, 16);
});

const role = ref('fe');
const saveRole = (val: string) => {
  role.value = val;
  browser.storage.local.set({ role: role.value });
};

const filterProjectList = computed(() => {
  return projectList.filter((project) => project.type === role.value);
});
const checkedProjects = ref(projectList.map((v) => v.repo));
const projectMapping = projectList.reduce((pre, cur) => {
  pre[cur.repo] = cur;
  return pre;
}, {});
const checkedProjectsByRole = computed(() => {
  return checkedProjects.value.filter((project) => projectMapping[project].type === role.value);
});

const baseRef = $ref('master');
let allBranchOptions = $ref([]);
const branchName = ref('');
let branchLoading = $ref(false);

const handleBranchSearch = useDebounceFn((query) => {
  if (!query.length) {
    allBranchOptions = [];
    return;
  }
  branchLoading = true;
  searchBranch({ owner: 'BangWork', repo: 'ones-project-web', head: query })
    .then((res) => {
      const branches = res.sort((a, b) => a.ref.length - b.ref.length);
      allBranchOptions = branches.map((v) => ({
        label: v.ref.replace('refs/heads/', ''),
        value: v.object.sha,
      }));
    })
    .finally(() => {
      branchLoading = false;
    });
}, 500);

const canCreateBranches = computed(() => {
  return branchName.value && checkedProjects.value.length;
});
const showModal = ref(false);
const create = () => {
  showModal.value = true;
};

const createBranches = () => {
  const createNewBranchFn = (project, sha) => {
    createNewBranch({ ...project, ref: branchName.value, sha })
      .then((res) => {
        message.success(`创建${project.repo} ${branchName.value}分支成功`);
      })
      .catch((err) => {
        message.error(err);
      });
  };

  checkedProjects.value.forEach((v) => {
    const project = projectMapping[v];
    if (baseRef === 'master') {
      fetchBranchSHA({ ...project, head: project.defaultBranch }).then((res) => {
        message.success(`获取${project.repo} ${project.defaultBranch}分支sha信息成功`);
        createNewBranchFn(project, res);
      });
    } else {
      createNewBranchFn(project, baseRef);
    }
  });
};

const commitHash = reactive({
  branch: 'preview2',
  branchOptions: [
    { label: 'preview2', value: 'preview2' },
    { label: 'master', value: 'master' },
  ],
});

const copyHashLoading = ref(false);
const getAllCommitHashAndCopy = () => {
  copyHashLoading.value = true;
  const apis = filterProjectList.value.map((project) => {
    return fetchBranchSHA({ ...project, head: commitHash.branch });
  });
  Promise.allSettled(apis)
    .then((res) => {
      let noPermissionCount = 0;
      const text = filterProjectList.value.map((project, index) => {
        if (res[index].value) {
          return `${project.repo}(${commitHash.branch}): ${res[index].value}`;
        }
        noPermissionCount += 1;
        return `${project.repo}(${commitHash.branch}): 无权限`;
      });
      copyToClipboard(text.join('\r\n'), false);
      if (noPermissionCount) {
        if (noPermissionCount === text.length) {
          message.error('复制失败, 全部无权限');
        } else {
          message.success(`复制成功, 有${noPermissionCount}个无权限`);
        }
      } else {
        message.success('复制成功');
      }
      copyHashLoading.value = false;
    })
    .catch((err) => {
      if (err) {
        copyHashLoading.value = false;
      }
    });
};

watch(otherConfig, () => {
  onesConfigService.saveOtherConfig(toRaw(otherConfig.data));
});

const getOtherConfig = () => {
  onesConfigService.getOtherConfig().then((res) => {
    otherConfig.data = { ...otherConfig.data, ...res };
  });
};

const getGithubOAuthInfo = () => {
  browser.storage.local.get('GithubOAuthInfo').then(({ GithubOAuthInfo }) => {
    if (GithubOAuthInfo) {
      state.GithubOAuthClientID = GithubOAuthInfo.GithubOAuthClientID;
    } else {
      fetchTaskInfo('9tnwZjqBCGpdAKEo').then((res) => {
        const data = JSON.parse(res.desc);
        state.GithubOAuthClientID = data.GithubOAuthClientID;
        browser.storage.local.set({ GithubOAuthInfo: data });
      });
    }
  });
};

const auth = () => {
  if (code.value) {
    return;
  }
  browser.tabs.create({
    url: `https://github.com/login/oauth/authorize?scope=repo,user:email&client_id=${state.GithubOAuthClientID}`,
    active: true,
  });
};

const clearAuth = () => {
  browser.storage.local.remove('githubAccessToken').then((res) => {
    message.success('清除授权成功');
    code.value = '';
  });
};

onMounted(() => {
  getGithubOAuthInfo();
  browser.storage.local.get('role').then((res) => {
    role.value = res.role || 'fe';
  });
  getOtherConfig();
  getGithubOAuthToken().then((res) => {
    if (res) {
      console.log(res);
      code.value = res;
    }
  });
});
</script>

<style lang="scss">
.disabled-area {
  cursor: not-allowed;
  position: absolute;
  width: 768px;
  height: 406px;
  top: 180px;
  z-index: 99999999;
  background: #eee;
  opacity: 0.5;
}
</style>
