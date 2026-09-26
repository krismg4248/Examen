<script>
  import { push } from 'svelte-spa-router'
  import Scene3D from '../lib/Scene3D.svelte'
  import { register as apiRegister } from '../lib/api.js'
  import { setSession } from '../lib/auth.js'

  let nombre = $state('')
  let email = $state('')
  let password = $state('')
  let error = $state('')
  let loading = $state(false)

  async function onSubmit(e) {
    e.preventDefault()
    error = ''
    loading = true
    try {
      const data = await apiRegister({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
      })
      setSession(data.access_token, data.usuario)
      push('/panel')
    } catch (err) {
      error = err.message || 'No se pudo registrar'
    } finally {
      loading = false
    }
  }
</script>

<div class="relative min-h-dvh overflow-hidden bg-navy text-cream">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_15%,rgba(24,103,132,0.4),transparent_50%),radial-gradient(ellipse_at_10%_90%,rgba(192,160,136,0.18),transparent_45%)]"
  ></div>

  <div class="absolute inset-0 opacity-70">
    <Scene3D />
  </div>

  <main class="relative z-10 grid min-h-dvh lg:grid-cols-[0.85fr_1.15fr]">
    <section
      class="order-2 flex items-end lg:order-1 lg:items-center bg-gradient-to-t from-cream via-cream/95 to-cream/80 px-6 py-10 backdrop-blur-sm md:px-12 lg:bg-cream lg:px-14"
    >
      <form
        class="w-full max-w-md animate-fade-up text-ink"
        onsubmit={onSubmit}
      >
        <h2 class="font-display text-3xl font-bold tracking-tight text-navy">
          Registro
        </h2>
        <p class="mt-2 text-sm text-taupe">
          Alta de empleado. El administrador se gestiona por separado.
        </p>

        <label class="mt-8 block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
          Nombre
          <input
            class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base text-ink outline-none transition placeholder:text-taupe/50 focus:border-teal"
            type="text"
            required
            bind:value={nombre}
            placeholder="Tu nombre"
          />
        </label>

        <label class="mt-6 block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
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
            autocomplete="new-password"
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
          class="mt-10 w-full bg-teal px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-cream transition hover:bg-navy disabled:opacity-60"
        >
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>

        <p class="mt-6 text-sm text-taupe">
          ¿Ya tienes acceso?
          <a class="font-semibold text-navy underline-offset-4 hover:underline" href="#/">
            Iniciar sesion
          </a>
        </p>
      </form>
    </section>

    <section
      class="order-1 flex flex-col justify-between px-8 py-10 md:px-14 lg:order-2 lg:px-16 lg:py-14"
    >
      <header class="animate-fade-up">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-sand/80">
          Nuevo acceso
        </p>
        <h1
          class="mt-4 font-display text-5xl tracking-tight text-cream md:text-7xl"
          style="font-weight: 800"
        >
          TORQUE
        </h1>
        <p class="mt-5 max-w-sm text-base leading-relaxed text-cream/75">
          Un espacio limpio para consultar piezas, numeros de parte y modelos.
        </p>
      </header>
    </section>
  </main>
</div>
