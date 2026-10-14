# Environment notes

Implements: fuera del playbook (X9)

Machine and session facts, not doctrine. Read on Windows, inside a worktree, or when other
sessions run in parallel.

## Windows and Git Bash

1. Line endings: `* text=auto eol=lf` in `.gitattributes`; check with `git ls-files --eol`.
   `grep -c $'\r'` counts every line in Git Bash; use `grep -cP '\r'`. `sed -i` converts CRLF to LF.
2. The Bash tool collapses `\\` to `\` in commands and heredocs; write such content with the Write
   tool or a script file.
3. Long edit scripts go to the scratchpad as files and run by path; no long heredocs.
4. PowerShell JSON conversion mangles secrets; serialize them elsewhere.
5. Hook `run:` lines are flat commands; use `npx --no-install`.
6. Long scratchpad paths break some package managers; shorten with a junction when needed.
7. Agent commands are relative to the working directory; never `cd` into a quoted path with spaces,
   it deadlocks the agent.
8. Two modules whose names differ only by case resolve wrongly on NTFS.
9. Store apps virtualize AppData; never keep shared state there.
10. Orphaned dev processes are killed by command line plus port, never by image name, which respawns
    children. Confirm with a port listing afterwards.
11. Edits that end in a space can lose it; end anchors on a non-space and read `git diff`.

## Worktrees and parallel sessions

1. The stash stack is shared across worktrees and sessions. Never bare stash or pop; push with a
   unique tag, capture the SHA, apply, then drop by tag.
2. Ports are shared; each session uses its own port for test servers and schema checks.
3. Removing a worktree can leave thousands of package-manager junctions; clean them explicitly.
4. Plain `git config` inside a worktree writes the shared config.
5. The preview tool reads the main checkout's launch config, not the worktree's.
6. Decision, research and debt numbers race between sessions: re-check the base branch and every
   open PR right before push, claim a number early with a draft when needed, renumber by script.
7. The operator merges without warning, stacked PRs seconds apart: make a push depend on the PR state check.
8. Sync with the base before a long gate; merge first, then quick checks, then the gate.
9. A subagent may edit the session's tree instead of the worktree it was handed; check both.
10. Never kill the operator's processes or another session's. Health-probe, then ask.

## Session and tool limits

1. Overriding `HOME` for one command breaks tools that read the profile; scope the override to the
   test runner only.
2. Stopping a workflow leaves child processes; list and end them by command line.
3. Before a usage limit ends the session, write the handoff.
4. Console output from test code does not surface in some pools; time functions by recording
   timestamps into results instead.
5. Full SHAs come from `rev-parse` or the API; never extend a short one by hand.
6. Web-editor merges of sibling doc PRs drop sections; audit the merged file line by line.

## Before you finish

- No bare stash, no shared-config write, no process killed by name.
- PR state checked before push; numbers re-checked before push.
- Handoff written if the session is near its limit.
