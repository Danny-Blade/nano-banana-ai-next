# 用户认证流程图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端应用
    participant NextAuth as NextAuth
    participant OAuth as OAuth提供商
    participant DB as D1数据库
    participant API as API服务

    %% 1. 用户发起登录
    User->>Frontend: 点击登录按钮
    Frontend->>NextAuth: 触发signIn(provider)
    NextAuth->>OAuth: 重定向到OAuth授权页面

    %% 2. OAuth认证
    OAuth->>User: 显示授权页面
    User->>OAuth: 用户授权应用
    OAuth->>NextAuth: 返回授权码和用户信息

    %% 3. JWT回调处理
    NextAuth->>NextAuth: jwt()回调执行
    NextAuth->>DB: 检查用户是否存在
    alt 用户不存在
        NextAuth->>DB: 创建新用户记录
        NextAuth->>DB: 创建OAuth绑定记录
    else 用户已存在
        NextAuth->>DB: 更新用户信息
    end

    %% 4. Session处理
    NextAuth->>NextAuth: session()回调执行
    NextAuth->>DB: 查询用户积分余额
    NextAuth->>Frontend: 返回JWT Token和用户信息

    %% 5. 前端存储Session
    Frontend->>Frontend: 存储Session到Cookie/LocalStorage
    Frontend->>User: 显示登录状态和积分

    %% 6. API请求认证
    User->>Frontend: 发起需要认证的请求
    Frontend->>API: 携带JWT Token
    API->>NextAuth: 验证Token
    NextAuth->>API: 返回用户信息
    API->>DB: 使用用户ID进行业务操作

    %% 7. 登出流程
    User->>Frontend: 点击登出
    Frontend->>NextAuth: 触发signOut()
    NextAuth->>Frontend: 清除Session
    Frontend->>User: 返回登录页面
```

## 认证流程详细说明

### 1. OAuth登录流程
- **支持提供商**: Google, Facebook
- **认证方式**: Authorization Code Flow
- **Scope**: email, profile, picture

### 2. 用户数据同步
```typescript
// JWT回调中的用户数据处理
async jwt({ token, account, profile }) {
    if (account?.provider && account.providerAccountId) {
        const user = await ensureUserFromOAuth({
            provider: account.provider,          // 'google' | 'facebook'
            providerAccountId: account.providerAccountId,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.picture
        });
        token.userId = user.id;  // 内部用户ID
    }
    return token;
}
```

### 3. Session增强
```typescript
// Session回调中添加业务数据
async session({ session, token }) {
    if (session.user && token.userId) {
        session.user.id = token.userId;
        const user = await getUserById(token.userId);
        session.user.credits = user?.credits_balance ?? 0;
    }
    return session;
}
```

### 4. 数据库表结构

**users表**:
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,           -- UUID
    email TEXT NOT NULL UNIQUE,    -- 邮箱
    name TEXT,                     -- 显示名称
    avatar_url TEXT,              -- 头像URL
    credits_balance INTEGER DEFAULT 0, -- 积分余额
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

**oauth_accounts表**:
```sql
CREATE TABLE oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,           -- 'google' | 'facebook'
    provider_account_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(provider, provider_account_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 5. 安全特性

#### JWT配置
- **Secret**: 环境变量配置
- **策略**: JWT Session (无状态)
- **过期**: 默认配置

#### 安全措施
- HTTPS强制
- CSRF保护
- Session劫持防护
- OAuth State参数验证

#### 错误处理
- 授权失败回退
- 网络错误重试
- 数据库异常处理
- 生产环境错误上报

### 6. 认证中间件

```typescript
// API路由认证检查
export async function requireAuth(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "请先登录" },
            { status: 401 }
        );
    }
    return session;
}
```

### 7. 前端集成

#### React Context
```typescript
// 认证状态管理
const AuthContext = createContext<{
    session: Session | null;
    loading: boolean;
    login: (provider: string) => void;
    logout: () => void;
}>({});
```

#### 路由保护
```typescript
// HOC保护需要认证的页面
const withAuth = (Component: React.ComponentType) => {
    return function AuthenticatedComponent(props: any) {
        const { session, loading } = useAuth();

        if (loading) return <Loading />;
        if (!session) return <LoginPrompt />;

        return <Component {...props} />;
    };
};
```