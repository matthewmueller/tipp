
# tipp

  Tool tips that just work.

## Features

- No jQuery
- Easily Customizeable
- Performant
- Auto-repositioning
- Various orientations

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
