const { resolve } = require('path')

module.exports = (options, context) => ({
  define () {
    const { position, audios, autoplay, mini } = options
    return {
      POSITION: position || {
        left: '10px',
        bottom: '10px',
        'z-index': '999999'
      },
      MINI: mini || false,
      AUDIOS: audios,
      AUTOPLAY: autoplay || true // 是否开启自动播放
    }
  },
  name: '@vuepress-reco/vuepress-plugin-bgm-player',
  enhanceAppFiles: resolve(__dirname, './bin/enhanceAppFile.js'),
  globalUIComponents: 'BgMusic'
})
