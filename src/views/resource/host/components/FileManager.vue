<template>
  <div class="file-manager">
    <el-row class="toolbar">
      <el-col :span="16">
        <PathNavigater :path="state.path" @click="handleFilePathChange" />
        <!-- <el-progress :percentage="50" :stroke-width="15" striped /> -->
      </el-col>
      <el-col :span="8">
        <div class="actions">
          <el-row :gutter="12">
            <el-col :span="14">
              <el-text>显示隐藏文件: &nbsp;&nbsp;</el-text>
              <el-switch
                inline-prompt
                active-text="开启"
                @change="handleHiddenFilesSwitchChange"
                inactive-text="关闭"
                v-model="state.showHiddenFiles"
                :style="switchStyle"
              />
            </el-col>
            <el-col :span="10">
              <el-progress
                v-if="state.uploading"
                :text-inside="true"
                :stroke-width="32"
                :percentage="state.uploadProcessNum"
                status="success"
              />
              <span v-else>
                <el-button
                  :icon="useRenderIcon(Upload)"
                  style="width: 100%"
                  type="primary"
                  @click="handleUploadClick"
                  >上传文件</el-button
                >
                <input
                  ref="fileInput"
                  type="file"
                  style="display: none"
                  @change="handleFileChange"
                />
              </span>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <div>
      <el-table :data="state.files" v-loading="state.loading">
        <el-table-column
          label="名称"
          sortable
          sort-by="name"
          min-width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.is_dir"
              type="primary"
              link
              @click="handleFilePathChange(row.abs_path)"
              >{{ row.name }}</el-button
            >
            <el-text v-else>{{ row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column
          sortable
          prop="size"
          sort-by="size"
          label="大小"
          align="center"
        >
          <template #default="{ row }">
            {{ formatBytes(row.size) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="mtime"
          sortable
          width="170"
          align="center"
          label="修改时间"
        />
        <el-table-column
          prop="mode"
          label="属性"
          width="110"
          sortable
          align="center"
        />
        <el-table-column label="操作" width="110" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              v-if="!row.is_dir"
              link
              @click="handleDownloadFile(row)"
              >下载</el-button
            >
            <el-button
              type="danger"
              v-if="!row.is_dir"
              link
              @click="handleDeleteFile(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onUnmounted, watch, onMounted } from "vue";
import { confirm } from "@/utils/generic";
import { formatBytes } from "@/utils/generic";
import { ElMessage } from "element-plus";
import PathNavigater from "./PathNavigater.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useCommonLogic } from "@/utils/common";
import Upload from "@iconify-icons/ep/upload";

const enum _permiss {
  download = "host-terminal-file-manager-download",
  delete = "host-terminal-file-manager-delete",
  upload = "host-terminal-file-manager-upload"
}

interface fileinfo {
  name: string;
  size: number;
  mtime: string;
  mode: string;
  abs_path: string;
}

const emits = defineEmits(["close", "downloadFile"]);
const props = defineProps({
  showHiddenFiles: {
    type: Boolean,
    default: false
  },
  wsUrl: {
    type: String,
    required: true
  }
});

let interval = null;

const { switchStyle } = useCommonLogic();

const state = reactive({
  showHiddenFiles: false,
  files: [],
  path: "/",
  uploading: false,
  uploadProcessNum: 0,
  loading: false
});

let ws = null;
// 发送获取文件列表请求
const listFiles = (path: string) => {
  (ws as WebSocket).send(
    JSON.stringify({
      type: "list",
      show_hidden_files: state.showHiddenFiles,
      path
    })
  );
  state.loading = true;
};

// 发送删除文件请求
const deleteFile = (path: string) => {
  (ws as WebSocket).send(
    JSON.stringify({
      type: "delete",
      path
    })
  );
};

onMounted(() => {
  ws = new WebSocket(props.wsUrl);
  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      // 获取文件列表
      case "listData":
        state.path = data.path;
        state.files = data.data;
        state.loading = false;
        break;
      // 分片上传文件完成或失败
      case "uploadFileChunk":
        if (data.success) {
          state.uploadProcessNum = 100;
          ElMessage.success(`上传成功`);
          setTimeout(() => {
            state.uploadProcessNum = 0;
            state.uploading = false;
          }, 2000);
          listFiles(state.path);
        } else {
          state.uploadProcessNum = 0;
          state.uploading = false;
          ElMessage.error(`上传失败, 错误信息: ${data.msg}`);
        }
        break;
      // 分片上传文件进行中
      case "uploadingFileChunk":
        state.uploadProcessNum = Math.round(
          (((data.chunk_end as number) / data.total_size) as number) * 100
        );
        break;
      // 删除文件
      case "delete":
        if (data.success) {
          ElMessage.success(`删除成功`);
          listFiles(state.path);
        } else {
          ElMessage.error(`删除失败, 错误信息: ${data.msg}`);
        }
        break;
    }
  };

  ws.onopen = () => {
    listFiles("/");
    interval = setInterval(() => {
      (ws as WebSocket).send(
        JSON.stringify({
          type: "ping"
        })
      );
    }, 5000);
  };

  ws.onclose = () => {
    ElMessage.warning("文件管理器连接已关闭");
    emits("close");
  };

  ws.onerror = () => {
    ElMessage.error("文件管理器连接已断开");
    emits("close");
  };
});

watch(
  () => props.showHiddenFiles,
  (newValue, _) => {
    state.showHiddenFiles = newValue;
  }
);

// 处理文件路径改变
const handleFilePathChange = (newPath: string) => {
  listFiles(newPath);
};

const fileInput = ref<HTMLInputElement | null>(null);

// 处理上传文件按钮点击
const handleUploadClick = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 异步读取文件为字节数组
async function readChunkAsync(
  file: File,
  startByte: number,
  endByte: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    const slice = file.slice(startByte, endByte);
    reader.readAsArrayBuffer(slice);
  });
}

