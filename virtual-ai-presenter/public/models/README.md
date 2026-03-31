# 3D模型目录

此目录用于存放3D虚拟人模型文件。

## 模型要求
- 格式: GLTF 或 GLB
- 建议尺寸: 优化后的文件大小
- 动画: 支持 idle, talking, gesturing 等动画

## 默认模型
项目使用 `/models/virtual-human.glb` 作为默认模型路径。

## 获取模型
1. 可以从以下网站获取免费3D人物模型:
   - Sketchfab (https://sketchfab.com)
   - Mixamo (https://www.mixamo.com)
   - TurboSquid (https://www.turbosquid.com)

2. 确保模型有适当的许可证

## 备用方案
如果无法获取3D模型，应用将显示一个简单的几何体作为备用显示。

## 模型优化建议
1. 减少多边形数量
2. 压缩纹理
3. 合并材质
4. 优化动画骨骼

## 测试模型
可以使用简单的立方体模型进行功能测试：
```javascript
// 在代码中使用简单的几何体作为测试
const geometry = new THREE.BoxGeometry(1, 2, 0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x4f46e5 });
const mesh = new THREE.Mesh(geometry, material);