// 初始化全局插件注册容器
if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：多中心环形流体干涉场
 */
window.AntiOcrPlugins.push({
    name: "🌊 多中心环形流体干涉",
    
    // 1. 暴露给前端 UI 的可调参元数据
    params: {
        centers: { label: "涟漪源数量", min: 1, max: 6, step: 1, value: 1 },
        amplitude: { label: "径向最大振幅", min: 0, max: 20, step: 0.5, value: 0 },
        wavelength: { label: "涟漪波长", min: 15, max: 70, step: 1, value: 15 }
    },
    
    /**
     * 2. 核心像素级变换函数（必须返回一个 ImageData 对象）
     * @param {CanvasRenderingContext2D} ctx - 主画布上下文
     * @param {ImageData} imageData - 由上一个算法插件传过来的中间像素切片
     * @param {Object} currentParams - 当前用户调整后的实时参数值
     */
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        // 提取调参值
        const cCount = currentParams.centers.value;
        const amp = currentParams.amplitude.value;
        const wavelength = currentParams.wavelength.value;
        
        // 创建用于输出的新像素缓冲区
        const outputData = ctx.createImageData(w, h);
        const src = imageData.data;
        const dst = outputData.data;
        
        // 动态生成确定性的伪随机环形中心（基于图像高宽比例）
        let rippleSources = [];
        for (let i = 0; i < cCount; i++) {
            // 使用正弦分布打散圆心，使其分布自然且不随重绘改变相对位置
            rippleSources.push({
                x: (0.2 + 0.6 * Math.abs(Math.sin(i * 4.56))) * w,
                y: (0.2 + 0.6 * Math.abs(Math.cos(i * 7.89))) * h,
                phase: i * Math.PI * 0.5
            });
        }
        
        // 执行二维径向反向折射空间映射 (Backward Mapping)
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let totalDX = 0;
                let totalDY = 0;
                
                // 累加多源涟漪对当前像素点的空间拉扯力和相位干涉
                for (let i = 0; i < cCount; i++) {
                    const rSource = rippleSources[i];
                    const dx = x - rSource.x;
                    const dy = y - rSource.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        // 随着扩散距离增大，波动幅度微幅非线性衰减
                        let attenuation = 1.0 / (1.0 + distance * 0.0015);
                        let waveShift = amp * Math.sin((distance / wavelength) * Math.PI * 2 - rSource.phase) * attenuation;
                        
                        // 径向矢量分解
                        totalDX += (dx / distance) * waveShift;
                        totalDY += (dy / distance) * waveShift;
                    }
                }
                
                // 逆向映射寻找原图位置
                let origX = Math.round(x + totalDX);
                let origY = Math.round(y + totalDY);
                
                // 安全边界锁
                origX = Math.max(0, Math.min(w - 1, origX));
                origY = Math.max(0, Math.min(h - 1, origY));
                
                // 像素矩阵寻址 (RGBA)
                const srcIdx = (origY * w + origX) * 4;
                const dstIdx = (y * w + x) * 4;
                
                dst[dstIdx]     = src[srcIdx];     // R
                dst[dstIdx + 1] = src[srcIdx + 1]; // G
                dst[dstIdx + 2] = src[srcIdx + 2]; // B
                dst[dstIdx + 3] = src[srcIdx + 3]; // A
            }
        }
        
        return outputData;
    }
});
