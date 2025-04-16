# UniApp + Vue3 + TypeScript 项目

## 项目介绍

这是一个基于 uni-app 框架的多端应用项目，使用 Vue 3 和 TypeScript 开发。项目支持编译到多个平台，包括 H5、微信小程序、支付宝小程序、百度小程序、头条小程序等。

## 技术栈

- **框架**: uni-app
- **前端框架**: Vue 3
- **开发语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **国际化**: vue-i18n
- **自动导入**: unplugin-auto-import

## 项目结构

```
├── src/                    # 源代码目录
│   ├── App.vue             # 应用入口组件
│   ├── main.ts             # 应用入口文件
│   ├── manifest.json       # 应用配置文件
│   ├── pages.json          # 页面路由配置
│   ├── env.d.ts            # TypeScript 环境声明
│   ├── shime-uni.d.ts      # uni-app 类型声明
│   ├── uni.scss            # 全局样式文件
│   ├── pages/              # 页面文件夹
│   │   └── index/          # 首页
│   │       └── index.vue   # 首页组件
│   └── static/             # 静态资源文件夹
│       └── logo.png        # 项目 logo
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── .gitignore              # Git 忽略文件
```

## 开发环境

- Node.js
- pnpm 包管理器

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

根据不同平台，可以使用以下命令启动开发服务器：

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 支付宝小程序开发
pnpm dev:mp-alipay

# 百度小程序开发
pnpm dev:mp-baidu

# 头条小程序开发
pnpm dev:mp-toutiao
```

### 构建生产版本

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin

# 支付宝小程序构建
pnpm build:mp-alipay

# 百度小程序构建
pnpm build:mp-baidu

# 头条小程序构建
pnpm build:mp-toutiao
```

### 类型检查

```bash
pnpm type-check
```

## 项目特性

- **多端适配**: 一套代码，多端运行
- **TypeScript 支持**: 提供类型检查和智能提示
- **自动导入**: 自动导入 Vue、uni-app 和 Pinia 相关 API
- **状态管理**: 使用 Pinia 进行状态管理，支持持久化
- **国际化**: 支持多语言切换

## 注意事项

- 在 `manifest.json` 中配置各平台的 appid 和其他配置
- 在 `pages.json` 中配置页面路由和全局样式
- 使用 `uni.scss` 定义全局样式变量

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

[MIT](LICENSE)
