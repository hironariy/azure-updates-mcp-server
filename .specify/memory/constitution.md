<!--
Sync Impact Report:
- Version change: N/A → 1.0.0 (Initial constitution ratification)
- Modified principles: N/A (initial version)
- Added sections: Core Principles (4), Cost Efficiency Standards, Development Workflow
- Removed sections: N/A
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section aligned)
  ✅ .specify/templates/spec-template.md (Requirements section aligned)
  ✅ .specify/templates/tasks-template.md (Task categories aligned)
- Follow-up TODOs: None
-->

# Azure Updates MCP Server Constitution

## Core Principles

### I. Code Quality Excellence (NON-NEGOTIABLE)

Every code contribution MUST meet these quality standards:

- **Type Safety**: All code MUST use strict type checking (TypeScript strict mode, Python type hints with mypy strict).
- **Linting**: Zero linter warnings or errors. ESLint/Ruff MUST pass with project configuration.
- **Code Coverage**: Minimum 80% test coverage for all new code. Critical paths require 95%+ coverage.
- **Documentation**: All public APIs, functions, and classes MUST have clear documentation (JSDoc/docstrings).
- **Complexity Limits**: Cyclomatic complexity ≤10 per function. Functions exceeding this MUST be refactored.
- **DRY Principle**: Code duplication beyond 6 lines requires extraction to shared functions/modules.

**Rationale**: High code quality reduces bugs, improves maintainability, and lowers long-term costs by preventing technical debt accumulation.

### II. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development is MANDATORY for all features:

- **Red-Green-Refactor**: Write failing tests → Implement minimum code → Tests pass → Refactor.
- **Test Hierarchy**: Unit tests (fast, isolated) → Integration tests (API contracts) → E2E tests (critical paths only).
- **Test Independence**: Each test MUST run in isolation and be independently verifiable.
- **Test Documentation**: Each test MUST clearly document: Given (setup), When (action), Then (assertion).
- **No Implementation Without Tests**: Code without accompanying tests MUST NOT be merged.

**Rationale**: TDD ensures correctness from the start, provides living documentation, and enables confident refactoring without breaking existing functionality.

### III. Maintainability & Simplicity

Code MUST prioritize long-term maintainability over short-term convenience:

- **YAGNI Principle**: Implement only what is needed now. No speculative features.
- **Single Responsibility**: Each module, class, and function MUST have one clear purpose.
- **Minimal Dependencies**: Evaluate cost/benefit before adding dependencies. Prefer standard library.
- **Clear Naming**: Names MUST be descriptive and unambiguous. Avoid abbreviations unless industry-standard.
- **Refactoring Discipline**: Technical debt MUST be addressed within 2 sprints of identification.
- **Code Reviews**: All changes require peer review focusing on readability and maintainability.

**Rationale**: Simple, maintainable code reduces cognitive load, speeds up onboarding, and minimizes the cost of future changes.

### IV. Cost-Conscious Engineering

Every technical decision MUST consider operational and development costs:

- **Resource Efficiency**: Code MUST be optimized for memory and CPU usage. Profile before optimization.
- **Minimal Infrastructure**: Prefer serverless/managed services over self-hosted when cost-effective.
- **Caching Strategy**: Implement intelligent caching to reduce API calls and external service costs.
- **Dependency Audit**: Regular review of dependencies for licensing costs, security, and maintenance burden.
- **Build Time Optimization**: CI/CD pipelines MUST complete in <10 minutes. Use caching and parallelization.
- **Monitoring Costs**: Logging and metrics MUST be structured to minimize storage costs while maintaining observability.

**Rationale**: Cost-conscious engineering ensures project sustainability, prevents budget overruns, and maximizes value delivery per dollar spent.

## Cost Efficiency Standards

### Infrastructure & Operations

- Cloud resources MUST use auto-scaling and right-sizing to match actual load
- Development/staging environments MUST be shut down outside working hours
- API rate limits and retry logic MUST be implemented to prevent cost spikes
- All external API calls MUST be measured and optimized for cost per request

### Development Efficiency

- Developer tools and IDEs MUST be chosen for team productivity, not cost alone
- Automated testing MUST catch bugs in CI/CD, not production (prevention > reaction)
- Code generation and scaffolding tools SHOULD be used to reduce repetitive work
- Technical debt backlog MUST be prioritized by cost-of-delay metrics

## Development Workflow

### Pre-Implementation Gates

1. **Specification Review**: Feature spec MUST be complete, testable, and approved
2. **Constitution Check**: All constitution principles MUST be verified as achievable
3. **Cost Estimate**: Implementation and operational costs MUST be documented
4. **Test Plan**: Comprehensive test strategy MUST be defined before coding begins

### Implementation Standards

1. **Branch Strategy**: Feature branches from main, named `###-feature-name`
2. **Commit Messages**: Follow conventional commits (feat:, fix:, docs:, test:, refactor:)
3. **Pull Requests**: MUST include tests, documentation updates, and constitution compliance checklist
4. **Review Requirements**: Minimum one approval, all CI checks green, no unresolved comments

### Quality Gates

- **Local**: Pre-commit hooks run linters, formatters, and unit tests
- **CI Pipeline**: Automated tests, security scanning, coverage checks
- **Staging**: Integration tests against real services (with mocked external APIs)
- **Production**: Gradual rollout with monitoring and automated rollback triggers

## Governance

### Constitutional Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise between this document and other standards, this constitution takes precedence.

### Amendment Process

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: Team discussion of necessity, implications, and alignment with project goals
3. **Approval**: Requires consensus from project maintainers
4. **Migration**: Update all templates, documentation, and automated checks
5. **Versioning**: Follow semantic versioning (MAJOR.MINOR.PATCH)

### Compliance & Enforcement

- All pull requests MUST include a constitution compliance checklist
- Constitution violations MUST be identified in code review and addressed before merge
- Repeated violations require team discussion and process improvement
- Complexity exceptions MUST be documented with justification in plan.md

### Versioning Policy

- **MAJOR**: Principle removal, redefinition, or backward-incompatible governance changes
- **MINOR**: New principles added, material expansion of existing guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Runtime Development Guidance

For agent-specific development context and runtime guidance, refer to the appropriate agent context file (e.g., `.github/agents/copilot-instructions.md`). These files are automatically updated with project-specific technologies and patterns.

**Version**: 1.0.0 | **Ratified**: 2025-12-16 | **Last Amended**: 2025-12-16
