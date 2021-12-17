<template>
  <n-message-provider>
    <custom-api />
    <features-config />
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider } from 'naive-ui'
import CustomApi from '~/options/custom_api/index.vue'
import FeaturesConfig from '~/options/features_config/index.vue'
</script>
