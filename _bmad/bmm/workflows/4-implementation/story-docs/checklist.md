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
