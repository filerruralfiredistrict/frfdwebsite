/**
 * Cloudflare Pages Function: /api/callback
 *
 * Handles the GitHub OAuth callback for Decap CMS.
 * Exchanges the code for an access token and passes it
 * back to the CMS via postMessage.
 *
 * Requires environment variables:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */
export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return errorPage('No authorization code received from GitHub.');
  }

  // Exchange code for access token
  let token;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return errorPage(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    token = data.access_token;
  } catch (err) {
    return errorPage('Failed to contact GitHub. Please try again.');
  }

  // Store token in session storage and redirect back to admin
  // Decap CMS will pick it up from there
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
<script>
(function () {
  const token = '${token}';

  // Store in session storage
  try {
    sessionStorage.setItem('decap-cms-auth-token', token);
  } catch (e) {
    try {
      localStorage.setItem('decap-cms-auth-token', token);
    } catch (e2) {}
  }

  // Redirect back to admin with token in hash
  window.location.href = '/admin/#/login?token=' + encodeURIComponent(token);
})();
</script>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function errorPage(message) {
  return new Response(
    `<!DOCTYPE html>
<html>
<body>
<h2>Authorization failed</h2>
<p>${message}</p>
<p>Close this window and try again, or contact your site administrator.</p>
</body>
</html>`,
    { status: 400, headers: { 'Content-Type': 'text/html' } }
  );
}
