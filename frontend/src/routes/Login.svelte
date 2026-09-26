<script>
  import { push } from 'svelte-spa-router'
  import Scene3D from '../lib/Scene3D.svelte'
  import { login as apiLogin } from '../lib/api.js'
  import { setSession } from '../lib/auth.js'

  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function onSubmit(e) {
    e.preventDefault()
    error = ''
    loading = true
    try {
      const data = await apiLogin(email.trim(), password)
      setSession(data.access_token, data.usuario)
      push('/panel')
    } catch (err) {
      error = err.message || 'Credenciales invalidas'
    } finally {
      loading = false
    }
  }
</script>

<div class="relative min-h-dvh overflow-hidden bg-navy text-cream">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(24,103,132,0.45),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(154,124,101,0.22),transparent_50%)]"
  ></div>

  <div class="absolute inset-0 opacity-80">
    <Scene3D />
  </div>

  <div
    class="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-teal/20 blur-3xl animate-soft-pulse"
  ></div>

  <main class="relative z-10 grid min-h-dvh lg:grid-cols-[1.15fr_0.85fr]">
    <section class="flex flex-col justify-end px-8 pb-6 pt-10 md:px-14 lg:justify-between lg:px-16 lg:py-14">
      <header class="animate-fade-up">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-sand/80">
          Refaccionaria
        </p>
        <h1
          class="mt-3 font-display text-5xl tracking-tight text-cream md:mt-4 md:text-7xl lg:text-8xl"
          style="font-weight: 800"
        >
          TORQUE
        </h1>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-cream/75 md:mt-5 md:text-lg">
          Piezas precisas. Catalogo claro. Acceso para tu equipo de taller.
        </p>
      </header>

      <p class="mt-16 hidden text-sm text-sand/60 lg:block animate-fade-up-delay">
        Inspirado en la practica del mostrador — sin ruido visual.
      </p>
    </section>

    <section
      class="flex items-start bg-cream px-6 py-8 md:px-12 lg:items-center lg:px-14"
    >
      <form
        class="w-full max-w-md animate-fade-up-delay text-ink"
        onsubmit={onSubmit}
      >
        <h2 class="font-display text-3xl font-bold tracking-tight text-navy">
          Entrar
        </h2>
        <p class="mt-2 text-sm text-taupe">
          Usa tu correo de trabajo para continuar.
        </p>

        <label class="mt-8 block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
          Correo
          <input
            class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base text-ink outline-none transition placeholder:text-taupe/50 focus:border-teal"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            placeholder="tu@correo.com"
          />
        </label>

        <label class="mt-6 block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
          Contraseña
          <input
            class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base text-ink outline-none transition placeholder:text-taupe/50 focus:border-teal"
            type="password"
            autocomplete="current-password"
            required
            minlength="8"
            bind:value={password}
            placeholder="Minimo 8 caracteres"
          />
        </label>

        {#if error}
          <p class="mt-4 text-sm text-teal" role="alert">{error}</p>
        {/if}

        <button
          type="submit"
          disabled={loading}
          class="mt-10 w-full bg-navy px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-cream transition hover:bg-teal disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Continuar'}
        </button>

        <p class="mt-6 text-sm text-taupe">
          ¿Primera vez?
          <a class="font-semibold text-navy underline-offset-4 hover:underline" href="#/registro">
            Crear cuenta
          </a>
        </p>

        <div class="mt-10 space-y-1 border-t border-taupe/30 pt-6 text-xs leading-relaxed text-taupe">
          <p>Kristen Angelica Miranda Garcia 369033</p>
          <p>Pedro Alexandro Limas Peña 368666</p>
        </div>
      </form>
    </section>
  </main>
</div>
