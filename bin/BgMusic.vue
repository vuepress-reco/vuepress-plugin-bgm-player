<template>
  <div class="reco-bgm-panel" :style="panelPosition">
    <div class="reco-bgm-box">
      <!-- 播放器 -->
      <audio id="bgm" :src="audio[curIndex].url" ref="bgm" @ended="bgmEnded" @canplay="playReady" @timeupdate="timeUpdate"></audio>
      <!-- 封面 -->
      <div class="reco-bgm-cover" @click="showBgmInfo" :style="`background-image:url(${audio[curIndex].cover}),url(${dcover})`">
        <!-- mini操作栏 -->
        <div v-show="isMini" class="mini-operation">
          <i v-show="this.curPlayStatus === 'playing' && isMini" @click.stop="pauseBgm" class="reco-bgm reco-bgm-pause"></i>
          <i v-show="this.curPlayStatus === 'paused' && isMini" @click.stop="playBgm" class="reco-bgm reco-bgm-play"></i>
        </div>
        <!-- 错误信息显示 -->
        <div v-show="isFault" class="falut-message">
          播放失败
        </div>
      </div>
      <!-- 歌曲信息栏 -->
      <div v-show="!isMini" class="reco-bgm-info">
        <!-- 歌曲名 -->
        <div class="info-box"><i class="reco-bgm reco-bgm-music music"></i>{{ audio[curIndex].name }}</div>
        <!-- 艺术家名 -->
        <div class="info-box"><i class="reco-bgm reco-bgm-artist"></i>{{ audio[curIndex].artist }}</div>
        <!-- 歌曲进度条 -->
        <div class="reco-bgm-progress">
          <div class="progress-bar" @click="progressJump">
            <div class="bar" ref="pbar"></div>
          </div>
        </div>
        <!-- 歌曲操作栏 -->
        <div class="reco-bgm-operation">
          <i class="reco-bgm reco-bgm-last last" @click="playLast"></i>
          <i v-show="curPlayStatus === 'playing'" @click="pauseBgm" class="reco-bgm reco-bgm-pause pause"></i>
          <i v-show="curPlayStatus === 'paused'" ref="play" @click="playBgm" class="reco-bgm reco-bgm-play play"></i>
          <i class="reco-bgm reco-bgm-next next" @click="playNext"></i>
          <i v-show="!isMute" @click="muteBgm" class="reco-bgm reco-bgm-volume volume"></i>
          <i v-show="isMute" @click="unMuteBgm" class="reco-bgm reco-bgm-mute mute"></i>
          <div class="volume-bar" @click="volumeJump">
            <div class="bar" ref="vbar"></div>
          </div>
        </div>
      </div>
      <!-- 缩放按钮 -->
      <div v-show="!isMini" @click="hideBgmInfo" class="reco-bgm-left-box">
        <i class="reco-bgm reco-bgm-left" ></i>
      </div>
    </div>
  </div>
</template>

