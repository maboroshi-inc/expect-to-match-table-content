import Table from "cli-table3"
import { TableContent, Matcher, emptyString, skipToCheck } from "."
import { gray, red } from "./colors"

const keyToTag = {
  header: "thead",
  body: "tbody",
  footer: "tfoot",
}

export function toMatchTableContent(
  received: HTMLElement,
  expected: TableContent,
) {
  const head = aggregateRowData(received, expected, "header")
  const body = aggregateRowData(received, expected, "body")
  const foot = aggregateRowData(received, expected, "footer")

  const table = new Table({
    head: head.items[0],
  })

  ;[...head.items.slice(1), ...body.items, ...foot.items].forEach((row) =>
    table.push(row),
  )

  return {
    pass: !(head.fail || body.fail || foot.fail),
    message: () =>
      `${red`Table contents did not match expected structure and values:`}

${table.toString()}
${list(head.help)}
${list(body.help)}
${list(foot.help)}
`,
  }
}

function list(strings: string[]): string {
  return strings.map((string) => `- ${string}`).join("\n\n")
}

type AggregateResult = {
  fail: boolean
  items: string[][]
  help: string[]
}

function aggregateRowData(
  table: HTMLElement,
  expected: TableContent,
  key: keyof TableContent,
): AggregateResult {
  if (!expected[key]) return { fail: false, items: [], help: [] }

  const help: string[] = []
  const expectedRows = expected[key]
  const rows = qsa(table, `${keyToTag[key]} tr`)

  if (rows.length !== expectedRows.length) {
    help.push(
      `Row count mismatch in ${keyToTag[key]}: expected ${expectedRows.length} rows, but got ${rows.length}.`,
    )
  }

  return rows.reduce<AggregateResult>(
    (state, tr, rowIndex) => {
      const { fail, items, help } = qsa(tr, ":is(th, td)").reduce<{
        fail: boolean
        help: string[]
        items: string[]
      }>(
        (state, cell, cellIndex) => {
          const expected = expectedRows[rowIndex]?.[cellIndex]
          const actual = cell.textContent?.trim()
          const {
            fail = false,
            message,
            help,
          } = checkNodeContent(cell, {
            expected,
            actual,
            rowIndex,
            cellIndex,
          })

          return {
            fail: state.fail || fail,
            help: help ? state.help.concat(help) : state.help,
            items: state.items.concat(message),
          }
        },
        { fail: false, items: [], help: [] },
      )

      return {
        fail: state.fail || fail,
        help: state.help.concat(help),
        items: state.items.concat([items]),
      }
    },
    { fail: false, help, items: [] },
  )
}

function checkNodeContent(
  node: Element,
  {
    expected,
    actual,
    rowIndex,
    cellIndex,
  }: {
    expected: Matcher
    actual: string | undefined
    rowIndex: number
    cellIndex: number
  },
): { fail?: boolean; message: string; help?: string } {
  const id = `[Row ${rowIndex + 1}, Col ${cellIndex + 1}]`

  if (typeof expected === "function") {
    try {
      expected(node)
      return { message: gray`${actual}` }
    } catch (exception) {
      return {
        fail: true,
        message: red`${actual} (function check failed at ${id})`,
        help: `${id} ${(exception as Error).message}`,
      }
    }
  } else if (expected === skipToCheck) {
    return { message: gray`(SKIP)` }
  } else if (expected === emptyString) {
    if (actual === "") {
      return { message: gray`(EMPTY)` }
    } else {
      return { fail: true, message: `${actual} (expected: (EMPTY))` }
    }
  } else {
    if (expected === "") {
      return {
        fail: true,
        message: `${id}`,
        help: red`${id} An empty string matches any textContent. To test for an actual empty string, use \`emptyString\` instead.`,
      }
    }

    if (!actual?.match(expected)) {
      return { fail: true, message: `${actual} (expected: ${expected})` }
    } else {
      return { message: gray`${actual}` }
    }
  }
}

function qsa(element: Element, selectors: string): Element[] {
  return Array.from(element.querySelectorAll(selectors))
}
