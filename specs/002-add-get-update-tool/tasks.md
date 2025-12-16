# Tasks: Add Get Update Tool & Simplify Search

**Input**: Design documents from `/specs/002-add-get-update-tool/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test-First Development is NOT required for this feature (modifying existing tested infrastructure).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**Constitution Compliance**: TypeScript strict mode, ESLint, JSDoc documentation, <10 cyclomatic complexity.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3) for story-specific tasks only
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: No setup required - using existing infrastructure

- [ ] T001 Verify existing TypeScript project configuration and dependencies are sufficient

---

## Phase 2: Foundational

**Purpose**: Core type definitions that both user stories depend on

- [ ] T002 Add `AzureUpdateSummary` type to src/models/azure-update.ts using `Omit<AzureUpdate, 'description'>`
- [ ] T003 [P] Remove `id` parameter from `SearchQuery` type in src/models/search-query.ts
- [ ] T004 [P] Add `SortBy` type definition to src/models/search-query.ts supporting relevance, modified:desc/asc, created:desc/asc, retirementDate:desc/asc

**Checkpoint**: Type definitions ready - user story implementation can begin

---

## Phase 3: User Story 1 - Retrieve Full Update Details (Priority: P1) 🎯 MVP

**Goal**: Enable retrieval of complete Azure update details (including description) by ID

**Independent Test**: Call `get_azure_update` with a valid ID and verify full description is returned

### Implementation for User Story 1 ✅

- [ ] T005 [P] [US1] Create `get_azure_update` tool handler in src/tools/get-azure-update.tool.ts with input validation
- [ ] T006 [US1] Implement tool logic in src/tools/get-azure-update.tool.ts: call database.getUpdateById(), handle not-found errors
- [ ] T007 [US1] Add JSDoc documentation to src/tools/get-azure-update.tool.ts handler function
- [ ] T008 [US1] Register `get_azure_update` tool in src/server.ts tools list
- [ ] T009 [US1] Add tool schema definition to src/server.ts for `get_azure_update` (input: id string, required)
- [ ] T010 [P] [US1] Create unit tests for get_azure_update tool in tests/unit/tools/get-azure-update.test.ts (valid ID, invalid ID, missing ID)
- [ ] T011 [US1] Verify test coverage ≥80% for get_azure_update tool handler

**Checkpoint**: `get_azure_update` tool fully functional and independently testable

---

## Phase 4: User Story 2 - Lightweight Search (Priority: P1)

**Goal**: Reduce token consumption by returning only metadata (no descriptions) from search results

**Independent Test**: Call `search_azure_updates` and verify response contains no description fields, size reduced by 80%+

### Implementation for User Story 2 ✅

- [ ] T012 [P] [US2] Remove `id` parameter handling from src/tools/search-azure-updates.tool.ts input validation
- [ ] T013 [US2] Modify result projection in src/tools/search-azure-updates.tool.ts to return `AzureUpdateSummary[]` (omit description)
- [ ] T014 [US2] Update tool schema in src/server.ts for `search_azure_updates` to remove `id` parameter from input
- [ ] T015 [US2] Update tool description in src/server.ts to mention two-tool pattern (search → get)
- [ ] T016 [P] [US2] Update unit tests in tests/unit/tools/search-azure-updates.test.ts to expect no description fields in results
- [ ] T017 [P] [US2] Add test in tests/unit/tools/search-azure-updates.test.ts to verify `id` parameter is rejected
- [ ] T018 [US2] Verify test coverage ≥80% for search_azure_updates tool handler

**Checkpoint**: `search_azure_updates` returns lightweight results, `id` parameter removed

---

## Phase 5: User Story 3 - Retirement Date Filtering (Priority: P1)

**Goal**: Enable filtering and sorting by retirement dates for proactive planning

**Independent Test**: Call `search_azure_updates` with `retirementDateFrom/To` and verify results are filtered and sorted correctly

### Implementation for User Story 3 ✅

- [ ] T019 [P] [US3] Add `retirementDateFrom` and `retirementDateTo` filter parameters to src/tools/search-azure-updates.tool.ts input handling
- [ ] T020 [P] [US3] Add `sortBy` parameter to src/tools/search-azure-updates.tool.ts with enum validation (relevance, modified:desc/asc, created:desc/asc, retirementDate:desc/asc)
- [ ] T021 [US3] Implement retirement date filtering logic in src/tools/search-azure-updates.tool.ts (filter availabilities array where ring='Retirement')
- [ ] T022 [US3] Implement sortBy logic in src/tools/search-azure-updates.tool.ts with direction parsing (split on ':')
- [ ] T023 [US3] Implement retirementDate sorting in src/tools/search-azure-updates.tool.ts (extract retirement date from availabilities, exclude updates without Retirement ring)
- [ ] T024 [US3] Update tool schema in src/server.ts to add `retirementDateFrom/To` and `sortBy` parameters with descriptions
- [ ] T025 [US3] Update default limit from 50 to 20 in src/server.ts schema
- [ ] T026 [US3] Clarify offset parameter description in src/server.ts with pagination example
- [ ] T027 [P] [US3] Add unit tests in tests/unit/tools/search-azure-updates.test.ts for retirement date filtering
- [ ] T028 [P] [US3] Add unit tests in tests/unit/tools/search-azure-updates.test.ts for sortBy parameter (all directions)
- [ ] T029 [P] [US3] Add unit tests in tests/unit/tools/search-azure-updates.test.ts for retirementDate sorting edge cases (no Retirement ring)
- [ ] T030 [US3] Verify test coverage ≥80% for new filtering and sorting logic

**Checkpoint**: Retirement date filtering and sorting fully functional

---

## Phase 6: Integration & Documentation

**Purpose**: Update guide resource and integration tests for two-tool pattern

### Guide Resource Updates

- [ ] T031 [P] Remove `id` parameter example from src/resources/guide.resource.ts usage examples
- [ ] T032 [P] Update overview in src/resources/guide.resource.ts to mention two-tool architecture (search for discovery, get for details)
- [ ] T033 [P] Add query tips in src/resources/guide.resource.ts: explain tags/categories/products are searchable via query parameter
- [ ] T034 [P] Add query tips in src/resources/guide.resource.ts: explain sortBy with direction suffixes
- [ ] T035 [P] Add query tips in src/resources/guide.resource.ts: explain retirementDateFrom/To filters
- [ ] T036 Add query tip in src/resources/guide.resource.ts: explain two-step workflow (search → get_azure_update)
- [ ] T037 Update usage examples in src/resources/guide.resource.ts to use simplified filtering (query parameter instead of individual filters)
- [ ] T038 Update usage examples in src/resources/guide.resource.ts to show sortBy and retirement date filtering

### Integration Testing

- [ ] T039 [P] Add integration test in tests/integration/tools-integration.test.ts for two-step workflow (search → get by ID)
- [ ] T040 [P] Add integration test in tests/integration/tools-integration.test.ts to verify search response size reduction (compare with old version)
- [ ] T041 Update existing integration tests in tests/integration/tools-integration.test.ts to expect no description in search results
- [ ] T042 Verify guide resource tests in tests/unit/resources/guide.test.ts reflect updated examples and tips

---

## Phase 7: Polish & Cross-Cutting Concerns

**Constitution Compliance Checks**:

- [ ] T043 [P] Run test coverage report and verify ≥80% coverage across modified files
- [ ] T044 [P] Run ESLint on all modified files - zero warnings/errors
- [ ] T045 [P] Check cyclomatic complexity ≤10 for all new/modified functions
- [ ] T046 [P] Verify TypeScript strict mode compliance - no `any` types without justification
- [ ] T047 [P] Verify JSDoc documentation completeness for all public APIs
- [ ] T048 Code cleanup and refactoring pass (DRY violations, naming consistency)
- [ ] T049 [P] Update contracts/README.md to document two-tool pattern
- [ ] T050 Test quickstart.md examples manually to ensure accuracy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verification only
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T002) for `AzureUpdateSummary` type
- **User Story 2 (Phase 4)**: Depends on Foundational (T002, T003) for types
- **User Story 3 (Phase 5)**: Depends on Foundational (T003, T004) and User Story 2 (T012-T015) modifications
- **Integration (Phase 6)**: Depends on all user stories being complete
- **Polish (Phase 7)**: Depends on Integration completion

### User Story Dependencies

- **User Story 1**: Independent after Foundational - can implement get_azure_update separately
- **User Story 2**: Independent after Foundational - modifies search_azure_updates independently
- **User Story 3**: Builds on User Story 2 - adds filtering/sorting to already-modified search tool

### Within Each User Story

**US1 (Get Tool)**:
- T005 (create file) → T006 (implement logic) → T007 (docs) → T008 (register) → T009 (schema) → T010 (tests) → T011 (coverage)

**US2 (Lightweight Search)**:
- T012, T013 (modify handler) in parallel → T014, T015 (update schema) → T016, T017 (update tests) in parallel → T018 (coverage)

**US3 (Retirement Filtering)**:
- T019, T020 (add parameters) in parallel → T021, T022, T023 (implement logic) sequentially → T024, T025, T026 (schema updates) sequentially → T027, T028, T029 (tests) in parallel → T030 (coverage)

### Parallel Opportunities

**Foundational Phase**: T003 and T004 can run in parallel (different type definitions)

**User Story 1**: T010 (tests) can run in parallel with T005-T009 if using TDD approach

**User Story 2**: T012 and T013 can run in parallel (separate concerns), T016 and T017 can run in parallel (independent test cases)

**User Story 3**: T019 and T020 in parallel, T027/T028/T029 in parallel

**Integration Phase**: T031-T035 (guide resource changes) all in parallel, T039-T041 (integration tests) in parallel

**Polish Phase**: T043-T047 all in parallel (independent quality checks)

---

## Parallel Example: User Story 3

```bash
# Launch parameter additions in parallel:
Task T019: "Add retirementDateFrom/To to input handling"
Task T020: "Add sortBy parameter with enum validation"

