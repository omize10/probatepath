// Custom 404 page for Pages Router compatibility
// Redirects to App Router not-found handling
export default function Custom404() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: '#111827' }}>Go home</a>
    </div>
  );
}
