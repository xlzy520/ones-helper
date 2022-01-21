<template>
  <div class="py-5">
    <n-form ref="formRef" :model="formValue" label-placement="left" :label-width="75">
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
            :placeholder="isCustom ? '输入Host' : '点击另存为创建自定义配置'"
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
            :placeholder="isCustom ? '输入分支名' : '点击另存为创建自定义配置'"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="ws地址" path="websocket">
          <n-input
            v-model:value="selectedConfig.websocket"
            placeholder="自定义websocket地址, 如果不填则使用插件默认配置"
          />
          <n-tooltip placement="right" trigger="hover">
            <template #trigger>
              <question-icon class="ml-2" />
            </template>
            <p>dev格式: wss://dev.myones.net/wiki/B1002</p>
            <p>local格式: ws://dev.localhost:3000</p>
          </n-tooltip>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label="提示" path="showCustomApi">
          <n-tooltip placement="right" trigger="hover">
            <template #trigger>
              <n-switch v-model:value="formValue.showCustomApi" class="" />
            </template>
            <p>网站页面右下角会有一块悬浮区域，</p>
            <p>显示当前页面的自定义API配置信息</p>
          </n-tooltip>
        </n-form-item-grid-item>

        <!--        <n-form-item-grid-item :span="24" label="Wiki API Branch" path="customONESApiWikiBranch">-->
        <!--          <n-input v-model:value="formValue.selectedConfig.customONESApiWikiBranch" placeholder="输入Wiki的分支" />-->
        <!--        </n-form-item-grid-item>-->
        <n-form-item-grid-item :span="22" label=" ">
          <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
              <n-button class="ml-4 flex-1" type="info" @click="onSubmitClick"> 保存 </n-button>
            </template>
            点击则配置立即生效
          </n-tooltip>
          <n-tooltip v-if="!isCustom" placement="bottom" trigger="hover">
            <template #trigger>
              <n-button class="ml-4 flex-1" type="info" @click="onSaveAs"> 另存为 </n-button>
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
              <n-button class="ml-4 flex-1" type="error"> 删除 </n-button>
            </template>
            确认删除吗？
          </n-popconfirm>
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <n-alert title="温馨提示" type="info">
      {{
        isLocal
          ? '由于options请求问题，需要在本地nginx配置如下代码'
          : '这里快速配置接口请求跳转的域，开发或者线上'
      }}
      <pre v-if="isLocal">
server {
  listen      9002;
  server_name localhost;

  # reverse proxy
  location / {
    if ($request_method = 'OPTIONS') {
    return 200;
    }
    proxy_pass http://localhost:9001;
  }
}</pre
      >
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
import { Ref } from 'vue-demi';
import { DefaultPresetOptions } from '~/common/constants';
import { customApiService } from '~/service';
import { PresetOption, PresetOptionConfig } from '~/service/custom_api';

const renderLabel = (option: PresetOption) => {
  if (!option.config) {
    return;
  }
  const { custom } = option.config;
  const tagName = custom ? '自定义请求头指向' : '内置请求头指向';
  const tagType = custom ? 'info' : '';
  return (
    <div>
      <n-tag size="small" type={tagType}>
        {tagName}
      </n-tag>
      <span className="ml-4">{option.label}</span>
    </div>
  );
};

const selectedConfig: Ref<PresetOptionConfig> = ref({
  customONESApiHost: '',
  customONESApiProjectBranch: '',
  websocket: '',
  custom: false,
  isBranch: false,
});

const formValue = reactive({
  preset: '',
  showCustomApi: true,
  customApiPatterns: null,
  presetOptions: DefaultPresetOptions,
});
const isLocal = computed(() => {
  return formValue.preset.includes('本地后端');
});

const isCustom = computed(() => selectedConfig.value.custom);

const setFormValue = (data) => {
  const { preset, presetOptions, customApiPatterns, showCustomApi } = data;
  formValue.presetOptions = presetOptions;
  formValue.preset = preset;
  formValue.customApiPatterns = customApiPatterns;
  formValue.showCustomApi = showCustomApi;
  selectedConfig.value = presetOptions.find((v: PresetOption) => v.value === preset).config;
};

const syncFormData = async () => {
  const customApiData = await customApiService.getCustomApi();
  setFormValue(customApiData);
};

const handleUpdatePresetValue = (value: string, option: PresetOption) => {
  formValue.preset = value;
  selectedConfig.value = {
    ...option.config,
    websocket: option.config.websocket ?? '',
  };
  customApiService.saveCustomApi(toRaw(formValue));
  console.log(toRaw(unref(selectedConfig)));
};

const trim = () => {
  selectedConfig.value.customONESApiHost = selectedConfig.value.customONESApiHost.trim();
  selectedConfig.value.customONESApiProjectBranch =
    selectedConfig.value.customONESApiProjectBranch.trim();
};

const onSubmitClick = (shouldClose = true) => {
  trim();
  console.log(toRaw(formValue));
  customApiService.saveCustomApi(toRaw(formValue)).then(() => {
    if (shouldClose) window.close();
  });
};

const newPreset = reactive({
  showModal: false,
  name: '',
});
const onSaveAs = () => {
  newPreset.showModal = true;
};
const onDelete = () => {
  const index = formValue.presetOptions.findIndex((v) => v.value === formValue.preset);
  formValue.presetOptions.splice(index, 1);
  formValue.preset = formValue.presetOptions[0].value;
  setFormValue(formValue);
  onSubmitClick(false);
};
const onSubmitNewPreset = () => {
  const name = newPreset.name;
  const preset = {
    label: name,
    value: name,
    config: {
      ...selectedConfig.value,
      custom: true,
    },
  };
  formValue.presetOptions.unshift(preset);
  formValue.preset = name;
  selectedConfig.value = preset.config;
  newPreset.name = '';
  onSubmitClick(false);
};

onMounted(() => {
  syncFormData();
});
</script>

<style lang="scss">
.n-base-select-menu .n-scrollbar,
.n-base-select-menu .n-virtual-list {
  max-height: 200px;
}
</style>
