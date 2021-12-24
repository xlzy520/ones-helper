import { createApp } from 'vue'
import '../styles'
import App from './Popup.vue'
import CustomApi from '~/popup/features/custom_api/index.vue'
import OnesConfig from '~/popup/features/onesConfig/index.vue'
import TaskAction from '~/popup/features/taskAction/index.vue'
import OtherAction from '~/popup/features/otherAction/index.vue'
import ManHour from '~/popup/features/manhour/index.vue'
import AboutMe from '~/popup/features/about/index.vue'

const app = createApp(App)

app.component('CustomApi', CustomApi)
app.component('OnesConfig', OnesConfig)
app.component('TaskAction', TaskAction)
app.component('OtherAction', OtherAction)
app.component('ManHour', ManHour)
app.component('AboutMe', AboutMe)

app.mount('#app')
