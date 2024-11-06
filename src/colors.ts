const color = (code: number, text: string) => `\x1b[${code}m${text}\x1b[0m`

const enum Code {
  GRAY = 90,
  RED = 31,
}

export function gray(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return color(Code.GRAY, String.raw({ raw: strings }, ...values))
}

export function red(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return color(Code.RED, String.raw({ raw: strings }, ...values))
}
