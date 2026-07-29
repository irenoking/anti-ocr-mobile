if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 开放式算法插件：实体文本与特殊符号语义污染
 */
window.AntiOcrPlugins.push({
    name: "🔤 实体文字与符号语义污染",
    
    params: {
        charCount: { label: "干扰字块总量", min: 0, max: 60, step: 1, value: 0 },
        fontSize: { label: "干扰字体大小(px)", min: 12, max: 24, step: 1, value: 12 },
        opacity: { label: "干扰字图层透明度", min: 0.1, max: 0.8, step: 0.05, value: 0.1 }
    },
    
    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        const count = currentParams.charCount.value;
        const fSize = currentParams.fontSize.value;
        const alpha = currentParams.opacity.value;
        
        // 极易污染 VLM 语言模型上下文概率树的核心字典（混淆数字、偏旁、特殊几何）
        const poisonDict = "一二三四五六七八九十★▲■●◆0123456789X#井卍";
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
        
        // 设定绘制字体样式
        tempCtx.font = `bold ${fSize}px sans-serif`;
        tempCtx.textBaseline = "top";
        
        for (let i = 0; i < count; i++) {
            // 提取随机字符
            let char = poisonDict[Math.floor(Math.random() * poisonDict.length)];
            
            // 随机鲜艳颜色，并带有独立透明度控制
            tempCtx.fillStyle = `rgba(${rand(30, 180)}, ${rand(30, 180)}, ${rand(30, 180)}, ${alpha})`;
            
            // 计算随机坐标（留出边界余量，防止溢出）
            let x = Math.random() * (w - fSize);
            let y = Math.random() * (h - fSize);
            
            // 直接将干扰文字粘连在原文字层之上，产生灾难性的 Token 级分类冲突
            tempCtx.fillText(char, x, y);
        }
        
        return tempCtx.getImageData(0, 0, w, h);
    }
});
