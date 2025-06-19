# -P5-
本代码库主要收录P5车机优化完善的脚本，如需使用请自行辨别实现过程和安全性再作搬运。
本脚本集合基于AutoJS 6，https://github.com/SuperMonster003/AutoJs6

1.深色模式自动切换
# 车载系统UI模式智能监控脚本
## 功能概述
这是一个专为智能汽车系统设计的自动化脚本，通过监控环境光线和系统设置，智能切换UI显示模式（日间/夜间/自动）。主要功能包括：
1. **实时环境监测**：根据当前时间自动判断白天/黑夜模式
2. **系统设置监控**：持续检测系统亮度和UI模式设置
3. **智能模式切换**：当检测到不匹配时自动切换到最佳显示模式
4. **快速操作优化**：实现毫秒级界面操作响应
5. **操作验证**：后台验证设置是否生效

## 使用环境要求
- **设备**：小鹏汽车智能系统 (兼容其他Android车机系统需调整)
- **依赖**：
  - Shizuku 权限管理系统
  - Auto.js 自动化框架
- **Android版本**：8.0 及以上

## 使用说明
1. 确保已正确安装并授权Shizuku
2. 将脚本导入Auto.js
3. 启动脚本即可开始自动监控
4. 系统将每3秒检测一次设置状态

### 手动执行命令
```javascript
// 获取当前亮度设置
shizuku.execCommand({command: "settings get system autolight"})

// 获取当前UI模式
shizuku.execCommand({command: "settings get secure ui_night_mode"})
```

## 主要技术特点
### 1. 极速操作优化
- 100ms超时查找界面元素
- 并行命令执行减少等待时间
- 智能等待策略（动态调整等待时间）
### 2. 增强型元素查找
```javascript
// 多轮查找策略
for (let i = 0; i < 3; i++) {
    swipe(device.width / 2, device.height * 0.7, device.width / 2, device.height * 0.3, 300);
    sleep(200);
    displayTab = textMatches(/^(显示|显示与亮度)$/).findOne(300);
    if (displayTab) break;
}
```
### 3. 可靠的应用切换
```javascript
// 智能返回原应用
threads.start(() => {
    if (frontApp && currentPackage() !== frontApp) {
        if (["com.xiaopeng.car.settings", "com.xiaopeng.montecarlo"].includes(frontApp)) {
            shizuku.execCommand({
                command: "am start -n com.xiaopeng.montecarlo/com.xiaopeng.montecarlo.MainActivity"
            });
        } else {
            launchPackage(frontApp);
        }
    }
});
```

### 4. 智能决策逻辑
```javascript
// 环境自适应决策
if (isDaytime()) {
    if (uimode < 2 && brightness < 20 && brightness > 0) {
        changeUIMode("黑夜");
    } else if (uimode === 2 && brightness > 40) {
        changeUIMode("自动");
    }
} else if (uimode !== 0) {
    changeUIMode("自动");
}
```

## 注意事项
1. **设备兼容性**：
   - 默认适配小鹏汽车设置应用(`com.xiaopeng.car.settings`)
   - 其他设备需调整包名和活动名称
2. **坐标点击**：
   ```javascript
   // 备用坐标点击位置（需根据实际屏幕调整）
   click(90, 800);
   ```
   - 不同分辨率设备需要调整坐标值
3. **安全机制**：
   - 设置最大迭代次数防止无限循环
   - 命令错误处理避免脚本崩溃
   - 双线程验证确保设置生效
4. **性能优化**：
   - 仅当设置变化时记录日志
   - 并行执行减少延迟
   - 3秒检测间隔平衡性能和资源消耗
5. **权限要求**：
   - 需要授予Shizuku和Auto.js特殊权限
   - 需要无障碍服务权限
> **提示**：首次使用建议在白天测试，观察模式切换是否正常