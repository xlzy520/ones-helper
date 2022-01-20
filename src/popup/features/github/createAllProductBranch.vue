<template>
  <div class="py-2">
    <div class="layout-items-center">
      <div class="font-bold">
        一键创建最后一个ONES稳定大版本的所有产品的分支（技术支持组使用）
      </div>
    </div>
    <div class="mt-2">
      <n-button type="primary" ghost :loading="loading" @click="getAllCommitHash">
        ✨ 先点我获取并复制全部产品Hash
      </n-button>
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
      :style="{width:'600px'}"
      title="分支创建进度"
      positive-text="确认"
    >
      <div class="">
        <div v-for="item in commitHashResult" :key="item.name" class="layout-items-center switch-row">
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
import { useMessage } from 'naive-ui'
import { $ref } from 'vue/macros'
import { fetchPublishVersion, fetchTaskInfo, fetchTasksInfo } from '~/service/graphql'
import { commitHashResultItem, Task } from '~/common/types'
import { copyToClipboard } from '~/common/utils'
import { GitHubRepoMap } from '~/common/constants'
import { createNewBranch } from '~/service/github'

const message = useMessage()

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
})
let loading = $ref(false)
const createLoading = $ref(false)

const branchName = $ref('')
let showModal = $ref(false)
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
]

