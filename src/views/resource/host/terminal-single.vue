<template>
  <!-- 工具菜单栏 -->
  <div class="tool-menu" v-if="isReplayMode">
    <div class="tool-item">
      <el-text size="small">倍速：</el-text>
      <el-select
        placeholder="请选择"
        v-model="logPlayerState.speed"
        @change="handleSpeedChange"
        size="small"
      >
        <el-option label="0.2x" :value="0.2" />
        <el-option label="0.5x" :value="0.5" />
        <el-option label="1.0x" :value="1" />
        <el-option label="1.5x" :value="1.5" />
        <el-option label="2.0x" :value="2.0" />
        <el-option label="4.0x" :value="4.0" />
        <el-option label="8.0x" :value="8.0" />
        <el-option label="16.0x" :value="16.0" />
        <el-option label="32.0x" :value="32.0" />
      </el-select>
    </div>
    <div class="tool-item" style="width: 70%">
      <el-slider
        @change="handleProgressChange"
        :disabled="logPlayerState.closed"
        v-model="logPlayerState.progress"
      />
    </div>
    <div class="tool-item">
      <el-button
        :icon="useRenderIcon(RefreshRight)"
        @click="handleTerminalReload"
        size="small"
        type="success"
        >重放</el-button
      >
      <el-button
        :icon="useRenderIcon(VideoPlay)"
        @click="handlePause(false)"
        v-if="logPlayerState.pause"
        size="small"
        type="success"
        >继续</el-button
      >
      <el-button
        :icon="useRenderIcon(VideoPause)"
        @click="handlePause(true)"
        v-else
        size="small"
        type="info"
        >暂停</el-button
      >
    </div>
  </div>
  <SshTerminal
    :inner-data="isReplayMode"
    @close="handleTerminalClose"
    @message="handleTerminalMessage"
    @connected="handleTerminalConnected"
    :key="terminalReloadCounter"
    ref="terminal"
    :padding-bottom="padding_bottom"
    :ws-url="wsUrl"
    @reload="handleTerminalReload"
    :in-body="true"
    @ctrl-u="handleTerminalCtrlU"
  />
  <!-- destroy-on-close -->
  <el-drawer
    v-if="!isReplayMode"
    v-model="fileManagerState.visible"
    title="文件管理器"
    direction="rtl"
    :before-close="handleFileManagerDrawerClose"
    size="50%"
  >
    <FileManager
      ref="fileManagerRef"
      @download-file="handleDownloadFile"
      :visible="fileManagerState.visible"
      :ws-url="fileManagerState.wsUrl"
      @close="handleFileManagerClose"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getWsProtocol, getHttpProtocol } from "@/utils/generic";
import { getApi } from "@/api/resource/host";
import FileManager from "./components/FileManager.vue";
import { confirm } from "@/utils/generic";
import { Arrayable } from "@pureadmin/utils";
import SshTerminal from "./components/SshTerminal.vue";
import { getToken } from "@/utils/auth";
import { hasAuth } from "@/router/utils";
import { Permiss } from "./logic/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import RefreshRight from "@iconify-icons/ep/refresh-right";
import VideoPlay from "@iconify-icons/ep/video-play";
import VideoPause from "@iconify-icons/ep/video-pause";

// const enum permiss {
//   fileManagerReadonly = "host-terminal-file-manager-readonly"
// }
const tokenInfo = getToken();

const router = useRouter();
const token = tokenInfo.token;
const { id, mode } = router.currentRoute.value.query;
const isReplayMode = mode === "replay";
const wsUrl = `${getWsProtocol()}://${import.meta.env.VITE_BASE_URL}${
  isReplayMode ? `/host-terminal-session/${id}/replay` : `/host/${id}/terminal`
}?token=${token}`;
const fileManagerRef = ref();

const fileManagerState = reactive<{
  visible: boolean;
  showHiddenFiles: boolean;
  wsUrl: string;
  path: string;
}>({
  visible: false,
  showHiddenFiles: false,
  wsUrl: "",
  path: "/"
});

const logPlayerState = reactive({
  pause: false,
  speed: 1.0,
  progress: 0,
  closed: false
});

const terminal = ref<any>();
const terminalReloadCounter = ref(0);

const padding_bottom = isReplayMode ? 30 : 0;

// 处理终端ctrl+u，打开文件管理器
const handleTerminalCtrlU = () => {
  if (!hasAuth(Permiss.TERMINAL_SFTP_READ)) return;
  const wsUrl = `${getWsProtocol()}://${
    import.meta.env.VITE_BASE_URL
  }/host/${id}/sftp-file-manager?token=${token}`;
  fileManagerState.wsUrl = wsUrl;
  fileManagerState.visible = true;
};

// 处理文件管理器关闭
const handleFileManagerClose = () => {
  fileManagerState.visible = false;
};

// 处理下载文件
const handleDownloadFile = async (path: string) => {
  window.open(
    `${getHttpProtocol()}://${
      import.meta.env.VITE_BASE_URL
    }/host/${id}/download-file?path=${path}&token=${token}`
  );
};

// 处理终端重载
const handleTerminalReload = () => {
  terminalReloadCounter.value++;
};

// 处理暂停/继续
const handlePause = (pause: boolean) => {
  if (!terminal.value) {
    return;
  }
  terminal.value.wsSend({ type: pause ? "pause" : "continue" });
  logPlayerState.pause = pause;
};

// 处理倍速变化
const handleSpeedChange = (speed: number) => {
  terminal.value.wsSend({ type: "speed", speed: speed });
};

// 终端连接成功，更新倍速信息
const handleTerminalConnected = () => {
  logPlayerState.closed = false;
  terminal.value.wsSend({ type: "speed", speed: logPlayerState.speed });
};

// 处理终端消息
const handleTerminalMessage = (msg: {
  total: number;
  sent: number;
  data: string;
  progress_set: boolean;
}) => {
  logPlayerState.progress = (msg.sent / msg.total) * 100;
};

// 处理进度条变化
const handleProgressChange = (_: Arrayable<number>) => {
  if (logPlayerState.closed) {
    terminalReloadCounter.value++;
  }
  terminal.value.wsSend({
    type: "progress",
    progress: logPlayerState.progress / 100
  });
};

// 处理终端关闭
const handleTerminalClose = () => {
  logPlayerState.closed = true;
};

onMounted(async () => {
  if (!id) {
    router.push("/404");
    return;
  }
  if (!isReplayMode) {
    const res = await getApi(parseInt(id as string));
    document.title = `终端-${res.data.name}-${res.data.hostAddr}`;
  }
});

// 处理文件管理器关闭
const handleFileManagerDrawerClose = async () => {
  if (!(await confirm("确认关闭？"))) {
    return;
  }
  // fileManagerRef.value?.handleClose();
  fileManagerState.visible = false;
};
</script>

<style scoped>
.tool-menu {
  display: flex;
  justify-content: space-between;
  height: v-bind(padding_bottom + "px");
  padding: 0 20px;
  background-color: #f5f7fa;
}

.tool-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
</style>
