
# tipp

  Tool tips that just work.

## Features

- No jQuery
- No CSS to include
- Infinitely Customizeable
- Performant
- Auto-repositioning
- Orientations (top left, bottom, right)

## Installation

    npm install tipp

## Usage

1. Using HTML attributes:

Markup:

```html
<button tooltip="YOLO!" tooltip-orientation="top" tooltip-class="simple">Buy Now</button>
```

Initialize:

```js
tipp()
```

2. Using the API

Initialize:

```js
tipp(button, 'YOLO!', {
  orientation: 'top',
  class: 'simple'
})
```

## License

MIT
