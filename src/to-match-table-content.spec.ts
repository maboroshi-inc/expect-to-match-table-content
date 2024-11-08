import { expect, test } from "vitest"
import { within } from "@testing-library/dom"
import { emptyString } from "."
import { toMatchTableContent } from "./to-match-table-content"

expect.extend({ toMatchTableContent })

test("success", () => {
  const table = html<HTMLTableElement>`
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alice</td>
          <td>Admin</td>
          <td>
            <a href="mailto:alice@example.com"> alice@example.com </a>
          </td>
        </tr>
        <tr>
          <td>Bob</td>
          <td>Editor</td>
          <td>
            <a href="mailto:bob@example.com">bob@example.com</a>
          </td>
        </tr>
        <tr>
          <td>Charlie</td>
          <td>Viewer</td>
          <td />
        </tr>
      </tbody>
    </table>
  `

  // @ts-expect-error FIXME
  expect(table).toMatchTableContent({
    header: [["Name", "Role", "Email"]],
    body: [
      ["Alice", /admin/i, "alice@example.com"],
      [
        "Bob",
        /editor/i,
        (node: HTMLElement) => {
          const link = within(node).getByRole("link")
          expect(link).toHaveAttribute("href", "mailto:bob@example.com")
        },
      ],
      ["Charlie", /viewer/i, emptyString],
    ],
  })
})

test.todo("add more tests")

function html<const Elem extends Element>(
  input: TemplateStringsArray,
  ...values: unknown[]
): Elem {
  const container = document.createElement("div")
  container.innerHTML = String.raw({ raw: input }, ...values)

  document.body.innerHTML = ""
  document.body.appendChild(container)

  return container.firstElementChild as Elem
}
