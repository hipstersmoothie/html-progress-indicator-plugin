# html-progress-indicator-plugin

A webpack plugin that display the build progress inside the app without having to open the console.
This plugin requires you to also use [`html-webpack-plugin`](https://www.npmjs.com/package/html-webpack-plugin).

![A toast displaying the re-build progress](https://github.com/hipstersmoothie/html-progress-indicator-plugin/blob/main/assets/CleanShot%202022-11-01%20at%2001.18.57%402x.png?raw=true)

## Installation

```sh
npm i --save-dev html-progress-indicator-plugin
# or
yarn add --dev html-progress-indicator-plugin
```

## Configuration

First add the plugin to your webpack config.

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  HtmlProgressIndicatorPlugin,
} = require('html-progress-indicator-plugin');

module.exports = {
  // Your webpack config
  plugins: [
    new HtmlWebpackPlugin(),
    // This plugin MUST come after your usage of `HtmlWebpackPlugin`
    new HtmlProgressIndicatorPlugin(),
  ],
};
```

Then add the placeholder for the progress indicator into the HTML loaded by `html-webpack-plugin`.

```html
<html>
  <body>
    <!-- The rest of your HTML template -->
    <!-- reload-indicator-placeholder -->
  </body>
</html>
```

That's it!
Now a tiny toast style message will appear in your app while webpack is rebuilding.

## Options

### `placeholder`

Customize the placeholder that goes in your HTML file.

```js
new HtmlProgressIndicatorPlugin({
  placeholder: '<!-- my-cool-placeholder -->',
});
```

### `template`

If you want to customize the look of the indicator use the `template` option.

#### As String

Define your custom template directly in your config (or use a templating library that produces HTML)

```js
const {
  MSG_ID,
  PROGRESS_ID,
  HtmlProgressIndicatorPlugin,
} = require('html-progress-indicator-plugin');

new HtmlProgressIndicatorPlugin({
  template: `
    <div class="fixed bottom-0 right-0 m-3 h-4 px-2 bg-white border border-grey-200 flex gap-1">
      <div class="text-grey-800 text-semibold" id="${PROGRESS_ID}"></div>
      <div class="text-grey-500" id="${MSG_ID}"></div>
    </div>
  `,
});
```

### As path

Or store your template in a different file

```js
new HtmlProgressIndicatorPlugin({
  template: './path/to/template.html',
});
```

The IDs in the following HTML will be replaced with the correct IDs.

```html
<div
  class="fixed bottom-0 right-0 m-3 h-4 px-2 bg-white border border-grey-200 flex gap-1"
>
  <div class="text-grey-800 text-semibold" id="{{PROGRESS_ID}}"></div>
  <div class="text-grey-500" id="{{MSG_ID}}"></div>
</div>
```