# Launch test additions in parallel:
Task T027: "Test retirement date filtering"
Task T028: "Test sortBy parameter"
Task T029: "Test retirementDate sorting edge cases"
```

---

## Implementation Strategy

### Recommended Approach (Sequential by Priority)

1. **Phase 1-2**: Setup + Foundational types (T001-T004)
2. **Phase 3**: Complete User Story 1 - Get tool (T005-T011)
   - **Validate independently**: Can retrieve full update by ID
3. **Phase 4**: Complete User Story 2 - Lightweight search (T012-T018)
   - **Validate independently**: Search returns no descriptions, 80%+ size reduction
4. **Phase 5**: Complete User Story 3 - Retirement filtering (T019-T030)
   - **Validate independently**: Retirement date filtering and sorting work correctly
5. **Phase 6**: Integration & Documentation (T031-T042)
6. **Phase 7**: Polish & Quality (T043-T050)

### Parallel Team Strategy

If multiple developers available:

1. Complete Phase 1-2 together (T001-T004)
2. Split work:
   - **Developer A**: User Story 1 (T005-T011) - Get tool
   - **Developer B**: User Story 2 (T012-T018) - Lightweight search
3. Once US1 and US2 complete:
   - **Developer A**: User Story 3 (T019-T030) - Retirement filtering
   - **Developer B**: Integration work (T031-T042) - Guide + tests
4. Both: Phase 7 polish tasks in parallel (T043-T050)

### MVP Milestone

**Minimum deliverable**: Phases 1-4 (T001-T018)
- Get tool works (US1)
- Search is lightweight (US2)
- Basic two-tool pattern functional

**Enhanced deliverable**: Add Phase 5 (T019-T030)
- Retirement date filtering (US3)

---

## Notes

- TypeScript project with existing database layer - no DB changes needed
- All tasks use existing infrastructure (better-sqlite3, MCP SDK)
- Tests update existing test files - no new test framework setup
- Constitution compliance: strict TypeScript, ESLint, JSDoc, <10 complexity
- Each user story can be validated independently before proceeding
- Total estimated LOC: ~540 (100 get tool + 50 search mods + 40 guide + 200 unit tests + 100 integration tests + 50 polish)