const commitHashResult: commitHashResultItem[] = $ref([
  {
    name: 'ONES Demo v1.0.1',
    hash: 'bf33a2ea6fb1e8bb29587b823f7d80edbc007b8a',
  },
  // {
  //   name: 'ONES Mapper Attachments v1.0.5',
  //   hash: '4f994af95e7de62a74388d13f7694d3decbc6609',
  // },
  // {
  //   name: 'ONES Web Gateway v1.0.1',
  //   hash: 'dbacd944c4c679097bdf10fc964baa09dcdc1d3d',
  // },
  // {
  //   name: 'ONES CRM v2.2.10',
  //   hash: '8a7c07d067c40818cd81f496466a69b566591d6c',
  // },
  // {
  //   name: 'ONES Purchase for Web v0.0.6',
  //   hash: 'b5285412de99ba5896c1277592caec489bd18ca7',
  // },
  // {
  //   name: 'ONES CMD Proxy Service v0.1.6',
  //   hash: '6b87db71d720e16006d15cc026ac4135e1113e40',
  // },
  // {
  //   name: 'ONES Manual v1.17.11',
  //   hash: '1361386d5f42139e231e54e8da63c2ce6d15fc21',
  // },
  // {
  //   name: 'ONES DevOps API v1.6.5',
  //   hash: '1a7798d77cd73f332f2fd3f26114210f8e2fac3f',
  // },
  // {
  //   name: 'ONES Binlog Event Sync v1.4.0',
  //   hash: '86cb8ebfffadf01e9634c5ffc73ff52230473b9e',
  // },
  // {
  //   name: 'ONES Purchase API v0.1.0',
  //   hash: 'c4e5383488d5583a6a2eafc415037e7f0b66cde7',
  // },
  // {
  //   name: 'ONES Host Java v0.1.0',
  //   hash: '2b63545c24a2ed668e1f38d31dd2240e2329f243',
  // },
  // {
  //   name: 'ONES Official Website v4.13.27',
  //   hash: 'b51b9ed40f4b48d3177a881faec77497cb49d385',
  // },
  // {
  //   name: 'ONES Mobile Web v3.5.1',
  //   hash: '3c39df90f2e6752d3e95a03764c98e2c6df46e99',
  // },
  // {
  //   name: 'ONES AI Docker v3.10.5',
  //   hash: '2bad8f3ccf4c4bf38d715caddf5b65a27b577bdc',
  // },
  // {
  //   name: 'ONES Plugin Host v1.1.4',
  //   hash: '5995693b2f0c32cc362242748a1d24adfcf9982a',
  // },
  // {
  //   name: 'ONES Plugin Platform v0.1.9',
  //   hash: '120b7066d5c5ee890f6d23e69ce3f0c48576ea98',
  // },
  // {
  //   name: 'ONES Wiki for Web v1.68.7',
  //   hash: '4dcef83ed90916b5678c22269b14d8b20bc8165c',
  // },
  // {
  //   name: 'ONES Wiki API v1.68.2',
  //   hash: '1b8b18fce2fd9e9a6798418f81cadd37172a53ec',
  // },
  // {
  //   name: 'ONES Audit Log v3.3.5',
  //   hash: 'dcbb9f9e0cc90350768351759e11144d0ba5b954',
  // },
  // {
  //   name: 'ONES Third Importer v1.1.6',
  //   hash: '289102a98ef1b8c323e3b9012dc130a1f30e214b',
  // },
  // {
  //   name: 'ONES Superset v0.2.1',
  //   hash: '28fe6b14ea405b665dfc41b10346ec84e70beabd',
  // },
  // {
  //   name: 'ONES Project for Web v3.4.20',
  //   hash: 'de71a0e90ebd87b30dbbee9347a5327e1494bc98',
  //   loading: true,
  //   success: false,
  // },
  // {
  //   name: 'ONES BI Sync v0.2.4',
  //   hash: '5fa3175859ba2ca45047c7d2910bd9779bb216f4',
  // },
  // {
  //   name: 'ONES Hostboot v1.0.1',
  //   hash: '70754f69dbc029d7cd48751f9c8d90a2e0614284',
  // },
  // {
  //   name: 'ONES Host NodeJs v1.0.2',
  //   hash: '55b19bb9ad84a684777deee6f9f2bba96f91a67c',
  // },
  {
    name: 'ONES Project API v3.4.19',
    hash: 'cf8d8e123c230faf88b7715cb1fc3a1b743382bf',
    loading: true,
    success: false,
  },
  // {
  //   name: 'ONES Official Website Blog CMS v1.0.37',
  //   hash: 'b4fe926d14b5a8dea1a498ef26539180565d194e',
  // },
])
const CommitHashKey = '2C3W6Gvp'
const frontCommonCommitHashKey = '_FDxiwrFZ' // 前端common库hash的属性值
const publishTypeKey = '_A3j2J3q8' // 发布类型
const getAllCommitHash = () => {
  loading = true
  fetchPublishVersion().then((res) => {
    let lastMinorStableVersionItem
    let frontCommonCommitHash = ''
    for (let i = 0; i < res.length; i++) {
      const item = res[i]
      if (lastMinorStableVersionItem) {
        const commonCommitHashItem = item[frontCommonCommitHashKey]
        if (!frontCommonCommitHash && commonCommitHashItem && commonCommitHashItem.length > 20) {
          frontCommonCommitHash = item[frontCommonCommitHashKey]
        }
      }
      if (item[publishTypeKey].value === 'MINOR') {
        lastMinorStableVersionItem = res[i + 1]
      }
    }
    if (lastMinorStableVersionItem) {
      const taskUUID = lastMinorStableVersionItem.uuid
      fetchTaskInfo(taskUUID).then((res) => {
        console.log(res)
        const related_tasks = res.related_tasks
        const childComponentUUIDs = related_tasks.filter(v => v.sub_issue_type_uuid).map(v => v.uuid)
        fetchTasksInfo(childComponentUUIDs).then((res) => {
          console.log(res)
          const tasks = res.tasks
          tasks.forEach((task) => {
            const fieldValues = task.field_values
            const result = fieldValues.find(v => v.field_uuid === CommitHashKey)
            if (result) {
              commitHashResult.push({
                name: task.summary,
                hash: result.value,
                loading: true,
                success: false,
                reason: '',
              })
            }
          })
          if (frontCommonCommitHash) {
            commitHashResult.push({
              name: 'ones-ai-web-common',
              hash: frontCommonCommitHash,
              loading: true,
              success: false,
              reason: '',
            })
          }
          loading = false
          console.log(unref(commitHashResult))
          const text = commitHashResult.map((v) => {
            return `【${v.name}】: ${v.hash}`
          })
          copyToClipboard(text.join('\r\n'), false)
          message.success('全部复制成功')
        })
        // console.log(childComponentUUIDs)
      })
      // console.log(lastMinorStableVersionItem)
    }
    // console.log(res, latestMinor)
  })
}

const getProductName = (name = '') => {
  return name.split(' v')[0]
}

const createAllBranch = () => {
  showModal = true
  commitHashResult.forEach((item, index) => {
    const productName = getProductName(item.name)
    const repoData = GitHubRepoMap[productName]
    console.log(productName, repoData)
    const branch = branchName
    createNewBranch({
      owner: 'BangWork',
      repo: repoData.repo,
      ref: branch,
      sha: item.hash,
    }).then((res) => {
      message.success(`创建${repoData.repo} ${branch}分支成功`)
      item.loading = false
      item.success = true
    }).catch((err) => {
      message.error(err)
      item.loading = false
      item.success = false
      item.reason = err
    })
  })
}

const copyAllResult = () => {
  const text = commitHashResult.map((v) => {
    let result = ''
    if (v.loading) {
      result = '创建中'
    }
    else {
      if (v.success) {
        result = '成功'
      }
      else {
        result = `失败：${v.reason}`
      }
    }
    return `【${v.name}】: ${v.hash}—— ${result}`
  })
  copyToClipboard(text.join('\r\n'), false)
  message.success('全部复制成功')
}

</script>

<style lang="scss" scoped>

</style>
