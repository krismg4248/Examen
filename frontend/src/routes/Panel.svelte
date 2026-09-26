<script>
  import { onMount } from 'svelte'
  import { push } from 'svelte-spa-router'
  import { createPieza, getPiezas, updatePieza } from '../lib/api.js'
  import { clearSession, token, user } from '../lib/auth.js'

  let piezas = $state([])
  let error = $state('')
  let formError = $state('')
  let loading = $state(true)
  let saving = $state(false)
  let editingId = $state(null)
  let formOpen = $state(false)

  let form = $state({
    nombre: '',
    descripcion: '',
    numero_parte: '',
    auto: '',
  })

  const isAdmin = $derived($user?.rol === 'administrador')

  async function loadPiezas(value) {
    loading = true
    error = ''
    try {
      const data = await getPiezas(value)
      piezas = data || []
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  }

  onMount(() => {
    let cancelled = false

    const unsub = token.subscribe(async (value) => {
      if (!value) {
        push('/')
        return
      }
      if (!cancelled) await loadPiezas(value)
    })

    return () => {
      cancelled = true
      unsub()
    }
  })

  function logout() {
    clearSession()
    push('/')
  }

  function resetForm() {
    form = { nombre: '', descripcion: '', numero_parte: '', auto: '' }
    editingId = null
    formError = ''
    formOpen = false
  }

  function openCreate() {
    form = { nombre: '', descripcion: '', numero_parte: '', auto: '' }
    editingId = null
    formError = ''
    formOpen = true
  }

  function openEdit(pieza) {
    form = {
      nombre: pieza.nombre || '',
      descripcion: pieza.descripcion || '',
      numero_parte: pieza.numero_parte || '',
      auto: pieza.auto || '',
    }
    editingId = pieza.id
    formError = ''
    formOpen = true
  }

  async function onSave(e) {
    e.preventDefault()
    formError = ''
    saving = true
    const currentToken = localStorage.getItem('torque_token')
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      numero_parte: form.numero_parte.trim(),
      auto: form.auto.trim(),
    }

    try {
      if (editingId) {
        await updatePieza(currentToken, editingId, payload)
      } else {
        await createPieza(currentToken, payload)
      }
      resetForm()
      await loadPiezas(currentToken)
    } catch (err) {
      formError = err.message || 'No se pudo guardar'
    } finally {
      saving = false
    }
  }
</script>

<div class="min-h-dvh bg-cream text-ink">
  <div
    class="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(24,103,132,0.08),transparent_45%),linear-gradient(180deg,#dac6b6_0%,#c0a08833_100%)]"
  ></div>

  <header class="relative z-10 border-b border-navy/10">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
      <div>
        <p class="font-display text-2xl font-bold tracking-tight text-navy">TORQUE</p>
        <p class="text-xs uppercase tracking-[0.25em] text-taupe">Catalogo</p>
      </div>
      <div class="flex items-center gap-4 text-sm">
        {#if $user}
          <span class="hidden text-navy/80 sm:inline">
            {$user.nombre}
            <span class="text-taupe"> · {$user.rol}</span>
          </span>
        {/if}
        <button
          type="button"
          class="border border-navy/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy transition hover:border-teal hover:text-teal"
          onclick={logout}
        >
          Salir
        </button>
      </div>
    </div>
  </header>

  <main class="relative z-10 mx-auto max-w-6xl px-6 py-10 md:px-10">
    <div class="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display text-4xl font-bold tracking-tight text-navy md:text-5xl">
          Piezas
        </h1>
        <p class="mt-3 max-w-xl text-taupe">
          {#if isAdmin}
            Como administrador puedes agregar piezas nuevas y editar las existentes.
          {:else}
            Consulta nombre, numero de parte y modelo del catalogo.
          {/if}
        </p>
      </div>

      {#if isAdmin && !formOpen}
        <button
          type="button"
          class="bg-navy px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition hover:bg-teal"
          onclick={openCreate}
        >
          Agregar pieza
        </button>
      {/if}
    </div>

    {#if isAdmin && formOpen}
      <form
        class="mt-10 border border-navy/10 bg-cream/80 p-6 animate-fade-up-delay md:p-8"
        onsubmit={onSave}
      >
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="font-display text-2xl font-bold text-navy">
            {editingId ? 'Editar pieza' : 'Nueva pieza'}
          </h2>
          <button
            type="button"
            class="text-xs font-semibold uppercase tracking-[0.18em] text-taupe hover:text-navy"
            onclick={resetForm}
          >
            Cancelar
          </button>
        </div>

        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
            Nombre
            <input
              class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
              required
              bind:value={form.nombre}
            />
          </label>
          <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
            No. de parte / modelo
            <input
              class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
              required
              bind:value={form.numero_parte}
            />
          </label>
          <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 md:col-span-2">
            Descripcion
            <input
              class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
              bind:value={form.descripcion}
            />
          </label>
          <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 md:col-span-2">
            Auto / compatibilidad
            <input
              class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
              required
              bind:value={form.auto}
              placeholder="Ej. Nissan Sentra 2018"
            />
          </label>
        </div>

        {#if formError}
          <p class="mt-4 text-sm text-teal" role="alert">{formError}</p>
        {/if}

        <button
          type="submit"
          disabled={saving}
          class="mt-8 bg-teal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition hover:bg-navy disabled:opacity-60"
        >
          {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Registrar pieza'}
        </button>
      </form>
    {/if}

    {#if loading}
      <p class="mt-12 text-sm text-taupe animate-fade-up-delay">Cargando catalogo…</p>
    {:else if error}
      <p class="mt-12 text-sm text-teal" role="alert">{error}</p>
    {:else}
      <ul class="mt-12 divide-y divide-navy/10 border-y border-navy/10 animate-fade-up-delay">
        {#each piezas as pieza (pieza.id)}
          <li class="grid gap-3 py-5 md:grid-cols-[1.4fr_0.8fr_1fr_auto] md:items-baseline md:gap-6">
            <div>
              <p class="font-display text-xl font-semibold text-navy">{pieza.nombre}</p>
              <p class="mt-1 text-sm leading-relaxed text-taupe">{pieza.descripcion || '—'}</p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe">
                No. de parte
              </p>
              <p class="mt-1 font-semibold text-teal">{pieza.numero_parte}</p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe">
                Compatibilidad
              </p>
              <p class="mt-1 text-sm text-navy/80">{pieza.auto}</p>
            </div>
            {#if isAdmin}
              <div class="md:justify-self-end">
                <button
                  type="button"
                  class="text-xs font-semibold uppercase tracking-[0.18em] text-navy underline-offset-4 hover:text-teal hover:underline"
                  onclick={() => openEdit(pieza)}
                >
                  Editar
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>
