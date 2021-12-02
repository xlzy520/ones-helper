<template>
  <div class="py-5">
    <n-form
      ref="formRef"
      :model="formValue"
      label-placement="left"
      :label-width="135"
    >
      <n-grid>
        <n-form-item-grid-item :span="22" label="配置预设" path="preset">
          <n-select
            v-model:value="formValue.preset"
            filterable
            :options="formValue.presetOptions"
            :render-label="renderLabel"
            @update:value="handleUpdatePresetValue"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="API Host" path="customONESApiHost">
          <n-input
            v-model:value="selectedConfig.customONESApiHost"
            :disabled="!isCustom"
            :placeholder="isCustom?'输入Host':'点击另存为创建自定义配置'"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="Project API Branch" path="customONESApiProjectBranch">
          <n-input
            v-model:value="selectedConfig.customONESApiProjectBranch"
            :disabled="!isCustom"
            :placeholder="isCustom?'输入Project的分支':'点击另存为创建自定义配置'"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="是否在页面展示提示" path="showCustomApi">
          <n-switch v-model:value="formValue.showCustomApi" class="" />
        </n-form-item-grid-item>

        <!--        <n-form-item-grid-item :span="24" label="Wiki API Branch" path="customONESApiWikiBranch">-->
        <!--          <n-input v-model:value="formValue.selectedConfig.customONESApiWikiBranch" placeholder="输入Wiki的分支" />-->
        <!--        </n-form-item-grid-item>-->
        <n-form-item-grid-item :span="22" label=" ">
          <n-button class="ml-4 w-full" type="info" @click="onSubmitClick">
            保存
          </n-button>
          <n-button v-if="!isCustom" class="ml-4 w-full" type="info" @click="onSaveAs">
            另存为预设
          </n-button>
          <n-popconfirm
            negative-text="取消"
            positive-text="确定"
            @positive-click="onDelete"
          >
            <template #trigger>
              <n-button v-if="isCustom" class="ml-4 w-full" type="error">
                删除
              </n-button>
            </template>
            确认删除吗？
          </n-popconfirm>
        </n-form-item-grid-item>
      </n-grid>
    </n-form>

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
  useMessage, NForm, NInput, NSelect, NSwitch,
  NButton, NGrid, NFormItemGridItem, NModal, NTag, NPopconfirm,
} from 'naive-ui'
import { DefaultPresetOptions } from '~/common/constants'
import { customApiService } from '~/service'

const message = useMessage()

interface Option {
  config: any
  label: string
}

const renderLabel = (option: Option) => {
  const { custom } = option.config || {}
  const tagName = custom ? '自定义' : '内置'
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
  selectedConfig.value = presetOptions.find((v: Option) => v.label === preset).config
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

const onSubmitClick = (shouldClose = true) => {
  // console.log(toRaw(formValue))
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
  const index = formValue.presetOptions.findIndex(v => v.label === formValue.preset)
  formValue.presetOptions.splice(index, 1)
  formValue.preset = formValue.presetOptions[0].label
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
