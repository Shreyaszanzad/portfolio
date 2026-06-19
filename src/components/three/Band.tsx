/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'


// ── Band component ────────────────────────────────────────────────────────────
type BounceRef = { current: { trigger: () => void } | null }

export default function Band({
  maxSpeed = 50,
  minSpeed = 10,
  bounceRef,
}: {
  maxSpeed?: number
  minSpeed?: number
  bounceRef?: BounceRef
}) {
  const band  = useRef<any>(null)
  const fixed = useRef<any>(null)
  const j1    = useRef<any>(null)
  const j2    = useRef<any>(null)
  const j3    = useRef<any>(null)
  const card  = useRef<any>(null)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 2,
    linearDamping: 2,
  }

  const { nodes, materials } = useGLTF('/card.glb') as any
  const texture = useTexture('/tag_texture.png')
  const { width, height } = useThree((state) => state.size)

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  )

  const [dragged, drag] = useState<THREE.Vector3 | false>(false)
  const [hovered, hover] = useState(false)
  const pendingBounce = useRef(false)

  useEffect(() => {
    if (!bounceRef) return
    bounceRef.current = { trigger: () => { pendingBounce.current = true } }
    return () => { if (bounceRef) bounceRef.current = null }
  }, [bounceRef])

  useRopeJoint(fixed, j1, [[2, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1,    j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2,    j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => { document.body.style.cursor = 'auto' }
    }
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      })
    }
    if (pendingBounce.current && card.current) {
      card.current.applyImpulse({ x: 0, y: 0.6, z: 0 }, true)
      card.current.applyTorqueImpulse({ x: 0.012, y: 0, z: 0 }, true)
      ;[j1, j2, j3].forEach((ref) => ref.current?.wakeUp())
      pendingBounce.current = false
    }
    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        )
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        )
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  // eslint-disable-next-line react-hooks/immutability
  curve.curveType = 'chordal'
  // eslint-disable-next-line react-hooks/immutability
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      {/* Absolute world-space positions so the rope mesh (which reads physics
          translations directly) stays perfectly in sync with the card.
          j3 anchors at x=0 → card hangs centered under the camera. */}
      <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[-1.5, 4.6, 0]} />
      <RigidBody position={[-1, 4.6, 0]} ref={j1} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[-0.5, 4.6, 0]} ref={j2} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[0, 4.6, 0]} ref={j3} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
        <RigidBody
          position={[0.5, 4.6, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              ;(e.target as Element).releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={(e) => {
              ;(e.target as Element).setPointerCapture(e.pointerId)
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation())),
              )
            }}
          >
            {/* Card face — original GLB material preserved */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>

            {/* Metal clip + clamp keep their original material */}
            <mesh geometry={nodes.clip.geometry}  material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>

      {/* Lanyard rope — original tag_texture */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}
