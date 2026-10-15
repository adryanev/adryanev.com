import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowUpRight, Plus, Search } from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Feedback,
  Field,
  Input,
  PageHeader,
  PageState,
  Panel,
  Select,
  Table,
  TableScroll,
  Textarea,
} from '@/components/ui'
import '@/design-system/catalog.css'

export const Route = createFileRoute('/admin/_layout/design-system')({
  component: DesignSystemPage,
})

const swatches = [
  'surface-canvas',
  'surface-paper',
  'foreground',
  'foreground-muted',
  'brand-yellow',
  'brand-blue',
  'brand-red',
  'color-success',
  'color-warning',
  'color-danger',
  'color-info',
] as const
const typeScale = [
  'micro',
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  'title',
  '5xl',
  '6xl',
] as const

function DesignSystemPage() {
  const [surface, setSurface] = useState<'admin' | 'public'>('admin')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)
  const error =
    submitted && !email.trim()
      ? 'Enter an email address to try this example.'
      : undefined
  return (
    <div className="system-catalog">
      <PageHeader>
        <div>
          <h1>Design system</h1>
          <p>
            The components and tokens used across the website and content
            studio.
          </p>
        </div>
      </PageHeader>
      <div className="system-catalog__toolbar">
        <Field label="Preview surface" htmlFor="preview-surface">
          <Select
            id="preview-surface"
            value={surface}
            onChange={(event) =>
              setSurface(event.target.value as 'admin' | 'public')
            }
          >
            <option value="admin">Content studio</option>
            <option value="public">Public website</option>
          </Select>
        </Field>
        <p>
          Use the theme control in the sidebar to inspect light and dark.
          Examples on this page do not save content.
        </p>
      </div>
      <div data-ui-surface={surface} className="system-catalog__preview">
        <section aria-labelledby="system-color">
          <h2 id="system-color">Color</h2>
          <div className="system-catalog__swatches">
            {swatches.map((name) => (
              <div key={name}>
                <div
                  className="system-catalog__swatch"
                  style={{ background: `var(--${name})` }}
                />
                <code>--{name}</code>
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="system-type">
          <h2 id="system-type">Typography</h2>
          <p>
            Bricolage Grotesque for reading and headings. DM Mono for compact
            metadata.
          </p>
          <div className="system-catalog__type">
            {typeScale.map((size) => (
              <div key={size}>
                <code>--text-{size}</code>
                <span style={{ fontSize: `var(--text-${size})` }}>
                  Build with care.
                </span>
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="system-actions">
          <h2 id="system-actions">Actions</h2>
          <div className="system-catalog__row">
            <Button>
              <Plus size={18} />
              Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="inverse">Inverse</Button>
            <Button variant="danger">Delete</Button>
            <Button variant="ghost">Ghost</Button>
            <Button asChild variant="secondary">
              <a href="#system-forms">
                Anchor action <ArrowUpRight size={18} />
              </a>
            </Button>
          </div>
          <div className="system-catalog__row">
            <Button size="sm">Small · 40</Button>
            <Button size="md">Context default</Button>
            <Button size="lg">Large · 48</Button>
            <Button size="feature">Feature · 56</Button>
            <Button size="icon" aria-label="Search example">
              <Search size={18} />
            </Button>
            <Button disabled>Disabled</Button>
            <Button pending>Saving…</Button>
          </div>
        </section>
        <section aria-labelledby="system-forms">
          <h2 id="system-forms">Forms</h2>
          <Panel asChild>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                setSubmitted(true)
                setSaved(!!email.trim())
              }}
              className="system-catalog__form"
            >
              <Field
                label="Email address"
                htmlFor="example-email"
                error={error}
                hint="A local example. No email will be sent."
              >
                <Input
                  id="example-email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSaved(false)
                  }}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Publication status" htmlFor="example-status">
                <Select id="example-status">
                  <option>Draft</option>
                  <option>Published</option>
                </Select>
              </Field>
              <Field label="Notes" htmlFor="example-notes" optional>
                <Textarea
                  id="example-notes"
                  rows={3}
                  placeholder="Describe the work…"
                />
              </Field>
              <Field label="Unavailable field" htmlFor="example-disabled">
                <Input
                  id="example-disabled"
                  disabled
                  value="Read only example"
                />
              </Field>
              <label className="system-catalog__check">
                <Input appearance="plain" type="checkbox" />
                Include this example
              </label>
              <div>
                <Button type="submit">Try validation</Button>
              </div>
              {saved && (
                <Feedback tone="success">
                  Example complete. Nothing was saved.
                </Feedback>
              )}
            </form>
          </Panel>
        </section>
        <section aria-labelledby="system-status">
          <h2 id="system-status">Status and feedback</h2>
          <div className="system-catalog__row">
            <Badge>Neutral</Badge>
            <Badge tone="success">Published</Badge>
            <Badge tone="warning">Draft</Badge>
            <Badge tone="danger">Failed</Badge>
            <Badge tone="info">Beta</Badge>
            <Badge tone="accent">Featured</Badge>
          </div>
          <Feedback tone="success">Changes saved.</Feedback>
          <Feedback tone="warning">This entry has not been published.</Feedback>
          <Feedback tone="danger">
            The request failed. Check your connection and try again.
          </Feedback>
          <Feedback tone="info">Background work is in progress.</Feedback>
        </section>
        <section aria-labelledby="system-table">
          <h2 id="system-table">Tables</h2>
          <TableScroll aria-label="Example content table, scroll for all columns">
            <Table>
              <caption className="sr-only">Example publication records</caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    A long article title that remains readable in a narrow
                    viewport
                  </td>
                  <td>
                    <Badge tone="success">Published</Badge>
                  </td>
                  <td>15 Oct 2026</td>
                  <td>
                    <Button variant="secondary" size="sm">
                      Edit example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Notes from a coding adventure</td>
                  <td>
                    <Badge tone="warning">Draft</Badge>
                  </td>
                  <td>14 Oct 2026</td>
                  <td>
                    <Button variant="secondary" size="sm">
                      Edit example
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </TableScroll>
        </section>
        <section aria-labelledby="system-states">
          <h2 id="system-states">Page states</h2>
          <div className="system-catalog__states">
            <EmptyState>
              <h2>No entries yet</h2>
              <p>Create an entry to start this collection.</p>
              <Button className="mt-6">Create example</Button>
            </EmptyState>
            <PageState role="status" aria-busy="true">
              <h3>Loading content</h3>
              <p>Getting the latest entries.</p>
            </PageState>
            <PageState role="alert">
              <h3>Content could not load</h3>
              <p>Check your connection and try again.</p>
              <Button variant="secondary" className="mt-6">
                Try again example
              </Button>
            </PageState>
          </div>
        </section>
      </div>
    </div>
  )
}
