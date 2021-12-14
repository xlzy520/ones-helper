<template>
  <div class="py-5">
    <n-form
      ref="formRef"
      :model="formValue"
      label-placement="left"
      :label-width="135"
    >
      <n-grid>
        <n-form-item-grid-item :span="22" label="配置" path="preset">
          <n-select
            v-model:value="formValue.preset"
            filterable
            :options="formValue.presetOptions"
            :render-label="renderLabel"
            @update:value="handleUpdatePresetValue"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item
          v-if="selectedConfig.isHost"
          :span="22"
          label="API Host"
          path="customONESApiHost"
        >
          <n-input
            v-model:value="selectedConfig.customONESApiHost"
            :disabled="!isCustom"
            :placeholder="isCustom?'输入Host':'点击另存为创建自定义配置'"
            clearable
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item
          v-if="selectedConfig.isBranch"
          :span="22"
          label="API Branch"
          path="customONESApiProjectBranch"
        >
          <n-input
            v-model:value="selectedConfig.customONESApiProjectBranch"
            :disabled="!isCustom"
            :placeholder="isCustom?'输入分支名':'点击另存为创建自定义配置'"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="是否在页面展示提示" path="showCustomApi">
          <n-tooltip placement="right" trigger="hover">
            <template #trigger>
              <n-switch v-model:value="formValue.showCustomApi" class="" />
            </template>
            <p>网站页面右下角会有一块悬浮区域，</p><p>显示当前页面的自定义API配置信息</p>
          </n-tooltip>
        </n-form-item-grid-item>

        <!--        <n-form-item-grid-item :span="24" label="Wiki API Branch" path="customONESApiWikiBranch">-->
        <!--          <n-input v-model:value="formValue.selectedConfig.customONESApiWikiBranch" placeholder="输入Wiki的分支" />-->
        <!--        </n-form-item-grid-item>-->
        <n-form-item-grid-item :span="22" label=" ">
          <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
              <n-button class="ml-4 flex-1" type="info" @click="onSubmitClick">
                保存
              </n-button>
            </template>
            点击则配置立即生效
          </n-tooltip>
          <n-tooltip v-if="!isCustom" placement="bottom" trigger="hover">
            <template #trigger>
              <n-button class="ml-4 flex-1" type="info" @click="onSaveAs">
                另存为
              </n-button>
            </template>
            点击另存为则基于选中的配置自定义
          </n-tooltip>

          <n-popconfirm
            v-if="isCustom"
            negative-text="取消"
            positive-text="确定"
            @positive-click="onDelete"
          >
            <template #trigger>
              <n-button class="ml-4 flex-1" type="error">
                删除
              </n-button>
            </template>
            确认删除吗？
          </n-popconfirm>
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <n-alert title="温馨提示" type="info">
      这里快速配置接口请求跳转的域，开发或者线上
    </n-alert>
    <n-modal
      v-model:show="newPreset.showModal"
      preset="dialog"
      title="另存为新的预设"
      positive-text="确认"
      @positive-click="onSubmitNewPreset"
    >
      <n-input v-model:value="newPreset.name" placeholder="输入新的预设名" />
    </n-modal>
  </div>
</template>

<script setup lang="tsx">
import {
  NForm, NInput, NSelect, NSwitch,
  NButton, NGrid, NFormItemGridItem, NModal, NTag, NPopconfirm, NAlert, NTooltip,
} from 'naive-ui'
import { DefaultPresetOptions } from '~/common/constants'
import { customApiService } from '~/service'

interface Option {
  config: any
  label: string
  value: string
}

const renderLabel = (option: Option) => {
  const { custom } = option.config || {}
  const tagName = custom ? '自定义请求头指向' : '内置请求头指向'
  const tagType = custom ? 'info' : ''
  return (
    <div>
      <NTag size="small" type={tagType}>{tagName}</NTag>
      <span className="ml-4">{option.label}</span>
    </div>
  )
}

const selectedConfig = ref({
  customONESApiHost: '',
  customONESApiProjectBranch: '',
  custom: false,
})

const formValue = reactive({
  preset: '',
  showCustomApi: true,
  customApiPatterns: null,
  presetOptions: DefaultPresetOptions,
})

const isCustom = computed(() => selectedConfig.value.custom)

const setFormValue = (data, handlePreset = true) => {
  const { preset, presetOptions, customApiPatterns, showCustomApi } = data
  formValue.presetOptions = presetOptions
  formValue.preset = preset
  formValue.customApiPatterns = customApiPatterns
  formValue.showCustomApi = showCustomApi
  selectedConfig.value = presetOptions.find((v: Option) => v.value === preset).config
}

const syncFormData = async() => {
  const customApiData = await customApiService.getCustomApi()
  setFormValue(customApiData)
}

const handleUpdatePresetValue = (value: string, option: Option) => {
  formValue.preset = value
  selectedConfig.value = option.config
  customApiService.saveCustomApi(toRaw(formValue))
  console.log(toRaw(unref(selectedConfig)))
}

const trim = () => {
  selectedConfig.value.customONESApiHost = selectedConfig.value.customONESApiHost.trim()
  selectedConfig.value.customONESApiProjectBranch = selectedConfig.value.customONESApiProjectBranch.trim()
}

const onSubmitClick = (shouldClose = true) => {
  trim()
  console.log(toRaw(formValue))
  customApiService.saveCustomApi(toRaw(formValue))
    .then(() => {
      if (shouldClose)
        window.close()
    })
}

const newPreset = reactive({
  showModal: false,
  name: '',
})
const onSaveAs = () => {
  newPreset.showModal = true
}
const onDelete = () => {
  const index = formValue.presetOptions.findIndex(v => v.value === formValue.preset)
  formValue.presetOptions.splice(index, 1)
  formValue.preset = formValue.presetOptions[0].value
  setFormValue(formValue)
  onSubmitClick(false)
}
const onSubmitNewPreset = () => {
  const name = newPreset.name
  const preset = {
    label: name,
    value: name,
    config: {
      ...selectedConfig.value,
      custom: true,
    },
  }
  formValue.presetOptions.unshift(preset)
  formValue.preset = name
  selectedConfig.value = preset.config
  newPreset.name = ''
  onSubmitClick(false)
}

onMounted(() => {
  syncFormData()
})

</script>

<style lang="scss">
.n-base-select-menu .n-scrollbar, .n-base-select-menu .n-virtual-list{
  max-height: 200px;
}
</style>
