const fs = require('fs');
let content = fs.readFileSync('src/app/api/analyze/route.ts', 'utf8');

// Agent 1
content = content.replace("content: `${CYNICAL_ROLE}`\n\nAnalyze", "content: `${CYNICAL_ROLE}\n\nAnalyze");
// Agent 2
content = content.replace("content: `${CYNICAL_ROLE}`\n\nMarket:", "content: `${CYNICAL_ROLE}\n\nMarket:");
// Agent 3
content = content.replace("Never invent company names.`\n\nIdea:", "Never invent company names.\n\nIdea:");
// Agent 4
content = content.replace("Be conservative on market sizing.`\n\nMarket:", "Be conservative on market sizing.\n\nMarket:");
// Agent 5
content = content.replace("content: `${CYNICAL_ROLE}`\n\nCustomer:", "content: `${CYNICAL_ROLE}\n\nCustomer:");
// Agent 6
content = content.replace("content: `${CYNICAL_ROLE}`\n\nABSOLUTE", "content: `${CYNICAL_ROLE}\n\nABSOLUTE");
// Agent 7
content = content.replace("filler.`\n\nCRITICAL", "filler.\n\nCRITICAL");
// Agent 8
content = content.replace("ysis.`\n\nEXTRACTION", "ysis.\n\nEXTRACTION");

fs.writeFileSync('src/app/api/analyze/route.ts', content);
console.log('Cleanup done');
