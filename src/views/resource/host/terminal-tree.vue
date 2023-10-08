<template>
  <splitpane :splitSet="settingLR">
    <template #paneL>
      <div class="logo">DevOps Super</div>
      <el-tree
        ref="treeSelectRef"
        @node-click="handleNodeClick"
        default-expand-all
        :data="treeState.data"
        node-key="id"
        :render-after-expand="false"
        :expand-on-click-node="false"
        :highlight-current="true"
      >
        <template #default="{ node, data }">
          <span style="position: relative; top: 2px">
            <IconifyIconOffline
              style="display: inline"
              v-if="data.isHost"
              :icon="Monitor"
            />
            <IconifyIconOffline
              style="display: inline"
              v-else-if="node.expanded && !node.isLeaf"
              :icon="FolderOpened"
            />
            <IconifyIconOffline style="display: inline" v-else :icon="Folder" />
          </span>
          <span style="margin-left: 5px">{{ data.name }}</span
          ><span style="margin-left: 5px" v-if="!data.isHost"
            >({{ data.hostCount }})</span
          >
        </template>
      </el-tree>
    </template>
    <template #paneR>
      <el-tabs
        class="h-[100%]"
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
        v-model="tabState.activeTab"
        closable
        type="border-card"
      >
        <!-- 占位标签页模板 -->
        <el-tab-pane
          label="DevOps Super"
          :name="-1"
          v-if="!tabState.data.length"
        >
          <div class="placeholder-content">
            <p>
              <IconifyIconOffline
                style="display: inline"
                :icon="InfoFilled"
                width="30"
                class="relative top-2"
              />
              当前没有打开任何终端连接
            </p>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :lazy="true"
          :key="item.key"
          :name="idx"
          :label="item.label"
          v-for="(item, idx) in tabState.data"
        >
          <template #label>
            <div
              :class="{
                connected: item.connected,
                disconnected: !item.connected
              }"
            >
              {{ item.label }}
              <span style="position: relative; top: 2px">
                <IconifyIconOffline
                  v-if="item.connected"
                  :icon="SuccessFilled"
                  style="display: inline"
                />
                <IconifyIconOffline
                  style="display: inline"
                  v-else
                  :icon="CircleCloseFilled"
                />
              </span>
            </div>
          </template>
          <SshTerminal
            @reload="item.key = Date.now()"
            @connected="item.connected = true"
            @close="item.connected = false"
            :ws-url="item.terminalUrl"
            :in-body="false"
            :padding-bottom="70"
            @ctrl-u="handleTerminalCtrlU"
          />
          <el-drawer
            v-model="fileManagerState.visible"
            title="文件管理器"
            direction="rtl"
            :before-close="handleFileManagerDrawerClose"
            size="50%"
          >
            <FileManager
              @download-file="handleDownloadFile"
              :visible="fileManagerState.visible"
              :ws-url="fileManagerState.wsUrl"
              @close="handleFileManagerClose"
            />
          </el-drawer>
        </el-tab-pane>
      </el-tabs>
    </template>
  </splitpane>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { TabPaneName, TabsPaneContext } from "element-plus";
import { getWsProtocol, getHttpProtocol } from "@/utils/generic";
import SshTerminal from "./components/SshTerminal.vue";
import {
  getLstApi as getHostGroupLstApi,
  Model as IHostGroup
} from "@/api/resource/host-group";
import {
  getAuthorizedLstApi as getAuthorizedHostLstApi,
  Model as IHost
} from "@/api/resource/host";
import FileManager from "./components/FileManager.vue";
import { confirm } from "@/utils/generic";
import { getToken } from "@/utils/auth";
import { handleTree } from "@/utils/tree";
import Monitor from "@iconify-icons/ep/monitor";
import FolderOpened from "@iconify-icons/ep/folder-opened";
import Folder from "@iconify-icons/ep/folder";
import InfoFilled from "@iconify-icons/ep/info-filled";
import SuccessFilled from "@iconify-icons/ep/success-filled";
import CircleCloseFilled from "@iconify-icons/ep/circle-close-filled";
import { hasAuth } from "@/router/utils";
import { Permiss } from "./logic/types";
import splitpane, { ContextProps } from "@/components/ReSplitPane";

const settingLR: ContextProps = reactive({
  minPercent: 10,
  defaultPercent: 10,
  split: "vertical"
});

const tokenInfo = getToken();

interface TabItem {
  name: number;
  terminalUrl: string;
  label: string;
  connected: boolean;
  key: number;
}

interface ITreeItem {
  id: number;
  name: string;
  children?: ITreeItem[];
  hostCount: number;
  hostId?: number;
  isHost?: boolean;
}

type HostTreeItem = Partial<
  IHostGroup &
    IHost & { children: HostTreeItem[]; isHost: boolean; hostId: number }
>;

