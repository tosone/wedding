# 婚礼邀请 · 静态版

把原邀请页的**第一页**单独取出来，重新写成一个干净的静态页面：

- 去掉手机外框、顶部「婚贝请柬」标题、「我要制作」按钮、右侧二维码、上一页/下一页
- 去掉第二页（平台推广页）
- 去掉底部固定的「祝福留言 / 礼物 / 点赞」工具条和页面末尾的礼物模块
- 去掉姓名 / 出席人数 / 「提交」回执表单，以及所有提交、评论、送礼物的逻辑
- 去掉地图图片及其导航按钮
- 保留邀请函本身：封面、照片、文字、日历、倒计时、婚礼信息
- 页面上方的书法标题（「好久不见 / 婚礼见」「婚礼信息 /」「我们 / 婚礼见」「她 / 他 / 我们」）保留原来的 Bifeng 手写体；其余文字（包括中文）统一使用 Maple Mono CN
- 自动滚动目前暂停；滚轮 / 触摸 / 键盘仍可手动滚动，触摸带惯性，没有锚点吸附。打开 `js/main.js` 的 `AUTO_SCROLL_ENABLED` 即可恢复自动缓慢向下滚动

## 打开方式

直接双击 `index.html` 即可（字体已内嵌，图片 / 音乐都在本地，`file://` 也能正常显示）。

如果想用本地服务器：

```bash
cd wedding
python3 -m http.server 8000
# 打开 http://127.0.0.1:8000/
```

## 交互说明

- **自动滚动**：目前是暂停状态（`AUTO_SCROLL_ENABLED = false`）。想恢复时把 `js/main.js` 里的这个值改成 `true`；恢复后约 2.4 秒开始，以设计稿 40px/秒 缓慢向下滚动。
- **鼠标滚轮**：向下/向上滚动一段距离，停顿约 1.1 秒后自动继续缓慢向下。
- **触摸**：手指拖动即可，松手后会保留滑动惯性；惯性结束后自动继续缓慢向下。
- **键盘**：方向键 / PageUp / PageDown / 空格 / Home / End。
- 如果系统开启了「减少动态效果」（`prefers-reduced-motion`），自动滚动会关闭，但仍可手动滚动。

## 尺寸与适配

- 设计稿宽 `390px`。
- 手机竖屏：宽度铺满屏幕，高度也铺满；取景高度按设备比例自动补足（文字大小仍随宽度等比缩放）。
- 桌面 / 平板：高度占满浏览器，宽度按比例放大（在 1440 × 900 的屏幕上约为 501 × 900）。
- 两侧留白使用页面同色背景，不再有手机形状的框。

## 想修改内容

- **文案 / 姓名 / 日期 / 地址**：直接改 `index.html`。
- **倒计时目标时间**：`js/main.js` 里的
  `new Date("2026-11-28T00:00:00+08:00")`。目前倒计时只显示天和时。
- **日历**：`js/main.js` 的 `new Date(2026, 10, 1)` 和 `day === 28` 控制月份与高亮日期。
- **字体**：正文 / 中文使用 Maple Mono CN；书法标题使用 `--calligraphy`。
  如果想连书法标题也换成 Maple，把 `css/style.css` 里的 `--calligraphy` 改成 `var(--maple)` 即可。
- **背景音乐**：`assets/audio/theme-kuwo.mp3`（G.E.M. 邓紫棋《唯一》，约 4MB）。
- **自动滚动**：`js/main.js` 顶部的 `AUTO_SCROLL_ENABLED` 控制开关，`AUTO_SPEED` 控制速度（设计稿像素/秒）。
- **桌面取景高度**：`fitStage()` 里的 `700`。数值越小，桌面端画面越大；手机端按屏幕宽度自适应，不做固定高度。


## 图片压缩与素材目录

原始照片 / 视频已经移到项目外的 `../new/`（与 `wedding` 平级），不再放进仓库。项目内只保留页面实际使用的压缩资源。

页面第一张图（封面）目前是：

- 原图：`../new/mmexport1789901322366.jpeg`（4329 × 6493，约 12MB）
- 压缩后：`assets/images/hero-new2.webp`（2600 × 3900，约 524KB）


第二张图（封面下方带渐隐的那张）目前是：

- 原图：`../new/mmexport1789901345783.jpeg`（4329 × 6493，约 14MB）
- 压缩后：`assets/images/close-new.webp`（1600 × 2400，约 231KB）

「爱是万物」那一块的图目前是：

