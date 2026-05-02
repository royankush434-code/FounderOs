const fs = require('fs');
const content = fs.readFileSync('d:/founderOs/src/app/page.tsx', 'utf8');
let curlies = 0;
let rounds = 0;
let squares = 0;
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') curlies++;
  else if (char === '}') curlies--;
  else if (char === '(') rounds++;
  else if (char === ')') rounds--;
  else if (char === '[') squares++;
  else if (char === ']') squares--;
  
  if (curlies < 0 || rounds < 0 || squares < 0) {
    console.log(`Unbalanced at index ${i} (char ${char}): c=${curlies}, r=${rounds}, s=${squares}`);
    // break;
  }
}
console.log('Final counts:', { curlies, rounds, squares });
