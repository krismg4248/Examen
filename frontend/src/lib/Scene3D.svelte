<script>
  import { onMount, onDestroy } from 'svelte'
  import * as THREE from 'three'

  let canvas
  let frameId = 0
  let renderer
  let cleanup = () => {}

  onMount(() => {
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0c2e3d, 0.045)

    const camera = new THREE.PerspectiveCamera(
      42,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0.35, 6.2)

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    renderer.setClearColor(0x000000, 0)

    const ambient = new THREE.AmbientLight(0xc0a088, 0.55)
    const key = new THREE.DirectionalLight(0xdac6b6, 1.1)
    key.position.set(4, 6, 5)
    const fill = new THREE.DirectionalLight(0x186784, 0.65)
    fill.position.set(-5, -2, 3)
    scene.add(ambient, key, fill)

    const group = new THREE.Group()
    scene.add(group)

    const metal = new THREE.MeshStandardMaterial({
      color: 0x186784,
      metalness: 0.72,
      roughness: 0.28,
    })
    const accent = new THREE.MeshStandardMaterial({
      color: 0x9a7c65,
      metalness: 0.45,
      roughness: 0.4,
    })
    const rim = new THREE.MeshStandardMaterial({
      color: 0xc0a088,
      metalness: 0.35,
      roughness: 0.55,
      transparent: true,
      opacity: 0.85,
    })

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.08, 24, 96),
      metal,
    )
    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.045, 16, 80),
      accent,
    )
    ringInner.rotation.x = Math.PI / 2.4

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.28, 32), rim)
    hub.rotation.x = Math.PI / 2

    const spokes = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.35, 0.08),
        metal,
      )
      spoke.position.y = 0.55
      const pivot = new THREE.Group()
      pivot.rotation.z = (i / 6) * Math.PI * 2
      pivot.add(spoke)
      spokes.add(pivot)
    }

    const floating = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.28, 0),
      accent,
    )
    floating.position.set(2.1, 1.1, -0.4)

    const floating2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      rim,
    )
    floating2.position.set(-2.2, -0.9, 0.6)

    group.add(ring, ringInner, hub, spokes, floating, floating2)

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 48 }, () => {
          return new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 4 - 1,
          )
        }),
      ),
      new THREE.PointsMaterial({
        color: 0xc0a088,
        size: 0.035,
        transparent: true,
        opacity: 0.55,
      }),
    )
    scene.add(particles)

    const onResize = () => {
      if (!canvas) return
      const { clientWidth: w, clientHeight: h } = canvas
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    const tick = () => {
      const t = clock.getElapsedTime()
      group.rotation.y = t * 0.22
      group.rotation.x = Math.sin(t * 0.35) * 0.12
      ringInner.rotation.z = t * 0.4
      floating.rotation.x = t * 0.7
      floating.rotation.y = t * 0.5
      floating2.rotation.z = -t * 0.6
      particles.rotation.y = t * 0.05
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(tick)
    }
    tick()

    cleanup = () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      metal.dispose()
      accent.dispose()
      rim.dispose()
    }
  })

  onDestroy(() => cleanup())
</script>

<canvas
  bind:this={canvas}
  class="absolute inset-0 h-full w-full"
  aria-hidden="true"
></canvas>
