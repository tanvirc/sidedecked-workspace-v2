# Phase 7 Tech Writer Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the story-lifecycle Phase 7 (Steps 14-16) so the tech writer agent actually reads, updates, and creates documentation with the same rigor as Phases 2-3.

**Architecture:** Create a new `story-docs` sub-workflow (workflow.yaml + instructions.xml + checklist.md) following the existing dev-story/code-review pattern. Rewrite Steps 14-16 in the lifecycle instructions.xml to load context properly, invoke the sub-workflow, and tighten PR creation.

**Tech Stack:** BMAD workflow YAML, XML instructions, Markdown checklist

**Design doc:** `docs/plans/2026-02-20-phase7-tech-writer-redesign.md`

---

### Task 1: Create story-docs workflow.yaml

**Files:**
- Create: `_bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml`
- Reference: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml` (pattern to follow)
- Reference: `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml` (pattern to follow)

**Step 1: Create the workflow.yaml file**

```yaml
name: story-docs
description: "Update and create project documentation for a completed story. Reads all impacted docs, updates existing docs (CHANGELOG, architecture, READMEs, story file, sprint-status), creates new docs (API reference, architecture, user guides) when warranted, and validates against documentation-standards.md."
author: "SideDecked"

# Critical variables from config
config_source: "{project-root}/_bmad/bmm/config.yaml"
user_name: "{config_source}:user_name"
communication_language: "{config_source}:communication_language"
user_skill_level: "{config_source}:user_skill_level"
document_output_language: "{config_source}:document_output_language"
date: system-generated
planning_artifacts: "{config_source}:planning_artifacts"
implementation_artifacts: "{config_source}:implementation_artifacts"
output_folder: "{implementation_artifacts}"
sprint_status: "{implementation_artifacts}/sprint-status.yaml"

# Workflow components
installed_path: "{project-root}/_bmad/bmm/workflows/4-implementation/story-docs"
instructions: "{installed_path}/instructions.xml"
validation: "{installed_path}/checklist.md"
template: false

variables:
  project_context: "**/project-context.md"
  story_dir: "{implementation_artifacts}"
  doc_standards: "{project-root}/_bmad/_memory/tech-writer-sidecar/documentation-standards.md"
  architecture_docs: "docs/architecture"

input_file_patterns:
  architecture:
    description: "Architecture docs that may need updating"
    whole: "docs/architecture/*.md"
    load_strategy: "FULL_LOAD"
  standards:
    description: "Documentation quality standards"
    whole: "{project-root}/_bmad/_memory/tech-writer-sidecar/documentation-standards.md"
    load_strategy: "FULL_LOAD"
