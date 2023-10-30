<template>
  <div ref="terminalRef" />
</template>

<script lang="ts" setup>
import { nextTick } from "process";
import { ref, onMounted, onUnmounted } from "vue";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import _ from "lodash";
import "xterm/css/xterm.css";
const props = defineProps({
  wsUrl: {
    type: String,
    required: true
  },
  inBody: {
    type: Boolean,
    default: false
  },
  paddingBottom: {
    type: Number,
    default: 0
  }
});
const terminalRef = ref<HTMLDivElement>();
const terminalWs = new WebSocket(props.wsUrl);
const term = new Terminal({
  fontSize: 13,
  cursorBlink: true,
  convertEol: true,
  rightClickSelectsWord: true,
  allowTransparency: true,
  rows: 45,
  theme: {
    foreground: "white",
    background: "#2B394C"
  }
});
const _radius_em = props.inBody ? 0 : 0.3;

let pingInterval = null;
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.loadAddon(new WebLinksAddon());

const resizeTerminal = () => {
  if (!terminalRef.value) return;
  terminalRef.value.style.height = props.inBody
    ? `${document.body.clientHeight - props.paddingBottom}px`
    : `${
        (terminalRef.value!.offsetParent as HTMLDivElement)!.offsetParent!
          .clientHeight - props.paddingBottom
      }px`;
  fitAddon.fit();
  term.resize(term.cols, term.rows);
};
const init = () => {
  if (!terminalRef.value) return;
  let firstMessage = true;
  term.open(terminalRef.value);
  term.focus();
  nextTick(() => {
    term.writeln("初始化中...");
    resizeTerminal();
    window.addEventListener("resize", _.debounce(resizeTerminal, 300));
  });
  terminalWs.onopen = () => {
    resizeTerminal();
    pingInterval = setInterval(() => {
      terminalWs.send("ping");
    }, 10000);
  };
  terminalWs.onclose = () => {
    clearInterval(pingInterval);
    term.write("\x1b[31m" + "连接已断开" + "\x1b[0m");
    resizeTerminal();
  };
  terminalWs.onmessage = e => {
    if (firstMessage) {
      resizeTerminal();
    }
    firstMessage = false;
    term.writeln(e.data);
  };
};
onMounted(init);
onUnmounted(() => {
  clearInterval(pingInterval);
  terminalWs.close();
});
</script>

<style scoped>
:deep(.xterm) {
  /* position: unset; */
  padding: 1em;
}

:deep(.xterm-viewport) {
  border-radius: v-bind(_radius_em + "em");
}
</style>
