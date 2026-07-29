if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：多频复合曲线波纹（一维空间流体解构）
 */
window.AntiOcrPlugins.push({
    name: "🌊 多频复合曲线波纹干涉",
    
    params: {
        macroAmplitude: { label: "宏观弯曲幅度", min: 0, max: 15, step: 0.5, value: 0 },
        microAmplitude: { label: "微观特征毛刺", min: 0, max: 4, step: 0.1, value: 0 },
        periodScale: { label: "波动周期密度", min: 10, max: 50, step: 1, value: 10 }
    },
    
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        const mAmp = currentParams.macroAmplitude.value;
        const miAmp = currentParams.microAmplitude.value;
        const pScale = currentParams.periodScale.value;
        
        const outputData = ctx.createImageData(w, h);
        const src = imageData.data;
        const dst = outputData.data;
        
        // 引入高频随机相位因子，确保每次渲染出来的弯曲轨迹具有不确定性，绝不触发微信后台的去畸变缓存
        const phase1 = Math.random() * Math.PI;
        const phase2 = Math.random() * Math.PI;
        
        // 预计算逐行的一维复合曲线波动偏移阵列
        let rowOffsets = new Int32Array(h);
        for (let y = 0; y < h; y++) {
            // 一重波（低频大周期）：用于将整行文本在水平空间扭成波浪形，让 AI 文本框定位失败
            let wave1 = mAmp * Math.sin(y / pScale + phase1);
            
            // 二重波（高频小周期混沌波）：专门针对中文字符的偏旁结构进行微观切割
            let wave2 = miAmp * Math.sin(y * 1.45 + phase2) + (miAmp * 0.5) * Math.cos(y * 2.89);
            
            rowOffsets[y] = Math.round(wave1 + wave2);
        }
        
        // 执行一维空间反向流体射影变换 (Backward Mapping Loop)
        for (let y = 0; y < h; y++) {
            const offsetX = rowOffsets[y];
            
            for (let x = 0; x < w; x++) {
                // 根据当前的波动偏移反向寻找原图中的真实像素点
                let origX = x + offsetX;
                
                // 边界镜像与安全截断保护
                origX = Math.max(0, Math.min(w - 1, origX));
                
                const srcIdx = (y * w + origX) * 4;
                const dstIdx = (y * w + x) * 4;
                
                // 搬运像素矩阵分量
                dst[dstIdx]     = src[srcIdx];     // Red
                dst[dstIdx + 1] = src[srcIdx + 1]; // Green
                dst[dstIdx + 2] = src[srcIdx + 2]; // Blue
                dst[dstIdx + 3] = src[srcIdx + 3]; // Alpha
            }
        }
        
        return outputData;
    }
});
