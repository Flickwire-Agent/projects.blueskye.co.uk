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
  Accordion,
} from '@mantine/core'
import { IconTool, IconRobot, IconCircleCheck, IconCircleX, IconMinus, IconBulb, IconBrush } from '@tabler/icons-react'

interface Project {
  name: string
  hostname: string
  url: string
}

interface Health {
  hostname: string
  status: string
  http_status: number
}

interface TodoItem {
  text: string
  priority: string
}

interface TodoSection {
  id: string
  title: string
  icon: string
  items: TodoItem[]
}

interface DailyTodo {
  date: string
  generated_at: string
  sections: TodoSection[]
}

const priorityColor: Record<string, string> = {
  high: 'red',
  medium: 'yellow',
  low: 'gray',
}

const sectionIcon: Record<string, typeof IconBulb> = {
  bulb: IconBulb,
  wrench: IconTool,
  broom: IconBrush,
}

const statusColor: Record<string, string> = {
  up: 'green',
  degraded: 'yellow',
  unreachable: 'red',
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
  const [health, setHealth] = useState<Health[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [todo, setTodo] = useState<DailyTodo | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/projects.json').then((r) => r.json()),
      fetch('/health.json').then((r) => r.json()),
      fetch('/daily-todo.json').then((r) => r.json()),
    ])
      .then(([proj, hlth, td]) => {
        setProjects(proj)
        setHealth(hlth)
        setTodo(td)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const healthMap = new Map(health.map((h) => [h.hostname, h]))

  return (
    <Container size="sm" py="xl">
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
            <b>scan-projects</b> timer auto-discovers new project directories
          </List.Item>
        </List>
      </Card>

      {todo && (
        <Card withBorder radius="md" mb="md" padding="lg">
          <Group mb="sm">
            <ThemeIcon variant="gradient" size="lg" radius="md"
              gradient={{ from: 'orange', to: 'red' }}
            >
              <IconBulb size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>Daily Briefing</Text>
              <Text size="sm" c="dimmed">
                Brainstormed {todo.date}
              </Text>
            </div>
          </Group>
          <Accordion variant="contained" radius="md" defaultValue="">
            {todo.sections.map((section) => {
              const Icon = sectionIcon[section.icon] || IconBulb
              const itemCount = section.items.length
              return (
                <Accordion.Item key={section.id} value={section.id}>
                  <Accordion.Control>
                    <Group gap="sm">
                      <ThemeIcon variant="light" size="sm" radius="xl">
                        <Icon size={14} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>{section.title}</Text>
                      {itemCount > 0 && (
                        <Badge size="sm" variant="filled" color="gray">{itemCount}</Badge>
                      )}
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {itemCount === 0 && (
                        <Text size="sm" c="dimmed" fs="italic">Nothing yet — awaiting agent input.</Text>
                      )}
                      {section.items.map((item, i) => (
                        <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
                          <Badge
                            size="sm"
                            variant="dot"
                            color={priorityColor[item.priority] || 'gray'}
                            style={{ flexShrink: 0, marginTop: 3 }}
                          />
                          <Text size="sm">{item.text}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              )
            })}
          </Accordion>
        </Card>
      )}

      <Title order={2} mb="md" mt="xl">Projects</Title>

      {loading && <Text c="dimmed" fs="italic">Loading projects…</Text>}
      {error && <Text c="red" fs="italic">Failed to load: {error}</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {projects.map((p) => {
          const h = healthMap.get(p.hostname)
          return (
            <Anchor key={p.hostname} href={p.url} underline="never">
              <Card withBorder radius="md" padding="lg"
                style={{ transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-blue-6)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-dark-4)'}
              >
                <Group justify="space-between" mb={4}>
                  <Text fw={600} size="lg" c="blue.4">{p.name}</Text>
                  {h && (
                    <Badge color={statusColor[h.status]} variant="light" size="sm"
                      leftSection={statusIcon(h.status)}
                    >
                      {h.status}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">{p.hostname}</Text>
              </Card>
            </Anchor>
          )
        })}
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
