/**
 * 一个定时器
 */
export default class Timer {
  private startTime: number | null = null;
  private elapsedTime: number = 0;
  private timerId: number | null = null;

  // 开始计时
  start(): void {
    if (this.timerId !== null) {
      // 如果计时器已经在运行，避免重复启动
      console.warn("Timer is already running");
      return;
    }
    this.startTime = Date.now() - this.elapsedTime; // 考虑到暂停时保留的时间
    this.timerId = window.setInterval(() => this.update(), 1000); // 每秒更新一次
  }

  // 更新计时器
  private update(): void {
    if (this.startTime !== null) {
      this.elapsedTime = Date.now() - this.startTime;
      console.log(`Elapsed time: ${Math.floor(this.elapsedTime / 1000)} seconds`);
    }
  }

  // 停止计时
  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // 重置计时器
  reset(): void {
    this.stop(); // 停止当前计时
    this.elapsedTime = 0;
    this.startTime = null;
    console.log("Timer reset to 0");
    this.start();
  }

  clear() {
    this.stop();
  }

  // 获取当前计时的秒数
  getTime(): number {
    return Math.floor(this.elapsedTime / 1000);
  }
}