# Proof

Implements: fuera del playbook (X9)

## What the owner can and cannot see

The owner cannot see tool calls, the browser pane or a local file. Proof is an image or a link the owner opens.
The browser pane also cannot open a private artifact or a local file path.

## Capturing a mockup

1. Serve the file from its folder: `python -m http.server <port>`. Use a port no other session holds.
2. Capture with a Playwright script, not by hand: one image per theme, per frame, per data state that changed.
3. The script records page errors and console errors and fails when it sees one. A frame that renders blank is a
   failure, not an image.
4. Name images by frame and theme (`375-dark-empty.png`) so a reviewer can find the one a comment is about.
5. Stop the server when done; a leftover server holds the port for the next session.

## Reading what was captured

1. Read every captured image before saying the round is ready. Open the ones the round's comments touched first.
2. For each comment, locate the changed element in its image and confirm the change is visible there. "The code
   says so" is not proof.
3. Check the neighbours: a change to one element moves its siblings, and the owner notices the sibling.

## File discipline

| Moment | Action |
|---|---|
| Before an agent edits the mockup | Copy the file to a snapshot outside the working tree |
| After the agent returns | Diff the file against the snapshot; read the diff against the brief |
| After every edit | `node --check` on the inline script, LF check |
| Before publishing | Re-read the whole file; publishing distributes what you have not seen otherwise |

1. An agent's report of what it changed is intent. The diff is the evidence.
2. A diff touching something the round did not ask for is reverted before publishing, not after.

## Surfaces that run

1. Screenshot the real surface at each breakpoint in the same turn the change lands.
2. A motion change gets a standalone demo or a recording; a still image cannot show it.
3. A layout rule that a person reviews (no sideways scroll, tap targets) is checked at each breakpoint by looking,
   and a budget test guards only what is mechanically decidable.

## Pull requests

1. The body of every design PR carries screenshots: before and after for a change, one per breakpoint for a new
   surface. The owner reviews from the PR page and does not check out branches.
2. In a private repository an image in a PR body needs a URL pinned to a commit; a branch link breaks when the
   branch moves.
3. The body lists the commands that ran and their output.
4. The gate runs once, after the whole sequence of design PRs, then a scoped round for what it found. A full
   re-run after each fix is waste.

## Before you finish

- Every frame was captured with errors recorded, and every image read.
- Each comment's change was seen in its image, with its neighbours.
- The file was diffed against the snapshot, syntax-checked and read whole before publishing.
- Motion has a demo or recording.
- PR bodies carry screenshots and the commands that ran; the gate ran once.
