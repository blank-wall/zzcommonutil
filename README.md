# zzcommonutil

1. 连接 adb，先打开设备的开发者模式，在打开 USB 调式
2. 在视图中使用：截图（ctrl+鼠标左键滑动），连点（ctrl+shift+鼠标左键快速点击），单点，缩放（ctrl+鼠标滚动）
3. 加载本地图片不需要连接 adb
4. 录制功能需要连接 adb
5. 本地图片转 base64 支持前缀或去掉前缀格式
6. 项目目录右键生成对应的脚本文件

## 调试

安装依赖

```
yarn install 或者 npm install
```

本地生成插件

```
yarn package
```

上传插件

```
yarn push
```

开启调试

按 F5 就会打开一个扩展开发宿主

## 开发

1. vscode 扩展的开发在 src 目录下，可参考 VS Code API 中文文档 和 VS Code 插件开发中文文档 进行开发。
2. src 文件下进行开发，index 只用来引入
