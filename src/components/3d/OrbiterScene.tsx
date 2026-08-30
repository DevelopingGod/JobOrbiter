'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Points, 
  PointMaterial, 
  Float, 
  TorusKnot, 
  Sphere,
  Environment
} from '@react-three/drei'
import * as THREE from 'three'

// High-Performance Orbiter Core using MeshPhysicalMaterial
function OrbiterCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  
  // Position it to the right on desktop, center on mobile
  const isMobile = viewport.width < 5
  const targetX = isMobile ? 0 : viewport.width / 4
  const targetY = isMobile ? viewport.height / 4 : 0
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5
      coreRef.current.rotation.y += 0.01
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      {/* Highly optimized TorusKnot geometry */}
      <TorusKnot ref={coreRef} args={[1.5, 0.4, 128, 32]} position={[targetX, targetY, -2]}>
        {/* Native WebGL PBR material (120 FPS capable) without heavy post-processing */}
        <meshPhysicalMaterial 
          color="#f97316"
          emissive="#c2410c"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.1}
          transmission={1}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </TorusKnot>
      
      {/* Internal glowing sphere to simulate energy core without Bloom */}
      <Sphere args={[0.7, 32, 32]} position={[targetX, targetY, -2]}>
        <meshBasicMaterial color="#ffedd5" />
      </Sphere>
      {/* Point light to cast dynamic lighting on the knot */}
      <pointLight position={[targetX, targetY, -2]} intensity={2} color="#f97316" distance={5} />
    </Float>
  )
}

// Particle field representing the "Job Market"
function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  
  // Track global mouse since canvas has pointer-events-none
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const [positions] = useMemo(() => {
    const count = 1500
    const pos = new Float32Array(count * 3) 
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return [pos]
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x -= 0.0005
    ref.current.rotation.y -= 0.0008

    const targetX = (mouseRef.current.x * state.viewport.width) / 10
    const targetY = (mouseRef.current.y * state.viewport.height) / 10
    
    ref.current.position.x += (targetX - ref.current.position.x) * 0.02
    ref.current.position.y += (targetY - ref.current.position.y) * 0.02
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={true}>
      <PointMaterial
        transparent
        color="#ea580c"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={1.0}
        blending={THREE.NormalBlending}
      />
    </Points>
  )
}

export function OrbiterScene() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        
        <OrbiterCore />
        <ParticleField />
        <Environment preset="city" />
        {/* Notice: EffectComposer is entirely removed for 120 FPS mobile-friendly performance */}
      </Canvas>
    </div>
  )
}
