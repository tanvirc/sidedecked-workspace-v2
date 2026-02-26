---
name: bmad-bmm-story-lifecycle
description: bmad-bmm-story-lifecycle skill
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - while staying in character as the current agent persona you may have loaded:

<steps CRITICAL="TRUE">
1. Always LOAD the FULL @_bmad/core/tasks/workflow.xml
2. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @_bmad/bmm/workflows/4-implementation/story-lifecycle/workflow.yaml
3. Pass the yaml path _bmad/bmm/workflows/4-implementation/story-lifecycle/workflow.yaml as 'workflow-config' parameter to the workflow.xml instructions
4. Follow workflow.xml instructions EXACTLY as written to process and follow the specific workflow config and its instructions
5. Save outputs after EACH section when generating any documents from templates
6. During story-lifecycle Phase 2B Step 7, you MUST output a full in-window party-mode transcript with all five agent turns before any consolidated summary
7. NEVER collapse party-mode dialogue to summary-only output in Codex, OpenCode, or GitHub prompt surfaces
8. If nested workflow or hook output is hidden by the runtime, render every agent turn inline as plain text in the main response
</steps>
