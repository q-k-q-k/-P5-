// 文件路径 - 用户根目录
const sourcePath = "/sdcard/polling.json";
const targetPath = "/sdcard/polling_modified.json";

// 获取用户输入的校正因子
function getCorrectionFactors() {
    const factors = {};
    const sections = ["unlock", "lock", "oneMeterData", "handUnlockData"];
    
    sections.forEach(section => {
        let validInput = false;
        while (!validInput) {
            let input = dialogs.input(`请输入 ${section} 校正因子 (0.5-2.0)`, "1.0");
            let factor = parseFloat(input);
            
            if (!isNaN(factor) && factor >= 0.5 && factor <= 2.0) {
                factors[section] = factor;
                validInput = true;
            } else {
                toast("输入无效，请输入0.5-2.0之间的数字");
            }
        }
    });
    
    return factors;
}

// 应用校正因子到数据，并限制数值范围(-90～-40)
function applyCorrection(data, factors) {
    const sections = Object.keys(factors);
    
    sections.forEach(section => {
        const factor = factors[section];
        if (data[section]) {
            // 遍历所有条件（如NOH, H.2+H.1等）
            Object.keys(data[section]).forEach(condition => {
                // 遍历所有位置（m, l, c, r）
                Object.keys(data[section][condition]).forEach(position => {
                    // 应用校正因子
                    const originalValue = data[section][condition][position];
                    let correctedValue = originalValue * factor;
                    
                    // 限制数值范围在-90到-40之间
                    if (correctedValue < -90) {
                        correctedValue = -90;
                    } else if (correctedValue > -40) {
                        correctedValue = -40;
                    }
                    
                    // 确保保留一位小数
                    data[section][condition][position] = parseFloat(correctedValue.toFixed(1));
                });
            });
        }
    });
    
    return data;
}

// 主函数
function main() {
    // 获取用户输入的校正因子
    const correctionFactors = getCorrectionFactors();
    
    // 检查文件是否存在
    if (!files.exists(sourcePath)) {
        toast("文件不存在: " + sourcePath);
        return;
    }
    
    // 读取原始JSON文件
    let rawData = files.read(sourcePath);
    if (!rawData) {
        toast("读取文件失败");
        return;
    }
    
    try {
        let jsonData = JSON.parse(rawData);
        
        // 删除D22部分
        if ("D22" in jsonData) {
            delete jsonData.D22;
            toast("已删除D22部分数据");
        }
        
        // 应用校正因子到D55部分
        if (jsonData.D55) {
            jsonData.D55 = applyCorrection(jsonData.D55, correctionFactors);
            toast("已应用校正因子到D55数据，数值限制在-90~-40之间");
        } else {
            toast("未找到D55数据，跳过校正");
        }
        
        // 写入新文件
        const modifiedData = JSON.stringify(jsonData, null, 2);
        files.write(targetPath, modifiedData);
        
        toast("文件处理成功！保存至: " + targetPath);
        toast("原始文件路径: " + sourcePath);
    } catch (e) {
        toast("处理JSON时出错: " + e);
    }
}

// 执行主函数
main();