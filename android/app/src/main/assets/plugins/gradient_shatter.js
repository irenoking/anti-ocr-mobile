if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：1像素微观边缘梯度粉碎器 (已完全修复寻址与越界 Bug)
 */
window.AntiOcrPlugins.push({
    name: "🦠 1像素微观边缘梯度粉碎",
    
    // 暴露给前端工作台的动态调参控件
    params: {
        shatterDensity: { label: "梯度边缘粉碎率", min: 0.1, max: 0.9, step: 0.05, value: 0.1 },
        edgeThreshold: { label: "笔画边缘敏感度", min: 10, max: 80, step: 5, value: 10 }
    },
    
    process: function(ctx, imageData, currentParams) {
        // 提取调参滑块值
        const density = currentParams.shatterDensity.value;
        const threshold = currentParams.edgeThreshold.value;

        // ✨ 【核心修复拦截】：如果粉碎概率为 0，绝对不计算，直接原图透传
        if (density === 0) {
            return imageData;
        }

        const w = imageData.width;
        const h = imageData.height;
        
        
        // 创建用于流管道输出的全新像素缓冲区
        const outputData = ctx.createImageData(w, h);
        const src = imageData.data;
        const dst = outputData.data;
        
        // 预先完整深拷贝一份原始图像数据，确保非边缘区域能够完美保留
        dst.set(src);
        
        // 核心：一阶差分梯度分析（利用经典的索贝尔/拉普拉斯算子简化版精确锁定中文字体轮廓边界）
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                // 当前像素在全图一维数组中的 RGBA 起始寻址索引
                let idx = (y * w + x) * 4;
                
                // 1. 快速计算当前像素点的灰度明度值 (Luma)
                let currentGray = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;
                
                // 2. 提取右侧和下方紧邻像素的灰度明度值
                let rightIdx = idx + 4;
                let bottomIdx = ((y + 1) * w + x) * 4;
                
                let rightGray = (src[rightIdx] + src[rightIdx + 1] + src[rightIdx + 2]) / 3;
                let bottomGray = (src[bottomIdx] + src[bottomIdx + 1] + src[bottomIdx + 2]) / 3;
                
                // 3. 差分计算边缘梯度。如果明暗突变大于设定的阈值，则判定此处为中文字体的核心骨架边缘
                if (Math.abs(currentGray - rightGray) > threshold || Math.abs(currentGray - bottomGray) > threshold) {
                    
                    // 根据设定的密度概率进行局部特征打碎
                    if (Math.random() < density) {
                        // 4. 实施 1 像素微观非线性抖动：随机计算一个周边的相对偏移像素坐标
                        let dx = Math.floor(Math.random() * 3) - 1; // 产生 -1, 0, 1 的 1像素偏移
                        let dy = Math.floor(Math.random() * 3) - 1;
                        
                        // 计算抖动后的目标原图源像素索引
                        let targetX = x + dx;
                        let targetY = y + dy;
                        
                        // 严苛的安全边界校验，杜绝越界导致的 Canvas 卡死
                        if (targetX >= 0 && targetX < w && targetY >= 0 && targetY < h) {
                            let srcTargetIdx = (targetY * w + targetX) * 4;
                            
                            // 5. 像素级空间对冲置换（彻底重写原本错误的寻址语句）
                            dst[idx]     = src[srcTargetIdx];     // Red
                            dst[idx + 1] = src[srcTargetIdx + 1]; // Green
                            dst[idx + 2] = src[srcTargetIdx + 2]; // Blue
                            dst[idx + 3] = src[srcTargetIdx + 3]; // Alpha
                            // Alpha通道（dst[idx+3]）由深拷贝自动维护，无需操纵
                        }
                    }
                }
            }
        }
        
        return outputData;
    }
});
