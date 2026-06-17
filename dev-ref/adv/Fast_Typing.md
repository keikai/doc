---
title: 'Fast Typing'
---

{% include version-badge.html version='7.0.0' %}

# Overview

In earlier Keikai versions, every time a user confirmed a cell edit — by pressing Tab, Enter, or an arrow key — Keikai sent an `onStopEditing` event to the server and **blocked the client** until the server responded. Only after receiving the server's acknowledgement did Keikai move focus to the next cell.

For users entering data at a normal pace, this blocking round-trip was barely noticeable. But for data-entry-heavy workflows — think finance teams filling in dozens of numeric cells, or operators logging readings row by row — the symptoms were hard to miss.

## Common Symptoms Before 7.0.0

Users who typed faster than the server could respond reported a range of confusing behaviors:

- **Values committed in the wrong order.** A user typing a short numeric sequence quickly (for example, `1`, `4`, `5` in rapid succession) could see the committed value scrambled in the cell. The underlying cause was asynchronous key events arriving out of sequence while the client was still waiting for the previous server response.
- **Blank cells after fast Tab navigation.** Typing a value and pressing Tab rapidly — then immediately typing the next value — sometimes left a cell completely empty. The client's navigation event fired while the prior commit round-trip was still in flight, and the second value landed in the wrong cell or was silently discarded.
- **Focus escaping the spreadsheet entirely.** During rapid Tab input the browser's native Tab behavior occasionally fired before Keikai could intercept it, shifting keyboard focus all the way to the browser's address bar. The user was left typing outside the spreadsheet without realizing it.
- **Needing to press Tab twice to leave a cell.** Under noticeable network latency, a single Tab press after editing sometimes had no visible effect. The cell editor was still awaiting commit confirmation from the server, so a second Tab press was required before focus actually moved.
- **Visible lag with every cell in long sessions.** Applications that ran heavy logic — dependent-cell updates, cross-sheet lookups, or server-side validations — inside `onStopEditing` imposed a blocking pause after *every* single cell commit. Over an extended data-entry session this accumulated into a noticeably sluggish experience.
- **Progressive slowdown after prolonged use.** On some setups, keyboard navigation grew measurably slower the longer the session ran, a symptom of event-queue congestion accumulating from a high volume of cursor-movement events.

Keikai 7.0.0 resolves these problems with **optimistic commit-and-move**: for safe edits, the client moves focus to the next cell immediately and sends the commit to the server in the background, matching the behavior users expect from desktop spreadsheets like Excel.

# How It Works

When a user confirms an edit, Keikai evaluates the edit on the client to decide which path to take.

```
User confirms edit (Tab / Enter / arrow key)
         |
         v
  Is the value a formula?          ──yes──> Fallback path (wait for server)
  Does the cell have data validation?──yes──>
  Is the cell in an array-formula region?─yes──>
         |
         no (all checks pass)
         v
  Optimistic path: focus moves immediately
  Commit sent to server in the background
```

## Optimistic Path (Safe Edits)

Focus moves immediately on the client when **all** of the following are true:

- The entered value is **not a formula** (does not start with `=`).
- The cell has **no Keikai data validation** rule.
- The cell is **not inside an array-formula region**.

Because none of these conditions can silently fail in a browser, Keikai can safely assume the commit will succeed and update the UI immediately without waiting for the server.

## Fallback Path (Server Validation Required)

The original blocking behavior is preserved when the edit involves:

- A **formula** (starts with `=`) — formula evaluation and error checking happen on the server.
- A **data-validated cell** — the server must confirm whether the value passes the validation rule before allowing focus to advance.
- A cell **inside an array-formula region** — array formulas span multiple cells and require server-side recalculation.

For these edits, Keikai waits for the server's response before moving focus, so the user can be bounced back to the cell if the server rejects the value.

# Interaction with onStopEditing Listeners

The `onStopEditing` event listener still runs server-side for every edit — nothing changes in that respect. The difference is that for optimistic-path edits the listener runs **in the background** after focus has already moved in a browser.

This means:

- **No listener code changes are required.** Existing `onStopEditing` handlers continue to work without modification.
- The listener's execution time no longer stalls the user between cells on safe edits.
- For fallback-path edits (formulas, validated cells, array-formula cells), the listener still runs synchronously and can reject the value before focus moves.

# Configuration

Fast typing is **enabled by default** in Keikai 7.0.0. To restore the original blocking behavior for all edits, set the library property to `false` in `WEB-INF/zk.xml`.

Default value: **true**
{% include property-scope.html page=false %}

```xml
<library-property>
    <name>io.keikai.ui.fastTypingOptimisticMove</name>
    <value>false</value>
</library-property>
```

Setting this property to `false` makes every edit wait for the server response before moving focus, regardless of whether the edit involves a formula or data validation.

See [Configuration](/dev-ref/Configuration) for more details on using library properties in `zk.xml`.