```

**Step 2: Verify the file was created**

Run: `ls _bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml`
Expected: File exists

**Step 3: Commit**

```bash
git add _bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml
git commit -m "feat(bmad): add story-docs sub-workflow config"
```

---

### Task 2: Create story-docs instructions.xml

**Files:**
- Create: `_bmad/bmm/workflows/4-implementation/story-docs/instructions.xml`
- Reference: `_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml` (style/structure pattern)
- Reference: `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml` (git diff pattern)
- Reference: `_bmad/_memory/tech-writer-sidecar/documentation-standards.md` (quality rules)

**Step 1: Create the instructions.xml file**

The file has 6 steps:

1. **Discovery** — git diff across repos, load Phase 2+3 outputs, cross-reference, output Documentation Impact Matrix
2. **Read All Impacted Docs** — read every doc in the impact matrix plus always-read docs (CHANGELOG, READMEs, architecture, story file, doc standards)
3. **Update Existing Documentation** — mandatory non-conditional updates to CHANGELOG, architecture docs, story file ACs, sprint-status, READMEs. Each architecture doc explicitly addressed or justified
4. **Create New Documentation** — API reference for new endpoints, architecture docs for new modules, user guides for new features. Each category requires explicit justification if skipped
5. **Quality Gate + Commit** — run checklist, validate against documentation-standards.md, commit and push
6. **Create Pull Requests** — existing PR logic with "Documentation Changes" section in PR body and validation that doc files appear in diff

Full content for the file:

```xml
<workflow>
  <critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
  <critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
  <critical>Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}</critical>
  <critical>Generate all documents in {document_output_language}</critical>
  <critical>You are a Technical Documentation Specialist. Your job is to READ existing docs, UPDATE them with substance, and CREATE new docs when warranted.</critical>
  <critical>NEVER skip a documentation category silently. Every category must be explicitly addressed: updated OR justified why no update is needed.</critical>
  <critical>NEVER add AI references in documentation: no "Claude", "Generated with", "Co-Authored-By: Claude", robot emojis.</critical>
  <critical>Follow {doc_standards} for all documentation output.</critical>

  <!-- ═══════════════════════════════════════════════════════
       STEP 1: Discovery — Diff Analysis + Design Note Cross-Reference
       ═══════════════════════════════════════════════════════ -->

  <step n="1" goal="Analyse code changes and build Documentation Impact Matrix">
    <action>Identify all repos that received commits on the feature branch (root repo + child repos: backend/, customer-backend/, storefront/, vendorpanel/)</action>
    <action>For EACH repo with a feature branch:
      - cd into the repo directory
      - Run: git diff main..HEAD --name-only
      - Record the list of changed files per repo
      - cd back to root
    </action>

    <action>Load the Technical Design Note from Phase 3 (already in context). Extract:
      - Domain classification (commerce vs customer experience vs frontend)
      - Affected files/modules list
      - New database entities or migrations
      - API contract changes (new or modified endpoints)
      - Integration touchpoints (Stripe, Algolia, Redis, MinIO, Resend)
      - Architectural risks or decisions made
    </action>

    <action>Load the Requirements + UX Brief from Phase 2 (already in context). Extract:
      - New user-facing features or flows
      - UX interaction patterns introduced
      - Business rules added or changed
    </action>

    <action>Cross-reference: compare the git diff file list against the Technical Design Note's affected files list. Flag:
      - Files changed in code but NOT mentioned in the design note (potential undocumented changes)
      - Files in the design note but NOT changed (potential incomplete implementation — note for doc purposes only)
    </action>

    <action>Build a Documentation Impact Matrix table:
      | Changed Area | Source (git diff / design note / both) | Docs to Update | Docs to Create | Priority |
      |---|---|---|---|---|
      (one row per logical change area — e.g., "new vendor API endpoint", "updated card pricing model", etc.)

      For each row, determine which existing docs need updating and whether new docs should be created.
      Priority: HIGH (user-facing or API change), MEDIUM (internal architecture), LOW (minor refactor)
    </action>

    <output>
      ## Step 1 Complete — Documentation Impact Matrix

      (display the matrix table)

      **Code changes not in design note:** {{undocumented_changes_count}}
      **Total doc update targets:** {{update_count}}
      **Total new doc candidates:** {{create_count}}
    </output>
  </step>

  <!-- ═══════════════════════════════════════════════════════
       STEP 2: Read All Impacted Documentation
       ═══════════════════════════════════════════════════════ -->

  <step n="2" goal="Read current state of all documentation that may need updating">
    <critical>You MUST read every doc before modifying it. No blind updates.</critical>

    <action>Read the following ALWAYS-READ docs in full:
      - Root CHANGELOG.md
      - Root README.md
      - The story file (from story_dir matching the current story key)
      - {sprint_status} (sprint-status.yaml)
      - {doc_standards} (documentation-standards.md — prime quality rules for all subsequent steps)
    </action>

    <action>For EACH child repo identified in Step 1 as having changes:
      - Read the repo's README.md (if it exists)
      - Read the repo's CHANGELOG.md (if it exists)
    </action>

    <action>Read ALL architecture docs in {architecture_docs}/:
      - For each architecture doc, note its current scope and what it covers
      - Flag which ones are relevant to this story based on the Impact Matrix from Step 1
    </action>

    <action>If the Impact Matrix identified API contract changes: read any existing API reference documentation (look in docs/api/, docs/standards/, or similar paths)</action>

    <action>Output a Documentation State Summary:
      | Document | Path | Current Coverage | Relevant to Story? | Needs Update? |
      |---|---|---|---|---|
      (one row per doc read — include ALL docs read, not just the ones that need updating)
    </action>
  </step>

  <!-- ═══════════════════════════════════════════════════════
       STEP 3: Update Existing Documentation (Mandatory)
       ═══════════════════════════════════════════════════════ -->

  <step n="3" goal="Update all existing documentation impacted by this story">
    <critical>Every documentation category below is MANDATORY. You must either update the doc OR provide explicit justification citing the specific doc content and why no update is needed.</critical>

    <!-- CHANGELOG -->
    <action>Update CHANGELOG.md:
      - Add entry under the correct version/date section
      - Describe WHAT was built and WHY (not just "updated X" or "added Y")
      - Reference the story key
      - Follow conventional changelog format (Added, Changed, Fixed, Removed)
    </action>

    <!-- Architecture Docs -->
    <action>For EACH architecture doc flagged as relevant in Step 2:
      - Determine what content needs updating based on the Technical Design Note
      - Update sections affected by new patterns, components, data flows, or integration changes
      - Add or update Mermaid diagrams where the story changes system interactions
      - If the doc genuinely does not need updating: write a one-sentence justification referencing the specific doc section that already covers this area
    </action>

    <action>For EACH architecture doc flagged as NOT relevant in Step 2:
      - Confirm it truly is not affected by cross-referencing the git diff and design note
    </action>

    <!-- Story File -->
    <action>Update the story file:
      - For EACH acceptance criterion: verify it was implemented by checking the actual code changes from Step 1
      - Mark each verified criterion as (IMPLEMENTED)
      - If any criterion cannot be verified against the code: flag it and do NOT mark as implemented
    </action>

    <!-- Sprint Status -->
    <action>Update {sprint_status}:
      - Set the story status to "done"
      - Preserve ALL existing comments and structure in the YAML file
    </action>

    <!-- READMEs -->
    <action>Update root README.md if the story changes:
      - Available features or capabilities
      - Setup or installation instructions
      - Environment variables or configuration
      - API surface area
      If none of these changed: state "Root README.md — no update needed: [specific reason]"
    </action>

    <action>For EACH child repo with changes, update its README.md if the story changes:
      - Repo-specific setup, build, or run instructions
      - New dependencies or configuration requirements
      - New modules, services, or endpoints in that repo
      If none of these changed: state "{repo} README.md — no update needed: [specific reason]"
    </action>

    <action>Validate every update against {doc_standards}:
      - CommonMark strict compliance
      - Active voice, present tense
      - No time estimates
      - No AI references
      - Code blocks have language tags
      - Proper header hierarchy
    </action>
  </step>

  <!-- ═══════════════════════════════════════════════════════
       STEP 4: Create New Documentation (When Warranted)
       ═══════════════════════════════════════════════════════ -->

  <step n="4" goal="Create new documentation for new capabilities introduced by this story">
    <critical>Each category below MUST be explicitly addressed. Either create the doc OR justify why no new doc is needed with a specific reason.</critical>

    <!-- API Reference Docs -->
    <action>If the story introduced NEW API endpoints (from the Technical Design Note or git diff):
      - Create or update API reference documentation for each new endpoint
      - Include: endpoint path, HTTP method, authentication requirements, request parameters (path, query, body) with types, request example, response schema with types, response examples (success + common errors), error codes
      - Follow the OpenAPI documentation standards from {doc_standards}
      - Place in the appropriate location (docs/api/ or alongside existing API docs)
    </action>
    <action>If NO new API endpoints were introduced:
      - State: "No new API reference docs needed — [specific reason, e.g., 'story modified existing endpoint behavior only, already documented in X']"
    </action>

    <!-- Architecture Docs -->
    <action>If the story introduced a NEW module, service, or architectural pattern significant enough to warrant its own doc:
      - Create a new architecture doc in {architecture_docs}/ following the existing numbering convention (e.g., 08-new-topic.md)
      - Include: system overview diagram (Mermaid), component descriptions, data flow, technology decisions
      - Follow {doc_standards} Architecture Docs section
    </action>
    <action>If NO new architecture doc is warranted:
      - State: "No new architecture doc needed — [specific reason, e.g., 'changes extend existing vendor module already covered in 04-architectural-patterns.md']"
    </action>

    <!-- User Guides -->
    <action>If the story added USER-FACING features (from the Requirements + UX Brief):
      - Create or update task-oriented documentation with "How to..." sections
      - Include step-by-step instructions for the new capability
      - Add screenshots or Mermaid flow diagrams where they aid understanding
      - Place in the appropriate location (docs/guides/ or alongside existing user docs)
    </action>
    <action>If NO user-facing features were added:
      - State: "No user guide updates needed — [specific reason, e.g., 'story is backend-only with no UI changes']"
    </action>

    <action>Validate all new docs against {doc_standards} quality checklist before proceeding</action>
  </step>

  <!-- ═══════════════════════════════════════════════════════
       STEP 5: Quality Gate + Commit
       ═══════════════════════════════════════════════════════ -->

  <step n="5" goal="Validate documentation quality, commit, and push">
    <action>Run the documentation Definition of Done checklist ({installed_path}/checklist.md) against ALL updated and new docs</action>

    <action>Verify each quality criterion:
      - CommonMark strict compliance (ATX headers, fenced code blocks, proper link syntax)
      - No time estimates anywhere in any doc
      - No AI references anywhere ("Claude", "Generated with", "Co-Authored-By", robot emojis)
      - Proper header hierarchy (no skipped levels)
      - All code blocks have language tags
      - Mermaid diagrams use valid v10+ syntax (if any were added)
      - Active voice, present tense throughout
      - Task-oriented writing (answers "how do I...")
      - Descriptive link text (no "click here")
    </action>

    <action>If any quality criterion fails: fix the issue before committing</action>

    <action>Commit all documentation changes to the feature branch in EACH affected repo:
      - For each repo with doc changes:
        - cd into the repo directory
        - Stage all documentation files
        - Commit: docs({{story_scope}}): update documentation for {{story_title}}
        - Push: git push
        - Record the commit hash
        - cd back to root
      - For the root repo (story file, CHANGELOG, architecture docs, sprint-status):
        - Stage all changed doc files
        - Commit: docs({{story_scope}}): update documentation for {{story_title}}
        - Push: git push
        - Record the commit hash
    </action>

    <action>Output a Documentation Update Report:
      | File Path | Action | Summary of Changes |
      |---|---|---|
      (one row per file — action is "created", "updated", or "unchanged with justification")

      **New docs created:** {{new_doc_count}}
      **Existing docs updated:** {{updated_doc_count}}
      **Docs unchanged (with justification):** {{unchanged_count}}
      **Quality gate:** PASS / FAIL
      **Commit hashes:** (list per repo)
    </action>
  </step>

  <!-- ═══════════════════════════════════════════════════════
       STEP 6: Create Pull Requests
       ═══════════════════════════════════════════════════════ -->

  <step n="6" goal="Create pull requests in ALL repos that received commits">
    <action>Ensure all changes are committed and pushed to the feature branch in every affected repo</action>

    <action>For EACH repo that received commits during the story lifecycle (root + any child repos):
      - cd into the repo directory
      - Check if the feature branch has commits ahead of main: git log main..HEAD --oneline
      - If there ARE commits: create a PR using gh CLI
        - PR title: concise and descriptive, matching the story title
        - PR body must include:
          - Story key reference
          - Summary of changes specific to this repo
          - **Documentation Changes** section listing which docs were updated or created in this repo
          - Railway preview URL (from Phase 6, if available in context)
          - Testing notes
          - Acceptance criteria checklist
        - CRITICAL: No AI references in PR title or body
      - If there are NO commits (branch was created but empty): skip — do NOT create an empty PR
      - cd back to root
    </action>

    <action>Validate: for each PR created, verify that files listed in the Documentation Update Report (Step 5) for this repo appear in the PR diff. If any doc file is missing from the diff, investigate and fix before finalizing.</action>

    <action>Output a PR Creation Summary:
      | Repo | Had Commits? | PR Created? | PR URL | Doc Files in Diff? |
      |---|---|---|---|---|
      (one row per repo — root + all child repos with feature branches)
    </action>
  </step>

