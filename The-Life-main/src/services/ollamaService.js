import axios from 'axios'

const ollamaApi = axios.create({
  baseURL: 'http://localhost:11434/api',
  timeout: 30000
})

export const generateRoute = async (userInfo, context) => {
  try {
    const response = await ollamaApi.post('/generate', {
      model: 'llama3',
      prompt: `基于用户信息和当前情境，生成3-5条人生路线建议。\n\n用户信息：${JSON.stringify(userInfo)}\n当前情境：${context}\n\n每条路线应包含：\n1. 路线名称\n2. 详细描述\n3. 可行性（0-100%）\n4. 难度等级\n5. 预期收益\n6. 适合的人格类型\n\n请以JSON格式返回结果。`,
      format: 'json',
      stream: false
    })
    return response.data
  } catch (error) {
    console.error('Error generating route:', error)
    // 返回默认路线
    return {
      routes: [
        {
          title: '稳定职业发展',
          description: '专注于当前职业，通过持续学习和努力工作获得晋升机会。',
          feasibility: 85,
          difficulty: '中等',
          benefit: '稳定增长',
          personality: '风险规避型'
        },
        {
          title: '创业冒险',
          description: '利用自身技能和资源，创办自己的事业。',
          feasibility: 45,
          difficulty: '高',
          benefit: '潜在高回报',
          personality: '风险偏好型'
        },
        {
          title: '继续教育',
          description: '回到学校深造，获取更高学历或专业技能。',
          feasibility: 70,
          difficulty: '中等',
          benefit: '长期职业竞争力',
          personality: '学习型'
        }
      ]
    }
  }
}

export const getAIAdvice = async (question, context) => {
  try {
    const response = await ollamaApi.post('/generate', {
      model: 'llama3',
      prompt: `作为人生顾问，回答用户问题：${question}\n\n当前情境：${context}\n\n请提供详细、有深度的建议，结合现实因素和个人发展。`,
      stream: false
    })
    return response.data.response
  } catch (error) {
    console.error('Error getting AI advice:', error)
    return '感谢你的问题，我会认真思考并给你最适合的建议。'
  }
}

export const generateScenario = async (userInfo) => {
  try {
    const response = await ollamaApi.post('/generate', {
      model: 'llama3',
      prompt: `基于用户信息生成一个情境化测评场景。\n\n用户信息：${JSON.stringify(userInfo)}\n\n场景应包含：\n1. 具体情境描述\n2. 3-4个选择选项\n3. 每个选项对应的决策风格\n\n请以JSON格式返回结果。`,
      format: 'json',
      stream: false
    })
    return response.data
  } catch (error) {
    console.error('Error generating scenario:', error)
    // 返回默认场景
    return {
      scenario: '你突然获得了10万元的意外收入，你会如何处理？',
      options: [
        {
          text: '存入银行，作为紧急储备金',
          style: '风险规避型'
        },
        {
          text: '投资基金，追求稳健增长',
          style: '平衡型'
        },
        {
          text: '投资股票，追求高回报',
          style: '风险偏好型'
        },
        {
          text: '用于学习或提升技能',
          style: '成长型'
        }
      ]
    }
  }
}

export const calculateRegret = async (lifePath) => {
  try {
    const response = await ollamaApi.post('/generate', {
      model: 'llama3',
      prompt: `基于用户的人生路径计算后悔值。\n\n人生路径：${JSON.stringify(lifePath)}\n\n请计算后悔指数（0-100）并提供详细分析。\n\n请以JSON格式返回结果，包含：\n1. regretLevel: 后悔指数\n2. regretText: 后悔评级文本\n3. analysis: 详细分析\n4. advice: 人生建议`,
      format: 'json',
      stream: false
    })
    return response.data
  } catch (error) {
    console.error('Error calculating regret:', error)
    // 返回默认值
    return {
      regretLevel: 30,
      regretText: '略有遗憾',
      analysis: '你的人生路径整体较为平衡，虽然有些小的遗憾，但总体方向正确。',
      advice: '继续保持当前的平衡状态，同时勇于尝试新的机会。'
    }
  }
}