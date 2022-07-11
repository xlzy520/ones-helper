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

const location = window.location;
const url = new URL(location.href);
const defaultTab = url.searchParams.get('tab') || 'API转发';

const settingOptions = reactive([
  {
    name: '功能开关',
    component: FeaturesConfig,
  },
  {
    name: 'API转发',
    component: CustomApi,
  },
]);
</script>
