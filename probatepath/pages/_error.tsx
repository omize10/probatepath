// Custom error page for Pages Router compatibility
// This prevents the Html import error from next-auth internal pages
import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>{statusCode ? `${statusCode} - Server Error` : 'An error occurred'}</h1>
      <p>Something went wrong.</p>
      <a href="/" style={{ color: '#111827' }}>Go home</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
