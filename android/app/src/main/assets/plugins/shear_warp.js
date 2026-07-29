if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：非线性高频局部剪切形变 (Shear Warp)
 */
window.AntiOcrPlugins.push({
    name: "📐 文本行非线性局部剪切",
    
    params: {
        shearIntensity: { label: "最大剪切斜率", min: 0, max: 0.15, step: 0.01, value: 0 },
        wavePeriod: { label: "切变周期密度", min: 15, max: 80, step: 1, value: 15 }
    },
    
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        const intensity = currentParams.shearIntensity.value;
        const period = currentParams.wavePeriod.value;
        
        const outputData = ctx.createImageData(w, h);
        const src = imageData.data;
        const dst = outputData.data;
        
        // 随机初始相位
        const phase = Math.random() * Math.PI * 2;
        
        // 执行逆向映射 (Backward Mapping)
        for (let y = 0; y < h; y++) {
            // 利用正弦函数计算当前行的仿射剪切斜率（产生波浪状左右倾斜效果）
            let currentShear = intensity * Math.sin(y / period + phase);
            
            for (let x = 0; x < w; x++) {
                // 根据当前行的剪切斜率，反向计算其在原图中的 X 坐标 (以图片中心为原点进行剪切变换)
                let origX = Math.round(x + currentShear * (y - h / 2));
                
                // 边界锁定保护
                origX = Math.max(0, Math.min(w - 1, origX));
                
                const srcIdx = (y * w + origX) * 4;
                const dstIdx = (y * w + x) * 4;
                
                dst[dstIdx]     = src[srcIdx];
                dst[dstIdx + 1] = src[srcIdx + 1];
                dst[dstIdx + 2] = src[srcIdx + 2];
                dst[dstIdx + 3] = src[srcIdx + 3];
            }
        }
        
        return outputData;
    }
});