- 原图：`../new/mmexport1789901372781.jpeg`（4000 × 6000，约 14MB）
- 压缩后：`assets/images/love-all-new.webp`（1600 × 2400，约 244KB）

BRIDE / GROOM 两张卡片图目前是：

- BRIDE：`../new/mmexport1789901331007.jpeg`（4331 × 6497，约 12MB）→ `assets/images/bride-card-new.webp`（1000 × 1501，约 84KB）
- GROOM：`../new/微信图片_20261021222128_1188_9.jpg`（4376 × 6563，约 13MB）→ `assets/images/groom-card-new.webp`（1000 × 1500，约 100KB）

「信笺」中间的图目前是：

- 原图：`../new/mmexport1789901361067.jpeg`（4000 × 6000，约 13MB）
- 压缩后：`assets/images/letter-couple-new.webp`（1600 × 2400，约 214KB）

「全幅合影」目前是：

- 原图：`../new/mmexport1789901378565.jpeg`（4000 × 6000，约 14MB）
- 压缩后：`assets/images/wide-couple-new.webp`（1600 × 2400，约 249KB）

「婚期」日历的背景图目前是：

- 原图：`../new/mmexport1789903361159.jpeg`（6720 × 4480，约 17MB）
- 压缩后：`assets/images/calendar-bg-new.webp`（1600 × 1067，约 73KB，页面中透明度 0.2）

使用的是 **cwebp**（WebP 编码器）：照片类图片用 WebP 比 JPEG 更省体积，画质也更好。当前各图压缩后约 70KB–524KB。以后要压缩新图，可以直接用：

```bash
./tools/compress-image.sh ../new/某张图.jpeg assets/images/xxx.webp
```

默认宽度 4000、质量 95；想更接近 1MB，可以把宽度调大（例如 6000），但手机解码内存也会更大。

> `../new/` 在项目外，不会被提交；仓库里只有压缩后的资源。


## 婚礼视频（页面最下方）

页面最下方上下排列两段视频：

- `assets/videos/bride.mp4`（新娘，约 6.1MB）
- `assets/videos/groom.mp4`（新郎，约 3.8MB）
- 对应封面图：
  - 新娘：`../new/mmexport1789903369811.jpeg` → `assets/videos/bride-cover.webp`（约 319KB）
  - 新郎：`../new/mmexport1789903375986.jpeg` → `assets/videos/groom-cover.webp`（约 302KB）

原视频是 HEVC 编码，为了在 Chrome / Safari / 微信里都能播放，已转成 H.264（720×1280、AAC 音频、`faststart`），原文件在项目外的 `../new/`。

交互：

- 默认隐藏浏览器原生播放控件
- 未播放时，视频上方覆盖对应的 cover 图和一个圆形播放按钮；开始播放后 cover 立刻隐藏
- 底部有一条简单的进度条，可点击跳转
- 点击播放中的视频会暂停
- 播放其中一个视频时，另一个会自动暂停，背景音乐也会暂停

如果要换视频，把新视频转成 H.264 后放到 `assets/videos/`，并更新 `index.html` 里的 `src` / `poster` 即可。

## 文件结构

```
index.html            页面结构
css/style.css         手写样式
css/fonts.css         Maple Mono CN 子集 + Bifeng 书法（base64 内嵌，离线可用）
js/main.js            滚动引擎、倒计时、日历、音乐
assets/images/        页面实际使用的照片（压缩后的 WebP）
tools/                图片压缩脚本
assets/fonts/         Maple Mono CN 全字库（回退）与 OFL 许可；Bifeng / Maple 子集已内嵌在 css/fonts.css
assets/audio/         背景音乐 theme-kuwo.mp3
assets/videos/        页面最下方的两段婚礼视频与封面
```


## Git / LFS

图片、视频、音频、字体已通过 Git LFS 管理，规则见 `.gitattributes`。查看当前 LFS 文件：

```bash
git lfs ls-files
```

原始素材放在项目外的 `../new/`，不会进入仓库。

## 说明

- 图片、音乐、Bifeng 书法字体沿用原页面；HTML / CSS / JS 已重新编写。
- Maple Mono CN 使用 OFL 许可，许可文件见 `assets/fonts/OFL.txt`。页面默认加载按当前文案裁剪的子集；如果改成子集之外的汉字，会自动回退到同目录下的完整 Maple Mono CN 字体。
- 页面里的「婚贝大酒店 A 栋 9F 幸福宴会厅」是原模板的占位地址，请替换成真实场地。
- 页面只做展示，不包含任何评论、提交或送礼物的接口逻辑。
