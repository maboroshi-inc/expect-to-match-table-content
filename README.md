# @maboroshi/expect-to-match-table-content

Vitest の `expect` を拡張し、テーブルの内容と構造を一括で検証するための `toMatchTableContent` マッチャーを追加します。

## インストール

```
npm install @maboroshi/expect-to-match-table-content --save-dev
```

## 使い方

まず、 テストのセットアップファイルに以下のインポート文を追加して、 マッチャーを有効にします。

```ts
// setup-tests.ts
import "@maboroshi/expect-to-match-table-content/vitest"
```

```ts
/// <reference types="vitest" />

import { defineConfig } from "vite"

export default defineConfig({
  // 他の設定は適宜行う
  test: {
    setupFiles: ["./setup-tests.ts"],
  },
})
```

以下は `toMatchTableContent` を使ったテーブルのテストコードの例です。

```tsx
import { test, expect } from "vitest"
import { render, within } from "@testing-library/react"
import { emptyString } from "@maboroshi/expect-to-match-table-content"

function Table() {
  return (
    <table>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Role</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice</td>
          <td>Johnson</td>
          <td>Admin</td>
          <td>
            <a href="mailto:alice.johnson@example.com">
              alice.johnson@example.com
            </a>
          </td>
        </tr>
        <tr>
          <td>Bob</td>
          <td>Smith</td>
          <td>Editor</td>
          <td>
            <a href="mailto:bob.smith@example.com">bob.smith@example.com</a>
          </td>
        </tr>
        <tr>
          <td>Charlie</td>
          <td>Brown</td>
          <td>Viewer</td>
          <td />
        </tr>
      </tbody>
    </table>
  )
}

test("should render table", () => {
  render(<Table />)

  expect(screen.getByRole("table")).toMatchTableContent({
    // ヘッダー行の内容を検証
    header: [["First Name", "Last Name", "Role", "Email"]],

    // ボディの各行を検証
    body: [
      [
        // 文字列の一致
        "Alice",
        "Johnson",
        // 正規表現のパターンマッチング
        /admin/i,
        "alice.johnson@example.com",
      ],
      [
        "Bob",
        "Smith",
        /editor/i,
        // 関数によるカスタムチェック
        (node) => {
          const link = within(node).getByRole("link")
          expect(link).toHaveAttribute("href", "mailto:bob.smith@example.com")
        },
      ],
      ["Charlie", "Brown", /viewer/i, emptyString],
    ],
  })
})
```

アサーションに失敗した際は、 コンソールに以下のようなエラーメッセージが表示されます。

```ts
test("should be failed", () => {
  render(<Table />)

  expect(screen.getByRole("table")).toMatchTableContent({
    header: [["First Name", "Last Name", "Role", "Email"]],
    body: [
      // ↓ 不一致
      ["Aliceeeee", "Johnsonnnnn", /admin/i, "alice.johnson@example.com"],
      [
        "Bob",
        "Smith",
        /editor/i,
        (node) => {
          const link = within(node).getByRole("link")
          // ↓ 属性値の不一致
          expect(link).toHaveAttribute("href", "bob.smith@example.com")
        },
      ],
      ["Charlie", "Brown", /viewer/i, emptyString],
    ],
  })
})
```

![テストが失敗した際のコンソールのスクリーンショット。エラー内容がアスキーアートを使って視覚的に表現されている。](assets/screenshot.png)
