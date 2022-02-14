# ONES Helper

### features(待后续完善)

### changelog

#### 2022-01-20(v1.1.4)

1. 快速响应看板增加判断数据变更后自动刷新功能
2. ws 转发受到配置的域名限制
3. ONESConfig 功能由入口开关决定启不启动
4. 重要功能增加：一键创建最后一个 ONES 稳定大版本的所有产品的分支

#### 2021-12-30

1. 实现读取 buildOnesProcessEnv（开发坏境下的 ONESConfig）
2. GitHub 相关功能：实现 GitHub OAuth 授权，一键获取前端三个项目的最新 hash 值(用于打包时的验证)，一键在多个项目创建同名迭代分支
3. Jenkins 立即触发构建（开发环境下，只改了 common 库没有触发构建时使用）
4. 全部兼容 Firefox
5. API 映射信息支持拖拽移动
6. 增加一键复制全部工作项

### 开发手册

1. 拉代码，yarn 或者 pnpm 安装依赖。
2. 本地调试，执行`pnpm run dev`
3. 在浏览器拓展选项中加载项目中的 ONESHelper 文件夹即可
   ![](https://i0.hdslb.com/bfs/album/ce99bf5c7fe21b509829816102eef3c80f6551c3.png)

#### 调试页面

点击右键，检查即可

#### 调试后台

点击下图中的链接就可以了
![](https://i0.hdslb.com/bfs/album/4dcff87e6e02cf5f83f63fe01b41d902feccd67a.png)

#### 调试 ContentScript

直接在页面里的控制台即可查看

#### 消息通信

1. 插件发给页面，需要用`tabs.sendMessage`
   直接引入`common/utils`里面的`sendMessage`方法即可

```js
sendMessage({
  type: 'copyAllTasks',
  data: {
    shouldWithLink: false,
  },
});
```

2. 页面发给插件
   如下是获取 Jenkins Token 的例子

```js
browser.runtime.sendMessage({
  type: 'jenkins-crumb',
  data: crumb,
});

browser.runtime.onMessage.addListener(({ type, data }) => {
  if (type === 'jenkins-crumb') {
    jenkinsCrumb.value = data;
    browser.storage.local.set({ jenkinsCrumb: data });
    message.success('Jenkins凭证获取成功, 请重新执行');
  }
});
```

#### 发布新版本

执行`pnpm run publish:patch`即可触发`Github Actions`自动构建发布
