<template>
  <div>
    <div class="layout-items-center mb-4">
      <n-input
        v-model:value="filterKey"
        placeholder="key"
        class="mr-4"
      />
      <n-button type="primary" @click="clearFilterKey">
        重置
      </n-button>
    </div>
    <div>
    </div>
    <div v-for="item in filterConfigFields" :key="item.key" class="layout-items-center py-1">
      <n-tag type="success" class="mr-4">
        {{ item.key }}
      </n-tag>
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
      />
    </div>
    <div class="fixed right-4 top-50">
      <n-button type="info" size="large" @click="saveOnesConfig">
        保存
      </n-button>
    </div>
  </div>
</template>

<script setup>
import {
  useMessage, NSwitch, NInput, NSelect, NRadioGroup, NRadio, NSpace,
  NButton, NTag, NPopconfirm,
} from 'naive-ui'
import { onesConfigService } from '~/service'
import { getCurrentTab } from '~/common/tabs'
import { CustomApiChange } from '~/common/message_type'

const filterKey = ref('')
const clearFilterKey = () => {
  filterKey.value = ''
}

// const config = ref({})
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
  onesConfigService.getOnesConfigApi().then((res) => {
    configFields.value = Object.keys(res).map((key) => {
      const value = res[key]
      let type = typeMap[value]
      if (!type)
        type = 'input'

      return { key, value, type }
    })
    console.log(res)
  })
}

const saveOnesConfig = () => {
  const onesConfig = {}
  configFields.value.forEach((item) => {
    onesConfig[item.key] = item.value
  })

  console.log(toRaw(unref(configFields)))
  onesConfigService.saveOnesConfigApi(onesConfig).then((res) => {
    getCurrentTab().then((tab) => {
      const { id } = tab
      if (id) {
        browser.tabs.sendMessage(id, {
          type: 'onesConfig',
          data: onesConfig,
        })
      }
    })
    // window.close()
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss">

</style>
