# 咪咪便签

一个常驻桌面的可编辑小便签。30 秒没有点击、输入或滚动后，窗口会自动淡成半透明；再次点击即可恢复。

## 从 GitHub 下载

前往 [Releases](https://github.com/waxeia/codex-cloud-environment/releases/latest) 下载最新安装包。

## Ubuntu 安装（x86_64）

推荐双击 `.deb` 文件使用“应用中心”安装，或在终端执行：

```bash
sudo apt install ./Mimi-Note-1.0.0.deb
```

安装后可从应用列表搜索“咪咪便签”。

## 直接使用（Linux x86_64）

下载后可直接双击 `Mimi-Note-1.0.0.AppImage`，或在终端执行：

```bash
./start.sh
```

如果桌面环境不允许双击启动，先执行 `chmod +x Mimi-Note-1.0.0.AppImage start.sh`。

## 功能

- 无边框透明窗口，可拖动、缩放
- 默认始终置顶，可随时切换
- 标题和正文自动保存
- 自动记住窗口位置与大小
- 30 秒无交互后透明化
- 托盘常驻，隐藏后可从托盘唤回

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm start
```

## 打包

```bash
npm run dist
```

安装包会生成到 `dist/` 目录。请在目标系统上执行打包命令，例如 Windows 安装包建议在 Windows 上生成。
