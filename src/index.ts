// Copyright 2022 Descript, Inc

import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export const WRAPPER_ID = 'webpack-progress-indicator-wrapper';
export const MSG_ID = 'webpack-progress-indicator-message';
export const PROGRESS_ID = 'webpack-progress-indicator-percentage';

interface ReloadIndicatorPluginOptions {
  /** The placeholder in the HTML that will be replaced with the reload indicator */
  placeholder?: string;
  /** The template for the reload indicator. A path or HTML string */
  template?: string | 'nyan';
}

const defaultIndicator = path.join(
  __dirname,
  '../variants/indicator-template.html'
);
const nyanIndicator = path.join(
  __dirname,
  '../variants/nyan-indicator-template.html'
);

const defaultOptions: Required<ReloadIndicatorPluginOptions> = {
  placeholder: '<!-- reload-indicator-placeholder -->',
  template: defaultIndicator,
};

export class HtmlProgressIndicatorPlugin {
  name = 'ReloadIndicatorPlugin';
  options: Required<ReloadIndicatorPluginOptions>;
  indicatorTemplate: string;

  constructor(options: ReloadIndicatorPluginOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.indicatorTemplate =
      this.options.template === 'nyan'
        ? fs.readFileSync(nyanIndicator, 'utf8')
        : this.options.template === 'default'
        ? fs.readFileSync(defaultIndicator, 'utf8')
        : fs.existsSync(this.options.template)
        ? fs.readFileSync(this.options.template, 'utf8')
        : this.options.template || fs.readFileSync(defaultIndicator, 'utf8');
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(this.name, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        this.name,
        (data, cb) => {
          // Get configured socket URL
          const host =
            compilation.options.devServer?.client?.webSocketURL?.hostname ||
            'localhost';
          const port =
            compilation.options.devServer?.client?.webSocketURL?.port || 8080;

          data.html = data.html.replace(
            this.options.placeholder,
            /* html */
            `
              ${this.indicatorTemplate
                .replaceAll('{{PROGRESS_ID}}', PROGRESS_ID)
                .replaceAll('{{WRAPPER_ID}}', WRAPPER_ID)
                .replaceAll('{{MSG_ID}}', MSG_ID)} 

              <script>
                  // Open up a websocket connection to webpack-dev-server
                  let socket = new WebSocket('ws://${host}:${port}/ws');

                  socket.addEventListener('message', (message) => {
                      const event = JSON.parse(message.data);
                      const wrapper = document.getElementById('${WRAPPER_ID}');
                      const msg = document.getElementById('${MSG_ID}');
                      const progress = document.getElementById('${PROGRESS_ID}');

                      // We only care about the progress event
                      if (event.type === 'progress-update') {
                        msg.innerText = event.data.msg;
                        progress.innerText = event.data.percent + '%';
                        
                        if (event.data.percent === 100) {
                          wrapper.style.display = 'none';
                        } else {
                          wrapper.style.display = 'flex';
                        }
                      }
                  });
              </script>
            `
          );
          cb(null, data);
        }
      );
    });
  }
}
