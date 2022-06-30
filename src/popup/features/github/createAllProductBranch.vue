<template>
  <div class="py-2">
    <div class="layout-items-center">
      <div class="font-bold">一键创建最后一个ONES稳定大版本的所有产品的分支（技术支持组使用）</div>
    </div>
    <div class="mt-2">
      <div class="layout-items-center">
        <n-input
          v-model:value="publishTaskUUID"
          placeholder="不想自动获取，手动输入TaskUUID"
          class="mr-4"
          clearable
          @clear="publishTaskUUID = ''"
        />
        <n-button type="primary" ghost :loading="loading" @click="getAllCommitHash">
          ✨ 点我获取并复制全部产品Hash
        </n-button>
      </div>

      <div class="layout-slide mt-2">
        <n-input
          v-model:value="branchName"
          placeholder="分支名称"
          class="mr-4"
          clearable
          @clear="branchName = ''"
        />
        <n-button
          :disabled="!commitHashResult.length || !branchName"
          type="primary"
          ghost
          :loading="createLoading"
          @click="createAllBranch"
        >
          ✨ 以此创建分支
        </n-button>
      </div>
    </div>
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :style="{ width: '600px' }"
      title="分支创建进度"
      positive-text="确认"
    >
      <div class="result-list">
        <div
          v-for="item in commitHashResult"
          :key="item.name"
          class="layout-items-center switch-row"
        >
          <div class="w-[160px]">
            <n-ellipsis>{{ item.name }}</n-ellipsis>
          </div>
          <div class="w-[80px] ml-4">
            <n-ellipsis>{{ item.hash }}</n-ellipsis>
          </div>
          <div class="ml-4 layout-items-center">
            <template v-if="item.loading">
              <icon-park-outline-loading-one />
              创建中...
            </template>
            <template v-else>
              <icon-park-outline-success v-if="item.success" style="color: #18a058" />
              <div v-else class="layout-items-center">
                <icon-park-outline-error style="color: #ff001c" />
                <span class="ml-2">原因: {{ item.reason }}</span>
              </div>
            </template>
          </div>
        </div>
        <!--          <n-data-table-->
        <!--            :columns="columns"-->
        <!--            :data="commitHashResult"-->
        <!--            max-height="400"-->
        <!--            size="small"-->
        <!--          />-->
      </div>
      <template #action>
        <!--          <n-button type="primary" ghost :loading="loading" @click="showModal = false">-->
        <!--            确定-->
        <!--          </n-button>-->
        <n-button type="primary" ghost :loading="loading" @click="copyAllResult">
          复制全部结果
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { $ref } from 'vue/macros';
import browser from 'webextension-polyfill';
import { fetchPublishVersion, fetchTaskInfo, fetchTasksInfo } from '~/service/request';
import { commitHashResultItem, fieldValueType, Task } from '~/common/types';
import { copyToClipboard } from '~/common/utils';
import { createNewBranch } from '~/service/github';

const message = useMessage();

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
});
let loading = $ref(false);
const createLoading = $ref(false);

const state = reactive({
  GitHubRepoMap: {},
});

const branchName = $ref('');
let showModal = $ref(false);
const columns = [
  {
    title: '产品名',
    key: 'name',
    width: 70,
    align: 'center',
  },
  {
    title: 'Hash值',
    key: 'hash',
    width: 160,
    align: 'center',
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
  },
];

const commitHashResult: commitHashResultItem[] = $ref([]);
const CommitHashKey = '2C3W6Gvp';
const frontCommonCommitHashKey = '_FDxiwrFZ'; // 前端common库hash的属性值
const publishTypeKey = '_A3j2J3q8'; // 发布类型
const publishTaskUUID = ref('');

