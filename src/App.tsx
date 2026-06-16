import { useEffect, useState } from 'react'

interface Project {
  name: string
  hostname: string
  url: string
}

const containerStyle: React.CSSProperties = {
  maxWidth: '48rem',
  margin: '0 auto',
  padding: '4rem 1.5rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#e2e8f0',
  background: '#0f172a',
  minHeight: '100vh',
}

const headingStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
}

const subStyle: React.CSSProperties = {
  color: '#64748b',
  marginBottom: '2.5rem',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
}

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: '1rem 1.25rem',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#38bdf8',
  fontSize: '1.125rem',
  transition: 'border-color 0.15s',
}

const domainHint: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: '#64748b',
  marginTop: '0.25rem',
}

const errorStyle: React.CSSProperties = {
  color: '#f87171',
  fontStyle: 'italic',
}

const loadingStyle: React.CSSProperties = {
  color: '#64748b',
  fontStyle: 'italic',
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
    <div style={containerStyle}>
      <h1 style={headingStyle}>projects.blueskye.co.uk</h1>
      <p style={subStyle}>Web projects hosted from ~/dev/projects/</p>

      {loading && <p style={loadingStyle}>Loading projects…</p>}
      {error && <p style={errorStyle}>Failed to load projects: {error}</p>}

      <div style={gridStyle}>
        {projects.map((p) => (
          <a key={p.hostname} href={p.url} style={cardStyle}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
          >
            {p.name}
            <span style={domainHint}>{p.hostname}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default App