// 分片上传文件
async function uploadFileChunks(file: File, ws: WebSocket) {
  const fileSize = file.size;
  let bytesSent = 0;
  const MB_1 = 1024 * 1024;
  const KB_1 = 1024;
  let CHUNK_SIZE = 256 * KB_1;
  // if (fileSize > 20 * MB_1 && fileSize < 100 * MB_1) {
  //     CHUNK_SIZE = 1024 * 1024 * 2.5 // 2.5MB
  // }
  if (fileSize > 10 * MB_1) {
    CHUNK_SIZE = 512 * KB_1; // 512KB
  }
  // CHUNK_SIZE = CHUNK_SIZE > 5 * 1024 * 1024 ? 2.5 * 1024 * 1024 : CHUNK_SIZE
  CHUNK_SIZE = Math.round(CHUNK_SIZE);
  while (bytesSent < fileSize) {
    state.uploading = true;
    const startByte = bytesSent;
    const endByte = Math.min(bytesSent + CHUNK_SIZE, fileSize);
    const dataBytes = await readChunkAsync(file, startByte, endByte);
    const intArray = Array.from(dataBytes).map(byte => Number(byte));
    const fileData = {
      type: "uploadFileChunk",
      filename: file.name,
      chunk_start: startByte,
      chunk_end: endByte,
      path: state.path,
      data: intArray,
      total_size: fileSize
    };
    ws.send(JSON.stringify(fileData));
    bytesSent += endByte - startByte;
  }
}

// 文件上传框改变时触发上传
const handleFileChange = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const files = fileInput.files;
  if (files && files.length > 0) {
    uploadFileChunks(files[0], ws as WebSocket);
  }

  if (fileInput.value) {
    fileInput.value = "";
  }
};
// 切换显示隐藏文件
const handleHiddenFilesSwitchChange = (
  value: string | number | boolean
): any => {
  state.showHiddenFiles = value as boolean;
  listFiles(state.path);
};

// 处理删除文件
const handleDeleteFile = async (file: fileinfo) => {
  if (!(await confirm(`确认删除文件: ${file.name} ?`))) {
    return;
  }
  deleteFile(file.abs_path);
};

// 处理下载文件
const handleDownloadFile = async (file: fileinfo) => {
  emits("downloadFile", file.abs_path);
};

const handleClose = () => {
  interval && clearInterval(interval);
  ws?.close();
};

onUnmounted(() => {
  (ws as WebSocket).send(
    JSON.stringify({
      type: "exit"
    })
  );
  state.showHiddenFiles = false;
  state.uploadProcessNum = 0;
  state.uploading = false;
  interval && clearInterval(interval);
  ws?.close();
});

defineExpose({ handleClose });
</script>

<style scoped>
.file-manager {
  padding: 1rem;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.actions {
  gap: 1rem;
}

.table {
  height: calc(100% - 4rem);
  overflow-y: auto;
}
</style>
