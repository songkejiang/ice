const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
import R from 'ramda'
import {resolve} from 'path'
// Import and Set Nuxt.js options
const r = path => resolve(__dirname, path)
let config = require('../nuxt.config.js')
const MIDDLEWARE = ['router']
class Server {
  constructor(app) {
    config.dev = !(process.env.NODE_ENV === 'production')
    this.app = new Koa() 
    this.useMiddleWare(this.app)(MIDDLEWARE)
  }
  useMiddleWare(app) {
    return R.map(R.compose(
      R.map(i => i(app)), 
      require,
      i => `${r('./middlewares')}/${i}`
    )) 
  }
  async start() {
    const nuxt = new Nuxt(config)
    const {
      host = process.env.HOST || '127.0.0.1',
      port = process.env.PORT || 3000
    } = nuxt.options.server
  
    // Build in development
    console.log('env', config.dev)
    if (config.dev) {
      const builder = new Builder(nuxt)
      await builder.build()
    } else {
      await nuxt.ready()
    }
  
    this.app.use(ctx => {
      ctx.status = 200
      ctx.respond = false // Bypass Koa's built-in response handling
      ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
      nuxt.render(ctx.req, ctx.res)
    })
  
    this.app.listen(port, host)
    consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true
    })
  }
}
const app = new Server()
app.start()
