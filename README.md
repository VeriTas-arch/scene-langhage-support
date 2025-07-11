# Scene Language Support

![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/ovolab-veritas.computer-graphics-testcases-highlighting)
![License](https://img.shields.io/github/license/VeriTas-arch/scene-language-support)

| [简体中文](#说明) | [English](#introduction) |
| :------------------------: | :--------------------: |

## 说明

为计算机图形学课程中的渲染测试用例提供 `.scene` 文件的语法高亮。注意，`.scene` 只是作为 `.txt` 的替代扩展名，以避免与其他扩展冲突。

### 功能

- 高亮显示相机、光源、材质和几何体等关键字。
- 支持基础的格式化操作。
- 自动修正场景中物体、光源和材质的数量。
- 悬停在 `MaterialIndex` 上会显示材质名称。
- 按住 Ctrl 点击 `MaterialIndex` 可跳转到材质定义。
- 支持在 `.scene` 文件中通过 GUI 编辑颜色，点击颜色值可打开取色器。
- 额外小功能：在文件资源管理器中为 `.scene` 文件提供预览图标（真的吗？）。

### 用法

只需安装此插件并打开 `.scene` 文件即可。倘若 Material Icon Theme 未自动识别 `.scene` 扩展名并启用文件图标关联，则建议在编辑器的 `settings.json` 中添加如下内容（本插件将 `.scene` 文件的图标与 Material Icon Theme 中提供的 `3d` 图标进行了绑定）：

```json
{
  "material-icon-theme.files.associations": {
    "*.scene": "3d"
  }
}
```

### 文件扩展名

`.scene`

### 示例

![showcase](https://raw.githubusercontent.com/VeriTas-arch/scene-language-support/main/media/showcase.gif)

--------------------------------------------
--------------------------------------------

## Introduction

Provides syntax highlighting for `.scene` files used in rendering testcases during the computer graphics course. Note that `.scene` is used simply as an alternative to `.txt` to avoid conflicts with other extensions.

## Features

- Highlights camera, light, material, and geometry descriptions.
- Supports basic format operations.
- Auto fix for number of objects, lights, and materials in the scene.
- Hovering over `MaterialIndex` shows the material name.
- Ctrl + clicking on `MaterialIndex` jumps to the material definition.
- Supports GUI editing for colors in `.scene` files, allowing you to click on color values to open a color picker.
- As a small bonus, a preview icon is provided for `.scene` files in the file explorer (or is it?).

## Usage

Simply instal this plugin and open `.scene` files. It is also recommended to add the following to your editor `settings.json` to enable file icon association in case the Material Icon Theme does not automatically recognize the `.scene` file extension:

```json
{
  "material-icon-theme.files.associations": {
    "*.scene": "3d"
  }
}
```

## File extension

`.scene`

## Example

![showcase](https://raw.githubusercontent.com/VeriTas-arch/scene-language-support/main/media/showcase.gif)
