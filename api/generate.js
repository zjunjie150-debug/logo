// api/generate.js (简化版 - 直接使用 API Key 作为 Bearer Token)

import fetch from 'node-fetch'; 

// 密钥从 Vercel 的环境变量中获取
const BEARER_TOKEN = process.env.QIANFAN_API_KEY; 

// 导出函数，供 Vercel 调用
export default async (req, res) => {
    // 基础的设置和请求方法检查...
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt 不能为空' });
        }

        // 1. 调用千帆图像生成 API
        // 注意：这里 URL 中不再需要 access_token=，而是通过 Header 鉴权
        const qianfanUrl = `https://qianfan.baidubce.com/v2/images/generations`;
        
        const apiResponse = await fetch(qianfanUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // !!! 关键：将您的 API Key 作为 Bearer Token 放入 Authorization Header !!!
                'Authorization': `Bearer ${BEARER_TOKEN}` 
            },
            body: JSON.stringify({
                prompt: prompt,
                model: "Stable-Diffusion-XL", 
                size: "1024x1024", 
                n: 1 
            }),
        });
        
        // ... (后续的错误处理和返回逻辑保持不变)
        const apiData = await apiResponse.json();

        if (apiData.error_code) {
            return res.status(500).json({ error: `API 错误: ${apiData.error_msg}` });
        }

        const image_base64 = apiData.result.data[0].b64_image;
        res.status(200).json({ image_base64 });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};