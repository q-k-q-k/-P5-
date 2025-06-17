//shizuku 作为全局对象使用
typeof shizuku; // "function"
typeof shizuku.execCommand; // "function"

// 时间判断
const isDaytime = () => {
    const hours = new Date().getHours();
    return hours >= 7 && hours < 20;
};

// 封装设置命令执行
const execSettingsCommand = (command) => {
    try {
        const result = shizuku(command).result.trim();
        return result ? parseFloat(result) : -1;
    } catch (e) {
        toastLog("命令执行错误: " + e);
        return -1;
    }
};

// 极速切换UI模式函数（修正Activity名称）
const changeUIMode = (targetMode) => {
    const startTime = Date.now();
    const frontApp = currentPackage();

    try {
        // 直接打开设置应用主页面
        shizuku("am start -n com.xiaopeng.car.settings/com.xiaopeng.car.settings.ui.activity.MainActivity");

        // 极速查找显示选项卡（100ms超时）
        const displayTab = text("显示").findOne(100);
        if (displayTab) {
            displayTab.click();
            sleep(50); // 极短等待页面切换
        } else {
            // 如果找不到选项卡，尝试坐标点击（需要根据实际屏幕调整）
            click(90, 800); // 假设显示选项卡在(300,200)位置
            toastLog("使用坐标点击显示选项卡");
            sleep(100);
        }

        // 极速查找目标模式（100ms超时）
        const modeOption = text(targetMode).findOne(100);
        if (!modeOption) throw "未找到'" + targetMode + "'选项";

        // 直接点击
        modeOption.click();
        toastLog(`✓ 已切换到${targetMode}模式`);

        // 后台验证模式切换
        threads.start(() => {
            sleep(300); // 给系统一些时间保存设置
            const newUIMode = execSettingsCommand("settings get secure ui_night_mode");
            const expectedMode = targetMode === "自动" ? 0 : targetMode === "黑夜" ? 2 : -1;

            if (newUIMode !== expectedMode) {
                toastLog(`⚠ 验证失败: 当前模式 ${newUIMode}, 期望模式 ${expectedMode}`);
            }
        });

    } catch (e) {
        toastLog("模式切换失败: " + e);
    } finally {
        // 极速返回原应用（并行执行）
        threads.start(() => {
            if (frontApp && currentPackage() !== frontApp) {
                if (["com.xiaopeng.car.settings", "com.xiaopeng.montecarlo"].includes(frontApp)) {
                    shizuku("am start -n com.xiaopeng.montecarlo/com.xiaopeng.montecarlo.MainActivity");
                } else {
                    launchPackage(frontApp);
                }
            }
        });

        //toastLog(`操作耗时: ${Date.now() - startTime}ms`);
    }
};

// 主监控逻辑
let lastMode = -1;
let lastBrightness = -1;

const monitorUISettings = () => {
    let iterationCount = 0;
    const maxIterations = 60000; // 增加安全阀值

    setInterval(() => {
            if (iterationCount++ > maxIterations) {
                toastLog("达到最大执行次数，安全退出");
                exit();
            }

            // 并行获取设置值
            let brightness = -1,
                uimode = -1;
            threads.start(() => brightness = execSettingsCommand("settings get system autolight"));
            threads.start(() => uimode = execSettingsCommand("settings get secure ui_night_mode"));
            sleep(30); // 极短等待线程启动

            // 快速检查结果
            if (brightness === -1 || uimode === -1) {
                // 同步重试一次
                brightness = execSettingsCommand("settings get system autolight");
                uimode = execSettingsCommand("settings get secure ui_night_mode");
                if (brightness === -1 || uimode === -1) {
                    toastLog("获取系统设置失败，跳过本次检查");
                    return;
                }
            }

            // 只在值变化时记录日志
            if (brightness !== lastBrightness || uimode !== lastMode) {
                //toastLog(`亮度: ${brightness}%, 模式: ${uimode} (0=自动 1=日间 2=夜间)`);
                lastBrightness = brightness;
                lastMode = uimode;
            }

            // 决策逻辑
            if (isDaytime()) {
                if (uimode < 2 && brightness < 20 && brightness > 0) {
                changeUIMode("黑夜");
            } else if (uimode === 2 && brightness > 40) {
                changeUIMode("自动");
            }
        } else if (uimode !== 0) {
            changeUIMode("自动");
        }
    }, 3000); // 检测间隔3秒
};

// 初始化执行
toastLog("启动UI模式监控 - " + (isDaytime() ? "白天模式" : "夜间模式"));
toastLog("优化特性: 极速操作(100ms超时)、坐标点击备用、并行返回");
auto();
monitorUISettings();