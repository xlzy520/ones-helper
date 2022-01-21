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
import App from './Popup.vue';
import CustomApi from '~/popup/features/custom_api/index.vue';
import OnesConfig from '~/popup/features/onesConfig/index.vue';
import TaskAction from '~/popup/features/taskAction/index.vue';
import Github from '~/popup/features/github/index.vue';
import ManHour from '~/popup/features/manhour/index.vue';
import Jenkins from '~/popup/features/jenkins/index.vue';
import AboutMe from '~/popup/features/about/index.vue';

export const app = createApp(App);

app.component('CustomApi', CustomApi);
app.component('OnesConfig', OnesConfig);
app.component('TaskAction', TaskAction);
app.component('Github', Github);
app.component('ManHour', ManHour);
app.component('Jenkins', Jenkins);
app.component('AboutMe', AboutMe);

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

app.use(naive);

app.mount('#app');
