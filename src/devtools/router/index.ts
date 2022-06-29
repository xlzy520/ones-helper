import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import CommonInfo from '../views/CommonInfo/index.vue';
import Tools from '../views/Tools/index.vue';

// 静态路由页面
export const allowRouter = [
  {
    name: 'Tools',
    path: '/Tools',
    component: Tools,
    meta: { title: '实用工具' },
  },
  {
    name: 'CommonInfo',
    path: '/CommonInfo',
    component: CommonInfo,
    meta: { title: '通用信息' },
  },
];

const router = createRouter({
  history: createWebHashHistory(), // createWebHistory
  routes: allowRouter as RouteRecordRaw[],
});

export default router;
