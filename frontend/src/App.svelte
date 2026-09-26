<script>
  import Router, { replace } from 'svelte-spa-router'
  import { wrap } from 'svelte-spa-router/wrap'
  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'
  import Panel from './routes/Panel.svelte'
  import { isAuthenticated } from './lib/auth.js'

  const routes = {
    '/': Login,
    '/registro': Register,
    '/panel': wrap({
      component: Panel,
      conditions: [
        () => {
          let ok = false
          const unsub = isAuthenticated.subscribe((v) => {
            ok = v
          })
          unsub()
          if (!ok) replace('/')
          return ok
        },
      ],
    }),
    '*': Login,
  }
</script>

<Router {routes} />
