# 图像生成流程图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端应用
    participant API as 图像生成API
    participant Auth as 认证服务
    participant DB as D1数据库
    participant Credit as 积分系统
    participant AI as AI模型服务
    participant Storage as R2存储

    %% 1. 用户提交生成请求
    User->>Frontend: 输入提示词和参数
    Frontend->>Frontend: 表单验证
    Frontend->>API: POST /api/image/generate

    %% 2. 认证检查
    API->>Auth: 验证用户Session
    Auth->>API: 返回用户信息
    alt 未认证
        API->>Frontend: 401 错误
        Frontend->>User: 跳转登录
    end

    %% 3. 参数验证
    API->>API: 验证请求参数
    alt 参数无效
        API->>Frontend: 400 错误
        Frontend->>User: 显示错误信息
    end

    %% 4. 积分扣费
    API->>Credit: 获取模型费用
    Credit->>DB: 查询model_pricing表
    DB->>Credit: 返回费用信息
    API->>Credit: 扣除用户积分
    Credit->>DB: 原子更新users.credits_balance
    alt 积分不足
        Credit->>API: 扣费失败
        API->>Frontend: 402 积分不足
        Frontend->>User: 提示充值
    else 扣费成功
        Credit->>DB: 记录积分流水
        Credit->>API: 扣费成功
    end

    %% 5. 创建任务记录
    API->>DB: 插入generation_jobs记录
    Note over API,DB: 状态: running, 成本: 已记录

    %% 6. 调用AI模型
    API->>AI: 根据模型类型调用对应API

    alt Gemini模型
        API->>AI: POST /v1beta/models/gemini-2.5-flash
    else Flux模型
        API->>AI: POST /v1/images/generations
    else Sora模型
        API->>AI: POST /v1/chat/completions
    else Seedream模型
        API->>AI: POST /v1/images/generations
    end

    %% 7. 处理AI响应
    alt AI调用成功
        AI->>API: 返回图像数据
        API->>API: 解析图像(base64/URL)
        API->>DB: 更新任务状态为succeeded
        API->>Frontend: 返回生成结果
        Frontend->>User: 显示生成的图像
    else AI调用失败
        AI->>API: 返回错误信息
        API->>DB: 更新任务状态为failed
        API->>Credit: 退还积分
        Credit->>DB: 记录退款流水
        API->>Frontend: 返回错误信息
        Frontend->>User: 显示错误和退款提示
    else 超时
        API->>API: 超时处理
        API->>DB: 更新任务状态为failed
        API->>Credit: 退还积分
        API->>Frontend: 返回超时错误
    end

    %% 8. 可选：存储到R2
    alt 需要持久化存储
        API->>Storage: 上传图像到R2
        Storage->>API: 返回存储URL
        API->>DB: 更新output_r2_key
    end
```

## 图像生成技术流程

### 1. 支持的AI模型

#### Gemini系列
```typescript
// Gemini 2.5 Flash (nano-banana)
const geminiRequest = {
    contents: [{ parts: [{ text: prompt }], role: "user" }],
    generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio, imageSize },
    },
};

// Gemini 3 Pro (nano-banana-pro)
const geminiProRequest = {
    // 支持更高分辨率，更高质量
    imageSize: "4K", // 360秒超时
};
```

#### Flux系列
```typescript
// Flux-kontext-pro/max
const fluxRequest = {
    model: "flux-kontext-pro",
    prompt: prompt,
    aspect_ratio: aspectRatio,
    response_format: "b64_json",
};

// 支持参考图像编辑
if (referenceImages.length > 0) {
    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("prompt", prompt);
}
```

#### Sora Image
```typescript
// 基于Chat Completion的图像生成
const soraRequest = {
    model: "sora_image",
    messages: [{
        role: "user",
        content: [
            { type: "text", text: prompt },
            ...referenceImages.map(url => ({
                type: "image_url",
                image_url: { url }
            }))
        ]
    }],
};
```

### 2. 积分计费策略

| 模型 | 积分成本 | 分辨率 | 超时时间 |
|------|----------|--------|----------|
| nano-banana | 2 | 1K/2K | 180s/300s |
| nano-banana-pro | 4 | 1K/2K/4K | 180s/300s/360s |
| seedream-4.0 | 5 | 1K/2K/4K | 240s |
| sora-image | 6 | 标准 | 240s |
| flux-kontext-pro | 3 | 1K/2K | 240s |
| flux-kontext-max | 8 | 1K/2K | 240s |

### 3. 错误处理机制

#### 原子扣费保证
```typescript
const chargeCredits = async ({ userId, amount, reason, refId }) => {
    // 原子操作：检查余额并扣费
    const update = await db.prepare(
        `UPDATE users SET credits_balance = credits_balance - ?
         WHERE id = ? AND credits_balance >= ?`
    ).bind(amount, userId, amount).run();

    if (update.meta.changes !== 1) {
        return false; // 余额不足
    }

    // 记录流水
    await db.prepare(
        `INSERT INTO credit_ledger(...) VALUES(...)`
    ).run();
    return true;
};
```

#### 自动退款机制
```typescript
const handleGenerationFailure = async (jobId, userId, cost, error) => {
    // 更新任务状态
    await db.prepare(
        `UPDATE generation_jobs SET status = 'failed', error = ? WHERE id = ?`
    ).bind(error, jobId).run();

    // 自动退款
    await refundCredits({
        userId,
        amount: cost,
        reason: "generation_refund",
        refId: jobId
    });
};
```

### 4. 任务状态管理

#### 状态机
```
queued -> running -> succeeded
        \-> failed
```

#### 数据库记录
```sql
CREATE TABLE generation_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    model_key TEXT NOT NULL,
    cost_credits INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    aspect_ratio TEXT,
    image_size TEXT,
    status TEXT NOT NULL,  -- 'running'|'succeeded'|'failed'
    error TEXT,
    output_r2_key TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### 5. 性能优化

#### 超时控制
```typescript
const fetchWithTimeout = async (url, init, timeoutMs) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};
```

#### 并发限制
- 单用户并发限制
- 全局请求队列
- 资源使用监控

#### 缓存策略
- 模型配置缓存
- 用户积分缓存
- 响应结果缓存

### 6. 监控和日志

#### 关键指标
- 生成成功率
- 平均响应时间
- 错误分布
- 积分消费统计

#### 日志记录
```typescript
console.log(`[generation] User: ${userId}, Model: ${model}, Cost: ${cost}`);
console.error(`[generation] Failed: ${error}, Job: ${jobId}`);
```

### 7. 安全考虑

#### 输入验证
- 提示词长度限制
- 恶意内容检测
- 参数范围验证

#### 资源保护
- 请求频率限制
- 单次生成成本上限
- 批量操作限制

#### 数据隐私
- 提示词脱敏存储
- 生成结果访问控制
- 用户数据隔离