<template>
  <div>
    <div class="layout-slide">
      <!--      <n-select-->
      <!--        v-model:value="domains.value"-->
      <!--        filterable-->
      <!--        :options="domains.options"-->
      <!--        @update:value="changeDomain"-->
      <!--      />-->
      <n-button class="" type="info" @click="saveOnesConfig">
        保存
      </n-button>
      <n-button class="ml-4" @click="clearOnesConfig">
        清空全部域下的ONES Config
      </n-button>
    </div>
    <n-divider class=""></n-divider>
    <n-alert title="温馨提示" type="info">
      构建系统注入到项目一些配置项，提供编辑用于快速调试
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
    <!--    <div class="fixed right-4 top-50">-->
    <!--      <n-button type="info" size="large" @click="saveOnesConfig">-->
    <!--        保存-->
    <!--      </n-button>-->
    <!--    </div>-->
  </div>
</template>

<script setup>
import {
  useMessage, NSwitch, NInput, NSelect, NRadioGroup, NRadio, NSpace,
  NButton, NTag, NPopconfirm, NDivider, NGrid, NGridItem, NCard, NAlert,
} from 'naive-ui'
import { onesConfigService } from '~/service'
import { getCurrentTab } from '~/common/tabs'
import { CustomApiChange } from '~/common/message_type'

const filterKey = ref('')
const clearFilterKey = () => {
  filterKey.value = ''
}

// const config = ref({})
const domains = reactive({
  value: '',
  options: [],
})
const changeDomain = (value, option) => {
  domains.value = value
  // domains. = option.config
  // console.log(toRaw(unref(selectedConfig)))
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
      console.log(res)
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

const saveData = (onesConfig) => {
  getCurrentTab().then((tab) => {
    const { id } = tab
    if (id) {
      browser.tabs.sendMessage(id, {
        type: 'onesConfig',
        data: onesConfig,
      })
    }
  })
}

const saveOnesConfig = () => {
  const onesConfig = {}
  configFields.value.forEach((item) => {
    onesConfig[item.key] = item.value
  })

  console.log(toRaw(unref(configFields)))
  saveData(onesConfig)
}

const clearOnesConfig = () => {
  saveData({})
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
