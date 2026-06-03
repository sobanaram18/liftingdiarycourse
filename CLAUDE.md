# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

## Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- No test framework configured yet

## Architecture

This is a fresh Next.js App Router project. All routes live under `app/`. The root layout (`app/layout.tsx`) sets up Geist fonts via CSS variables and a flex column body. Pages are server components by default; add `"use client"` only when needed.

Styling is utility-first with Tailwind. Global styles are in `app/globals.css`. No component library or state management is installed yet.
