# ADR-001: nest the monorepo as one Nest app per microservice

Status: accepted
Date:   today
Owner:  platform team

## Context

The Mindmint backend is a multi-agent platform with shared NestJS helpers
(health, logger, interceptors) and ~60 domain microservices (puzzles,
achievements, leaderboard, social, wallet, ...). Two reasonable layouts:

1. Single Nest app with split routers per feature module — simplest to
   ship, but every cross-cutting change forces a redeploy of every domain.
2. Monorepo with one Nest app per microservice — more moving parts in CI,
   but per-domain deploy granularity and easier ownership transfer.

## Decision

We pick (2): one Nest app per microservice. Shared helpers live in `src/`
and are consumed via relative imports by each microservice. CI builds
the affected apps only on a push (via path filters) and deploys them
independently.

## Consequences

- Test fixtures and CI parallelism scale linearly with microservice count.
- Domain teams can pick their own NestJS module versions per service.
- Cross-cutting migrations (e.g. introducing a global auth guard) require
  touching every microservice app.module.ts and re-running its tests.
