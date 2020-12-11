<style scoped>
.typing-block {
  width: 1031px;
  margin: 0 auto;
  position: relative;
}

.keyboard {
  top: 0;
  left: 0;
}

.hand {
  position: absolute;
  pointer-events: none;
  top: -10px;
  left: 0px;
  opacity: 0.8;
  transform: translate(87px, 86px) scale(2.2);
}
</style>


<template>
  <div class="typing-block" :style="'transform:scale(' + scale + ')'">
    <object
      :data="keyboardData"
      type="image/svg+xml"
      ref="svg"
      class="keyboard"
      width="100%"
      height="100%"
    ></object>
    <object
      :data="handData"
      type="image/svg+xml"
      ref="hand"
      class="hand"
      width="100%"
      height="100%"
    ></object>
  </div>
</template>


<script>
import keyboard from "../assets/keyboard-ansi.svg";
import hand from "../assets/hand-both.svg";
let strokeColor = "#02a8de";
let originalColor = "#777777";

export default {
  name: "vueKeyboard",
  data() {
    return {
      keyboardData: keyboard,
      handData: hand,
    };
  },
  props: ["width"],
  computed: {
    scale() {
      return this.width ? this.width / 1031 : 1;
    },
  },
  methods: {
    keydownUpHandler(ev) {
      let that = this;
      var list = that.getLineByKeycode(ev.keyCode);
      var k = String.fromCharCode(ev.keyCode).toLowerCase();
      if (ev.type == "keydown") {
        that.showHand(k);
      } else {
        that.hideHand(k);
      }
      list.forEach(function (item) {
        if (ev.type == "keydown") {
          item.style.stroke = strokeColor;
        } else {
          item.style.stroke = originalColor;
        }
      });
    },
    getLineByKeycode(keyCode) {
      var result = [];
      var svg = this.$refs.svg;
      var k = String.fromCharCode(keyCode);
      var item = svg.contentDocument.getElementById(k.toLowerCase());

      if (item) {
        result.push(item);
      }
      return result;
    },
    getTextByKeycode(keyCode) {
      var svg = this.$refs.svg;
      var items = svg.contentDocument.querySelectorAll("text");
      var result = [];
      var k = String.fromCharCode(keyCode);
      items.forEach(function (item) {
        if (item.innerText == k) {
          result.push(item);
        }
      });

      return result;
    },
    highlightKey(k) {
      const list = this.getLineByKeycode(k.toUpperCase().charCodeAt());
      list.forEach(function (item) {
        item.style.stroke = strokeColor;
      });
    },
    cancelHighlightKey(k) {
      const list = this.getLineByKeycode(k.toUpperCase().charCodeAt());
      list.forEach(function (item) {
        item.style.stroke = originalColor;
      });
    },
    showHand(k) {
      var hand = this.$refs.hand;
      var item = hand.contentDocument.getElementById(k.toLowerCase());
      if (item) {
        item.style.display = "block";
      }
      this.highlightKey(k);
    },
    hideHand(k) {
      var hand = this.$refs.hand;
      var item = hand.contentDocument.getElementById(k.toLowerCase());
      if (item) {
        item.style.display = "none";
      }
      this.cancelHighlightKey(k);
    },
  },
};
</script>

