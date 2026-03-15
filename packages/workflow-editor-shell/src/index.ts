import type { ThemeTokens } from '@minislively/workflow-types'

export const defaultTheme: ThemeTokens = {
  shellBg: '#0f172a',
  shellPanel: '#111827',
  shellBorder: '#273449',
  shellText: '#ecf3ff',
  shellMuted: '#8da2c0',
  accent: '#f97316',
  accentSoft: '#1f2937',
  canvasBg: '#08111f',
  grid: '#12233b',
  edge: '#3b82f6',
  nodeFill: '#13243b',
  nodeStroke: '#355477',
  nodeSelected: '#f97316',
}

export function mergeTheme(overrides?: Partial<ThemeTokens>): ThemeTokens {
  return {
    ...defaultTheme,
    ...overrides,
  }
}

export const editorShellStyles = `
  :host {
    display: block;
    min-height: 720px;
    color: var(--wf-shell-text);
    font-family: "Space Grotesk", "Avenir Next", system-ui, sans-serif;
  }

  .shell {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 720px;
    border: 1px solid var(--wf-shell-border);
    border-radius: 28px;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(249, 115, 22, 0.18), transparent 24rem),
      linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(8, 17, 31, 0.98));
    box-shadow: 0 24px 80px rgba(2, 6, 23, 0.45);
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--wf-shell-border);
    background: rgba(10, 18, 32, 0.72);
    backdrop-filter: blur(18px);
  }

  .brand {
    display: grid;
    gap: 0.25rem;
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--wf-shell-muted);
  }

  .title {
    font-size: 1rem;
    font-weight: 700;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .toolbar button,
  .stat-pill {
    border: 1px solid var(--wf-shell-border);
    background: rgba(17, 24, 39, 0.9);
    color: var(--wf-shell-text);
    border-radius: 999px;
    padding: 0.55rem 0.85rem;
    font: inherit;
  }

  .toolbar button {
    cursor: pointer;
  }

  .body {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr) 320px;
    min-height: 0;
  }

  .rail,
  .inspector {
    padding: 1.2rem;
    border-right: 1px solid var(--wf-shell-border);
    background: rgba(13, 20, 34, 0.72);
  }

  .inspector {
    border-right: none;
    border-left: 1px solid var(--wf-shell-border);
  }

  .panel-label {
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--wf-shell-muted);
    margin-bottom: 0.75rem;
  }

  .rail-list,
  .inspector-list {
    display: grid;
    gap: 0.75rem;
  }

  .rail-card,
  .inspector-card {
    border: 1px solid var(--wf-shell-border);
    border-radius: 18px;
    padding: 0.85rem 0.95rem;
    background: rgba(15, 23, 42, 0.78);
  }

  .rail-card strong,
  .inspector-card strong {
    display: block;
    margin-bottom: 0.35rem;
  }

  .stage {
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 620px;
    touch-action: none;
    cursor: grab;
  }

  canvas:active {
    cursor: grabbing;
  }

  .stage-note {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    max-width: 320px;
    padding: 0.85rem 1rem;
    border-radius: 18px;
    border: 1px solid var(--wf-shell-border);
    color: var(--wf-shell-muted);
    background: rgba(8, 17, 31, 0.85);
    backdrop-filter: blur(12px);
  }

  @media (max-width: 1100px) {
    .body {
      grid-template-columns: 1fr;
    }

    .rail,
    .inspector {
      border: none;
      border-bottom: 1px solid var(--wf-shell-border);
    }
  }
`
