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

  // Return a page that sends the token back to the popup opener
  const successPayload = JSON.stringify({ token, provider: 'github' });

  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
<p id="status">Authorizing...</p>
<script>
(function () {
  const payload = ${successPayload};
  document.getElementById('status').textContent = 'Token received: ' + payload.token.substring(0, 20) + '...';

  // Send to parent window - try both formats
  if (window.opener) {
    try {
      // Try sending as object (what Decap CMS v3 expects)
      window.opener.postMessage({
        type: 'authorization',
        provider: 'github',
        token: payload.token
      }, '*');
      document.getElementById('status').textContent = 'Auth sent to parent. Closing...';
    } catch (e) {
      document.getElementById('status').textContent = 'Error: ' + e.message;
    }
  } else {
    document.getElementById('status').textContent = 'No parent window found';
  }

  setTimeout(function() {
    window.close();
  }, 2000);
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
