# font-loader

Use your fonts in webpack-based projects!

## Usage

Add `font-loader` to the list of your webpack loaders.

```javascript
{
	modules: {
		loaders: [{
			test: /\.font\.json$/,
			loader: 'font?formats=ttf,woff,eot'
		}]
	}
}
```

Create a font manifest file which describes the variants in the font and includes paths to their TTF/OTF/WOFF/etc. files. Variant metadata matches what is found in CSS (e.g. `weight` and `style`).

```json5
{
	"name": "Proxima Nova",
	"files": [{
		"weight": 100,
		"file": "./files/Proxima Nova Thin.otf"
	}, {
		"weight": 300,
		"file": "./files/Proxima Nova Light.otf"
	}, {
		"weight": 400,
		"file": "./files/Proxima Nova Reg.otf"
	}, {
		"weight": 500,
		"file": "./files/Proxima Nova Sbold.otf"
	}, {
		"weight": 700,
		"file": "./files/Proxima Nova Bold.otf"
	}, {
		"weight": 900,
		"file": "./files/Proxima Nova Xbold.otf"
	}]
}

```

Create a `package.json` that points to your new font.

```json
{
	"name": "font-myfont",
	"main": "myfont.font.json"
}
```

Use your font in CSS.

```css
@import "font-myfont";
```

Control which variants are included.

```css
@import "font-myfont?weight=100,500,900&format=woff";
```

Use your font in JavaScript.

```javascript
var myfont = require('font-myfont');
console.log(myfont); // { name: "Proxima Nova", files: [...] }
```

## Configuration

Some stuff.
