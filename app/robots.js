export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/myaccount/',
          '/dashboard/',
          '/auth/',
          '/login',
          '/banned',
          '/chat/',
          '/messages/',
          '/register-on-rubrhythm',
        ],
      },
      // AI Crawlers — explicitly ALLOW
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: 'https://www.rubrhythm.com/sitemap.xml',
  };
}
