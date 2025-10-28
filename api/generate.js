// api/generate.js (模型名称最终修正版)

import fetch from 'node-fetch'; 

// 密钥从 Vercel 的环境变量中获取
const BEARER_TOKEN = process.env.QIANFAN_API_KEY; 

// 导出函数，供 Vercel 调用
export default async (req, res) => {
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

        const qianfanUrl = `https://qianfan.baidubce.com/v2/images/generations`;
        
        const apiResponse = await fetch(qianfanUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BEARER_TOKEN}` 
            },
            body: JSON.stringify({
                prompt: prompt,
                // ----------------------------------------------------
                // !!! 关键修正点：模型名称改为小写，确保被 API 接受 !!!
                // ----------------------------------------------------
                model: "stable-diffusion-xl", // 确保使用 API 接受的 exact name
                size: "1024x1024", 
                n: 1 
            }),
        });
        
        const apiData = await apiResponse.json();

        if (apiData.error) {
            // 捕获 API 明确返回的错误信息（包括 invalid_model）
            return res.status(500).json({ error: `API 错误: ${apiData.error.message}. 错误代码: ${apiData.error.code}` });
        }

        // 检查 result 字段和 data 数组是否存在
        const imageResult = apiData?.result?.data?.[0]?.b64_image;
        
        if (!imageResult) {
             // 如果结构不完整，返回 API 完整响应进行调试
             return res.status(500).json({ error: `模型返回数据结构不完整或为空。完整API响应: ${JSON.stringify(apiData)}` });
        }
        
        const image_base64 = imageResult;
        res.status(200).json({ image_base64 });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};