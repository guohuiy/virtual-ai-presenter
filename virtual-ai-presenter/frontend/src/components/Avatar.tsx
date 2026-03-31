import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Props = { viseme: {phoneme:string, startMs:number, endMs:number} | null }

export default function Avatar({viseme}:Props){
  const mountRef = useRef<HTMLDivElement | null>(null)
  const mouthRef = useRef<THREE.Mesh | null>(null)

  useEffect(()=>{
    const width = mountRef.current?.clientWidth || window.innerWidth
    const height = mountRef.current?.clientHeight || window.innerHeight
    const renderer = new THREE.WebGLRenderer({antialias:true})
    renderer.setSize(width, height)
    mountRef.current?.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000)
    camera.position.set(0,1.6,3)

    const light = new THREE.DirectionalLight(0xffffff,1)
    light.position.set(5,10,7)
    scene.add(light)

    const headGeo = new THREE.SphereGeometry(0.6, 32, 32)
    const headMat = new THREE.MeshStandardMaterial({color: 0xffddcc})
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.set(0,1.6,0)
    scene.add(head)

    const mouthGeo = new THREE.BoxGeometry(0.4, 0.1, 0.05)
    const mouthMat = new THREE.MeshStandardMaterial({color: 0x333333})
    const mouth = new THREE.Mesh(mouthGeo, mouthMat)
    mouth.position.set(0,1.35,0.56)
    scene.add(mouth)
    mouthRef.current = mouth

    function onResize(){
      const w = mountRef.current?.clientWidth || window.innerWidth
      const h = mountRef.current?.clientHeight || window.innerHeight
      renderer.setSize(w,h)
      camera.aspect = w/h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    function animate(){
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return ()=>{
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      mountRef.current?.removeChild(renderer.domElement)
    }
  },[])

  useEffect(()=>{
    if(!viseme || !mouthRef.current) return
    // quick mapping: scale mouth.y for duration
    const dur = Math.max(50, viseme.endMs - viseme.startMs)
    mouthRef.current.scale.y = 4
    setTimeout(()=>{ if(mouthRef.current) mouthRef.current.scale.y = 1 }, dur)
  },[viseme])

  return (<div ref={mountRef} style={{width:'100%', height:'100%'}} />)
}
