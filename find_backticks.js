const fs = require('fs');
const lines = fs.readFileSync('src/app/api/analyze/route.ts', 'utf8').split('\n');
let blockStack = [];

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // basic scan for backticks
    let idx = l.indexOf('`');
    while (idx !== -1) {
        if (blockStack.length > 0) {
            blockStack.pop();
            console.log(`Closing backtick at line ${i + 1}`);
        } else {
            blockStack.push('`');
            console.log(`Opening backtick at line ${i + 1}`);
        }
        idx = l.indexOf('`', idx + 1);
    }
}
if (blockStack.length > 0) {
    console.error("UNCLOSED BACKTICK DETECTED!");
}
