import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals"),
  // 添加自定义的规则——使用未定义的变量会warning
  {
    rules: {
      'no-unused-vars':["warn"]
    }
  }
];

export default eslintConfig;
