<template>
  <n-message-provider>
    <div class="container m-auto mt-2">
      <n-tabs size="large" :default-value="defaultTab" type="card">
        <n-tab-pane
          v-for="item in settingOptions"
          :key="item.name"
          :name="item.name"
          :tab="item.name"
        >
          <component :is="item.component"></component>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider, NTabs, NTabPane } from 'naive-ui';
import CustomApi from '~/options/custom_api/index.vue';
import FeaturesConfig from '~/options/features_config/index.vue';

const settingOptions = reactive([
  {
    name: 'API转发',
    component: CustomApi,
  },
  {
    name: '功能开关',
    component: FeaturesConfig,
  },
]);
const defaultTab = ref('API转发');
</script>
