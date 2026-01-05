import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";

/**
 * 给前端提供“当前用户 + 积分”查询的便捷接口。
 *（虽然 session 已带 credits，但该接口可用于验证 DB 链路是否正常。）
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserById(userId);
  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          credits: user.credits_balance,
        }
      : null,
  });
}
