// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ['@nuxt/ui','@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  ssr: false,

  app: {
    head: {
      title : 'Kaki Battle Cuber',
      link : [
        {rel: 'icon', type: 'image/svg+xml', href:'/kbc.svg'}
      ]
    },
     
  },

  runtimeConfig: {
    public: {
      socketUrl: "",
    },
  }
});