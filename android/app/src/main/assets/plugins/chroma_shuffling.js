if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：高频明相通道色差分离 (Chroma Shuffling)
 */
window.AntiOcrPlugins.push({
    name: "🌈 高频明相通道色相分离",
    
    params: {
        chromaShift: { label: "红蓝通道色差偏置", min: 0, max: 5, step: 1, value: 0 },
        shredBand: { label: "色彩切片高频密度", min: 1, max: 6, step: 1, value: 1 }
    },
    
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        const shift = currentParams.chromaShift.value;
        const band = currentParams.shredBand.value;

        // ✨ 【核心修复拦截】：如果色差偏置为 0，立刻原样透传，不碰任何通道
        if (shift === 0) {
            return imageData;
        }
        
        const outputData = ctx.createImageData(w, h);
        const src = imageData.data;
        const dst = outputData.data;
        
        // 执行高频色彩通道对冲剥离
        for (let y = 0; y < h; y++) {
            // 根据高频行带宽，交错确定当前行的通道平移方向
            let direction = (Math.floor(y / band) % 2 === 0) ? 1 : -1;
            let rShift = shift * direction;
            let bShift = -shift * direction; // 红蓝反向对冲，将色彩特征彻底揉碎
            
            for (let x = 0; x < w; x++) {
                let dstIdx = (y * w + x) * 4;
                
                // 计算红通道和蓝通道的目标采样 X 坐标
                let rSrcX = Math.max(0, Math.min(w - 1, x + rShift));
                let bSrcX = Math.max(0, Math.min(w - 1, x + bShift));
                
                let rIdx = (y * w + rSrcX) * 4;
                let bIdx = (y * w + bSrcX) * 4;
                
                // 核心重组：R 通道取自偏移R，G 通道保持绝对静止，B 通道取自反向偏移B
                dst[dstIdx]     = src[rIdx];     // 破坏红通道梯度特征
                dst[dstIdx + 1] = src[dstIdx + 1]; // G 通道保持物理不动，确保人类宏观视觉锚定
                dst[dstIdx + 2] = src[bIdx];     // 破坏蓝通道梯度特征
                dst[dstIdx + 3] = src[dstIdx + 3]; // 保持原 Alpha 透明度
            }
        }
        
        return outputData;
    }
});
