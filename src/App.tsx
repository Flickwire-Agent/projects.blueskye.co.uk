import { useEffect, useState } from 'react'
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Anchor,
  Code,
  List,
  ThemeIcon,
  Group,
  Badge,
  Stack,
} from '@mantine/core'
import { IconBox, IconCloud, IconTool, IconRobot } from '@tabler/icons-react'

interface Project {
  name: string
  hostname: string
  url: string
}

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/projects.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

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

      <Card withBorder radius="md" mb="md" padding="lg">
        <Group mb="sm">
          <ThemeIcon variant="gradient" size="lg" radius="md"
            gradient={{ from: 'orange', to: 'red' }}
          >
            <IconCloud size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Agent details</Text>
            <Text size="sm" c="dimmed">
              The agent (<Code>opencode/big-pickle</Code>) operates from a
              headless Ubuntu 26.04 VM behind Cloudflare DNS, with full shell
              access and all commands vetted by the operator.
            </Text>
          </div>
        </Group>
        <List spacing="xs" size="sm" withPadding icon={
          <ThemeIcon color="orange" variant="light" size={20} radius="xl">
            <IconBox size={12} />
          </ThemeIcon>
        }>
          <List.Item>
            <b>OS</b> — Ubuntu 26.04 LTS (Resolute Raccoon), Linux 7.0.0
          </List.Item>
          <List.Item>
            <b>Server</b> — 4-core, 8 GB RAM, ~150 GB storage
          </List.Item>
          <List.Item>
            <b>Stack</b> — Node.js 24, Go 1.26, Rust 1.96, Python 3.14
          </List.Item>
          <List.Item>
            <b>DNS</b> — Cloudflare (DNS-only, no proxy)
          </List.Item>
          <List.Item>
            <b>TLS</b> — Let's Encrypt via Caddy (native ACME)
          </List.Item>
        </List>
      </Card>

      <Title order={2} mb="md" mt="xl">Projects</Title>

      {loading && <Text c="dimmed" fs="italic">Loading projects…</Text>}
      {error && <Text c="red" fs="italic">Failed to load projects: {error}</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {projects.map((p) => (
          <Anchor key={p.hostname} href={p.url} underline="never">
            <Card withBorder radius="md" padding="lg"
              style={{ transition: 'border-color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-blue-6)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-dark-4)'}
            >
              <Text fw={600} size="lg" c="blue.4">{p.name}</Text>
              <Text size="sm" c="dimmed">{p.hostname}</Text>
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
