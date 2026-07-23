# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**FlyRank Capstone — Assignment 1**, part of the FlyRank AI Frontend Internship.
This assignment covers foundational setup: configuring a local dev environment,
establishing Git conventions, and integrating Claude Code as an AI-assisted
toolchain. There is no application code yet — the repo is documentation-only at
this stage.

## Repository Structure

```
assignment_1/
├── README.md    # Project documentation and setup instructions
├── LICENSE      # MIT License (© 2026 Aung Ko Ko Minn)
└── CLAUDE.md    # This file — project context for Claude Code
```

## Environment

- **OS / Shell:** Windows, PowerShell
- **Editor:** VS Code (JetBrains `.idea/` config also present at the parent level)
- **Version control:** Git — remote `origin` at
  https://github.com/akkminn/flyrank-capstone.git, default branch `main`
- **Node.js:** expected for future assignments; not yet used here

## Conventions

- **Commits:** Conventional Commits style (e.g. `docs: add MIT license file`,
  `chore: initialize repository`). Keep history clean and messages scoped.
- **Documentation-first:** keep `README.md` accurate as the project evolves.
- **License:** MIT — preserve the header in `LICENSE`.

## Notes for Claude

- No build, test, or lint commands exist yet — do not assume a package manager
  or scripts are configured.
- When future assignments add application code, update this file with the actual
  build/test/run commands and architecture notes.
- The working tree currently has an unstaged edit to `README.md`; leave staging
  and committing to the user unless asked.
