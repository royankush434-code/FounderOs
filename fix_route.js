const fs = require('fs');

let content = fs.readFileSync('src/app/api/analyze/route.ts', 'utf8');

// 1. CYNICAL ROLE and OUTPUTS ARRAY
content = content.replace(
  "export async function POST(req: Request) {\n  try {\n    const { idea",
  "export async function POST(req: Request) {\n  const CYNICAL_ROLE = `ROLE: Cynical Auditor. Be brutally honest, pessimistic, and find fatal flaws.`;\n  const outputs: string[] = [];\n  try {\n    const { idea"
);

// 2. AGENT 1
content = content.replace(
  "content: `You are a cynical startup problem analyst. Your job\nis to find reasons why a problem is NOT worth solving,\nnot reasons why it is.",
  "content: `${CYNICAL_ROLE}`"
);
content = content.replace(
  "const agent1Output = agent1.choices[0]?.message?.content ?? '{}';",
  "const agent1Output = agent1.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 1: ${agent1Output}`);"
);

// 3. AGENT 2
content = content.replace(
  "content: `You are a market research analyst. Be pessimistic\nabout market potential — most markets are smaller\nand harder than founders think.",
  "content: `${CYNICAL_ROLE}`"
);
content = content.replace(
  "const agent2Output = agent2.choices[0]?.message?.content ?? '{}';",
  "const agent2Output = agent2.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 2: ${agent2Output}`);"
);

// 4. AGENT 3
content = content.replace(
  "content: `You are a competitive intelligence analyst.\nOnly name companies that ACTUALLY EXIST right now.\nNever invent company names.",
  "content: `${CYNICAL_ROLE}\nOnly name companies that ACTUALLY EXIST right now.\nNever invent company names.`"
);
content = content.replace(
  "- Do not provide generic competitors. You must identify at least one failed startup in this space and explain why their 'Ghost' haunts this new idea.",
  "- Mention one failed startup in this sector and its primary cause of death. Keep it under 30 words."
);
content = content.replace(
  "const agent3Output = agent3.choices[0]?.message?.content ?? '{}';",
  "const agent3Output = agent3.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 3: ${agent3Output}`);"
);

// 5. AGENT 4
content = content.replace(
  "content: `You are a VC analyst who has seen thousands of failed\nstartups. Be conservative on market sizing.",
  "content: `${CYNICAL_ROLE}\nBe conservative on market sizing.`"
);
content = content.replace(
  "Previous: ${agent1Output} ${agent2Output} ${agent3Output}",
  ""
);
content = content.replace(
  "Agent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "const agent4Output = agent4.choices[0]?.message?.content ?? '{}';",
  "const agent4Output = agent4.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 4: ${agent4Output}`);"
);

// 6. AGENT 5
content = content.replace(
  "content: `You are a behavioral economist. You know that most\nstartups overestimate how much users will change behavior.",
  "content: `${CYNICAL_ROLE}`"
);
content = content.replace(
  "Previous: ${agent1Output} ${agent2Output}\n${agent3Output} ${agent4Output}",
  ""
);
content = content.replace(
  "Agent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "const agent5Output = agent5.choices[0]?.message?.content ?? '{}';",
  "const agent5Output = agent5.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 5: ${agent5Output}`);"
);

// 7. AGENT 6
content = content.replace(
  "content: `You are the world's most calibrated startup scoring\nengine. You are known for accurate pessimism — you\npredict failures correctly 85% of the time.",
  "content: `${CYNICAL_ROLE}`"
);
content = content.replace(
  "All previous agent outputs:\nAgent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "Agent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "const agent6Output = agent6.choices[0]?.message?.content ?? '{}';",
  "const agent6Output = agent6.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 6: ${agent6Output}`);"
);

// 8. AGENT 7
content = content.replace(
  "content: `You are the most cynical startup critic alive.\nYou have seen every startup pattern and you know\nexactly where founders deceive themselves.",
  "content: `${CYNICAL_ROLE}\nList exactly 3 technical and 3 market hurdles. No conversational filler.`"
);
content = content.replace(
  "Your job: Find the 3 most devastating reasons this\nstartup will fail. Surface the insight the founder\nhas never thought of. Ask the question that exposes\nthe fatal flaw.",
  ""
);
content = content.replace(
  "All previous outputs:\nAgent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}\nAgent 6: ${agent6Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "Agent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}\nAgent 6: ${agent6Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "const agent7Output = agent7.choices[0]?.message?.content ?? '{}';",
  "const agent7Output = agent7.choices[0]?.message?.content ?? '{}';\n    outputs.push(`Agent 7: ${agent7Output}`);"
);

// 9. AGENT 8 (Do not use slice since agent 8 explicitly extracts from ALL previous agents, wait, the prompt says "In Agents 4, 5, 6, 7, and 8, find where you pass previousAgentsOutput... CHANGE: Instead of passing the entire JSON history, only pass the last two agent responses.")
content = content.replace(
  "All agent outputs:\nAgent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}\nAgent 6: ${agent6Output}\nAgent 7: ${agent7Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);
content = content.replace(
  "Agent 1: ${agent1Output}\nAgent 2: ${agent2Output}\nAgent 3: ${agent3Output}\nAgent 4: ${agent4Output}\nAgent 5: ${agent5Output}\nAgent 6: ${agent6Output}\nAgent 7: ${agent7Output}",
  "Previous Agent Outputs:\n${outputs.slice(-2).join('\\n---\\n')}"
);

fs.writeFileSync('src/app/api/analyze/route.ts', content);
console.log('Script executed, file updated.');
