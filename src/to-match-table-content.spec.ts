import { expect, test } from "vitest"
import { within } from "@testing-library/dom"
import { emptyString, skipToCheck } from "."
import { toMatchTableContent } from "./to-match-table-content"

expect.extend({ toMatchTableContent })

test("success", () => {
  const table = render(`
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
  `)

  // @ts-expect-error
  expect(table).toMatchTableContent({
    header: [["First Name", "Last Name", "Role", "Email"]],
    body: [
      ["Aliceeeee", "Johnsonnnnn", /admin/i, "alice.johnson@example.com"],
      [
        "Bob",
        "Smith",
        /editor/i,
        (node: HTMLElement) => {
          const link = within(node).getByRole("link")
          expect(link).toHaveAttribute("href", "bob.smith@example.com")
        },
      ],
      ["Charlie", "Brown", /viewer/i, emptyString],
    ],
  })
})

test.todo("add more tests")

function render<const Elem extends Element>(html: string): Elem {
  const container = document.createElement("div")
  container.innerHTML = html

  document.body.innerHTML = ""
  document.body.appendChild(container)

  return container.firstElementChild as Elem
}
