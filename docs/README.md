# Nano Banana Pro AI 项目文档

本文档包含了 Nano Banana Pro AI 项目的完整架构设计和流程图，便于开发团队理解和维护系统。

## 📚 文档目录

### 1. [系统架构图](./architecture-diagram.md)
- 整体技术架构
- 部署架构设计
- 服务组件关系
- 技术栈说明

### 2. [用户认证流程](./auth-flow-diagram.md)
- OAuth登录流程
- JWT Session管理
- 用户数据同步
- 安全特性说明

### 3. [图像生成流程](./image-generation-flow.md)
- 多模型支持架构
- 积分计费机制
- 错误处理和重试
- 性能优化策略

### 4. [支付订阅流程](./payment-subscription-flow.md)
- 商品管理设计
- 支付提供商集成
- Webhook事件处理
- 订阅生命周期管理

### 5. [数据库设计](./database-schema.md)
- 完整ER图
- 表结构设计
- 索引和约束
- 性能优化策略

### 6. [本地开发调试指南](./local-development.md)
- 环境配置步骤
- 本地 D1 数据库操作
- 常用调试命令
- 故障排查指南

## 🏗️ 系统概览

Nano Banana Pro AI 是一个基于 Next.js 16 的 AI 图像生成和编辑平台，具有以下核心特性：

### 技术栈
- **前端**: Next.js 16 + React 19 + TypeScript
- **后端**: Cloudflare Workers + D1 数据库
- **AI模型**: Google Gemini 2.5 Flash, Flux, Sora, Seedream
- **支付**: Creem + Stripe
- **认证**: NextAuth.js (Google/Facebook OAuth)

### 核心功能
1. **AI图像生成**: 支持多种AI模型的文本到图像生成
2. **图像编辑**: 基于参考图像的智能编辑
3. **用户系统**: OAuth登录和用户管理
4. **积分系统**: 按使用量计费的积分体系
5. **订阅服务**: 灵活的订阅和一次性购买模式
6. **支付集成**: 多支付渠道支持

## 🔧 开发指南

### 环境要求
- Node.js 18+
- Cloudflare CLI (wrangler)
- D1 数据库

### 快速开始
```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 访问 http://localhost:3000
```

### 数据库初始化
```bash
# 创建D1数据库
wrangler d1 create nano-banana-db

# 执行迁移
wrangler d1 migrations apply nano-banana-db
```

## 📊 业务模式

### 积分计费
- **nano-banana**: 2积分/张
- **nano-banana-pro**: 4积分/张
- **seedream-4.0**: 5积分/张
- **sora-image**: 6积分/张
- **flux-kontext-pro**: 3积分/张
- **flux-kontext-max**: 8积分/张

### 商品体系
- **一次性积分包**: 100积分、500积分等
- **月度订阅**: 每月发放固定积分
- **年度订阅**: 更优惠的长期方案

## 🚀 部署架构

### Cloudflare 全栈部署
- **Pages**: 前端静态资源托管
- **Workers**: API服务端运行
- **D1**: SQLite 数据库
- **R2**: 图像文件存储
- **KV**: 缓存和会话存储

### 全球CDN加速
- 25+ 地区边缘节点
- 智能路由和负载均衡
- 自动故障转移

## 🔒 安全特性

### 数据安全
- 服务端API密钥保护
- 输入参数严格验证
- SQL注入防护
- XSS攻击防护

### 业务安全
- 原子性积分扣费
- 幂等性支付处理
- 频率限制和防刷
- 审计日志记录

## 📈 监控指标

### 业务指标
- 用户注册和活跃度
- 图像生成成功率
- 积分消费统计
- 订阅续费率

### 技术指标
- API响应时间
- 数据库查询性能
- AI模型调用延迟
- 错误率和异常统计

## 🔄 开发流程

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier 代码格式化
- Git提交规范
- 代码审查流程

### 测试策略
- 单元测试覆盖
- API集成测试
- 端到端测试
- 性能测试

### 发布流程
1. 功能开发和测试
2. 代码审查
3. 数据库迁移
4. 灰度发布
5. 全量发布

## 📞 支持和联系

### 技术支持
- 查看项目文档
- 提交Issue反馈
- 参与社区讨论

### 商务合作
- 技术咨询服务
- 定制开发服务
- 企业版解决方案

---

**注意**: 本文档会随项目开发持续更新，请定期查看最新版本。