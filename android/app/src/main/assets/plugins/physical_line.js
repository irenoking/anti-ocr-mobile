if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：彩色物理线与几何干扰层
 */
window.AntiOcrPlugins.push({
    name: "📏 物理彩色线与几何斑块拦截",
    
    // 暴露给前端可动态调参的元数据
    params: {
        lineCount: { label: "彩色干扰线条数", min: 0, max: 40, step: 1, value: 0 },
        lineWidth: { label: "线条物理粗度(px)", min: 1, max: 8, step: 1, value: 1 },
        shapeCount: { label: "几何斑块数量", min: 0, max: 20, step: 1, value: 0 },
        pointDensity: { label: "高频高对比噪点数", min: 0, max: 3000, step: 100, value: 0 }
    },
    
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        // 1. 先把上一层传过来的 ImageData 渲染到一个临时的离屏画布上，方便直接使用 Canvas 2D 绘图 API
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;

        // 同步加上 willReadFrequently 属性
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true }); 
        tempCtx.putImageData(imageData, 0, 0);
        
        // 2. 读取当前实时滑块参数
        const lCount = currentParams.lineCount.value;
        const lWidth = currentParams.lineWidth.value;
        const sCount = currentParams.shapeCount.value;
        const pDensity = currentParams.pointDensity.value;
        
        // ✨ 【新增绝对防御边界拦截】：如果全部调成了 0，原封不动原汁原味透传，彻底解决变色和卡顿
        if (lCount === 0 && sCount === 0 && pDensity === 0) {
            return imageData; 
        }
        
        // 辅助随机数生成器
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
        
        // 3. 绘制彩色随机粗线条（穿透大模型去噪机制）
        for (let i = 0; i < lCount; i++) {
            tempCtx.beginPath();
            tempCtx.moveTo(Math.random() * w, Math.random() * h);
            tempCtx.lineTo(Math.random() * w, Math.random() * h);
            // 采用中等透明度彩色，既不刺眼又能让 AI 发生图层混淆
            tempCtx.strokeStyle = `rgba(${rand(50, 255)}, ${rand(50, 255)}, ${rand(50, 255)}, 0.45)`;
            tempCtx.lineWidth = lWidth;
            tempCtx.stroke();
        }
        
        // 4. 绘制半透明几何斑块（圆形/矩形）
        for (let i = 0; i < sCount; i++) {
            let x1 = Math.random() * (w - 50);
            let y1 = Math.random() * (h - 50);
            let sw = rand(20, 60);
            let sh = rand(20, 60);
            tempCtx.fillStyle = `rgba(${rand(100, 255)}, ${rand(100, 255)}, ${rand(100, 255)}, 0.25)`;
            
            if (Math.random() < 0.5) {
                tempCtx.beginPath();
                tempCtx.arc(x1 + sw/2, y1 + sh/2, sw/2, 0, Math.PI * 2);
                tempCtx.fill();
            } else {
                tempCtx.fillRect(x1, y1, sw, sh);
            }
        }
        
        // 5. 注入高频高对比度随机噪声点
        for (let i = 0; i < pDensity; i++) {
            let x = Math.random() * w;
            let y = Math.random() * h;
            // 随机产生纯黑或纯白的点，强行截断微观笔画
            tempCtx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
            tempCtx.fillRect(x, y, 1.5, 1.5);
        }
        
        // 6. 将离屏画布处理完的内容重新导回 ImageData 返回给流管道
        return tempCtx.getImageData(0, 0, w, h);
    }
});
