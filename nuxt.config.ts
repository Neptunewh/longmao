import vuetify from 'vite-plugin-vuetify'
import inject from '@rollup/plugin-inject'

export default defineNuxtConfig({
  pages: true,
  ssr: false,
  generate: {
    fallback: '404.html',
  },
  routeRules: { '/totoro/**': { proxy: 'https://app.xtotoro.com/app/**' } },
  vite: {
    build: {
      commonjsOptions: { transformMixedEsModules: true },
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          manualChunks: {
            vuetify: ['vuetify'],
          },
        },
      },
    },
    resolve: { alias: { buffer: 'buffer' } },
    plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    ssr: { noExternal: ['vuetify'] },
    optimizeDeps: {
      include: ['@vueuse/core', 'date-fns', 'uuid', '@amap/amap-jsapi-loader'],
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@unocss/nuxt',
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        if (!config.plugins) config.plugins = []
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  experimental: {
    payloadExtraction: false,
  },
})
