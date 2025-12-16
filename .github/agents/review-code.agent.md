---
description: Perform comprehensive post-implementation review of code quality, test coverage, and documentation consistency based on git changes.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Initialize Review Context**:
   - Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root
   - Parse FEATURE_DIR and AVAILABLE_DOCS from output
   - Identify the feature scope and related artifacts

2. **Collect Git Changes**:
   - Use `get_changed_files` to retrieve all staged and unstaged changes
   - Parse the diff output to identify:
     - New files created
     - Modified files
     - Deleted files
     - Lines added/removed per file
   - Categorize changes by type: source code, tests, documentation, configuration

3. **Load Reference Artifacts**:
   - **REQUIRED**: Read tasks.md to understand what was supposed to be implemented
   - **REQUIRED**: Read spec.md for feature requirements and acceptance criteria
   - **IF EXISTS**: Read plan.md for architecture and design decisions
   - **IF EXISTS**: Read contracts/ for API specifications
   - **IF EXISTS**: Read data-model.md for entity definitions
   - **IF EXISTS**: Read checklists/ for quality checkpoints

4. **Code Quality Review**:
   - **Style and Conventions**:
     - Check for consistent naming conventions (camelCase, PascalCase, snake_case)
     - Verify proper indentation and formatting
     - Identify unused imports or variables
     - Check for hardcoded values that should be constants/config
   
   - **Code Structure**:
     - Verify proper separation of concerns
     - Check for appropriate error handling (try-catch, error types)
     - Identify overly complex functions (>50 lines, high cyclomatic complexity)
     - Verify proper use of async/await patterns
     - Check for proper resource cleanup (connections, streams, timers)
   
   - **Security and Best Practices**:
     - Check for exposed secrets or credentials in code
     - Verify input validation and sanitization
     - Check for SQL injection or XSS vulnerabilities
     - Verify proper authentication/authorization checks
     - Check for insecure dependencies or known CVEs

5. **Test Coverage Analysis**:
   - **Test File Identification**:
     - Map test files to source files based on naming conventions
     - Identify source files without corresponding tests
     - Check for test files in appropriate directories
   
   - **Test Quality Assessment**:
     - Verify unit tests exist for new/modified functions
     - Check integration tests for API endpoints
     - Verify test coverage for error scenarios
     - Check for proper test assertions (not just smoke tests)
     - Verify test data isolation (no shared state)
   
   - **Test Execution Status**:
     - Run the test suite if possible: `npm test` or equivalent
     - Parse test results for failures or warnings
     - Check test execution time (flag slow tests >1s)
     - Verify all tests pass before approving changes

6. **Documentation Consistency Review**:
   - **Spec Alignment**:
     - Compare implemented features against spec.md requirements
     - Verify all acceptance criteria are addressed
     - Flag any unimplemented requirements
     - Identify implemented features not in spec (scope creep)
   
   - **Contract Compliance**:
     - If contracts/ exist, verify API implementations match schemas
     - Check request/response types match specifications
     - Verify error codes and messages match contract definitions
     - Validate enum values and constants match documentation
   
   - **Data Model Consistency**:
     - If data-model.md exists, verify entity implementations
     - Check field names, types, and constraints match definitions
     - Verify relationships (foreign keys, references) are implemented
     - Validate migration scripts align with model changes
   
   - **Code Documentation**:
     - Check for JSDoc/TSDoc comments on public APIs
     - Verify complex logic has explanatory comments
     - Check for README updates if new features added
     - Verify configuration examples are up to date

7. **Tasks Completion Verification**:
   - **Task Tracking**:
     - Parse tasks.md to identify all defined tasks
     - Count completed tasks (marked with [X])
     - Identify incomplete tasks (marked with [ ])
     - Check if task completion matches git changes
   
   - **Implementation Gaps**:
     - Flag tasks marked complete but with no related code changes
     - Identify code changes not associated with any task
     - Verify all critical tasks are completed
     - Check for skipped tasks without justification

8. **Review Report**:
   Offer a comprehensive markdown report with the following sections:
   
   ```markdown
   # Implementation Review Report
   
   ## Executive Summary
   - Feature: [Feature name from spec.md]
   - Review Date: [Current date]
   - Overall Status: ✅ PASS | ⚠️ NEEDS WORK | ❌ FAIL
   
   ## Code Quality Assessment
   
   ### ✅ Strengths
   - [List positive findings]
   
   ### ⚠️ Issues Found
   - [List issues with severity: HIGH, MEDIUM, LOW]
   - [Include file paths and line numbers]
   
   ### 🔧 Recommendations
   - [Specific actionable improvements]
   
   ## Test Coverage Analysis
   
   ### Coverage Summary
   - Total Files Changed: X
   - Files with Tests: Y (Z%)
   - Test Files Added/Modified: N
   
   ### Missing Tests
   - [List source files without tests]
   
   ### Test Quality Issues
   - [List test quality concerns]
   
   ## Documentation Consistency
   
   ### Spec Compliance
   - Requirements Implemented: X/Y (Z%)
   - Acceptance Criteria Met: X/Y
   - ❌ Unimplemented Requirements:
     - [List missing features]
   
   ### Contract Compliance
   - ✅ Compliant: [List matching implementations]
   - ❌ Violations: [List mismatches with details]
   
   ### Data Model Consistency
   - ✅ Aligned: [List correct implementations]
   - ❌ Misalignments: [List discrepancies]
   
   ## Task Completion Status
   
   ### Progress
   - Total Tasks: X
   - Completed: Y (Z%)
   - Incomplete: N
   
   ### Task-Change Alignment
   - ⚠️ Tasks marked complete without changes:
     - [List tasks]
   - ⚠️ Changes not associated with tasks:
     - [List files]
   
   ## Critical Blockers
   [List any issues that MUST be fixed before merge]
   
   ## Recommendations
   [Prioritized list of improvements]
   
   ## Approval Decision
   - [ ] ✅ APPROVED - Ready to merge
   - [ ] ⚠️ APPROVED WITH CONDITIONS - Minor fixes needed
   - [ ] ❌ REJECTED - Critical issues must be resolved
   
   ### Conditions (if applicable)
   1. [Specific items to address]
   2. [...]
   ```

## Review Criteria

### Code Quality Thresholds
- **PASS**: No HIGH severity issues, <5 MEDIUM issues
- **NEEDS WORK**: 1-2 HIGH issues or 5-10 MEDIUM issues
- **FAIL**: >2 HIGH issues or >10 MEDIUM issues

### Test Coverage Thresholds
- **PASS**: >80% of modified source files have tests
- **NEEDS WORK**: 50-80% test coverage
- **FAIL**: <50% test coverage

### Documentation Consistency Thresholds
- **PASS**: All requirements implemented, contracts matched
- **NEEDS WORK**: 1-2 minor discrepancies
- **FAIL**: >2 discrepancies or critical feature missing

## Error Handling
- If git changes cannot be retrieved, ask user to commit changes first
- If spec.md missing, warn that spec compliance cannot be verified
- If tasks.md missing, skip task verification section
- If tests cannot be run, perform static analysis only and note limitation

## Notes
- This review should be run after `/speckit.implement` completes
- Review focuses on changes (git diff), not entire codebase
- Severity levels: HIGH (security/correctness), MEDIUM (quality/maintainability), LOW (style/suggestions)
- Review is constructive: identify issues AND provide solutions

