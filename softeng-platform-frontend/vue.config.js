const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000, // 前端开发服务器端口设为3000，避免与后端8080冲突
    open: true, // 自动打开浏览器
    hot: true, // 启用热模块替换
    liveReload: true, // 启用实时重载
    historyApiFallback: true, // 修复 SPA 路由问题
    // 修复 chunk 加载错误
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    // 优化编译性能
    compress: true
  },
  configureWebpack: {
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        fs: false,
        child_process: false,
        crypto: false,
        net: false,
        tls: false
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ]
  },
  chainWebpack: config => {
    config.resolve.alias.set('process', 'process/browser')
  }
})
