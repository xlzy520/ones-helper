<template>
  <div class="custom-api w-[500px] m-auto">
    <n-page-header title="API 匹配规则" class="p-5" :back-icon="false" />
    <div class="custom-api-main">
      <div
        v-for="(item, index) in customApiData.customApiPatterns"
        :key="index"
        class="layout-items-center mb-4"
      >
        <n-checkbox v-model:checked="item.enable" />
        <n-input v-model:value="item.pattern" placeholder="输入 Pattern" class="ml-3 w-[300px]" />
        <IconClose class="icon-remove ml-3" @click="removePattern(index)" />
      </div>
      <div class="">
        <n-button class="w-full" type="info" dashed @click="addPattern"> 添加规则 </n-button>
        <n-button class="w-full mt-3" type="info" @click="savePattern"> 保存规则 </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { useMessage, NCheckbox, NPageHeader, NInput, NButton } from 'naive-ui';
import { Ref } from 'vue-demi';
import { customApiService } from '~/service';
import { CustomApiData, PatternConfig } from '~/service/custom_api';
import IconClose from '~icons/icon-park-outline/close';

const message = useMessage();

const customApiData: Ref<CustomApiData> = ref({
  customApiPatterns: [],
  preset: '',
  presetOptions: [],
});

const syncFormData = async () => {
  const result = await customApiService.getCustomApi();
  console.log(result);
  customApiData.value = result;
};

const savePattern = () => {
  customApiService.saveCustomApi(toRaw(customApiData.value)).then((res) => {
    message.success('保存成功', {
      duration: 1000,
    });
  });
};

const addPattern = () => {
  customApiData.value.customApiPatterns.push({
    enable: true,
    pattern: 'http://',
  });
};

const removePattern = (index: number) => {
  customApiData.value.customApiPatterns.splice(index, 1);
};

onMounted(() => {
  syncFormData();
});
</script>

<style lang="scss">
.icon-remove {
  cursor: pointer;
}
.icon-remove:hover {
  color: red;
}
</style>
