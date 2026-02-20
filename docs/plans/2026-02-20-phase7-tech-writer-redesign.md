# Phase 7 Tech Writer Redesign

## Problem

The story-lifecycle workflow Phase 7 (Steps 14-16) produces weak documentation output compared to Phases 2-3. The tech writer persona loads but receives vague, conditional instructions that allow it to skip actual doc updates. Specifically:

- **No "read before write"** — Phases 2-3 explicitly read docs first; Phase 7 says "identify impacted docs" without reading them
- **No sub-workflow** — Phases 4 and 5 invoke dedicated sub-workflows; Phase 7 has raw bullet points
- **Conditional escape hatch** — "Update architecture docs **if** new patterns..." lets the agent skip work silently
- **No instruction to create new docs** — only mentions updating existing ones
- **No reference to documentation-standards.md** — quality rules get lost during multi-agent context switching
- **Weak structured output** — 3 generic bullets vs Phase 3's 6 required sections

## Solution

Create a dedicated `story-docs` sub-workflow and rewrite Steps 14-16 in the story-lifecycle instructions.

## New Files

### `_bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml`

Sub-workflow config matching existing patterns (dev-story, code-review). Variables include story file, story key, architecture docs, documentation standards, feature branch name, and Railway preview URL.

### `_bmad/bmm/workflows/4-implementation/story-docs/instructions.xml`

6-step documentation workflow:

1. **Discovery** — Run `git diff main..HEAD --name-only` across affected repos. Load Technical Design Note (Phase 3) and Requirements + UX Brief (Phase 2). Cross-reference code changes against design note to catch gaps. Output a Documentation Impact Matrix mapping every changed area to docs needing updates.

2. **Read All Impacted Docs** — Read full content of every doc in the impact matrix. Always read: CHANGELOG.md, root README.md, repo-level READMEs, architecture docs referenced in the design note, the story file, and documentation-standards.md. Output current state summary per doc.

3. **Update Existing Documentation** (mandatory, non-conditional) — CHANGELOG.md entry (what + why). Each architecture doc explicitly addressed (updated or justified). Story file acceptance criteria marked (IMPLEMENTED) with verification against code. sprint-status.yaml to done. READMEs updated where setup/features/API surface changed. All updates validated against documentation-standards.md.

4. **Create New Documentation** (when warranted, with explicit justification if skipped) — New API endpoints get reference docs (OpenAPI standards). New modules/patterns get architecture docs following numbering convention. New user-facing features get task-oriented guides. Each category requires explicit justification if no new doc is created.

5. **Quality Gate + Commit** — Run documentation checklist. Verify CommonMark compliance, no time estimates, proper headers, code block language tags, Mermaid rendering, active voice, no AI references. Commit with `docs({story-scope}): update documentation for {story-title}`. Push to remote. Output Documentation Update Report table.

6. **Create Pull Requests** — Existing Step 16 logic with two additions: PR body includes "Documentation Changes" section, and validation that doc files appear in PR diff.

### `_bmad/bmm/workflows/4-implementation/story-docs/checklist.md`

Documentation Definition of Done with four sections:

- **Discovery & Analysis** — git diff, design note cross-reference, impact matrix
- **Existing Documentation Updates** — CHANGELOG, acceptance criteria, sprint-status, architecture docs, READMEs
- **New Documentation** — API docs, architecture docs, user guides (each requires explicit justification if skipped)
- **Quality Gate** — documentation-standards.md compliance, CommonMark, no time estimates, no AI references, Mermaid rendering, active voice

## Modified Files

### `_bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml`

Steps 14-16 rewritten:

- **Step 14** — Enhanced persona load: also loads documentation-standards.md, tech writer customize file, and explicitly summarizes Phase 2 + Phase 3 outputs as primary inputs
- **Step 15** — Replaced with `<invoke-workflow config="story-docs/workflow.yaml" />` (steps 1-5). Same `<ask>` boundary for user confirmation
- **Step 16** — Tightened: adds "Documentation Changes" section to PR body, validates doc files appear in PR diff

## Design Principles

- **Explicit over implicit** — every doc category must be addressed, even if just to justify why no update is needed
- **Read before write** — matching the pattern from Phases 2-3 where agents read source material before producing output
- **Structured output** — Documentation Impact Matrix and Documentation Update Report provide verifiable artifacts
- **Reusable** — sub-workflow can be invoked independently via the tech writer agent menu, not just from the lifecycle
