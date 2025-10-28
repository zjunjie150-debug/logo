// api/generate.js (最终确定版 - 解析 URL)

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
                model: "stable-diffusion-xl", // 修正模型名称
                size: "1024x1024", 
                n: 1 
            }),
        });
        
        const apiData = await apiResponse.json();

        if (apiData.error) {
            return res.status(500).json({ error: `API 错误: ${apiData.error.message}. 错误代码: ${apiData.error.code}` });
        }

        // 修正：改为解析返回的 'url' 字段
        const imageURL = apiData?.data?.[0]?.url;
        
        if (!imageURL) {
             return res.status(500).json({ error: `模型返回数据结构不完整或为空。完整API响应: ${JSON.stringify(apiData)}` });
        }
        
        // 返回 URL 给前端
        res.status(200).json({ image_url: imageURL });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};