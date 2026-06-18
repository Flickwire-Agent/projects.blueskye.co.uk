import { useEffect, useState } from 'react'
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Anchor,
  List,
  ThemeIcon,
  Group,
  Badge,
  Stack,
  SegmentedControl,
  Image,
} from '@mantine/core'
import { IconTool, IconRobot, IconCircleCheck, IconCircleX, IconMinus, IconChartBar } from '@tabler/icons-react'

interface Project {
  name: string
  hostname: string
  url: string
  description: string
  techStack: string[]
  screenshot: string | null
  status: string
  http_status: number
}

type TokenKey = 'input' | 'output' | 'reasoning' | 'cacheRead' | 'cacheWrite'

interface TokenTotals {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
  total: number
  billable: number
}

interface TokenUsageModel {
  id: string
  provider: string
  model: string
  messages: number
  cost: number
  tokens: TokenTotals
}

interface TokenUsageWindow {
  id: string
  label: string
  since: string | null
  totals: {
    messages: number
    cost: number
    tokens: TokenTotals
  }
  models: TokenUsageModel[]
}

interface OpenCodeTokenUsage {
  generatedAt: string
  windows: TokenUsageWindow[]
}

const statusColor: Record<string, string> = {
  up: 'green',
  degraded: 'yellow',
  unreachable: 'red',
}

const tokenSegments: { key: TokenKey; label: string; color: string }[] = [
  { key: 'cacheRead', label: 'Cache read', color: 'var(--mantine-color-cyan-6)' },
  { key: 'input', label: 'Input', color: 'var(--mantine-color-blue-6)' },
  { key: 'output', label: 'Output', color: 'var(--mantine-color-green-6)' },
  { key: 'reasoning', label: 'Reasoning', color: 'var(--mantine-color-violet-6)' },
  { key: 'cacheWrite', label: 'Cache write', color: 'var(--mantine-color-orange-6)' },
]

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function formatTokens(value: number) {
  return compactNumber.format(value)
}

