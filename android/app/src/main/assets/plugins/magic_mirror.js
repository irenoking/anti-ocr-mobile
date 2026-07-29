// plugins/magic_mirror.js

if (!window.AntiOcrPlugins) {
    window.AntiOcrPlugins = [];
}

/**
 * 🪞 魔镜域局部反演干扰器（Magic Mirror Field）
 * 核心思想：
 * - 人眼依赖全局结构
 * - OCR依赖局部稳定纹理
 * → 用“分块镜像 + 梯度保护 + 随机相位翻转”破坏OCR连续性
 */
window.AntiOcrPlugins.push({
    name: "🪞 魔镜域局部反演",

    params: {
        tileSize: {
            label: "镜像块尺寸",
            min: 8,
            max: 64,
            step: 4,
            value: 8
        },
        mirrorStrength: {
            label: "反演强度",
            min: 0,
            max: 1,
            step: 0.05,
            value: 0
        },
        edgeProtect: {
            label: "边缘保护(保留可读性)",
            min: 0,
            max: 1,
            step: 0.05,
            value: 0
        },
        phaseNoise: {
            label: "相位扰动",
            min: 0,
            max: 10,
            step: 1,
            value: 0
        }
    },

    process: function(ctx, imageData, currentParams) {
        const w = imageData.width;
        const h = imageData.height;

        const tile = currentParams.tileSize.value;
        const strength = currentParams.mirrorStrength.value;
        const protect = currentParams.edgeProtect.value;
        const noise = currentParams.phaseNoise.value;

        const src = imageData.data;
        const output = ctx.createImageData(w, h);
        const dst = output.data;

        // 复制原图作为基础层（保证人眼可识别）
        dst.set(src);

        // 边缘检测（简化版梯度，用于保护文字结构）
        function isEdge(x, y) {
            const idx = (y * w + x) * 4;
            const gray = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;

            const right = (src[idx + 4] + src[idx + 5] + src[idx + 6]) / 3;
            const down = (src[((y + 1) * w + x) * 4] + src[((y + 1) * w + x) * 4 + 1] + src[((y + 1) * w + x) * 4 + 2]) / 3;

            return Math.abs(gray - right) > 25 || Math.abs(gray - down) > 25;
        }

        // 分块魔镜反演
        for (let ty = 0; ty < h; ty += tile) {
            for (let tx = 0; tx < w; tx += tile) {

                // 每个tile随机决定是否镜像
                const mirrorX = Math.random() < strength;
                const mirrorY = Math.random() < (strength * 0.7);

                // 相位扰动（让OCR无法稳定采样块结构）
                const phase = (Math.random() - 0.5) * noise;

                for (let y = 0; y < tile; y++) {
                    for (let x = 0; x < tile; x++) {

                        const sx = tx + x;
                        const sy = ty + y;

                        if (sx >= w || sy >= h) continue;

                        // 边缘保护：文字轮廓区域减少破坏
                        if (isEdge(sx, sy) && Math.random() < protect) {
                            continue;
                        }

                        // 镜像坐标计算
                        let mx = mirrorX ? (tile - 1 - x) : x;
                        let my = mirrorY ? (tile - 1 - y) : y;

                        // 加相位扰动（轻微错位采样）
                        let ox = tx + ((mx + Math.round(phase)) % tile);
                        let oy = ty + ((my + Math.round(phase * 0.7)) % tile);

                        if (ox >= w || oy >= h) continue;

                        const srcIdx = (oy * w + ox) * 4;
                        const dstIdx = (sy * w + sx) * 4;

                        dst[dstIdx]     = src[srcIdx];
                        dst[dstIdx + 1] = src[srcIdx + 1];
                        dst[dstIdx + 2] = src[srcIdx + 2];
                        dst[dstIdx + 3] = src[srcIdx + 3];
                    }
                }
            }
        }

        return output;
    }
});