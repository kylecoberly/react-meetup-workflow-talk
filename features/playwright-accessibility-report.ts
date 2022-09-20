import {readFile} from "fs/promises"
import {Page} from "playwright"
import chalk from "chalk"
import type {run, Result, AxeResults, RunOptions} from "axe-core"

declare type Window = {
  eval(axe: unknown): void;
  axe: {
    run: typeof run;
  };
  document: any;
};
let window: Window;

type Violations = Record<string, {
  link: string;
  details: {
    html: string;
    failureSummary?: string;
  }[]
}>

export async function printAccessibilityCheck(page: Page) {
  await injectAxe(page)
  const results = await getAxeResults(page)

  const hasViolations = !!Object.keys(results).length
  if (hasViolations) {
    const formattedViolations = formatViolations(results.violations)
    printViolations(formattedViolations)
  }
}

async function injectAxe(page: Page): Promise<void> {
  const axe: string = await readFile(
    require.resolve("axe-core/axe.min.js"),
    "utf8",
  )
  await page.evaluate((axe: string) => window.eval(axe), axe)
}

async function getAxeResults(page: Page, options?: RunOptions): Promise<AxeResults> {
  const result = await page.evaluate((options) => {
    return window.axe.run(window.document.body, options)
  }, options)

  return result
}

function formatViolations(violations: Result[]) {
  return violations.reduce<Violations>((violations, violation) => ({
    ...violations,
    [violation.help]: {
      link: violation.helpUrl,
      details: violation.nodes.map(node => ({
        html: node.html,
        failureSummary: node.failureSummary
      })),
    }
  }), {})
}

function printViolations(violations: Violations) {
  console.log(chalk.red.bold("Accessibility violations:\n"))

  Object.entries(violations).forEach(([label, violation]) => {
    console.log(chalk.white.bold(`${label}`))
    console.log(chalk.grey.dim(`${violation.link}\n`))
    violation.details.forEach(({html, failureSummary}, index) => {
      console.log(chalk.grey(`${index + 1}) ${html}\n`))
      failureSummary && console.log(chalk.yellow(`${failureSummary}\n`))
    })
  })
}

