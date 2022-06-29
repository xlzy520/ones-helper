<template>
  <div>
    <n-button @click="dispatchStoreUpdate">触发渲染</n-button>
  </div>
</template>

<script setup lang="ts">
import Browser from 'webextension-polyfill';

const state = reactive({});

const dispatchStoreUpdate = () => {
  Browser.devtools.inspectedWindow.eval(
    "_store.dispatch({type: 'SAVE_PREFERENCE_IN_STORE', payload: {key: 'reRender_check_key', time: new Date()}})"
  );
};
</script>

<style lang="scss"></style>
