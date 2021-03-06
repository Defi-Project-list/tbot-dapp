export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'TBOT Interface',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [{
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    {
      hid: 'description',
      name: 'description',
      content: "The TBOT Project's vision is wealth redistribution through Decentralized Finance (DeFi) by giving power to the people for full autonomy of their assets."
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    },
    {
      hid: 'og:title',
      property: 'og:title',
      content: 'TBOT Project'
    },
    {
      hid: 'og:description',
      property: 'og:description',
      content: "The TBOT Project's vision is wealth redistribution through Decentralized Finance (DeFi) by giving power to the people for full autonomy of their assets."
    },
    {
      hid: 'og:image',
      property: 'og:image',
      content: `https://tbot-docs.us-east-1.linodeobjects.com/tbot.png`
    },
    {
      hid: 'og:image:secure_url',
      property: 'og:image:secure_url',
      content: `https://tbot-docs.us-east-1.linodeobjects.com/tbot.png`
    },
    {
      hid: 'og:image:alt',
      property: 'og:image:alt',
      content: 'TBOT'
    }
  ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@assets/scss/main'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/jazzicon.client',
    '~/plugins/ethereum.client',
    '~/plugins/validate.client',
    '~/plugins/countdown.client',
    '~/plugins/axios'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/device',
    '@nuxtjs/google-analytics'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/buefy
    'nuxt-buefy',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'nuxt-vuex-localstorage',
    '@nuxtjs/auth-next',
    '@nuxtjs/color-mode',
    // '@nuxtjs/sitemap'
  ],

  sitemap: {
    hostname: process.env.SITEMAP_HOSTNAME,
  },

  buefy: {
    css: false,
    materialDesignIcons: true
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  auth: {
    redirect: {
      login: '/',
      logout: '/'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'token',
          maxAge: 1800,
          global: true,
          type: 'Bearer'
        },
        refreshToken: {
          property: 'refreshToken',
          data: 'token',
          maxAge: 21600
        },
        user: {
          property: false,
          // autoFetch: true
        },
        endpoints: {
          login: {
            url: `${process.env.API_SERVER}/auth/login`,
            method: 'post'
          },
          refresh: {
            url: `${process.env.API_SERVER}/auth/refresh`,
            method: 'post'
          },
          user: {
            url: `${process.env.API_SERVER}/auth/me`,
            method: 'get'
          },
          logout: {
            url: `${process.env.API_SERVER}/auth/logout`,
            method: 'post'
          }
        },
        // autoLogout: false
      }
    }
  },

  publicRuntimeConfig: {
    infuraId: process.env.INFURA_ID,
    idoContract: process.env.IDO_CONTRACT,
    tbotContract: process.env.TBOT_CONTRACT,
    votingContract: process.env.VOTING_CONTRACT,
    apiUrl: process.env.API_SERVER,
    stakingContract: process.env.STAKING_CONTRACT,
    tbotContent:process.env.TBOT_CONTENT,
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_ID
    },
    airdropContract:process.env.AIRDROP_CONTRACT,
    giftsContract:process.env.GIFTS_CONTRACT
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, ctx) {},
    publicPath: '/_tbot/'
  },

}
