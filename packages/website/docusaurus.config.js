// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const { npm2yarn2pnpm } = require('@sapphire/docusaurus-plugin-npm2yarn2pnpm')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Bronzite.js',
  tagline: 'A discord.js framework.',
  url: 'https://bronzite.daimond113.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/daimond113/bronzite/tree/main/packages/website/',
          remarkPlugins: [npm2yarn2pnpm]
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Bronzite.js',
        logo: {
          alt: 'Bronzite.js Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'api/index',
            position: 'left',
            label: 'API Docs',
          },
          {
            href: 'https://github.com/daimond113/bronzite',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: "Introduction",
                to: '/docs/intro',
              },
              {
                label: 'API Docs',
                to: '/docs/api',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/daimond113/bronzite',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Bronzite.js. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