const treeSelectRef = ref<any>(null);

// 树状态
const treeState = reactive<{
  data: Array<ITreeItem>;
}>({
  data: []
});

// tab 状态
const tabState = reactive<{ data: TabItem[]; activeTab: number }>({
  data: [],
  activeTab: 0
});

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

const handleFileManagerClose = () => {
  fileManagerState.visible = false;
};

const handleTerminalCtrlU = () => {
  if (!hasAuth(Permiss.TERMINAL_SFTP_READ)) return;
  const wsUrl = `${getWsProtocol()}://${import.meta.env.VITE_BASE_URL}/host/${
    tabState.data[tabState.activeTab].name
  }/sftp-file-manager?token=${tokenInfo?.token}`;
  fileManagerState.wsUrl = wsUrl;
  fileManagerState.visible = true;
};

const handleDownloadFile = async (path: string) => {
  window.open(
    `${getHttpProtocol()}://${import.meta.env.VITE_BASE_URL}/host/${
      tabState.data[tabState.activeTab].name
    }/download-file?path=${path}&token=${tokenInfo?.token}`
  );
  // 可以优化，服务端生成临时认证链接，前端直接下载
  // let loading = openLoading("正在下载文件，请稍后...")
  // let res = await downloadFileApi(tabState.data[tabState.activeTab].name, path).catch(() => false)
  // loading.close()
  // if (res) saveAs(res as Blob, basename(path))
};

const convertTree = (tree: HostTreeItem[]): ITreeItem[] => {
  const result: ITreeItem[] = [];
  tree.forEach(item => {
    const newItem: ITreeItem = {
      id: item.id ?? 0,
      hostCount: item.children?.filter(item => item.isHost).length ?? 0,
      name: item.name,
      children: item.children ? convertTree(item.children) : [],
      isHost: item.isHost ?? false,
      hostId: item.hostId
    };

    if (
      newItem.hostCount > 0 ||
      newItem.isHost ||
      checkHaveHost(newItem.children)
    ) {
      result.push(newItem);
    }
  });
  return result;
};

const checkHaveHost = (items: ITreeItem[]): boolean => {
  if (items.some(item => item.hostCount > 0)) {
    return true;
  }

  return items.some(item => checkHaveHost(item.children));
};

const handleTabRemove = (idx: TabPaneName) => {
  tabState.data = tabState.data.filter((_, index) => index !== idx);
  if (tabState.activeTab >= (idx as number)) {
    tabState.activeTab--;
  }
  if (tabState.activeTab <= 0) {
    tabState.activeTab = -1;
  }
};

const handleTabClick = (idx: TabsPaneContext) => {
  if ((idx.paneName as number) < 0) {
    return;
  }
  const currentItem = tabState.data[idx.paneName as number];
  treeSelectRef.value.setCurrentKey(currentItem.name);
  // currentItem.key = Date.now()
};

const handleNodeClick = (data: ITreeItem) => {
  if (data.isHost) {
    const wsUrl = `${getWsProtocol()}://${import.meta.env.VITE_BASE_URL}/host/${
      data.hostId
    }/terminal?token=${tokenInfo?.token}`;
    tabState.data.push({
      name: data.hostId,
      terminalUrl: wsUrl,
      label: data.name,
      connected: false,
      key: Date.now()
    });
    tabState.activeTab = tabState.data.length - 1;
  }
};

// 处理文件管理器关闭
const handleFileManagerDrawerClose = async () => {
  if (!(await confirm("确认关闭？"))) {
    return;
  }
  fileManagerState.visible = false;
};

onMounted(async () => {
  document.title = `终端管理`;
  const [hostGroupRes, hostRes] = await Promise.all([
    getHostGroupLstApi(null),
    getAuthorizedHostLstApi()
  ]);
  hostRes.data.list.forEach(hostItem => {
    hostItem["parentId"] = hostItem.hostGroupId;
    hostItem["isHost"] = true;
    hostItem["hostId"] = hostItem.id;
    delete hostItem.id;
  });
  const allList = (hostGroupRes.data.list as []).concat(
    hostRes.data.list as []
  );
  const hostTree = handleTree(allList) as HostTreeItem[];
  treeState.data = convertTree(hostTree);
  tabState.activeTab = -1;
});

onUnmounted(() => {
  fileManagerState.visible = false;
});
</script>

<style scoped>
.logo {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
}

.el-tree :deep(.el-tree-node__content) {
  padding: 2px 10px;
  transition: background-color 0.3s;
}

.el-tree :deep(.el-tree-node__content:hover) {
  background-color: #e6f7ff;
}

:deep(.el-tabs) {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: 100%;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.placeholder-content i {
  margin-bottom: 20px;
  font-size: 40px;
}

.connected {
  color: #67c23a;
}

.disconnected {
  color: #f56c6c;
}
</style>
