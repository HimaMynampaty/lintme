# Custom JavaScript Operator Guide

This guide will help you write and test custom JavaScript functions that integrate with our platform to process data, validate content, or generate output.

---

## What You’re Writing

You will write a function with the following signature:

```js
export function run(ctx) {
  // your logic here
  return ctx; // or a new object
}
```

- The platform **automatically detects and executes this function**
- Your function receives a **context object (`ctx`)**
- You can modify `ctx`, add diagnostics, or return any custom output

---

## Input (`ctx`)

The `ctx` object contains data you can use in your function. Common properties:

| Property        | Type       | Description |
|----------------|------------|-------------|
| `ctx.markdown` | `string`   | The raw Markdown text you want to analyze or transform |
| `ctx.input`    | `any`      | Optional: additional input data |
| `ctx.diagnostics` | `Array` | You can push messages here to report issues |
| `ctx.variables` | `object`  | Optional named variables or flags from the environment |

---

## Output

Return either:
- The same `ctx` object (modified)
- A new object with any custom data

For example:

```js
ctx.markdown = "## Processed Output";
ctx.diagnostics.push({ line: 2, severity: 'info', message: 'Markdown updated' });
return ctx;
```

---

## Validation Requirements

Your code **must** export a function named `run` that accepts one argument:

```js
export function run(ctx) {
  // valid!
}
```

Invalid:

```js
function run(ctx) {} // ❌ missing `export`
export default function(ctx) {} // ❌ must be named `run`
```

---

##  Example: Lint Markdown Content

```js
export function run(ctx) {
  const text = ctx.markdown;
  const lines = text.split('\n');
  const diagnostics = [];

  if (!/^#\s/.test(lines[0])) {
    diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'Markdown should start with a top-level heading',
    });
  }

  if (!lines.some(line => /^##\s+Usage/.test(line))) {
    diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'Missing "## Usage" section',
    });
  }

  ctx.diagnostics.push(...diagnostics);
  ctx.markdown = `### Lint Results\n${diagnostics.length ? 'Issues found' : 'No issues 🎉'}`;

  return ctx;
}
```

---

## Handling Errors

If something goes wrong, your function should throw or push a diagnostic:

```js
if (!ctx.markdown) {
  throw new Error('No markdown text provided');
}
```

Or use:

```js
ctx.diagnostics.push({
  line: 1,
  severity: 'error',
  message: 'No markdown content found in ctx.markdown',
});
```

---

## Tips

- Use `ctx.diagnostics.push(...)` to return messages with `line`, `severity`, and `message`
- Return `ctx` or a custom object as your result
- Keep code pure and side-effect free — no DOM or browser APIs

---

## Need Help?

If you're unsure how to structure your code or use `ctx`, feel free to reach out or refer to built-in examples available in the editor.