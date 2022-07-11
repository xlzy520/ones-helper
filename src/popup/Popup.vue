<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <main class="h-[360px] w-[720px] px-4">
        <n-tabs :value="currentTab" type="line" @update-value="changeTab">
          <template #suffix>
            <div class="cursor-pointer text-blue-500" @click="toOptionsPage">⚙ 菜单配置️</div>
          </template>
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
import Browser from 'webextension-polyfill';
import { featuresConfigService } from '~/service';
import { FeatureItem } from '~/common/types';

const currentTab = ref('API转发');

const filterFeatures = ref([]);

// const style = ref({
//   width: '800px',
// });

const changeTab = (value: string) => {
  currentTab.value = value;
  featuresConfigService.saveCurrentTab(value);
};

const toOptionsPage = () => {
  Browser.tabs.create({
    url: '/dist/options/index.html?tab=功能开关',
  });
};

onMounted(() => {
  featuresConfigService.getCurrentTab().then((res) => {
    currentTab.value = res;
  });
  featuresConfigService.getFeaturesConfig().then((res) => {
    filterFeatures.value = res.filter((feature: FeatureItem) => {
      return feature.show;
    });
  });
});

// todo
// 一键切换账号

// 模拟抛出错误

// 请求结果拦截

// function openOptionsPage() {
//   browser.runtime.openOptionsPage()
// }
</script>
