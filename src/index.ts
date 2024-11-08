export type Matcher =
  | string
  | RegExp
  | typeof skipToCheck
  | typeof emptyString
  | ((element: HTMLElement) => void)

export type TableContent = {
  header?: Matcher[][]
  body?: Matcher[][]
  footer?: Matcher[][]
}

export interface CustomMatchers<R = unknown> {
  toMatchTableContent: (expected: TableContent) => R
}

export const skipToCheck = Symbol("skipToCheck")
export const emptyString = Symbol("emptyString")

export { toMatchTableContent } from "./to-match-table-content"
