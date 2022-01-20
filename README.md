# ONES Helper


### features(待后续完善)



### changelog
#### 2022-01-20(v1.1.4)
1. 快速响应看板增加判断数据变更后自动刷新功能
2. ws转发受到配置的域名限制
3. ONESConfig功能由入口开关决定启不启动
4. 重要功能增加：一键创建最后一个ONES稳定大版本的所有产品的分支


#### 2021-12-30
1. 实现读取buildOnesProcessEnv（开发坏境下的ONESConfig）
2. GitHub相关功能：实现GitHub OAuth授权，一键获取前端三个项目的最新hash值(用于打包时的验证)，一键在多个项目创建同名迭代分支
3. Jenkins立即触发构建（开发环境下，只改了common库没有触发构建时使用）
4. 全部兼容Firefox
5. API映射信息支持拖拽移动
6. 增加一键复制全部工作项
