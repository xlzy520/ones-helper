<template>
  <div class="py-5">
    <n-form ref="formRef" :model="formValue" label-placement="left" :label-width="100" label-align='left'>
      <n-grid>
        <n-form-item-grid-item :span="22" label="API URL" path="preset">
          <n-input
            v-model:value="formValue.url"
            placeholder="如：https://dev.myones.net/project/master/api/project/team/AQEVMG13/fields/add"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item
          :span="22"
          label="添加个数"
        >
          <n-input-number
            :show-button='false'
            v-model:value="formValue.count"
            :placeholder="50"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item
          :span="22"
          label="单次请求个数"
        >
          <n-input-number
            :show-button='false'
            :max='500'
            v-model:value="formValue.reqCountOneTime"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item
          :span="22"
          label="起始下标"
        >
          <n-input-number
            :show-button='false'
            v-model:value="formValue.start"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="99" label="请求数据参数" path="websocket" label-placement='top'>
          <n-input
            v-model:value="formValue.body"
            type="textarea"
            clearable
            :placeholder="BodyTip"
            @keyup="onKeyUp"
            :autosize="{
              minRows: 7
            }"
          />
          <n-tooltip placement="right" trigger="hover">
            <template #trigger>
              <question-icon class="ml-2" />
            </template>
            <p>
              {{BodyTip}}
            </p>
          </n-tooltip>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="22" label=" ">
          <n-tooltip placement="bottom" trigger="hover">
            <template #trigger>
              <n-button class="ml-4 flex-1" type="info" @click="onSubmitClick"> 起飞 </n-button>
            </template>
            发请求
          </n-tooltip>
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <n-alert title="建议空闲时间使用此功能" type="info">
    </n-alert>
  </div>
</template>

<script setup lang="tsx">
import { useMessage } from 'naive-ui';
import { sendMessage } from '~/common/utils';

const formValue = reactive({
  url: '',
  count: 50,
  reqCountOneTime: 2,
  start: 0,
  body: ``
});

const BodyTip = `可以先去环境手动新增某配置，再复制浏览器 F12 Network 面板复制参数过来，再对某些参数进行更改
参数模板支持使用双花括号 {{index}} 写表达式，模板内置变量:
 "index" 当前执行序号
 "count" 当前数据总数
 "uuid" 生成uuid函数，类型: fn(preStr: string, randomLength: number)
如新增工作项属性，参数可以如下：
{
    "field": {
        "name": "{{ '工作项属性' + index }}", // 当 index 为 1 时， 名称为 工作项属性1
        "type": 2,
        "renderer": 1,
        "filter_option": 0,
        "search_option": 1
    }
}
`

const setFormValue = (data: Partial<typeof formValue>) => {
  let { body = '' } = data;
  formValue.body = body;
};

const message = useMessage();

async function onSubmitClick (shouldClose = true) {
  let {url, body, count, reqCountOneTime, start} = formValue;
  sendMessage({
    type: 'batchRequest',
    data: {
      url: url,
      body: body,
      count,
      reqCountOneTime,
      start
    }
  })
};


const onKeyUp = () => {
  try {
    setFormValue({
      body: JSON.stringify(JSON.parse(formValue.body), null, 4)
    });
  } catch (e){
    console.log('json 不正确')
  }
}

let url = ''

onMounted(() => {
  browser.runtime.onMessage.addListener(({ type, data, status, failCount }) => {
    if (type === 'batchRequest-tip') {
      message.info(data, {
        duration: status === 'done' ? 5000 : 1000
      });
      if (status === 'done' && failCount > 0) {
        message.info('执行结果存在失败，错误信息可以查阅项目的控制台输出', {
          duration: 5000
        });
      }
    }
  });
});
</script>

<style lang="scss">
.n-base-select-menu .n-scrollbar,
.n-base-select-menu .n-virtual-list {
  max-height: 200px;
}
</style>
