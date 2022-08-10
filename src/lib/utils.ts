import type { IToken } from "@chevrotain/types";

export function printTokenList(tokens: IToken[]) {
  const nameColumnWidth = Math.floor(process.stdout.columns * 0.2);
  const pushColumnWidth = Math.max(
    18,
    Math.floor(process.stdout.columns * 0.15)
  );
  const popColumnWidth = Math.max(16, Math.floor(process.stdout.columns * 0.1));
  const valueColumnWidth =
    process.stdout.columns - nameColumnWidth - pushColumnWidth - popColumnWidth;

  const header = `Token Type${" ".repeat(
    nameColumnWidth - 10
  )}Value${" ".repeat(valueColumnWidth - 5)}Push Lexer Mode${" ".repeat(
    pushColumnWidth - 15
  )}Pop Lexer Mode${" ".repeat(popColumnWidth - 14)}`;
  const headerUnderline = `${"=".repeat(nameColumnWidth - 2)}  ${"=".repeat(
    valueColumnWidth - 2
  )}  ${"=".repeat(pushColumnWidth - 2)}  ${"=".repeat(popColumnWidth - 1)}`;

  const fmtTokenList = tokens.map((token) => {
    const nameColumnValue = `[${token.tokenType.name.substring(
      0,
      nameColumnWidth - 2
    )}]`;
    const valueColumnValue = `|${token.image
      .replace(/[\r\n]/, "\\n")
      .substring(0, valueColumnWidth - 2)}|`;
    const pushColumnValue = token.tokenType.PUSH_MODE ?? "";
    const popColumnValue = token.tokenType.POP_MODE ?? "";
    return (
      `${nameColumnValue}${" ".repeat(
        Math.max(0, nameColumnWidth - nameColumnValue.length)
      )}` +
      `${valueColumnValue}${" ".repeat(
        Math.max(0, valueColumnWidth - valueColumnValue.length)
      )}` +
      `${pushColumnValue}${" ".repeat(
        Math.max(0, pushColumnWidth - pushColumnValue.length)
      )}` +
      `${
        typeof popColumnValue === "boolean"
          ? popColumnValue.toString()
          : popColumnValue
      }`
    );
  });

  return [header, headerUnderline, ...fmtTokenList].join("\n");
}
