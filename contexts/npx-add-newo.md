# npx add-newo — CLI Installer Concept
Newo.ai Developer Acquisition | April 20, 2026

---

## Vision

```bash
npx add-newo
```

A zero-install CLI that sets up a Newo AI receptionist in under 5 minutes.
Same concept as `npx create-react-app`, `npx shadcn`, `npx create-next-app`.
Developers are already comfortable with this pattern — no friction, no signup required
to try.

---

## User Flow

```bash
$ npx add-newo

🤖 Newo AI Receptionist Setup

? What's your business name? Riverside Dental
? What vertical are you in?
  ❯ Dental
    HVAC / Home Services
    Restaurant
    General Business
? Detect your stack? (scanning...)
  ✓ Found: Next.js 14 (App Router)
? Newo Agent ID? (get one free at newo.ai/start)  abc123xyz
? Phone number for the widget? +16145551234

⠋ Creating your AI receptionist...
⠙ Configuring appointment booking...
⠸ Generating embed code...

✓ Done! Here's what was added:

  Modified: app/layout.tsx
  ├─ Added Newo config
  └─ Added widget script

Your AI phone number: +1 (614) 867-5309

Test it:  Call +1 (614) 867-5309 right now
Dashboard: https://newo.ai/dashboard/abc123xyz
Docs:      https://newo.ai/docs

The AI will answer in English and route calls to Riverside Dental.
To customize: edit the greeting at newo.ai/dashboard/abc123xyz/greeting

Need help? ryan@newo.ai or https://newo.ai/support
```

---

## Technical Implementation

### Package Structure

```
@newo/cli/
├── package.json        # "bin": { "add-newo": "dist/index.js" }
├── src/
│   ├── index.ts        # Entry point, CLI args
│   ├── detect-stack.ts # Detects Next.js, React, HTML, etc.
│   ├── questions.ts    # Interactive prompts (inquirer or clack)
│   ├── embed.ts        # Generates embed code per stack
│   ├── insert.ts       # Reads + edits target file
│   ├── api.ts          # Calls Newo API to validate agent ID
│   └── output.ts       # Prints the completion summary
└── dist/               # Compiled output
```

### Stack Detection Logic

```typescript
async function detectStack(cwd: string): Promise<Stack> {
  const pkg = await readJson(path.join(cwd, 'package.json')).catch(() => null)
  
  if (pkg?.dependencies?.next || pkg?.devDependencies?.next) {
    const hasAppDir = await exists(path.join(cwd, 'app/layout.tsx')) ||
                      await exists(path.join(cwd, 'app/layout.jsx'))
    return hasAppDir ? 'nextjs-app' : 'nextjs-pages'
  }
  
  if (pkg?.dependencies?.react || pkg?.devDependencies?.react) {
    return 'react-spa'
  }
  
  if (await exists(path.join(cwd, 'index.html'))) {
    return 'static-html'
  }
  
  return 'unknown'
}
```

### Embed Code Generation

```typescript
function generateEmbedCode(config: Config, stack: Stack): string {
  const configScript = `
<script>
  window.NewoConfig = {
    agentId: "${config.agentId}",
    phone: "${config.phone}",
    vertical: "${config.vertical}",
    widgetStyle: "bubble"
  };
</script>
<script src="https://widget.newo.ai/v1/widget.js" async defer></script>
`
  // Stack-specific wrappers follow...
  return configScript
}
```

---

## Publishing Plan

1. **Package name:** `add-newo` on npm (check availability: `npm view add-newo`)
   - Backup names: `@newo/cli`, `newo-cli`, `create-newo`

2. **README at npmjs.com:** Same as this doc, with animated GIF of the terminal flow

3. **Launch channels:**
   - npm page itself (organic developer discovery)
   - Product Hunt listing: "Add AI Phone to Any Website in 5 Minutes"
   - Hacker News Show HN: "Show HN: I built an npx command that adds AI phone answering to any website"
   - Claude community / AI developer Twitter

4. **Pricing hook:** Free to install, free to try (Newo trial starts automatically).
   No credit card at CLI time. Convert to paid after first 2 months.

---

## Engineering Requirements (ticket this to Kyle)

**Ticket 1: Public embed snippet**
- Expose a stable, documented JavaScript embed: `<script src="https://widget.newo.ai/v1/widget.js">`
- Accept `data-agent-id` attribute OR `window.NewoConfig.agentId`
- Document at newo.ai/docs/embed

**Ticket 2: CLI agent ID validation**
- API endpoint: `GET /api/v1/agents/{id}/public` → returns `{ valid: true, vertical, name }`
- Used by the CLI to validate the agent ID the user enters
- No auth required (public endpoint, rate-limited)

**Ticket 3: npm package scaffold**
- Create `@newo/cli` package with stack detection + embed injection
- Publish to npm

**Ticket 4: newo.ai/developers page**
- Landing page using copy from developer-landing-copy.md
- Hero: one-liner install snippet
- Sections: 3 install methods, webhooks, pricing, FAQ

---

## Timeline Estimate

| Task | Owner | Time |
|------|-------|------|
| Embed script documentation | Engineering | 1 day |
| Agent ID validation API | Engineering | 1 day |
| CLI package (npx add-newo) | Engineering | 3-5 days |
| npm publish + README | Engineering | 0.5 days |
| /developers landing page | Ryan (copy ready) + Design + Dev | 3 days |
| Product Hunt launch | Ryan | 2 hours (scheduling + assets) |
| **Total** | | **~2 weeks** |

---

## Alternative: Claude Skill as V1 (No Engineering Required)

Until the npm package is built, the `/add-newo` Claude Code skill serves the same
purpose for developers already using Claude Code. The skill:
- Is already live at `~/.claude/skills/add-newo/SKILL.md`
- Surfaces automatically when Claude Code users are building web apps
- Generates the same embed code the CLI would generate

The CLI is V2. The Claude skill is V1 that proves the concept and generates demand.
