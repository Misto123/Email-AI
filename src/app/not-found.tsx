/* eslint-disable @next/next/no-html-link-for-pages */
export default function NotFound() {
  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/">Drafts</a>
          <a href="/mailboxes">Mailboxes</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <section className="content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '6rem', margin: 0, color: '#3b82f6' }}>404</h1>
          <h2 style={{ fontSize: '2rem', marginTop: '1rem', color: '#1f2937' }}>
            Page Not Found
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginTop: '1rem', maxWidth: '500px' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/" className="button primary">
              🏠 Go Home
            </a>
            <a href="/mailboxes" className="button ghost">
              📧 Mailboxes
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
