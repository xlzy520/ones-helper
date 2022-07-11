<template>
  <div class="pb-5">
    <div class="action-bar layout-slide">
      <div class="layout-items-center">
        <div class="layout-items-center">
          <div class="mr-4">代理开关：</div>
          <n-switch v-model:value="proxyConfig.proxyEnable" class="" @change="changeProxyConfig" />
        </div>
        <div class="layout-items-center ml-6">
          <div class="mr-4">提示开关：</div>
          <n-tooltip placement="right" trigger="hover">
            <template #trigger>
              <n-switch
                v-model:value="proxyConfig.showCustomApi"
                class=""
                @change="changeProxyConfig"
              />
            </template>
            <p>网站页面右下角会有一块悬浮区域，</p>
            <p>显示当前页面的自定义API配置信息</p>
          </n-tooltip>
        </div>
      </div>
      <div class="cursor-pointer text-blue-500" @click="toOptionsPage">⚙ API匹配规则配置️</div>

      <!--      <div class="layout-items-center ml-6">-->
      <!--        <div class="mr-4">强制覆盖URL：</div>-->
      <!--        <n-tooltip placement="right" trigger="hover">-->
      <!--          <template #trigger>-->
      <!--            <n-switch-->
      <!--              v-model:value="proxyConfig.forceReplace"-->
      <!--              class=""-->
      <!--              @change="changeProxyConfig"-->
      <!--            />-->
      <!--          </template>-->
      <!--          <p>开启之后会强制替换请求的URL地址</p>-->
      <!--        </n-tooltip>-->
      <!--      </div>-->
    </div>
    <n-divider />
    <div class="">
      <n-form ref="formRef" :model="formValue" label-placement="left" :label-width="75">
        <n-grid>
          <n-form-item-grid-item :span="22" label="配置" path="preset">
            <n-select
              v-model:value="formValue.preset"
              filterable
              :options="formValue.presetOptions"
              :render-label="renderLabel"
              :disabled="!proxyConfig.proxyEnable"
              @change="handleUpdatePresetValue"
            />
            <!--            <plus-icon class="ml-2" />-->
          </n-form-item-grid-item>
          <n-form-item-grid-item
            v-if="selectedConfig.isHost"
            :span="22"
            label="API地址"
            path="customONESApiHost"
          >
            <n-input
              v-model:value="selectedConfig.customONESApiHost"
              :disabled="!isCustom || !proxyConfig.proxyEnable"
              :placeholder="isCustom ? '输入API 域名' : '点击另存为创建自定义配置'"
              clearable
            />
          </n-form-item-grid-item>
          <n-form-item-grid-item
            v-if="selectedConfig.isBranch"
            :span="22"
            label="API分支"
            path="customONESApiProjectBranch"
          >
            <n-input
              v-model:value="selectedConfig.customONESApiProjectBranch"
              :disabled="!isCustom || !proxyConfig.proxyEnable"
              :placeholder="isCustom ? '输入分支名' : '点击另存为创建自定义配置'"
            />
          </n-form-item-grid-item>
          <n-form-item-grid-item :span="22" label="WS地址" path="websocket">
            <n-input
              v-model:value="selectedConfig.websocket"
              :disabled="!proxyConfig.proxyEnable"
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
          <n-form-item-grid-item :span="22" label=" ">
            <!--            <n-tooltip placement="bottom" trigger="hover">-->
            <!--              <template #trigger>-->
            <!--                <n-button-->
            <!--                  :disabled="disabled"-->
            <!--                  class="ml-4 flex-1"-->
            <!--                  type="info"-->
            <!--                  @click="onSubmitClick"-->
            <!--                >-->
            <!--                  保存-->
            <!--                </n-button>-->
            <!--              </template>-->
            <!--              点击则配置立即生效-->
            <!--            </n-tooltip>-->
            <n-tooltip v-if="!isCustom" placement="bottom" trigger="hover">
              <template #trigger>
                <n-button class="" type="info" @click="onSaveAs"> 另存为 </n-button>
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
                <n-button :disabled="!proxyConfig.proxyEnable" class="" type="error">
                  删除
                </n-button>
              </template>
              确认删除该自定义配置吗？
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
    </div>

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
import { NTag, NTooltip, useMessage } from 'naive-ui';
import { Ref } from 'vue-demi';
import Browser from 'webextension-polyfill';
import { isEmpty } from 'lodash-es';
import { useDebounceFn } from '@vueuse/core';
import { sendMessage } from '~/common/utils';
import { DefaultPresetOptions } from '~/common/constants';
import { customApiService } from '~/service';
import { PresetOption, PresetOptionConfig } from '~/service/custom_api';
import PlusIcon from '~/components/plus-icon.vue';

const message = useMessage();

const renderLabel = (option: PresetOption) => {
  if (!option.config) {
    return;
  }
  const { custom } = option.config;
  const tagName = custom ? '自定义' : '内置';
  const tagType = custom ? 'info' : 'default';
  const slots = {
    trigger: () => (
      <NTag size="small" type={tagType}>
        {tagName}
      </NTag>
    ),
  };
  return (
    <div>
      <NTooltip placement="top-start" v-slots={slots}>
        <span>
          {custom
            ? '自定义请求头指向，更加灵活的设置转发域或者分支'
            : '预设的一些配置，直接让请求转发到对应的域或者后端分支'}
        </span>
      </NTooltip>
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

const proxyConfig: Ref = ref({
  proxyEnable: true,
  showCustomApi: true,
  // forceReplace: false,
});

const changeProxyConfig = () => {
  Browser.storage.local
    .set({
      proxyConfig: toRaw(proxyConfig.value),
    })
    .then((res) => {
      message.success('代理配置已更新');
      const messageData = {
        type: 'proxyConfigUpdate',
        data: toRaw(proxyConfig.value),
      };
      sendMessage(messageData);
      Browser.runtime.sendMessage(messageData);
    });
};

const toOptionsPage = () => {
  Browser.tabs.create({
    url: '/dist/options/index.html?tab=API转发',
  });
};

const setFormValue = (data: any) => {
  const { preset, presetOptions, customApiPatterns } = data;
  formValue.presetOptions = presetOptions;
  formValue.preset = preset;
  formValue.customApiPatterns = customApiPatterns;
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
  console.log(toRaw(selectedConfig.value));
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
    if (shouldClose) {
      window.close();
    }
  });
};

const handleFormValueUpdate = useDebounceFn(() => {
  customApiService.saveCustomApi(toRaw(formValue));
}, 500);

watch(formValue, handleFormValueUpdate);

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
  const preset: any = {
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

const asyncProxyConfig = () => {
  Browser.storage.local.get('proxyConfig').then(({ proxyConfig: config }) => {
    if (config) {
      proxyConfig.value = config;
    }
  });
};

onMounted(() => {
  asyncProxyConfig();
  syncFormData();
});
</script>

<style lang="scss">
.n-base-select-menu .n-scrollbar,
.n-base-select-menu .n-virtual-list {
  max-height: 200px;
}
</style>
