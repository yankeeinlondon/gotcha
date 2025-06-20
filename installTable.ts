#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  name: string;
  version?: string;
}

interface PackageManager {
  name: string;
  installCommand: string;
  addCommand: string;
}

const packageManagers: PackageManager[] = [
  { name: 'npm', installCommand: 'npm install', addCommand: 'npm install' },
  { name: 'pnpm', installCommand: 'pnpm add', addCommand: 'pnpm add' },
  { name: 'yarn', installCommand: 'yarn add', addCommand: 'yarn add' },
  { name: 'bun', installCommand: 'bun add', addCommand: 'bun add' }
];

function readPackageJson(): PackageJson {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(packageJsonContent);
  } catch (error) {
    console.error('Error reading package.json:', error);
    process.exit(1);
  }
}

function generateInstallTable(packageName: string, useGitHubStyle: boolean = true): string {
  if (useGitHubStyle) {
    return generateGitHubStyleTable(packageName);
  }
  return generateInlineStyledTable(packageName);
}

function generateGitHubStyleTable(packageName: string): string {
  const commands = packageManagers.map((pm) => {
    const command = `${pm.addCommand} ${packageName}`;
    
    return `
| **${pm.name}** | \`${command}\` |`;
  }).join('');

  return `
| Package Manager | Command |
|---|---|${commands}
`;
}

function generateInlineStyledTable(packageName: string): string {
  const copyButtonStyle = `
    background: #24292e;
    color: white;
    border: none;
    padding: 4px 8px;
    margin-left: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  `;

  const codeStyle = `
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
    border: 1px solid #d0d7de;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  const tableStyle = `
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  `;

  const cellStyle = `
    padding: 0;
    vertical-align: top;
    width: ${Math.floor(100 / packageManagers.length)}%;
  `;

  const headerStyle = `
    text-align: center;
    font-weight: bold;
    padding: 8px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
  `;

  const headers = packageManagers.map(pm => 
    `<th style="${headerStyle}">${pm.name}</th>`
  ).join('');

  const commands = packageManagers.map((pm) => {
    const command = `${pm.addCommand} ${packageName}`;
    const buttonId = `copy-btn-${pm.name}`;
    
    return `
      <td style="${cellStyle}">
        <div style="${codeStyle}">
          <code>${command}</code>
          <button 
            id="${buttonId}"
            style="${copyButtonStyle}"
            onclick="copyToClipboard('${command}', '${buttonId}')"
            title="Copy to clipboard"
          >
            Copy
          </button>
        </div>
      </td>
    `;
  }).join('');

  const copyScript = `
function copyToClipboard(text, buttonId) {
  navigator.clipboard.writeText(text).then(function() {
    const button = document.getElementById(buttonId);
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = '#28a745';
    setTimeout(function() {
      button.textContent = originalText;
      button.style.background = '#24292e';
    }, 2000);
  }).catch(function(err) {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      const button = document.getElementById(buttonId);
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.style.background = '#28a745';
      setTimeout(function() {
        button.textContent = originalText;
        button.style.background = '#24292e';
      }, 2000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(textArea);
  });
}
`;

  return `
<script>
${copyScript}
</script>

<table style="${tableStyle}">
  <thead>
    <tr>
      ${headers}
    </tr>
  </thead>
  <tbody>
    <tr>
      ${commands}
    </tr>
  </tbody>
</table>
`;
}

function main() {
  const packageJson = readPackageJson();
  
  console.log('Install Table Generator');
  console.log('=' .repeat(60));
  
  console.log('\n1. GitHub Markdown Table (uses GitHub\'s built-in copy buttons):');
  console.log('-'.repeat(60));
  const githubTable = generateInstallTable(packageJson.name, true);
  console.log(githubTable);
  
  console.log('\n2. Inline Styles HTML Version (custom copy buttons):');
  console.log('-'.repeat(60));
  const inlineTable = generateInstallTable(packageJson.name, false);
  console.log(inlineTable);
  
  console.log('\n' + '=' .repeat(60));
  console.log('RECOMMENDED: Use the GitHub Markdown Table!');
  console.log('✅ No custom JavaScript needed');
  console.log('✅ GitHub automatically adds copy buttons to code blocks');
  console.log('✅ Cleaner, more maintainable markdown');
  console.log('✅ Consistent with GitHub\'s native UX');
  console.log('\nFiles created for legacy support:');
  console.log('- install-table.css (styles)');
  console.log('- install-table.js (JavaScript functionality)');
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateInstallTable, readPackageJson };
