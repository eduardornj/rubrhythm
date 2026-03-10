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
        ],
      },
    ],
    sitemap: 'https://rubrhythm.bubblesenterprise.com/sitemap.xml',
  };
}
