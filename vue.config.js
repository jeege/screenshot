const npmPackage = require("./package.json");
module.exports = {
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "截图工具";
      return args;
    });
  },
  pluginOptions: {
    electronBuilder: {
      // List native deps here if they don't work
      externals: [...Object.keys(npmPackage.dependencies)],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      // nodeModulesPath: ["../../node_modules", "./node_modules"],
      builderOptions: {
        productName: "截图工具",
        appId: "com.fanli.shottool",
        copyright: "xxxx",
        directories: {
          output: "dist"
        },
        nsis: {
          oneClick: false,
          allowElevation: true,
          guid: "11111111",
          allowToChangeInstallationDirectory: true,
          installerIcon: "build/icons/win/icon.ico",
          uninstallerIcon: "build/icons/win/icon.ico",
          installerHeaderIcon: "build/icons/win/icon.ico",
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "截图工具",
          include: "build/installer.nsh"
        },
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications"
            },
            {
              x: 130,
              y: 150,
              type: "file"
            }
          ]
        },
        mac: {
          icon: "build/icons/mac/icon.icns"
        },
        win: {
          icon: "build/icons/win/icon.ico",
          target: [
            {
              target: "nsis",
              arch: ["ia32"]
            }
          ]
        },
        linux: {
          icon: "build/icons/png"
        },
        compression: "normal"
      }
    }
  }
};
