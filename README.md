# Scene Language Support

Provides syntax highlighting for `.scene` files used in rendering testcases during the computer graphics course. Note that `.scene` is used simply as an alternative to `.txt` to avoid conflicts with other extensions.

## Features

- Highlights camera, light, material, and geometry descriptions.
- Supports basic format operations.

## Usage

It is recommended to add the following to your editor `settings.json` to enable file icon association in case the Material Icon Theme does not automatically recognize the `.scene` file extension:

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

```scene
PerspectiveCamera {
    center 0 0 25
    direction 0.02 0.02 -1
    up 0 1 0
    angle 30
}
```
