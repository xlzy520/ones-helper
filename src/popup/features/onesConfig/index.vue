<template>
  <div>
    <div class="layout-slide">
      <div class="flex w-full">
        <n-popconfirm
          negative-text="取消"
          positive-text="确定"
          placement="left-start"
          @positive-click="clearOnesConfig"
        >
          <template #trigger>
            <n-button type="warning">
              恢复默认配置
            </n-button>
          </template>
          恢复从项目配置读取的配置
        </n-popconfirm>
        <n-popconfirm
          negative-text="取消"
          positive-text="确定"
          placement="left-start"
          @positive-click="saveOnesConfig"
        >
          <template #trigger>
            <n-button class="ml-4" type="info">
              保存
            </n-button>
          </template>
          点击会自动重载页面，让修改的配置生效！！
        </n-popconfirm>
      </div>
    </div>
    <n-divider class=""></n-divider>
    <n-alert title="温馨提示" type="info">
      <div>第一次启用插件，若是没有读取到请<b style="color:#db2777">手动刷新页面</b>！！</div>
      <div>构建系统注入到项目一些配置项，提供编辑用于快速调试（不会保存到项目）！</div>
      <div>下面<b style="color:#22c55e">配置项修改后生效</b>需要点击<b style="color:#db2777">保存</b>按钮</div>
    </n-alert>
    <n-divider class=""></n-divider>
    <div class="layout-items-center mb-4">
      <n-input
        v-model:value="filterKey"
        placeholder="搜索配置项，支持清空"
        class="mr-4"
        clearable
        size="large"
        @clear="clearFilterKey"
      />
    </div>
    <div>
    </div>
    <div class="h-[300px] overflow-auto pb-4">
      <div v-for="item in filterConfigFields" :key="item.key" class="layout-items-center py-1 mb-2 flex items-start flex-col">
        <n-card size="small">
          <template #header>
            <div class="flex ">
              <span>配置项：</span>
              <n-tag type="success" class="mr-4">
                {{ item.key }}
              </n-tag>
            </div>
          </template>
          <div class="flex-1 w-full">
            <n-radio-group v-if="item.type === 'platform'" v-model:value="item.value" name="radiogroup1">
              <n-space>
                <n-radio v-for="song in platformOptions" :key="song.value" :value="song.value">
                  {{ song.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
            <n-radio-group v-else-if="item.type === 'boolean'" v-model:value="item.value" name="radiogroup">
              <n-space>
                <n-radio v-for="song in switchOptions" :key="song.value" :value="song.value">
                  {{ song.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
            <n-input
              v-else
              v-model:value="item.value"
              placeholder=""
              class="flex-1"
              clearable
            >
              />
            </n-input>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useMessage, NSwitch, NInput, NSelect, NRadioGroup, NRadio, NSpace,
  NButton, NTag, NPopconfirm, NDivider, NGrid, NGridItem, NCard, NAlert,
} from 'naive-ui'
import { onesConfigService } from '~/service'
import { getCurrentTab } from '~/common/tabs'
import { sendMessage } from '~/common/utils'
import { onesConfig } from '~/common/types'

const filterKey = ref('')
const clearFilterKey = () => {
  filterKey.value = ''
}

const configFields = ref([])

const platformOptions = ['none', 'SaaS', 'private', 'public'].map(value => ({ label: value, value }))
const switchOptions = ['false', 'true'].map(value => ({ label: value, value }))

const filterConfigFields = computed(() => {
  if (!filterKey.value)
    return configFields.value

  return configFields.value.filter(v => v.key.toLowerCase().includes(filterKey.value))
})

const typeMap = {
  'none': 'platform',
  'public': 'platform',
  'private': 'platform',
  'null': 'platform',
  'SaaS': 'platform',

  'true': 'boolean',
  'false': 'boolean',

  '\"false\"': 'boolean',
}

const fetchData = () => {
  getCurrentTab().then(({ url }) => {
    onesConfigService.getOnesConfigApi(true).then((res) => {
      // console.log(res)
      const keys = Object.keys(res)
      const matchKey = keys.find(key => url.includes(key))
      if (matchKey) {
        const config = res[matchKey]
        const configKeys = Object.keys(config)
        configFields.value = configKeys.map((key) => {
          const value = config[key]
          let type = typeMap[value]
          if (!type)
            type = 'input'

          return { key, value, type }
        })
      }
    })
  })
}

const saveData = (onesConfig: any) => {
  sendMessage({
    type: 'onesConfig',
    data: onesConfig,
  })
}

const saveOnesConfig = () => {
  const onesConfig: onesConfig = {}
  configFields.value.forEach((item) => {
    onesConfig[item.key] = item.value
  })

  console.log(toRaw(unref(configFields)))
  onesConfig.isUpdate = true // 标记为用户修改保存过
  saveData(onesConfig)
  window.close()
}

const clearOnesConfig = () => {
  saveData({})
  window.close()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss">
.n-divider:not(.n-divider--vertical){
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
