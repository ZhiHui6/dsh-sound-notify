# Sound notifications

[![CI](https://github.com/ZhiHui6/dsh-sound-notify/actions/workflows/ci.yml/badge.svg)](https://github.com/ZhiHui6/dsh-sound-notify/actions/workflows/ci.yml)

A DeepSeek Harness plugin that plays a sound when a task finishes, fails, or reports an error.

## Installation

This is a Harness bundle, so it installs into your Harness profile rather than into a normal project. It needs Harness 0.2.0 or newer.

Ask the agent in DeepSeek Harness to install it from this repository:

> Install the bundle at https://github.com/ZhiHui6/dsh-sound-notify

Or clone it and point the installer at the directory:

```bash
git clone https://github.com/ZhiHui6/dsh-sound-notify.git
```

then have the agent run `plugin_manager` with `action: install_bundle` and that directory as the target.

The install writes a link into your profile, so the plugin survives a restart and applies to every session in that profile.

## Features

- Three independent events: **task completed**, **task failed**, **error prompt**.
- Nine built-in tones synthesised with the Web Audio API, so nothing is downloaded: Chime, Marimba, Soft pad, Beep, Ding, Deep tone, Rising, Falling, Alarm.
- Custom sounds: add any audio file from this computer (up to 1.5 MB each, stored in the browser). Custom sounds join every event menu.
- Preview any sound instantly from the settings page, or play a test sound.
- Volume control, master on/off switch, and an option to include or exclude sub-agent sessions.
- Settings live in the browser's local storage, so they follow this browser profile.

## Where to configure

Open **Settings → Sound notifications**. The section sits after the built-in sections and before the plugin market.

## How events are detected

The client watches the session list that the Harness already publishes. A session that stops running after having run is treated as finished; if the session reports an agent error, it counts as failed instead. Standalone agent errors that arrive while a session is idle trigger the error prompt sound directly.

Sounds are debounced, so a burst of sessions finishing at once produces a single chime rather than a chorus.

## Notes

- Audio needs one interaction with the page before the browser lets it play. The first click or key press in the window unlocks playback.
- Custom sounds are stored as data URLs, which is why each file is capped at 1.5 MB. If the browser storage fills up, remove a custom sound and try again.

## Development

`node verify.mjs` loads the real client half against stubbed browser APIs and checks the three sound triggers, the debounce rules, custom sound playback, and the settings page render. No dependencies to install.

---

# 声音提示

当任务完成、任务失败或出现错误提示时播放提示音的 DeepSeek Harness 插件。

## 安装

这是一个 Harness bundle，安装进 Harness 配置档案，而不是装进某个普通项目。需要 Harness 0.2.0 或更高版本。

直接让 DeepSeek Harness 里的 Agent 从本仓库安装：

> 安装 https://github.com/ZhiHui6/dsh-sound-notify 这个 bundle

或者先克隆到本地，再让安装器指向该目录：

```bash
git clone https://github.com/ZhiHui6/dsh-sound-notify.git
```

然后让 Agent 调用 `plugin_manager`，`action: install_bundle`，`target` 填该目录。

安装会在配置档案里写入链接，因此重启后依然生效，并对该档案下的所有会话可用。

## 功能

- 三个独立事件：**任务完成**、**任务失败**、**错误提示**。
- 九种内置音效，由 Web Audio API 实时合成，不下载任何音频文件：清脆铃声、马林巴、柔和铺底、短促蜂鸣、叮咚、低沉音、上扬、下落、警报。
- 自定义音效：可添加本机任意音频文件，单个上限 1.5 MB，保存在浏览器中；添加后会出现在每个事件的下拉菜单里。
- 在设置页可即时预览任意音效，也可一键播放测试音。
- 提供音量调节、总开关，以及是否包含子代理会话的选项。
- 配置保存在浏览器本地存储中，跟随当前浏览器配置。

## 配置入口

打开 **设置 → 声音提示**。该分节位于内置设置项之后、插件市场之前。

## 事件判定方式

客户端监听 Harness 已经发布的会话列表。一个曾经在运行、随后停止运行的会话被视为已完成；如果该会话报告了代理错误，则计为失败。会话空闲时单独到达的代理错误会直接触发错误提示音。

提示音做了防抖处理，因此一批会话同时结束只会响一声，而不是响成一片。

## 说明

- 浏览器要求页面先有一次交互才允许播放音频。在窗口内第一次点击或按键即可解锁播放。
- 自定义音效以 data URL 形式保存，因此单个文件限制为 1.5 MB。如果浏览器存储写满，请删除一个自定义音效后重试。

## 开发与验证

`node verify.mjs` 会在桩件化的浏览器环境下加载真实的客户端逻辑，校验三种触发音、防抖规则、自定义音效播放以及设置页渲染。无需安装任何依赖。
