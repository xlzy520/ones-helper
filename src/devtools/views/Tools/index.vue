<template>
  <div>
    <div class="layout-items-center">
      <n-button @click="dispatchStoreUpdate">手动触发渲染</n-button>
      <div class="layout-items-center ml-4">
        <n-input
          v-model:value="state.interval"
          type="text"
          :allow-input="onlyAllowNumber"
          placeholder="请输入定时时间"
          @change="changeInterval"
        >
          <template #prefix>
            <n-tag type="success">定时触发渲染</n-tag>
          </template>
          <template #suffix> 单位(秒) </template>
        </n-input>
        <n-button class="ml-1" @click="toggleTimerState">
          {{ state.start ? '暂停' : '开始' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Browser from 'webextension-polyfill';
import { useMessage } from 'naive-ui';

const message = useMessage();

const state = reactive({
  start: false,
  interval: '',
  timer: null,
});
const onlyAllowNumber = (value) => !value || /^\d+$/.test(value);

const dispatchStoreUpdate = () => {
  Browser.devtools.inspectedWindow.eval(
    "_store.dispatch({type: 'SET_DATA_FETCHED', payload: [Date.now()]})"
  );
};

const changeInterval = (value) => {
  Browser.storage.local.set({
    dispatchStoreUpdateInterval: value,
  });
};

const toggleTimerState = () => {
  if (state.interval < 1) {
    message.warning('间隔不能小于1秒');
    return;
  }
  state.start = !state.start;
  if (state.start) {
    state.timer = setInterval(() => {
      dispatchStoreUpdate();
    }, state.interval * 1000);
  } else {
    clearInterval(state.timer);
  }
};

const initInterval = () => {
  Browser.storage.local.get('dispatchStoreUpdateInterval').then((res) => {
    state.interval = res.dispatchStoreUpdateInterval || '';
  });
};

onMounted(() => {
  initInterval();
});
</script>

<style lang="scss"></style>
