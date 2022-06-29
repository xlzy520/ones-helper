<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <main class="h-[360px] px-4 w-full">
        <n-tabs :default-value="defaultTab" type="line" :on-update:value="updateActiveTab">
          <n-tab-pane
            v-for="item in routes"
            :key="item.name"
            :name="item.name"
            :tab="item.meta.title"
          >
          </n-tab-pane>
        </n-tabs>
        <router-view />
      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<script></script>

<script setup lang="ts">
import { NMessageProvider, NTabs, NTabPane, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
const routes = computed(() => {
  return router.options.routes;
});
const defaultTab = 'Tools';

const updateActiveTab = (val: string) => {
  router.push(`/${val}`);
};

onMounted(() => {
  updateActiveTab(defaultTab);
});
</script>
