import { createApp } from 'vue';
import '../styles';
import {
  create,
  useMessage,
  NInput,
  NTag,
  NButton,
  NAlert,
  NSwitch,
  NTooltip,
  NCheckboxGroup,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NModal,
  NForm,
  NGrid,
  NGridItem,
  NFormItemGridItem,
  NPopconfirm,
  NSelect,
  NDataTable,
  NFormItem,
  NInputNumber,
  NDatePicker,
  NEllipsis,
  NSpace,
  NDivider,
  NCard,
} from 'naive-ui';

import Browser from 'webextension-polyfill';
import JsonViewer from 'vue-json-viewer';
import router from './router/index';

import App from './App.vue';
const naive = create({
  components: [
    useMessage,
    NInput,
    NTag,
    NButton,
    NAlert,
    NSwitch,
    NTooltip,
    NCheckboxGroup,
    NCheckbox,
    NRadioGroup,
    NRadio,
    NModal,
    NForm,
    NGrid,
    NGridItem,
    NFormItemGridItem,
    NPopconfirm,
    NSelect,
    NSpace,
    NDataTable,
    NFormItem,
    NInputNumber,
    NDatePicker,
    NEllipsis,
    NSpace,
    NDivider,
    NCard,
  ],
});
const app = createApp(App);
app.use(router);

app.use(naive);
app.use(JsonViewer);

app.mount('#app');

Browser.devtools.panels.create(
  'ONES Helper',
  './assets/favicon128.png',
  './dist/devtools/index.html'
);
