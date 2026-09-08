import type { ReactNode } from 'react'
import { resume } from '../content/resume'
import { about } from '../content/about'
import { projects, findProject } from '../content/projects'
import type { WindowId } from '../shell/windows'
import type { Command } from './types'

const OPENABLE: WindowId[] = ['resume', 'readme', 'terminal', 'projects']

// Deterministic 7-hex pseudo-hash so `experience` reads like `git log --oneline`
// without pulling in a real hash.
function fakeSha(seed: string): string {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7)
}

function Doc({ children }: { children: string }): ReactNode {
  return <pre className="term-pre">{children}</pre>
}

export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['?'],
    description: 'list the commands',
    run: () => {
      const visible = commands.filter((c) => !c.hidden)
      return (
        <div>
          {visible.map((c) => (
            <div key={c.name}>
              <strong>{c.name}</strong>
              {c.aliases?.length ? ` (${c.aliases.join(', ')})` : ''} — {c.description}
              {c.usage ? <div className="term-dim">    {c.usage}</div> : null}
            </div>
          ))}
          <div className="term-dim">↑/↓ history · Tab completes · Ctrl-L clears</div>
        </div>
      )
    },
  },
  {
    name: 'about',
    description: 'a few sentences about me',
    run: () => <Doc>{about.rawMarkdown}</Doc>,
  },
  {
    name: 'whoami',
    description: 'the one-line version',
    run: () => (
      <div>
        {resume.name} — {resume.title}, {resume.location}
      </div>
    ),
  },
  {
    name: 'resume',
    description: 'print resume.md',
    run: () => <Doc>{resume.rawMarkdown}</Doc>,
  },
  {
    name: 'cat',
    description: 'print a document',
    usage: 'cat <resume.md | about.md>',
    run: (args) => {
      const file = args[0]
      if (file === 'resume.md') return <Doc>{resume.rawMarkdown}</Doc>
      if (file === 'about.md') return <Doc>{about.rawMarkdown}</Doc>
      return <span className="term-err">cat: {file ?? ''}: No such file or directory</span>
    },
  },
  {
    name: 'experience',
    description: 'work history as a commit log',
    run: () => {
      const rows = resume.experience.map((j, i) => {
        const dec = i === 0 ? ' (HEAD -> main, origin/main)' : ''
        return `${fakeSha(j.company + j.start)}${dec}  ${j.company} — ${j.role}  (${j.start} – ${j.end})`
      })
      return <Doc>{['$ git log --oneline --decorate', ...rows].join('\n')}</Doc>
    },
  },
  {
    name: 'skills',
    description: 'skills as JSON',
    run: () => <Doc>{JSON.stringify(resume.skills, null, 2)}</Doc>,
  },
  {
    name: 'ls',
    description: 'list the documents',
    run: (_args, ctx) => (
      <div className="term-ls">
        <button className="term-file" onClick={() => ctx.run('cat resume.md')}>
          resume.md
        </button>
        <button className="term-file" onClick={() => ctx.run('cat about.md')}>
          about.md
        </button>
        <a href="/Resume.pdf">Resume.pdf</a>
      </div>
    ),
  },
  {
    name: 'contact',
    description: 'how to reach me',
    run: () => (
      <div>
        {resume.links.map((l) => (
          <div key={l.href}>
            <a href={l.href}>{l.label}</a>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'open',
    description: 'open a window',
    usage: 'open <resume | readme | terminal | projects>',
    run: (args, ctx) => {
      const target = args[0] as WindowId
      if (!OPENABLE.includes(target)) {
        return <span className="term-err">open: no such window: {args[0] ?? ''}</span>
      }
      ctx.open(target)
      return null
    },
  },
  {
    name: 'projects',
    description: 'browse the project stacks',
    usage: 'projects [stack]',
    run: (args, ctx) => {
      if (args[0]) {
        const p = findProject(projects, args[0])
        if (!p) return <span className="term-err">projects: no such stack: {args[0]}</span>
        ctx.openStack(p.slug)
        return null
      }
      const flat = [...projects.work, ...projects.side]
      return (
        <div className="term-ls">
          {flat.map((p) => (
            <button
              key={p.slug}
              className="term-file"
              onClick={() => ctx.run(`projects ${p.slug}`)}
            >
              {p.slug}
            </button>
          ))}
        </div>
      )
    },
  },
  {
    name: 'date',
    description: 'current date and time',
    run: () => <div>{new Date().toString()}</div>,
  },
  {
    name: 'clear',
    description: 'clear the screen',
    // Intercepted by useTerminal before dispatch; this run() is a safety net.
    run: (_args, ctx) => {
      ctx.clear()
      return null
    },
  },

  // ---- hidden ----
  {
    name: 'echo',
    hidden: true,
    description: 'echo the arguments',
    run: (args) => <span>{args.join(' ')}</span>,
  },
  {
    name: 'pwd',
    hidden: true,
    description: 'print working directory',
    run: (_args, ctx) => <span>{ctx.cwd}</span>,
  },
  {
    name: 'uname',
    hidden: true,
    description: 'system name',
    run: () => <span>Macintosh; System 7.0.1</span>,
  },
  {
    name: 'sudo',
    hidden: true,
    description: 'superuser do',
    run: () => (
      <span className="term-err">
        sudo: this is a résumé, not a root shell. Nice try though.
      </span>
    ),
  },
  {
    name: 'sysbeep',
    hidden: true,
    description: 'ring the system bell',
    run: (_args, ctx) => {
      ctx.beep()
      return null
    },
  },
  {
    name: 'hypercard',
    hidden: true,
    description: 'open the project stacks',
    run: (_args, ctx) => {
      ctx.open('projects')
      return null
    },
  },
]

const byName = new Map<string, Command>()
for (const c of commands) {
  byName.set(c.name.toLowerCase(), c)
  for (const a of c.aliases ?? []) byName.set(a.toLowerCase(), c)
}

export function resolve(name: string): Command | undefined {
  return byName.get(name.toLowerCase())
}

export function completions(prefix: string): string[] {
  const p = prefix.toLowerCase()
  return commands
    .filter((c) => !c.hidden && c.name.toLowerCase().startsWith(p))
    .map((c) => c.name)
    .sort()
}
