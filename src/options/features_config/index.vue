<template>
  <div class="custom-api w-[500px] m-auto">
    <n-page-header title="功能列表" class="p-5" :back-icon="false" />
    <div class="custom-api-main">
      <div v-for="(item, index) in features" :key="index" class="layout-slide mb-4">
        <div class="">
          {{ item.name }}
        </div>
        <n-switch v-model:value="item.show" class="" />
      </div>
      <div class="">
        <n-button class="w-full mt-3" type="info" @click="saveFeaturesConfig"> 保存 </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useMessage, NPageHeader, NButton, NSwitch } from 'naive-ui';
import { getFeaturesConfig } from '~/service/featuresConfig';
import { featuresConfigService } from '~/service';

const message = useMessage();

const features = ref([]);
const saveFeaturesConfig = () => {
  featuresConfigService.saveFeaturesConfig(toRaw(features.value)).then((res) => {
    message.success('保存成功', {
      duration: 1000,
    });
  });
};

onMounted(() => {
  getFeaturesConfig().then((res) => {
    features.value = res;
  });
});
</script>

<style lang="scss"></style>