</workflow>
```

**Step 2: Verify the file was created and is well-formed XML**

Run: `ls _bmad/bmm/workflows/4-implementation/story-docs/instructions.xml`
Expected: File exists

Run: `python -c "import xml.etree.ElementTree as ET; ET.parse('_bmad/bmm/workflows/4-implementation/story-docs/instructions.xml'); print('Valid XML')"`
Expected: "Valid XML"

**Step 3: Commit**

```bash
git add _bmad/bmm/workflows/4-implementation/story-docs/instructions.xml
git commit -m "feat(bmad): add story-docs sub-workflow instructions"
```

---

### Task 3: Create story-docs checklist.md

**Files:**
- Create: `_bmad/bmm/workflows/4-implementation/story-docs/checklist.md`
- Reference: `_bmad/bmm/workflows/4-implementation/dev-story/checklist.md` (pattern to follow)

**Step 1: Create the checklist.md file**

```markdown
---
title: 'Story Documentation Definition of Done Checklist'
validation-target: 'All documentation updated or created for the completed story'
validation-criticality: 'HIGHEST'
required-inputs:
  - 'Documentation Impact Matrix from Step 1'
  - 'Documentation State Summary from Step 2'
  - 'Technical Design Note from Phase 3 (lifecycle context)'
  - 'Requirements + UX Brief from Phase 2 (lifecycle context)'
