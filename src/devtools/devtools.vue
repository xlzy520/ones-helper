<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <main class="h-[360px] px-4 w-full">
        <n-tabs :default-value="defaultTab" type="line">
          <n-tab-pane
            v-for="item in filterFeatures"
            :key="item.name"
            :name="item.name"
            :tab="item.name"
          >
            <component :is="item.component"></component>
          </n-tab-pane>
        </n-tabs>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<script></script>

<script setup lang="ts">
import { NMessageProvider, NTabs, NTabPane, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';

const defaultTab = ref('通用信息');

const filterFeatures = ref([
  {
    name: '通用信息',
    component: 'CommonInfo',
  },
]);
onMounted(() => {});
</script>
