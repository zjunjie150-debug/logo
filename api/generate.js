// api/generate.js (Hugging Face Logo 生成版本)

import fetch from 'node-fetch'; 
import { Buffer } from 'node:buffer'; // 引入 Buffer 用于处理图像数据

// 密钥从 Vercel 的环境变量中获取
const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN; 

// 采用更适合 Logo/简约风格的 segmind/tiny-sd 模型
const HUGGINGFACE_MODEL = "segmind/tiny-sd"; 

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

    if (!HF_ACCESS_TOKEN) {
        return res.status(500).json({ error: '服务器配置错误: 缺少 HF_ACCESS_TOKEN 环境变量。' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt 不能为空' });
        }

        // 1. 调用 Hugging Face Inference API
        const hfUrl = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;
        
        const apiResponse = await fetch(hfUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_ACCESS_TOKEN}` 
            },
            // Hugging Face API 的标准请求体
            body: JSON.stringify({
                inputs: prompt,
                options: {
                    wait_for_model: true // 如果模型正在加载，等待它完成
                }
            }),
        });
        
        // 检查 API 是否返回错误（状态码非 200/202）
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            return res.status(apiResponse.status).json({ error: `Hugging Face API 错误: ${errorText}` });
        }

        // 2. 将图片 Blob 转换为 Base64 格式
        const imageArrayBuffer = await apiResponse.arrayBuffer();
        const base64Image = Buffer.from(imageArrayBuffer).toString('base64');

        // 返回 Base64 数据给前端
        res.status(200).json({ image_base64: base64Image });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};