optional-inputs:
  - 'Existing API reference docs'
  - 'Existing user guides'
validation-rules:
  - 'Every documentation category must be explicitly addressed — updated or justified'
  - 'All docs must pass documentation-standards.md quality checklist'
  - 'No AI references in any documentation'
  - 'No silent skips — every unchanged doc has a written justification'
---

# Story Documentation Definition of Done

**Critical validation:** Documentation is truly complete only when ALL items below are satisfied.

## Discovery and Analysis

- [ ] **Git Diff Analysis:** git diff main..HEAD --name-only run across all affected repos
- [ ] **Design Note Cross-Reference:** Technical Design Note (Phase 3) loaded and all change areas extracted
- [ ] **UX Brief Cross-Reference:** Requirements + UX Brief (Phase 2) reviewed for doc-relevant content
- [ ] **Gap Detection:** Code changes not in design note flagged and accounted for
- [ ] **Documentation Impact Matrix:** Produced with per-area mapping to docs needing update/creation

## Existing Documentation Updates

- [ ] **CHANGELOG.md:** Entry added describing what was built and why (not just "updated X")
- [ ] **Story File ACs:** Each acceptance criterion verified against actual code and marked (IMPLEMENTED)
- [ ] **Sprint Status:** sprint-status.yaml updated to "done" with structure preserved
- [ ] **Architecture Docs:** EACH architecture doc explicitly addressed — updated with substantive content OR justified with specific reason why no update is needed
- [ ] **Root README.md:** Updated if features/setup/config/API changed, OR justified why not
- [ ] **Child Repo READMEs:** Updated if repo-specific setup/deps/modules changed, OR justified why not

