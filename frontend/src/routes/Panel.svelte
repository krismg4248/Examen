<script>
  import { onMount } from 'svelte'
  import { push } from 'svelte-spa-router'
  import {
    createAuto,
    createPieza,
    getAutos,
    getPiezas,
    updateAuto,
    updatePieza,
  } from '../lib/api.js'
  import { clearSession, token, user } from '../lib/auth.js'

  const SITUACIONES = ['Falta reparacion', 'En proceso', 'Terminado']

  let tab = $state('autos')
  let piezas = $state([])
  let autos = $state([])
  let error = $state('')
  let formError = $state('')
  let loading = $state(true)
  let saving = $state(false)
  let editingId = $state(null)
  let formOpen = $state(false)

  let piezaForm = $state({
    nombre: '',
    descripcion: '',
    numero_parte: '',
    auto: '',
  })

  let autoForm = $state({
    marca: '',
    modelo: '',
    anio: '',
    placa: '',
    propietario: '',
    situacion: 'Falta reparacion',
    notas: '',
  })

  const isAdmin = $derived($user?.rol === 'administrador')

  function situacionClass(situacion) {
    if (situacion === 'Falta reparacion') return 'text-status-red'
    if (situacion === 'En proceso') return 'text-status-yellow'
    if (situacion === 'Terminado') return 'text-status-green'
    return 'text-taupe'
  }

  async function loadAll(value) {
    loading = true
    error = ''
    try {
      const [p, a] = await Promise.all([getPiezas(value), getAutos(value)])
      piezas = p || []
      autos = a || []
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
      if (!cancelled) await loadAll(value)
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

  function switchTab(next) {
    tab = next
    resetForm()
  }

  function resetForm() {
    piezaForm = { nombre: '', descripcion: '', numero_parte: '', auto: '' }
    autoForm = {
      marca: '',
      modelo: '',
      anio: '',
      placa: '',
      propietario: '',
      situacion: 'Falta reparacion',
      notas: '',
    }
    editingId = null
    formError = ''
    formOpen = false
  }

  function openCreate() {
    resetForm()
    formOpen = true
  }

  function openEditPieza(pieza) {
    tab = 'piezas'
    piezaForm = {
      nombre: pieza.nombre || '',
      descripcion: pieza.descripcion || '',
      numero_parte: pieza.numero_parte || '',
      auto: pieza.auto || '',
    }
    editingId = pieza.id
    formError = ''
    formOpen = true
  }

  function openEditAuto(auto) {
    tab = 'autos'
    autoForm = {
      marca: auto.marca || '',
      modelo: auto.modelo || '',
      anio: auto.anio != null ? String(auto.anio) : '',
      placa: auto.placa || '',
      propietario: auto.propietario || '',
      situacion: auto.situacion || 'Falta reparacion',
      notas: auto.notas || '',
    }
    editingId = auto.id
    formError = ''
    formOpen = true
  }

  async function onSave(e) {
    e.preventDefault()
    formError = ''
    saving = true
    const currentToken = localStorage.getItem('torque_token')

    try {
      if (tab === 'piezas') {
        const payload = {
          nombre: piezaForm.nombre.trim(),
          descripcion: piezaForm.descripcion.trim() || undefined,
          numero_parte: piezaForm.numero_parte.trim(),
          auto: piezaForm.auto.trim(),
        }
        if (editingId) await updatePieza(currentToken, editingId, payload)
        else await createPieza(currentToken, payload)
      } else {
        const payload = {
          marca: autoForm.marca.trim(),
          modelo: autoForm.modelo.trim(),
          anio: autoForm.anio ? Number(autoForm.anio) : undefined,
          placa: autoForm.placa.trim() || undefined,
          propietario: autoForm.propietario.trim() || undefined,
          situacion: autoForm.situacion,
          notas: autoForm.notas.trim() || undefined,
        }
        if (editingId) await updateAuto(currentToken, editingId, payload)
        else await createAuto(currentToken, payload)
      }
      resetForm()
      await loadAll(currentToken)
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
        <p class="text-xs uppercase tracking-[0.25em] text-taupe">Taller</p>
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
    <div class="animate-fade-up flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold tracking-tight text-navy md:text-5xl">
            {tab === 'autos' ? 'Autos' : 'Piezas'}
          </h1>
          <p class="mt-3 max-w-xl text-taupe">
            {#if tab === 'autos'}
              {#if isAdmin}
                Alta y seguimiento de autos en reparacion. Cambia la situacion segun el avance.
              {:else}
                Consulta autos en taller y su situacion actual.
              {/if}
            {:else if isAdmin}
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
            {tab === 'autos' ? 'Agregar auto' : 'Agregar pieza'}
          </button>
        {/if}
      </div>

      <div class="flex gap-6 border-b border-navy/10 text-xs font-semibold uppercase tracking-[0.2em]">
        <button
          type="button"
          class="pb-3 transition {tab === 'autos'
            ? 'border-b-2 border-teal text-navy'
            : 'text-taupe hover:text-navy'}"
          onclick={() => switchTab('autos')}
        >
          Autos
        </button>
        <button
          type="button"
          class="pb-3 transition {tab === 'piezas'
            ? 'border-b-2 border-teal text-navy'
            : 'text-taupe hover:text-navy'}"
          onclick={() => switchTab('piezas')}
        >
          Piezas
        </button>
      </div>
    </div>

    {#if isAdmin && formOpen}
      <form
        class="mt-10 border border-navy/10 bg-cream/80 p-6 animate-fade-up-delay md:p-8"
        onsubmit={onSave}
      >
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="font-display text-2xl font-bold text-navy">
            {#if tab === 'autos'}
              {editingId ? 'Editar auto' : 'Nuevo auto'}
            {:else}
              {editingId ? 'Editar pieza' : 'Nueva pieza'}
            {/if}
          </h2>
          <button
            type="button"
            class="text-xs font-semibold uppercase tracking-[0.18em] text-taupe hover:text-navy"
            onclick={resetForm}
          >
            Cancelar
          </button>
        </div>

        {#if tab === 'autos'}
          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Marca
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                required
                bind:value={autoForm.marca}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Modelo
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                required
                bind:value={autoForm.modelo}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Año
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                type="number"
                min="1950"
                max="2100"
                bind:value={autoForm.anio}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Placa
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                bind:value={autoForm.placa}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Propietario
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                bind:value={autoForm.propietario}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Situacion
              <select
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                bind:value={autoForm.situacion}
              >
                {#each SITUACIONES as s}
                  <option value={s}>{s}</option>
                {/each}
              </select>
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 md:col-span-2">
              Notas
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                bind:value={autoForm.notas}
              />
            </label>
          </div>
        {:else}
          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              Nombre
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                required
                bind:value={piezaForm.nombre}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
              No. de parte / modelo
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                required
                bind:value={piezaForm.numero_parte}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 md:col-span-2">
              Descripcion
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                bind:value={piezaForm.descripcion}
              />
            </label>
            <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 md:col-span-2">
              Auto / compatibilidad
              <input
                class="mt-2 w-full border-0 border-b border-taupe/50 bg-transparent px-0 py-3 text-base outline-none focus:border-teal"
                required
                bind:value={piezaForm.auto}
                placeholder="Ej. Nissan Sentra 2018"
              />
            </label>
          </div>
        {/if}

        {#if formError}
          <p class="mt-4 text-sm text-teal" role="alert">{formError}</p>
        {/if}

        <button
          type="submit"
          disabled={saving}
          class="mt-8 bg-teal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition hover:bg-navy disabled:opacity-60"
        >
          {saving
            ? 'Guardando…'
            : editingId
              ? 'Guardar cambios'
              : tab === 'autos'
                ? 'Registrar auto'
                : 'Registrar pieza'}
        </button>
      </form>
    {/if}

    {#if loading}
      <p class="mt-12 text-sm text-taupe animate-fade-up-delay">Cargando…</p>
    {:else if error}
      <p class="mt-12 text-sm text-teal" role="alert">{error}</p>
    {:else if tab === 'autos'}
      <ul class="mt-12 divide-y divide-navy/10 border-y border-navy/10 animate-fade-up-delay">
        {#each autos as auto (auto.id)}
          <li class="grid gap-3 py-5 md:grid-cols-[1.3fr_0.7fr_1fr_auto] md:items-baseline md:gap-6">
            <div>
              <p class="font-display text-xl font-semibold text-navy">
                {auto.marca} {auto.modelo}
                {#if auto.anio}<span class="text-base font-medium text-taupe"> · {auto.anio}</span>{/if}
              </p>
              <p class="mt-1 text-sm text-taupe">
                {auto.propietario ? `Propietario: ${auto.propietario}` : 'Sin propietario'}
                {#if auto.placa} · Placa {auto.placa}{/if}
              </p>
              {#if auto.notas}
                <p class="mt-1 text-sm leading-relaxed text-navy/70">{auto.notas}</p>
              {/if}
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe">
                Situacion
              </p>
              <p class="mt-1 text-sm font-semibold {situacionClass(auto.situacion)}">
                {auto.situacion}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-taupe">
                Registro
              </p>
              <p class="mt-1 text-sm text-navy/80">
                {auto.created_at ? new Date(auto.created_at).toLocaleDateString('es-MX') : '—'}
              </p>
            </div>
            {#if isAdmin}
              <div class="md:justify-self-end">
                <button
                  type="button"
                  class="text-xs font-semibold uppercase tracking-[0.18em] text-navy underline-offset-4 hover:text-teal hover:underline"
                  onclick={() => openEditAuto(auto)}
                >
                  Editar
                </button>
              </div>
            {/if}
          </li>
        {:else}
          <li class="py-8 text-sm text-taupe">Aun no hay autos registrados.</li>
        {/each}
      </ul>
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
                  onclick={() => openEditPieza(pieza)}
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
