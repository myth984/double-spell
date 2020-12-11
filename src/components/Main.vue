<template>
  <div>
    <a-row>
      <a-col :sm="{ span: '24' }" :lg="{ offset: '4', span: '16' }">
        <div>
          <div style="font-size: 18px">
            <span v-for="(text, index) of word" :key="index">
              <span :style="aimTextStyle" v-if="index == wordIndex">
                {{ text }}
              </span>
              <span v-else>
                {{ text }}
              </span>
            </span>
          </div>
          <div style="text-align: end">
            <div>出自：{{ wordFrom }}</div>
            <div>作者：{{ wordCreator }}</div>
          </div>
        </div>
        <div style="text-align: center">
          <div>
            <span :style="aimTextStyle">{{ aimText }}</span>
            {{ aimPinyin }}
          </div>
          <div>
            <a-input
              ref="input"
              style="width: 20vh"
              placeholder="输入对应的拼音按键"
              @pressEnter="commit"
              v-model="inputValue"
              @change="inputChange"
            />
          </div>
        </div>
        <vue-keyboard ref="keyBoard" :width="keyBoardWidth"></vue-keyboard>
        <div style="font-size: 14px">
          <div>单字母韵母，零声母 + 韵母所在键，如： 啊＝aa 哦=oo 额=ee</div>
          <div>
            双字母韵母，零声母 + 韵母末字母（表现形式同全拼），如： 爱＝ai 恩=en
            欧=ou 三字母韵母，零声母 + 韵母所在键，如： 昂＝ah
          </div>
          <div>三字母韵母，零声母 + 韵母所在键，如： 昂＝ah</div>
        </div>
        <a-divider  />
        <div style="text-align: center">
          <a href="https://cn.vuejs.org/" target="_blank"> vue </a>
          <a-divider type="vertical" />
          <a href="https://antdv.com/docs/vue/introduce-cn/" target="_blank">
            antd
          </a>
          <a-divider type="vertical" />
          <a href="https://hitokoto.cn/" target="_blank"> hitokoto </a>
          <a-divider type="vertical" />
          <a href="https://github.com/AJLoveChina/vue-keyboard" target="_blank">
            keyboard
          </a>
          <div>
            <a-tooltip>
              <template slot="title"> 只是做了一点微小的工作 </template>
              <a href="http://myth.icu" target="_blank">@myth</a></a-tooltip
            >
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
const pinyinUtil = require("pinyin");
import pinyinMap from "@/assets/pinyin.json";
// style="display:grid;grid-template-rows: auto 1fr;"
export default {
  data() {
    return {
      word: "加载中",
      wordFrom: "...",
      wordCreator: "...",
      wordIndex: 0,
      aimTextStyle: {
        "font-size": "22px",
        color: "#4f8c65",
      },
      inputValue: "",
      keyBoardWidth: 600,
      handKey: "",
    };
  },
  computed: {
    aimText() {
      return this.word[this.wordIndex];
    },
    aimPinyin() {
      return pinyinUtil(this.aimText, {
        heteronym: true,
        style: pinyinUtil.STYLE_NORMAL,
      })[0];
    },
  },
  methods: {
    getWord() {
      this.$axios.get("https://v1.hitokoto.cn/").then((res) => {
        this.word = res.data.hitokoto;
        this.wordFrom = res.data.from;
        this.wordCreator = res.data.creator;
        this.wordIndex = 0;
        if (!this.isChinese(this.word[0])) {
          this.commit();
        }
        this.initHand();
      });
    },
    commit() {
      if (this.wordIndex < this.word.length - 1) {
        this.wordIndex = this.wordIndex + 1;
        // 如果不是中文则跳过
        if (!this.isChinese(this.word[this.wordIndex])) {
          this.commit();
        }
      } else {
        this.getWord();
      }
    },
    isChinese(str) {
      return /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/.test(
        str
      );
    },
    inputChange() {
      if (this.inputValue.length == 2) {
        // 验证通过则提交
        if (this.verify()) {
          this.commit();
          this.aimTextStyle.color = "#4f8c65";
        } else {
          this.aimTextStyle.color = "#fa5936";
        }
        this.inputValue = "";
        this.showSmHand();
      } else if (this.inputValue.length == 1) {
        this.showYmHand();
      }
    },
    verify() {
      let smFlag = this.verifySm();
      let ymFlag = this.verifyYm();
      return smFlag && ymFlag;
    },
    verifySm() {
      // 检查声母
      const sm = this.inputValue[0];
      let smFlag = false;
      outer: for (const item of pinyinMap[sm]) {
        for (const pinyin of this.aimPinyin) {
          if (pinyin.startsWith(item)) {
            // 匹配成功
            smFlag = true;
            break outer;
          }
        }
      }
      return smFlag;
    },
    verifyYm() {
      // 检查韵母
      const ym = this.inputValue[1];
      let ymFlag = false;
      outer: for (const item of pinyinMap[ym]) {
        for (const pinyin of this.aimPinyin) {
          if (pinyin.endsWith(item)) {
            // 匹配成功
            ymFlag = true;
            break outer;
          }
        }
      }
      return ymFlag;
    },
    // 展示声母的手
    showSmHand() {
      // 隐藏当前手
      this.$refs.keyBoard.hideHand(this.handKey);
      const keys = Object.keys(pinyinMap);
      for (let key of keys) {
        // 获得数组
        let valueArr = pinyinMap[key];
        // 如果第一个字的拼音以该value开头 数组第0位 为声母
        let value = valueArr[0];
        // 声母匹配上则显示手
        if (this.aimPinyin[0].startsWith(value)) {
          this.handKey = key;
          this.$refs.keyBoard.showHand(key);
          return;
        }
      }
    },
    // 展示韵母的手
    showYmHand() {
      // 隐藏当前手
      const sm = this.getTextSm();
      this.$refs.keyBoard.hideHand(this.handKey);
      const keys = Object.keys(pinyinMap);
      for (let key of keys) {
        // 获得数组
        let valueArr = pinyinMap[key];
        for (let value of valueArr) {
          if (this.aimPinyin[0].replace(sm, "") == value) {
            this.handKey = key;
            this.$refs.keyBoard.showHand(key);
            return;
          }
        }
      }
    },
    // 获取一个字的声母
    getTextSm() {
      const keys = Object.keys(pinyinMap);
      for (let key of keys) {
        // 获得数组
        let valueArr = pinyinMap[key];
        for (let value of valueArr) {
          if (this.aimPinyin[0].startsWith(value)) {
            return value;
          }
        }
      }
    },
    initHand() {
      // 如果已经加载出了句子
      if (this.word !== "加载中") {
        this.showSmHand();
      }
    },
  },
  mounted() {
    this.getWord();
    this.$nextTick(() => {
      // 编辑框获得焦点
      this.$refs.input.focus();
    });
    window.onload = () => {
      this.initHand();
    };
  },
};
</script>

<style>
@media screen and (max-width: 992px) {
  .hand {
    display: none;
  }
}
.typing-block {
  transform: none !important;
  width: unset !important;
  overflow: hidden;
}
</style>