<script>
let InterVal
// 歌曲封面的旋转角度
let rotateVal = 0
// 歌曲封面的旋转
function rotate () {
  InterVal = setInterval(function () {
    const cover = document.querySelector('.reco-bgm-cover')
    const btn = document.querySelector('.mini-operation')
    rotateVal += 1
    // 设置旋转属性(顺时针)
    cover.style.transform = 'rotate(' + rotateVal + 'deg)'
    // 设置旋转时的动画  匀速0.1s
    cover.style.transition = '0.1s linear'
    // 设置旋转属性(逆时针)
    btn.style.transform = 'rotate(-' + rotateVal + 'deg)'
    // 设置旋转时的动画  匀速0.1s
    btn.style.transition = '0.1s linear'
  }, 100)
}
import default_cover from './assets/d.png'
export default {
  data () {
    return {
      dcover: default_cover,
      panelPosition: POSITION,
      curIndex: 0,
      curPlayStatus: 'paused',
      audio: AUDIOS,
      autoplay: AUTOPLAY,
      isMini: MINI,
      firstLoad: true,
      isMute: false,
      isFault: false
    }
  },
  watch: {
    'curPlayStatus': function (newVal) {
      if (newVal === 'playing') {
        rotate()
      } else {
        clearInterval(InterVal)
      }
    }
  },
  methods: {
    // 隐藏Bgm信息
    hideBgmInfo () {
      this.isMini = true
    },
    // 显示Bgm信息
    showBgmInfo () {
      this.isMini = false
    },
    // audio canplay回调事件
    playReady () {
      // 第一次加载时初始化音量条并处理自动播放事件
      if (this.firstLoad) {
        const vbar_width = this.$refs.bgm.volume * 100 + '%'
        this.$refs.vbar.style.width = vbar_width
        this.firstLoad = false
        /* 自动播放的处理
        if (this.autoplay) {
          let playPromise = this.$refs.bgm.play()
          if (playPromise !== undefined) {
            playPromise.then(res => {
            }).catch(err => {
              console.log('自动播放失败')
            })
          }
        } */
      }
      if (this.curPlayStatus === 'playing') {
        this.playBgm()
      }
    },
    // 暂停
    pauseBgm () {
      this.$refs.bgm.pause()
      this.curPlayStatus = 'paused'
    },
    // 播放
    playBgm () {
      const playPromise = this.$refs.bgm.play()
      if (playPromise !== undefined) {
        playPromise.then(res => {
        // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          // 播放异常时显示播放失败并暂停播放
          this.isFault = true
          this.pauseBgm()
        })
      }
      // this.$refs.bgm.play()
      this.curPlayStatus = 'playing'
    },
    // 播放下一首
    playNext () {
      this.$refs.pbar.style.width = 0
      this.isFault = false
      if (this.curIndex >= this.audio.length - 1) {
        this.curIndex = 0
      } else {
        this.curIndex++
      }
    },
    // 播放上一首
    playLast () {
      this.$refs.pbar.style.width = 0
      this.isFault = false
      if (this.curIndex <= 0) {
        this.curIndex = this.audio.length - 1
      } else {
        this.curIndex--
      }
    },
    // bgm结束时自动下一首
    bgmEnded () {
      this.$refs.pbar.style.width = 0
      this.playNext()
    },
    // 更新歌曲进度条
    timeUpdate () {
      const total_time = this.$refs.bgm.duration
      const cur_time = this.$refs.bgm.currentTime
      const bar_width = cur_time / total_time * 100 + '%'
      this.$refs.pbar.style.width = bar_width
    },
    // 点击进度条跳播
    progressJump (e) {
      const total_time = this.$refs.bgm.duration
      const percent = e.offsetX / 150
      // 歌曲未加载完成时点击进度条的错误处理
      if (isNaN(total_time)) return
      this.$refs.bgm.currentTime = percent * total_time
    },
    // 点击音量条修改音量
    volumeJump (e) {
      const percent = e.offsetX / 57
      if (percent >= 0 && percent <= 1) {
        this.isMute = !(percent > 0)
        this.$refs.vbar.style.width = percent * 100 + '%'
        this.$refs.bgm.volume = percent
      }
    },
    // 静音
    muteBgm () {
      this.isMute = true
      this.$refs.vbar.style.width = 0
      this.$refs.bgm.volume = 0
    },
    // 取消静音
    unMuteBgm () {
      this.isMute = false
      this.$refs.vbar.style.width = '100%'
      this.$refs.bgm.volume = 1
    }
  }
}
</script>

<style lang="stylus" scoped>
@require './assets/iconfont/iconfont.css'
.reco-bgm-panel
  height 100px
  position fixed
  display flex
  .reco-bgm-box
    height 80px
    background-color rgba(255, 255, 255, 0.7)
    border-radius 50px
    padding 10px
    box-shadow 0 1px 6px 0 rgba(0,0,0,0.2)
    .reco-bgm-cover
      background-size contain
      float left
      height 80px
      width 80px
      border-radius 40px
      box-shadow 0 0 10px 1px #616161
      .mini-operation
        height 80px
        border-radius 40px
        width 80px
        display flex
        background-color rgba(158, 158, 158, 0.3)
        justify-content center
        align-items center
        i
          color #fff
          cursor pointer
          font-size 20px
      .falut-message
        height 80px
        border-radius 40px
        width 80px
        display flex
        background-color rgba(158, 158, 158, 0.3)
        justify-content center
        align-items center
        color #ffffff
    .reco-bgm-info
      float left
      height 80px
      padding 0 10px
      display flex
      flex-direction column
      justify-content center
      .info-box
        height 21px
        display flex
        align-items center
        i
          color $accentColor
          font-size 21px
        .music
          font-size 18px
      .reco-bgm-progress
        height 14px
        width 150px
        display flex
        align-items center
        .progress-bar
          height 5px
          width 150px
          background #757575
          border-radius 5px
          position relative
          cursor pointer
          .bar
            position absolute
            left 0
            top 0
            height 5px
            width 0
            background-color $accentColor
            border-radius 5px
      .reco-bgm-operation
        display flex
        justify-content flex-start
        align-items center
        height 24px
        i
          margin-right 5px
          color $accentColor
          cursor pointer
        .last
          font-size 14px
        .next
          font-size 14px
        .pause
          font-size 14px
        .play
          font-size 14px
        .volume
          font-size 18px
        .mute
          font-size 18px
        .volume-bar
          height 5px
          width 57px
          background #757575
          border-radius 5px
          position relative
          cursor pointer
          .bar
            position absolute
            left 0
            top 0
            height 5px
            width 0
            background-color $accentColor
            border-radius 5px
    .reco-bgm-left-box
      float left
      height 80px
      font-size 22px
      display flex
      flex-direction column
      justify-content center
      cursor pointer
      i
        color $accentColor
  .reco-bgm-right-box
    margin 37.5px 0 37.5px 4px
    width 25px
    height 25px
    display flex
    justify-content center
    align-items center
    cursor pointer
    background-color $accentColor
    border-radius 50%
    box-shadow 0 1px 6px 0 rgba(0,0,0,0.2)
    i
      font-size 15px
      color #ffffff
</style>
