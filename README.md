# antiocr

> 本地优先的 Android 图片保护工作台。  
> A local-first image protection studio for Android.

`antiocr` 在设备本地对图片应用可配置的视觉变换管线，面向创意图片保护实验。所选图片不会被上传至服务器。  
`antiocr` applies a configurable pipeline of visual transformations on-device for creative image-protection experiments. Selected images are not uploaded to a server.

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=111827)
![License](https://img.shields.io/badge/license-Unspecified-lightgrey)

## 功能亮点 / Highlights

- **本地处理 / Local processing**：图片和算法参数均保留在设备中。  
  Images and algorithm parameters remain on the device.
- **可离线使用 / Offline-ready APK**：安装后的 APK 已包含 React Native JavaScript bundle，不需要 Metro。  
  The installed APK includes the React Native JavaScript bundle and does not need Metro.
- **可组合算法管线 / Composable pipeline**：可在应用内调整八种效果的参数与执行顺序。  
  Adjust parameters and execution order for eight effects in the app.
- **触摸友好工作区 / Touch-friendly workspace**：可拖动上下分隔条分配参数与预览区域，位置会在本机记忆。  
  Drag the separator to resize parameter and preview areas; the preference is saved locally.
- **导出到相册 / Android gallery export**：将结果 PNG 保存到 Android 系统媒体库。  
  Save the resulting PNG through Android's system media library.

## 算法管线 / Processing pipeline

| 效果 / Effect | 文件 / File |
| --- | --- |
| 剪切形变 / Shear warp | `shear_warp.js` |
| 曲线涟漪 / Curve ripple | `curve_ripple.js` |
| 水波纹 / Water ripple | `water_ripple.js` |
| 渐变碎裂 / Gradient shatter | `gradient_shatter.js` |
| 色度重排 / Chroma shuffling | `chroma_shuffling.js` |
| 文本干扰 / Text poison | `text_poison.js` |
| 物理线条 / Physical line | `physical_line.js` |
| 魔镜 / Magic mirror | `magic_mirror.js` |

> **说明 / Note**：这些效果属于实验性视觉变换，不能保证阻止 OCR、信息提取或其他自动化分析。  
> These effects are experimental visual transformations and do not guarantee prevention of OCR, extraction, or other automated analysis.

## 使用方式与隐私 / Usage and privacy

- 从设备导入 JPG、PNG 或 WebP。  
  Import JPG, PNG, or WebP from the device.
- 调整效果参数，并拖动算法卡片改变处理顺序。  
  Adjust effect parameters and drag cards to reorder the pipeline.
- 在嵌入式本地工作区预览处理结果。  
  Preview the transformed image in the embedded local workspace.
- 导出 PNG 到 Android 的 `Pictures/antiocr`。  
  Export PNG files to `Pictures/antiocr` on Android.

应用没有图片上传接口。Android Manifest 中保留网络权限是 React Native 开发环境的常见配置；图片处理流程本身完全在本地进行。  
The app has no image-upload endpoint. The Android Manifest keeps network permission as a common React Native development configuration; image processing itself is local.

## 快速开始 / Getting started

### 环境要求 / Requirements

- Node.js 22.11 或更高版本 / Node.js 22.11 or newer
- Android Studio、Android SDK，以及真机或模拟器 / Android Studio, Android SDK, and a device or emulator
- 与已安装 Android Gradle Plugin 对应的 JDK / The JDK required by your installed Android Gradle Plugin

### 安装依赖 / Install dependencies

```bash
git clone <your-repository-url>
cd AntiOcrStudio
npm install
```

### 开发运行 / Development build

在第一个终端启动 Metro（支持热更新）：  
Start Metro in one terminal for hot reload:

```bash
npm start
```

在第二个终端构建并启动应用：  
Build and launch the app in a second terminal:

```bash
npm run android
```

通过 USB 连接真机时，使设备可访问 Metro：  
For a USB-connected device, make Metro reachable with:

```bash
adb reverse tcp:8081 tcp:8081
```

## 构建离线 APK / Build an offline APK

Debug 与 Release 变体都会打包 React Native bundle，因此安装后可在不启动 Metro 的情况下运行。  
Both Debug and Release variants package the React Native bundle, so installed builds run without Metro.

```powershell
cd android
.\gradlew.bat :app:assembleDebug
```

Debug APK 输出路径 / Debug APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

使用 ADB 安装 / Install with ADB:

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

## 构建 Release / Release build

```powershell
cd android
.\gradlew.bat :app:assembleRelease
```

Release APK 输出路径 / Release APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### 签名与发布 / Signing and distribution

当前 Gradle 配置使用 debug keystore 对 Release 变体签名，适合内部测试。上架 Google Play 或正式分发前，请创建私有 upload keystore、不要提交到 Git，并将 `signingConfigs.release` 改为使用该证书；每次上传 Play 都必须增加 `versionCode`。  
The current Gradle configuration signs the Release variant with the debug keystore for internal testing. Before publishing to Google Play or distributing a production app, create a private upload keystore, keep it out of Git, configure `signingConfigs.release` to use it, and increment `versionCode` for every Play upload.

## 项目结构 / Project layout

```text
AntiOcrStudio/
├── App.tsx                                  # React Native 宿主与 WebView 桥接 / host and WebView bridge
├── android/app/src/main/assets/
│   ├── workspace/                            # 本地 HTML/CSS/JS 界面 / local UI
│   └── plugins/                              # 图像变换插件 / image-transformation plugins
├── android/app/src/main/java/com/antiocrstudio/
│   └── AntiOcrMediaModule.kt                 # Android PNG 保存桥接 / Android PNG-save bridge
└── android/app/src/main/res/mipmap-*/        # 启动器图标资源 / launcher icon assets
```

## 常用命令 / Useful commands

| 命令 / Command | 用途 / Purpose |
| --- | --- |
| `npm start` | 启动开发用 Metro / Start Metro for development |
| `npm run android` | 构建并启动开发版本 / Build and launch a development build |
| `npm run lint` | 执行 ESLint / Run ESLint |
| `npm test` | 执行 Jest 测试 / Run Jest tests |
| `cd android && .\gradlew.bat :app:assembleDebug` | 构建离线 Debug APK / Build an offline Debug APK |
| `cd android && .\gradlew.bat :app:assembleRelease` | 构建 Release APK / Build a Release APK |

## 贡献 / Contributing

欢迎提交 Issue 和 Pull Request。添加插件时，请将文件放到 `android/app/src/main/assets/plugins/`，在 `manifest.json` 中登记，并在真机算法管线中验证。  
Issues and pull requests are welcome. When adding a plugin, place it in `android/app/src/main/assets/plugins/`, register it in `manifest.json`, and verify it in the on-device pipeline.
