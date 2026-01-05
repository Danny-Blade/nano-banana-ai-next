/**
 * ID 生成工具。
 *
 * 优先使用 `crypto.randomUUID()`（Edge/Workers 通常可用）。
 * 如果环境不支持，则回退到简单的随机字符串。
 */

export const newId = (prefix?: string) => {
  const base =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
          .toString(16)
          .slice(2)}`;
  return prefix ? `${prefix}_${base}` : base;
};
