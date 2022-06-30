<template>
  <div class="">
    <n-input
      v-model:value="state.feedback"
      type="textarea"
      clearable
      placeholder="反馈与建议，尽量详细"
    />
    <n-button class="mt-4" @click="submit">提交</n-button>
  </div>
</template>

<script setup lang="tsx">
import { useMessage } from 'naive-ui';
import { getUid } from '~/common/utils';
import { createFeedback } from '~/service/request';

const message = useMessage();

const state = reactive({
  feedback: '',
  uid: '',
});

const submit = () => {
  createFeedback(state.feedback, state.uid)
    .then((res) => {
      if (res.bad_tasks.length) {
        message.error('提交失败');
      } else {
        message.success('提交成功');
        state.feedback = '';
      }
    })
    .catch(() => {
      message.error('提交失败');
    });
};

onMounted(() => {
  getUid().then((res: string) => {
    state.uid = res;
  });
});
</script>

<style lang="scss"></style>
