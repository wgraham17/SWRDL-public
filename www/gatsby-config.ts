import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
    siteMetadata: {
        title: `SWRDL`,
        siteUrl: `https://swrdl.app`,
    },
    plugins: [
        'gatsby-plugin-mdx',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'pages',
                path: './src/pages/',
            },
            __key: 'pages',
        },
        'gatsby-plugin-react-helmet',
        {
            resolve: `gatsby-plugin-s3`,
            options: {
                bucketName: 'swrdl.app',
                protocol: 'https',
                hostname: 'swrdl.app',
                params: {
                    'apple-app-site-association': {
                        'Cache-Control': 'public, max-age=0, must-revalidate',
                    },
                    'assetlinks.json': {
                        'Cache-Control': 'public, max-age=0, must-revalidate',
                    },
                },
            },
        },
        {
            resolve: `gatsby-plugin-google-tagmanager`,
            options: {
                id: `[REDACTED]`,
            },
        },
    ],
};

export default config;
