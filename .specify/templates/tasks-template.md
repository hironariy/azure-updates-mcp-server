---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test-First Development is MANDATORY per constitution. All test tasks MUST be completed before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution Compliance**: All tasks must align with code quality, testing standards, maintainability, and cost-efficiency principles.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools (enforce constitution quality standards)
- [ ] T004 [P] Setup pre-commit hooks (linting, formatting, type checking)
- [ ] T005 [P] Configure test framework with coverage reporting (80% minimum)
- [ ] T006 [P] Setup CI/CD pipeline with quality gates (<10min build time)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup database schema and migrations framework
- [ ] T008 [P] Implement authentication/authorization framework
- [ ] T009 [P] Setup API routing and middleware structure
- [ ] T010 Create base models/entities that all stories depend on
- [ ] T011 Configure error handling and logging infrastructure (cost-efficient structured logging)
- [ ] T012 Setup environment configuration management
- [ ] T013 [P] Implement caching layer (reduce API costs)
- [ ] T014 [P] Setup monitoring and observability (cost-optimized metrics)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY per TDD constitution) 🔴

> **CONSTITUTION REQUIREMENT: Write these tests FIRST, ensure they FAIL, then implement**

- [ ] T015 [P] [US1] Unit tests for [component] with >80% coverage in tests/unit/test_[name].py
- [ ] T016 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T017 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

**Quality Gate**: All tests written, reviewed, approved, and FAILING before T018 begins

### Implementation for User Story 1 ✅

> **CONSTITUTION REQUIREMENT: Tests must be green before moving to next story**

- [ ] T018 [P] [US1] Create [Entity1] model with type safety in src/models/[entity1].py
- [ ] T019 [P] [US1] Create [Entity2] model with type safety in src/models/[entity2].py
- [ ] T020 [US1] Implement [Service] with SRP in src/services/[service].py (depends on T018, T019)
- [ ] T021 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T022 [US1] Add validation and error handling (complexity ≤10)
- [ ] T023 [US1] Add structured logging (cost-optimized)
- [ ] T024 [US1] Add API documentation (JSDoc/docstrings)
- [ ] T025 [US1] Code review and refactoring (DRY, maintainability check)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY per TDD constitution) 🔴

- [ ] T026 [P] [US2] Unit tests for [component] with >80% coverage in tests/unit/test_[name].py
- [ ] T027 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T028 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

**Quality Gate**: All tests written, reviewed, approved, and FAILING before T029 begins

### Implementation for User Story 2 ✅

- [ ] T029 [P] [US2] Create [Entity] model with type safety in src/models/[entity].py
- [ ] T030 [US2] Implement [Service] with SRP in src/services/[service].py
- [ ] T031 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T032 [US2] Add validation, error handling, and documentation
- [ ] T033 [US2] Integrate with User Story 1 components (if needed)
- [ ] T034 [US2] Code review and refactoring

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY per TDD constitution) 🔴

- [ ] T035 [P] [US3] Unit tests for [component] with >80% coverage in tests/unit/test_[name].py
- [ ] T036 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T037 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

**Quality Gate**: All tests written, reviewed, approved, and FAILING before T038 begins

### Implementation for User Story 3 ✅

- [ ] T038 [P] [US3] Create [Entity] model with type safety in src/models/[entity].py
- [ ] T039 [US3] Implement [Service] with SRP in src/services/[service].py
- [ ] T040 [US3] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T041 [US3] Add validation, error handling, and documentation
- [ ] T042 [US3] Code review and refactoring

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

**Constitution Compliance Checks**:

- [ ] TXXX [P] Verify test coverage ≥80% across all code (run coverage report)
- [ ] TXXX [P] Run linters/formatters - zero warnings (ESLint/Ruff/etc)
- [ ] TXXX [P] Check cyclomatic complexity ≤10 per function
- [ ] TXXX [P] Verify type safety (strict mode compliance)
- [ ] TXXX [P] Documentation completeness audit (all public APIs documented)
- [ ] TXXX [P] Dependency audit (license, security, cost review)
- [ ] TXXX Code cleanup and refactoring (DRY violations, maintainability)
- [ ] TXXX Performance profiling and optimization (resource efficiency)
- [ ] TXXX [P] Security hardening and vulnerability scanning
- [ ] TXXX Cost analysis (API usage, infrastructure, monitoring costs)
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
