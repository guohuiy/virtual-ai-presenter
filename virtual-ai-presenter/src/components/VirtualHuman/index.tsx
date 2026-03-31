import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { Group, AnimationClip } from 'three'
import { useAppStore } from '@/store'

interface VirtualHumanProps {
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const VirtualHumanModel: React.FC<VirtualHumanProps> = ({
  scale = 1,
  position = [0, -1, 0],
  rotation = [0, 0, 0],
}) => {
  const group = useRef<Group>(null)
  const { isSpeaking } = useAppStore()
  
  // Load the 3D model
  const { scene, animations } = useGLTF('/models/virtual-human.glb')
  const { actions, mixer } = useAnimations(animations as AnimationClip[], group)
  
  // Animation control
  useEffect(() => {
    if (actions.idle) {
      actions.idle.play()
    }
    
    return () => {
      actions.idle?.stop()
      actions.talking?.stop()
    }
  }, [actions])
  
  // Handle speaking animation
  useEffect(() => {
    if (isSpeaking) {
      actions.idle?.stop()
      if (actions.talking) {
        actions.talking.play()
        actions.talking.timeScale = 1.5 // Speed up for talking
      }
    } else {
      actions.talking?.stop()
      actions.idle?.play()
    }
  }, [isSpeaking, actions])
  
  // Mouth animation based on speaking
  useFrame((state) => {
    if (isSpeaking && group.current) {
      // Simple mouth animation based on time
      const mouthOpenAmount = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 0.1
      
      // In a real implementation, you would animate the mouth morph target here
      // For now, we'll just rotate the head slightly
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  
  return (
    <group ref={group} scale={scale} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  )
}

// Fallback component if model fails to load
const FallbackModel: React.FC<VirtualHumanProps> = ({ scale = 1, position = [0, -1, 0] }) => {
  const meshRef = useRef<any>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  
  return (
    <group scale={scale} position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1, 0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  )
}

const VirtualHumanScene: React.FC = () => {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)
  
  useEffect(() => {
    // Try to load the model
    const loadModel = async () => {
      try {
        // In a real app, you would load the actual GLTF model
        // For now, we'll simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000))
        setModelLoaded(true)
      } catch (error) {
        console.error('Failed to load 3D model:', error)
        setModelError(true)
      }
    }
    
    loadModel()
  }, [])
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        {modelLoaded && !modelError ? (
          <VirtualHumanModel />
        ) : (
          <FallbackModel />
        )}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={10}
        />
        
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
      </Canvas>
      
      {/* Loading overlay */}
      {!modelLoaded && !modelError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">正在加载3D虚拟人模型...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {modelError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center p-6 bg-gray-800/90 rounded-xl max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">模型加载失败</h3>
            <p className="text-gray-400 mb-4">
              无法加载3D虚拟人模型。正在使用备用模型。
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              重试
            </button>
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${modelLoaded && !modelError ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
        <span className="text-sm text-gray-300">
          {modelLoaded && !modelError ? '模型已加载' : '加载中...'}
        </span>
      </div>
    </div>
  )
}

export default VirtualHumanScene