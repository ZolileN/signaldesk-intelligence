const fs = require('fs');

const code = fs.readFileSync('/home/zolile/Documents/signaldesk-app/apps/web/src/App.jsx', 'utf8');

let pos = 0;
const len = code.length;
const stack = [];

function getLineNum(offset) {
  return code.substring(0, offset).split('\n').length;
}

// We want to scan the file and find JSX tags.
// Inside JSX, we can have JavaScript expressions in curly braces { ... }.
// We must keep track of curly brace nesting to skip parsing tags inside JS expressions,
// except when those JS expressions return JSX!
// So let's trace character by character.

let braceDepth = 0;
let inString = null; // " or ' or `

while (pos < len) {
  const char = code[pos];
  const nextChar = code[pos + 1];

  // Handle strings (to skip braces or tags inside strings)
  if (inString) {
    if (char === '\\') {
      pos += 2;
      continue;
    }
    if (char === inString) {
      inString = null;
    }
    pos++;
    continue;
  }

  if (char === '"' || char === "'" || char === '`') {
    inString = char;
    pos++;
    continue;
  }

  // Handle comments
  if (char === '/' && nextChar === '*') {
    pos += 2;
    while (pos < len && !(code[pos] === '*' && code[pos + 1] === '/')) {
      pos++;
    }
    pos += 2;
    continue;
  }
  if (char === '/' && nextChar === '/') {
    pos += 2;
    while (pos < len && code[pos] !== '\n') {
      pos++;
    }
    pos++;
    continue;
  }

  // Track curly braces
  if (char === '{') {
    braceDepth++;
    pos++;
    continue;
  }
  if (char === '}') {
    braceDepth--;
    pos++;
    continue;
  }

  // Parse tags only at braceDepth 0 (or inside JSX, but let's be approximate)
  // In our case, the root return has braceDepth > 0 because it's inside the function.
  // But wait! Inside JSX, curly braces increase braceDepth.
  // So a tag is inside a JSX context.
  // Let's detect JSX tags: they start with < followed by a letter or /
  if (char === '<' && (/[a-zA-Z\/]/.test(nextChar))) {
    // Read the tag
    let tagStr = '';
    let tempPos = pos;
    let tagBraceDepth = 0;
    let tagInString = null;

    while (tempPos < len) {
      const c = code[tempPos];
      if (tagInString) {
        if (c === '\\') { tempPos += 2; continue; }
        if (c === tagInString) { tagInString = null; }
        tagStr += c;
        tempPos++;
        continue;
      }
      if (c === '"' || c === "'") {
        tagInString = c;
        tagStr += c;
        tempPos++;
        continue;
      }
      if (c === '{') { tagBraceDepth++; }
      if (c === '}') { tagBraceDepth--; }

      tagStr += c;
      if (c === '>' && tagBraceDepth === 0) {
        tempPos++;
        break;
      }
      tempPos++;
    }

    // Now process the tagStr
    const lineNum = getLineNum(pos);
    if (tagStr.startsWith('</')) {
      // Closing tag
      const tagName = tagStr.substring(2, tagStr.length - 1).trim().split(/[ \t\r\n>]/)[0];
      if (stack.length === 0) {
        console.log(`[Line ${lineNum}] Unexpected closing tag: ${tagStr}`);
      } else {
        const last = stack.pop();
        if (last.name !== tagName) {
          console.log(`[Line ${lineNum}] Mismatched tag: closed ${tagName}, expected ${last.name} (opened at line ${last.line})`);
          stack.push(last); // restore
        }
      }
    } else if (tagStr.endsWith('/>')) {
      // Self-closing
    } else {
      // Opening tag
      const tagName = tagStr.substring(1).trim().split(/[ \t\r\n>]/)[0];
      // Skip fragment <>
      if (tagName !== '') {
        stack.push({ name: tagName, line: lineNum, text: tagStr });
      }
    }

    pos = tempPos;
    continue;
  }

  pos++;
}

console.log("Unclosed tags remaining in stack at end of file:");
stack.forEach(t => {
  console.log(`- <${t.name}> opened at line ${t.line}`);
});
