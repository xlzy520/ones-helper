<template>
  <n-message-provider>
    <custom-api />
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider } from 'naive-ui'
import CustomApi from '~/options/custom_api/index.vue'
</script>
