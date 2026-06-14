# UI Coding Standards

## Component Library

**All UI must be built exclusively ONLY with [shadcn/ui](https://ui.shadcn.com/) components.**

- Do NOT create custom UI components. If a component does not exist in shadcn/ui, find the closest shadcn/ui primitive and compose with it.
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.).
- Install new shadcn/ui components via `npx shadcn@latest add <component>`.
- Keep shadcn/ui component files under `components/ui/` untouched — do not modify generated files.

## Date Formatting

Use [date-fns](https://date-fns.org/) for all date formatting. No other date library should be used.

Dates must be formatted in the following style:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the format string `do MMM yyyy` with `format` from `date-fns`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```