function formatCost(value: number) {
  return value === 0 ? '$0' : currency.format(value)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusIcon(status: string) {
  switch (status) {
    case 'up':
      return <IconCircleCheck size={16} />
    case 'degraded':
      return <IconMinus size={16} />
    default:
      return <IconCircleX size={16} />
  }
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenUsage, setTokenUsage] = useState<OpenCodeTokenUsage | null>(null)
  const [usageWindow, setUsageWindow] = useState('day')

  useEffect(() => {
    Promise.all([
      fetch('/projects.json').then((r) => r.json()),
      fetch('/opencode-token-usage.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([proj, usage]) => {
        setProjects(proj)
        setTokenUsage(usage)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const usageWindows = tokenUsage?.windows ?? []
  const selectedUsage = usageWindows.find((window) => window.id === usageWindow) ?? usageWindows[0]
  const maxModelTokens = selectedUsage?.models.reduce(
    (max, model) => Math.max(max, model.tokens.total),
    0,
  ) ?? 0

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xs">projects.blueskye.co.uk</Title>
      <Text c="dimmed" mb="lg">
        Agentic infrastructure — managed entirely by an AI agent.
      </Text>

      <Card withBorder radius="md" mb="md" padding="lg">
        <Group mb="sm">
          <ThemeIcon variant="gradient" size="lg" radius="md"
            gradient={{ from: 'violet', to: 'cyan' }}
          >
            <IconRobot size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Agent-managed testbed</Text>
            <Text size="sm" c="dimmed">
              This domain and all its subdomains are provisioned, configured, and
              maintained by the{' '}
              <Anchor href="https://opencode.ai" target="_blank">
                opencode
              </Anchor>{' '}
              agent running on this machine. Every change is tracked in git and
              synced to{' '}
              <Anchor href="https://github.com/Flickwire-Agent" target="_blank">
                GitHub
              </Anchor>
              .
            </Text>
          </div>
        </Group>
        <List spacing="xs" size="sm" withPadding icon={
          <ThemeIcon color="violet" variant="light" size={20} radius="xl">
            <IconTool size={12} />
          </ThemeIcon>
        }>
          <List.Item>
            <b>Caddy</b> reverse-proxies with auto-TLS via Let's Encrypt
          </List.Item>
          <List.Item>
            <b>systemd</b> user services with timers for periodic maintenance
          </List.Item>
          <List.Item>
            <b>dotfiles</b> repo mirrors every config change to GitHub
          </List.Item>
          <List.Item>
            <b>project registry</b> manually curated in <code>public/projects.json</code>
          </List.Item>
        </List>
      </Card>

      {tokenUsage && selectedUsage && (
        <Card withBorder radius="md" mb="md" padding="lg">
          <Group mb="sm" justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon variant="gradient" size="lg" radius="md"
                gradient={{ from: 'blue', to: 'grape' }}
              >
                <IconChartBar size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>OpenCode Token Usage</Text>
                <Text size="sm" c="dimmed">
                  Generated {formatDateTime(tokenUsage.generatedAt)}
                </Text>
              </div>
            </Group>
            <SegmentedControl
              size="xs"
              value={selectedUsage.id}
              onChange={setUsageWindow}
              data={usageWindows.map((window) => ({ label: window.label, value: window.id }))}
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
            <Card withBorder radius="sm" padding="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total tokens</Text>
              <Text fw={700} size="xl">{formatTokens(selectedUsage.totals.tokens.total)}</Text>
            </Card>
            <Card withBorder radius="sm" padding="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Messages</Text>
              <Text fw={700} size="xl">{selectedUsage.totals.messages.toLocaleString()}</Text>
            </Card>
            <Card withBorder radius="sm" padding="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Estimated cost</Text>
              <Text fw={700} size="xl">{formatCost(selectedUsage.totals.cost)}</Text>
            </Card>
          </SimpleGrid>

          <Group gap="xs" mb="sm">
            {tokenSegments.map((segment) => (
              <Badge
                key={segment.key}
                size="sm"
                variant="light"
                leftSection={
                  <span style={{
                    display: 'block',
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: segment.color,
                  }} />
                }
              >
                {segment.label}
              </Badge>
            ))}
          </Group>

          <Stack gap="sm">
            {selectedUsage.models.length === 0 && (
              <Text size="sm" c="dimmed" fs="italic">No OpenCode usage recorded for this window.</Text>
            )}
            {selectedUsage.models.map((model) => {
              const total = model.tokens.total
              const barWidth = maxModelTokens > 0 ? Math.max((total / maxModelTokens) * 100, 1) : 0

              return (
                <div key={model.id}>
                  <Group justify="space-between" gap="sm" align="flex-start" mb={4}>
                    <div>
                      <Group gap={6} mb={2}>
                        <Badge size="xs" variant="light">{model.provider}</Badge>
                        <Text size="sm" fw={600}>{model.model}</Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {model.messages.toLocaleString()} messages · {formatTokens(model.tokens.billable)} billable · {formatCost(model.cost)}
                      </Text>
                    </div>
                    <Text size="sm" fw={700}>{formatTokens(total)}</Text>
                  </Group>
                  <div style={{
                    height: 14,
                    width: '100%',
                    borderRadius: 999,
                    background: 'var(--mantine-color-dark-6)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex',
                      height: '100%',
                      width: `${barWidth}%`,
                      minWidth: total > 0 ? 6 : 0,
                    }}>
                      {tokenSegments.map((segment) => {
                        const value = model.tokens[segment.key]
                        if (value <= 0 || total <= 0) return null
                        return (
                          <div
                            key={segment.key}
                            title={`${segment.label}: ${value.toLocaleString()} tokens`}
                            style={{
                              width: `${(value / total) * 100}%`,
                              minWidth: 2,
                              background: segment.color,
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </Stack>
        </Card>
      )}

      <Title order={2} mb="md" mt="xl">Projects</Title>

      {loading && <Text c="dimmed" fs="italic">Loading projects…</Text>}
      {error && <Text c="red" fs="italic">Failed to load: {error}</Text>}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {projects.map((p) => (
          <Anchor key={p.hostname} href={p.url} underline="never">
            <Card withBorder radius="md" padding={0}
              style={{ height: '100%', overflow: 'hidden', transition: 'border-color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-blue-6)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-dark-4)'}
            >
              {p.screenshot ? (
                <Card.Section>
                  <Image
                    src={p.screenshot}
                    alt={p.name}
                    h={170}
                    fit="cover"
                  />
                </Card.Section>
              ) : (
                <Card.Section>
                  <div style={{
                    height: 170,
                    background: 'linear-gradient(135deg, var(--mantine-color-dark-6), var(--mantine-color-blue-9))',
                  }} />
                </Card.Section>
              )}

              <Stack gap="xs" p="lg">
                <Group justify="space-between" align="flex-start" gap="xs">
                  <div style={{ minWidth: 0 }}>
                    <Text fw={600} size="lg" c="blue.4" lineClamp={1}>{p.name}</Text>
                    <Text size="sm" c="dimmed" lineClamp={1}>{p.hostname}</Text>
                  </div>
                  {p.status && (
                    <Badge color={statusColor[p.status] || 'gray'} variant="light" size="sm"
                      leftSection={statusIcon(p.status)}
                      style={{ flexShrink: 0 }}
                    >
                      {p.status}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" lineClamp={4}>{p.description}</Text>
                {p.techStack && p.techStack.length > 0 && (
                  <Group gap={6} mt={4}>
                    {p.techStack.map((tech) => (
                      <Badge key={tech} size="sm" variant="light" color="gray">
                        {tech}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Stack>
            </Card>
          </Anchor>
        ))}
      </SimpleGrid>

      <Stack align="center" gap="xs" mt="xl" mb="lg">
        <Badge variant="outline" color="gray" size="sm">
          managed by opencode
        </Badge>
        <Text size="xs" c="dimmed">
          source: <Anchor href="https://github.com/Flickwire-Agent/projects.blueskye.co.uk" target="_blank">GitHub</Anchor>
        </Text>
      </Stack>
    </Container>
  )
}

export default App