const handleTaskInfo = (taskUUID: string, frontCommonCommitHash: string) => {
  fetchTaskInfo(taskUUID).then((res) => {
    console.log(res);
    if (!frontCommonCommitHash) {
      frontCommonCommitHash = res.field_values.find(
        (item: fieldValueType) => item.field_uuid === 'FDxiwrFZ'
      ).value;
    }
    console.log(frontCommonCommitHash);
    const related_tasks = res.related_tasks;
    const childComponentUUIDs = related_tasks
      .filter((v: Task) => v.sub_issue_type_uuid)
      .map((v: Task) => v.uuid);
    fetchTasksInfo(childComponentUUIDs).then((res) => {
      console.log(res);
      const tasks = res.tasks;
      tasks.forEach((task: Task) => {
        const fieldValues = task.field_values;
        const result = fieldValues.find((v) => v.field_uuid === CommitHashKey);
        if (result) {
          commitHashResult.push({
            name: task.summary,
            hash: result.value,
            loading: true,
            success: false,
            reason: '',
          });
        }
      });
      if (frontCommonCommitHash) {
        commitHashResult.push({
          name: 'ones-ai-web-common',
          hash: frontCommonCommitHash,
          loading: true,
          success: false,
          reason: '',
        });
      }
      loading = false;
      console.log(unref(commitHashResult));
      const text = commitHashResult.map((v) => {
        return `【${v.name}】: ${v.hash}`;
      });
      copyToClipboard(text.join('\r\n'), false);
      message.success('全部复制成功');
    });
    // console.log(childComponentUUIDs)
  });
};
const getAllCommitHash = () => {
  loading = true;
  if (publishTaskUUID.value) {
    handleTaskInfo(publishTaskUUID.value, '');
  } else {
    fetchPublishVersion().then((res) => {
      let lastMinorStableVersionItem;
      let frontCommonCommitHash = '';
      for (let i = 0; i < res.length; i++) {
        const item = res[i];
        if (lastMinorStableVersionItem) {
          const commonCommitHashItem = item[frontCommonCommitHashKey];
          if (!frontCommonCommitHash && commonCommitHashItem && commonCommitHashItem.length > 20) {
            frontCommonCommitHash = item[frontCommonCommitHashKey];
          }
        }
        if (item[publishTypeKey].value === 'MINOR') {
          lastMinorStableVersionItem = res[i + 1];
        }
      }
      if (lastMinorStableVersionItem) {
        const taskUUID = lastMinorStableVersionItem.uuid;
        handleTaskInfo(taskUUID, frontCommonCommitHash);
        // console.log(lastMinorStableVersionItem)
      }
      // console.log(res, latestMinor)
    });
  }
};

const getProductName = (name = '') => {
  return name.split(' v')[0];
};

const createAllBranch = () => {
  showModal = true;
  commitHashResult.forEach((item, index) => {
    const productName = getProductName(item.name);
    const repoData = state.GitHubRepoMap[productName as keyof typeof state.GitHubRepoMap];
    if (!repoData) {
      item.loading = false;
      item.success = false;
      item.reason = '未找到对应的仓库';
      return;
    }
    console.log(productName, repoData);
    const branch = branchName;
    createNewBranch({
      owner: 'BangWork',
      repo: repoData.repo,
      ref: branch,
      sha: item.hash,
    })
      .then((res) => {
        message.success(`创建${repoData.repo} ${branch}分支成功`);
        item.loading = false;
        item.success = true;
      })
      .catch((err) => {
        message.error(err);
        item.loading = false;
        item.success = false;
        item.reason = err;
      });
  });
};

const copyAllResult = () => {
  const text = commitHashResult.map((v) => {
    let result = '';
    if (v.loading) {
      result = '创建中';
    } else {
      if (v.success) {
        result = '成功';
      } else {
        result = `失败：${v.reason}`;
      }
    }
    return `【${v.name}】: ${v.hash}—— ${result}`;
  });
  copyToClipboard(text.join('\r\n'), false);
  message.success('全部复制成功');
};

const getGitHubRepoMap = () => {
  browser.storage.local.get('GitHubRepoMap').then(({ GitHubRepoMap }) => {
    if (GitHubRepoMap) {
      state.GitHubRepoMap = GitHubRepoMap;
    } else {
      fetchTaskInfo('9tnwZjqBOZOCNBIr').then((res) => {
        const data = JSON.parse(res.desc);
        state.GitHubRepoMap = data;
        browser.storage.local.set({ GitHubRepoMap: data });
      });
    }
  });
};

onMounted(() => {
  getGitHubRepoMap();
});
</script>

<style lang="scss" scoped>
.result-list {
  max-height: 400px;
  overflow: auto;
}
</style>