## New Documentation

- [ ] **API Reference:** New endpoints documented with full OpenAPI-style detail, OR explicitly justified why not needed
- [ ] **Architecture Doc:** New module/pattern documented in docs/architecture/, OR explicitly justified why not needed
- [ ] **User Guide:** Task-oriented how-to docs created for new user-facing features, OR explicitly justified why not needed

## Quality Gate

- [ ] **Documentation Standards:** All docs validated against documentation-standards.md
- [ ] **CommonMark Compliance:** ATX headers, fenced code blocks, proper link syntax
- [ ] **No Time Estimates:** Zero time/duration/effort estimates in any doc
- [ ] **No AI References:** Zero mentions of "Claude", "Generated with", "Co-Authored-By", robot emojis
- [ ] **Header Hierarchy:** No skipped levels (h1 then h2 then h3, not h1 then h3)
- [ ] **Code Blocks:** All code blocks have language identifier tags
- [ ] **Mermaid Diagrams:** Valid v10+ syntax, render correctly (if any added)
- [ ] **Active Voice:** Present tense, direct language throughout
- [ ] **Committed and Pushed:** All documentation changes committed to feature branch and pushed to remote

## Documentation Update Report

- [ ] **Report Produced:** Table with file path, action (created/updated/unchanged), and summary
- [ ] **Justifications Complete:** Every unchanged doc has a written justification
- [ ] **Commit Hashes Recorded:** Per-repo commit hashes documented
```

**Step 2: Verify the file was created**

Run: `ls _bmad/bmm/workflows/4-implementation/story-docs/checklist.md`
Expected: File exists

**Step 3: Commit**

```bash
git add _bmad/bmm/workflows/4-implementation/story-docs/checklist.md
git commit -m "feat(bmad): add story-docs documentation definition of done checklist"
```

---

### Task 4: Rewrite story-lifecycle instructions.xml Steps 14-16

**Files:**
- Modify: `_bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml:262-320`
- Reference: `_bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml` (sub-workflow to invoke)

**Step 1: Replace the Phase 7 comment block and Steps 14-16**

Find the section starting at line 260 (`<!-- ═══════════ PHASE 7 ═══════════ -->`) through line 320 (end of Step 16's `</ask>` and `</step>`).

Replace with the rewritten version that:
- **Step 14:** Loads tech writer persona + documentation-standards.md + customize file + explicitly summarizes Phase 2 and Phase 3 outputs
- **Step 15:** Uses `<invoke-workflow>` to call story-docs sub-workflow (Steps 1-5), followed by user confirmation `<ask>`
- **Step 16:** Existing PR logic enhanced with "Documentation Changes" section requirement and doc file diff validation

The replacement content for Steps 14-16:

```xml
  <!-- ═══════════════════════════════════════════════════════
       PHASE 7: Documentation — Tech Writer
       ═══════════════════════════════════════════════════════ -->

  <step n="14" goal="Load Tech Writer persona with full documentation context">
    <action>Load and read {agent_path}/tech-writer/tech-writer.md — adopt Tech Writer persona completely</action>
    <action>Load and read {project-root}/_bmad/_memory/tech-writer-sidecar/documentation-standards.md — these are the quality rules for ALL documentation output</action>
    <action>Load and read {project-root}/_bmad/_config/agents/bmm-tech-writer.customize.yaml — SideDecked-specific tech writer rules</action>
    <action>Summarize the Phase 2 outputs already in context:
      - Requirements + UX Brief: list the key user-facing features, business rules, and UX flows defined
      - These inform which user guides and feature docs may need creating
    </action>
    <action>Summarize the Phase 3 outputs already in context:
      - Technical Design Note: list the domain classification, affected files/modules, new entities, API contracts, integration points
      - These inform which architecture docs, API docs, and READMEs need updating
    </action>
    <action>Confirm: Tech Writer persona loaded, documentation standards primed, Phase 2 + Phase 3 context summarized and ready as primary inputs for documentation work</action>
  </step>

  <step n="15" goal="Tech Writer: Execute documentation sub-workflow">
    <invoke-workflow config="{project-root}/_bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml" />
    <ask>
      ## Phase 7A Complete — Documentation Updated

      Tech Writer has executed the documentation workflow (see Documentation Update Report above).

      Before confirming, verify:
      - [ ] CHANGELOG.md has a substantive entry (what + why)
      - [ ] Architecture docs addressed (updated or justified)
      - [ ] Story acceptance criteria verified and marked (IMPLEMENTED)
      - [ ] New docs created where warranted (API, architecture, user guide)
      - [ ] All changes committed and pushed to feature branch

      Type CONFIRM to proceed to pull request creation.
      Or describe documentation gaps to address first.
    </ask>
  </step>

  <step n="16" goal="Tech Writer: Create pull requests in ALL repos that received commits">
    <action>Ensure all changes are committed and pushed to the feature branch in every affected repo</action>
    <action>For EACH repo that received commits during Phase 4 (root + any child repos):
      - cd into the repo directory
      - Check if the feature branch has commits ahead of main: git log main..HEAD --oneline
      - If there ARE commits: create a PR using gh CLI
        - PR title: concise and descriptive, matching the story title
        - PR body must include:
          - Story key reference
          - Summary of changes specific to this repo
          - **Documentation Changes** section listing docs updated or created in this repo (from the Documentation Update Report in Step 15)
          - Railway preview URL from deployment phase
          - Testing notes
          - Acceptance criteria checklist
        - Do NOT use AI references in PR title or body
      - If there are NO commits (branch was created but empty): skip — do NOT create an empty PR
      - cd back to root
    </action>
    <action>Validate: for each PR created, verify that documentation files from the Documentation Update Report appear in the PR diff. If any doc file is missing, investigate before finalizing the PR.</action>
    <action>Output a PR Creation Summary table listing all repos:
      | Repo | Had commits? | PR created? | PR URL | Doc files in diff? |
      (one row per repo — root + all child repos with feature branches)
    </action>
    <ask>
      ## Phase 7 Complete — Pull Requests Created

      Pull requests have been created for all repos with commits (see table above).

      Type CONFIRM to proceed to code review and PR comment handling.
      Or describe any changes needed to the PRs.
    </ask>
  </step>
