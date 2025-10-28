document.getElementById('generate-btn').addEventListener('click', async () => {
    const prompt = document.getElementById('logo-prompt').value;
    const resultDiv = document.getElementById('logo-result');
    
    if (!prompt) {
        resultDiv.innerHTML = '<p style="color: red;">请输入 Logo 描述！</p>';
        return;
    }

    resultDiv.innerHTML = '<p>正在努力生成中，请稍候...</p>';
    
    try {
        // !!! 关键：向 Vercel 部署的鉴权代理发起请求 !!!
        // Vercel 会自动将 /api/generate 路由到 api/generate.js
        const response = await fetch('/api/generate', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        // 检查是否成功返回了图片数据
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red;">生成失败: ${data.error}</p>`;
            return;
        }

        if (data.image_base64) {
            // 千帆接口通常返回 Base64 编码的图片数据
            resultDiv.innerHTML = `<img src="data:image/png;base64,${data.image_base64}" alt="Generated Logo" class="generated-img">`;
        } else {
            resultDiv.innerHTML = `<p style="color: red;">模型返回数据格式错误。</p>`;
        }
        
    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.innerHTML = `<p style="color: red;">网络请求失败，请检查服务器状态。</p>`;
    }
});