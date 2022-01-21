<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <main class="h-[360px] px-4" :style="style">
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
import { featuresConfigService } from '~/service';

const defaultTab = ref('API转发');

const filterFeatures = ref([]);

const style = ref({
  width: '500px',
});

onMounted(() => {
  featuresConfigService.getFeaturesConfig().then((res) => {
    filterFeatures.value = res.filter((feature) => {
      if (feature.show) {
        if (feature.name === '工时') {
          style.value.width = '800px';
        }
        return true;
      }

      return false;
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
