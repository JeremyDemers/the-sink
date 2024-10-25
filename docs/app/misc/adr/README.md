# Write an ADR

An ADR stands for an [Architectural Decision Record](https://adr.github.io/) - a justified design choice that addresses a functional or non-functional requirement that is architecturally significant.

The good practice is to work on an ADR first, undergo the reviewal process and proceed to the implementation only in case of accepting it collectively.

## General rules

- Place a new ADR inside the `docs/adr` subdirectory in the project root.
- A new record has to have its own directory named following the `ADR-[ID]-[SLUG]` pattern.
    - The `[ID]` part is a unique sequential numeric ID starting from `001` that allows understanding the order among the project ADRs.
    - The `[SLUG]` part is a short topic of an ADR in English where words are separated with dashes (`-`).

  Here is a few examples:
    - `ADR-001-logging`
    - `ADR-002-access-model`
    - `ADR-002-database-structure`
- The ADR's directory must contain the `README.md` index file with the contents of an ADR filed using the template below. If applicable, the ADR's auxiliary resources, such as images, diagrams (i.e. `*.drawio` files), documents, should be added inside the ADR's directory.
- List the ADR in `docs/adr/README.md`. E.g.:
  ```markdown
  # ADRs

  * [ADR-001: Logging](ADR-001-logging)
  * [ADR-002: Access Model](ADR-002-access-model)
  * [ADR-003: Database Structure](ADR-002-database-structure)
  ```

## Template

- The H1 of an ADR should be formatted as follows - `ADR-[ID]: [TOPIC]`. I.e. `ADR-001: Logging`, `ADR-002: Access Model`, etc.
- Explain the context of an ADR inside the `## Context` section.
- List people involved inside the `## People Involved in This Decision` (provide their names and emails).
- Describe the decision inside the `## Decision`.
- The `## Status` section lists the proposal and approval dates in the `Y-m-d` format.
- The `## Consequences` section should contain a list of benefits and downsides to the application in case of accepting an ADR.
- Make a Pull Request once the work on ADR is completed. Assign the people involved as the reviewers.
    - Work on the ADR collaboratively with the involved group
- When the ADR fate is determined, do either of these steps:
    - Append the `- [x] Approved on 2024-09-23` to the `## Status` section in case of receiving an approval by the majority of voters. Merge the PR and proceed to implementing the changes.
    - Close the PR if an ADR is rejected.

```markdown
# ADR-001: Logging

## Context

TBD

### People Involved in This Decision

- Jon Doe (jon.doe@gmail.com)
- Jane Hartwell Doe (jane.h.doe@gmail.com)

## Decision

TBD

## Status

- [x] Proposed on 2024-09-19

## Consequences

- The debugging capabilities increased.
- The performance is degraded as the logging code has its execution costs.
```

### Examples

- [ADR-001-user-roles-and-project-workflow](/docs/adr/ADR-001-user-roles-and-project-workflow)
- [ADR-002-api-and-serialization](/docs/adr/ADR-002-api-and-serialization)
- [ADR-003-logging](/docs/adr/ADR-003-logging)
