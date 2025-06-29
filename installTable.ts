#!/usr/bin/env tsx

import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import util from "util";

interface PackageJson {
    name: string;
    version?: string;
}

interface PackageManager {
    name: string;
    installCommand: string;
    addCommand: string;
}

function log(...args: any[]) {
    process.stderr.write(util.format(...args) + "\n");
}

function output(...args: any[]) {
    process.stdout.write(util.format(...args) + "\n");
}

const packageManagers: PackageManager[] = [
    { name: 'npm', installCommand: 'npm install', addCommand: 'npm install' },
    { name: 'pnpm', installCommand: 'pnpm add', addCommand: 'pnpm add' },
    { name: 'yarn', installCommand: 'yarn add', addCommand: 'yarn add' },
    { name: 'bun', installCommand: 'bun add', addCommand: 'bun add' }
]

function readPackageJson(): PackageJson {
    try {
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        return JSON.parse(packageJsonContent);
    } catch (error) {
        log('Error reading package.json:', error);
        process.exit(1);
    }
}


const example = `<span class="pl-k">import</span> <span class="pl-kos">{</span> <span class="pl-s1">gotcha</span><span class="pl-kos">,</span> <span class="pl-s1">isOk</span> <span class="pl-kos">}</span> <span class="pl-k">from</span> <span class="pl-s">"jsr:@yankeeinlondon/gotcha"</span><span class="pl-kos">`

function pkgMgr(str: string, clean: boolean) {
    return clean
        ? str
        : `<span class="pl-k">${str}</span>`;
}

function languageSymbol(str: string, clean: boolean) {
    return pkgMgr(str, clean);
}

function subCommand(str: string, clean: boolean) {
    return clean
        ? str
        : `<span class="pl-kos">${str}</span>`;
}

function languageBracket(str: string, clean: boolean) {
    return clean
        ? str
        : `<span class="pl-kos">${str}</span>`
}

function pkgName(str: string, clean: boolean) {
    return clean
        ? str
        : `<span class="pl-s">${str}</span>`;
}

function symbolImport(str: string, clean: boolean) {
    return clean
        ? str
        : `<span class="pl-s1">${str}</span>`;
}
function quote(clean: boolean) {
    return clean ? `&quote;` : `"`;
}

function clipboardContainer(cleanInput: string): string {
    return [
        `<div class="zeroclipboard-container">`,
        `<clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="${cleanInput}" tabindex="0" role="button">`,
        `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon">`,
        `<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>`,
        `<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>`,
        `</svg>`,
        `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none">`,
        `<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>`,
        `</svg>`,
        `</clipboard-copy>`,
        `</div>`
    ].join("")
}

function container(cmd: Command) {
    const structure = [
        `<div class="highlight highlight-source-ts notranslate position-relative overflow-auto" dir="auto">`,
        `<pre>`,
        cmd(false),
        `</pre>`,
        clipboardContainer(cmd(true)),
        `</div>`
    ].join("");

    return structure;
}

function bold(str: string) {
    return `<span style="font-weight: 800">${str}<span>`
}

function code(str: string) {
    return `<code>${str}</code>`
}

type Command = (c: boolean) => string;


function row(command: Command) {
    const clean = command(true);
    const cmdName = clean.split(/\s+/)[0] as string;

    const structure = [
        "<tr>",
        "<td>",
        bold(code(cmdName)),
        "</td>",
        "<td>",
        container(command),
        "</td>",
        "</tr>"
    ].join("");

    return structure;
}

function createTable(cmds: Command[]): string {
    const tbl = (commands: Command[]) => [
        `<table>`,
        commands.map(c => row(c)).join(""),
        `</table>`
    ];



    return tbl(cmds).join("");
}


function main() {
    const packageJson = readPackageJson();
    const packageName = packageJson.name;

    log();
    log(`Install Table Generator for ${chalk.bold(packageName)}`);
    log('='.repeat(60));

    log('\n1. Creating parsed variants for npm, pnpm, yarn, and bun:');
    log('-'.repeat(60));
    const npm = (c: boolean) => `${pkgMgr('npm', c)} ${subCommand('install',c)} ${pkgName(packageName, c)}`
    const pnpm = (c: boolean) => `${pkgMgr('pnpm', c)} ${subCommand('add',c)} ${pkgName(packageName, c)}`
    const yarn = (c: boolean) => `${pkgMgr('yarn', c)} ${subCommand('add',c)} ${pkgName(packageName, c)}`
    const bun = (c: boolean) => `${pkgMgr('bun', c)} ${subCommand('add',c)} ${pkgName(packageName, c)}`
    log(`${chalk.bold("npm:")}\n    clean: ${npm(true)}\n   parsed: ${chalk.dim(npm(false))}`)
    log(`${chalk.bold("pnpm:")} ${chalk.dim(pnpm(false))}`)
    log(`${chalk.bold("yarn:")} ${chalk.dim(yarn(false))}`)
    log(`${chalk.bold("bun:")} ${chalk.dim(bun(false))}`)
    log();


    const table = createTable([npm, pnpm, yarn, bun]);
    log(`2. HTML Table for npm, pnpm, yarn, and bun [ ${chalk.italic.dim("to")} ${chalk.bold.yellow("STDOUT")} ]`)
    log('-'.repeat(60))

    output(table);

    log('\n' + '='.repeat(60));
    log('RECOMMENDED: Use the GitHub Markdown Table in the "install" section!');
    log('✅ No custom JavaScript needed');
    log('✅ GitHub automatically adds copy buttons to code blocks');
    log('✅ Cleaner, more maintainable markdown');
    log('✅ Consistent with GitHub\'s native UX');
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}


