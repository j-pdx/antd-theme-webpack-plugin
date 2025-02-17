const { generateTheme } = require("antd-theme-generator");
const path = require("path");

class AntDesignThemePlugin {
  constructor(options) {
    const defaulOptions = {
      varFile: path.join(__dirname, "../../src/styles/variables.less"),
      mainLessFile: path.join(__dirname, "../../src/styles/index.less"),
      antDir: path.join(__dirname, "../../node_modules/antd"),
      stylesDir: path.join(__dirname, "../../src/styles/antd"),
      themeVariables: ["@primary-color"],
      indexFileName: "index.html",
      generateOnce: false,
      publicPath: ""
    };
    this.options = Object.assign(defaulOptions, options);
    this.generated = false;
  }

  apply(compiler) {
    const options = this.options;
    compiler.hooks.emit.tapAsync('AntDesignThemePlugin', (compilation, callback) => {
      const less = `
    <link rel="stylesheet/less" type="text/css" href="${options.publicPath}/color.less" />
    <script>
      window.less = {
        async: false,
        env: 'production',
        javascriptEnabled: true
      };
    </script>
        `;
      if (
        options.indexFileName &&
        options.indexFileName in compilation.assets
      ) {
        const index = compilation.assets[options.indexFileName];
        let content = index.source();

        if (!content.match(/\/color\.less/g)) {
          index.source = () =>
            content.replace(less, "").replace(/<body>/gi, `<body>${less}`);
          content = index.source();
          index.size = () => content.length;
        }
      }
      if (options.generateOnce && this.colors) {
        compilation.assets["color.less"] = {
          source: () => this.colors,
          size: () => this.colors.length
        };
        return callback();
      }
      generateTheme(options)
        .then(css => {
          if (options.generateOnce) {
            this.colors = css;
          }
          compilation.assets["color.less"] = {
            source: () => css,
            size: () => css.length
          };
          callback();
        })
        .catch(err => {
          callback(err);
        });
    });
  }
}

module.exports = AntDesignThemePlugin;