```

**Step 2: Verify the lifecycle instructions.xml is still well-formed XML**

Run: `python -c "import xml.etree.ElementTree as ET; ET.parse('_bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml'); print('Valid XML')"`
Expected: "Valid XML"

**Step 3: Verify the invoke-workflow path is correct**

Run: `ls _bmad/bmm/workflows/4-implementation/story-docs/workflow.yaml`
Expected: File exists (created in Task 1)

**Step 4: Commit**

```bash
git add _bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml
git commit -m "feat(bmad): rewrite Phase 7 steps 14-16 with sub-workflow and enhanced context"
```

---

### Task 5: Final Verification

**Files:**
- Verify: all 4 files from Tasks 1-4

**Step 1: Verify all new files exist**

Run: `ls -la _bmad/bmm/workflows/4-implementation/story-docs/`
Expected: workflow.yaml, instructions.xml, checklist.md — all 3 files present

**Step 2: Verify story-lifecycle instructions.xml references are consistent**

Run: `grep -n "invoke-workflow" _bmad/bmm/workflows/4-implementation/story-lifecycle/instructions.xml`
Expected: Should show the story-docs workflow path alongside dev-story and qa/automate paths

**Step 3: Verify no AI references snuck into any file**

Run: `grep -ri "claude\|co-authored\|generated with" _bmad/bmm/workflows/4-implementation/story-docs/`
Expected: No matches

**Step 4: Final commit (if any fixups needed)**

If any issues found in steps 1-3, fix and commit:
```bash
git add -A _bmad/bmm/workflows/4-implementation/
git commit -m "fix(bmad): address verification issues in story-docs workflow"
```
