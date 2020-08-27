<template>
  <div class="home">
    <div class="btn-wrap">
      <button @click="showIpt = !showIpt">指定页面截图</button>
      <button @click="screenShot">
        {{ isRunShot ? "停止截图" : "开始批量截图" }}
      </button>
      <button @click="openPath">打开截图目录</button>
      <button @click="clearLog">清空日志</button>
      <div class="input-wrap" v-if="showIpt">
        请输入地址：
        <input class="url-ipt" type="text" v-model="singlePath" />
        <button @click="singleShot">开始截图</button>
      </div>
    </div>
    <div class="logger">
      <h3 class="log-title">日志：</h3>
      <div ref="logContent" class="log-content">
        <p v-for="item in logger" :key="item.time">{{ item.content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
const { ipcRenderer } = window.require("electron");
export default {
  name: "Home",
  data() {
    return {
      showIpt: false,
      singlePath: "",
      logger: [],
      isRunShot: false
    };
  },
  mounted() {
    window.setLogger = data => {
      this.logger.push({
        time: Date.now(),
        content: data
      });
      this.$nextTick(() => {
        this.$refs.logContent.scrollTop = this.$refs.logContent.scrollHeight;
      });
    };
  },
  beforeDestroy() {
    window.setLogger = null;
  },
  methods: {
    clearLog() {
      this.logger = [];
    },
    singleShot() {
      ipcRenderer.send("singleShot", this.singlePath);
      this.singlePath = "";
    },
    screenShot() {
      if (!this.isRunShot) {
        ipcRenderer.send("screenShot");
      } else {
        ipcRenderer.send("stopShot");
      }
      this.isRunShot = !this.isRunShot;
    },
    openPath() {
      ipcRenderer.send("openPath");
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
}
.home button {
  margin-right: 10px;
}
.input-wrap {
  margin-top: 10px;
  font-size: 14px;
}
.url-ipt {
  box-sizing: border-box;
  width: 220px;
  padding: 6px 12px;
  margin-right: 15px;
  -webkit-appearance: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.logger {
  margin-top: 20px;
  width: 400px;
  padding: 15px;
  border: 1px solid #eee;
  box-sizing: border-box;
}

.logger h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.logger .log-content {
  width: 100%;
  height: 200px;
  overflow-y: auto;
}

.logger p {
  font-size: 12px;
  margin: 0 0 5px 0;
}
</style>
