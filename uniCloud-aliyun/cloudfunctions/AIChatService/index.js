'use strict';
const OpenAI = require('openai'); // 引入 OpenAI SDK

const client = new OpenAI({
	apiKey: "sk-lcqERTnS828vzCc927NtBsB1BTt0rFpXktod3al0Eniwzk7j", // 从环境变量中获取 API 密钥
	baseURL: "https://api.moonshot.cn/v1",
});

// 我们将 System Messages 单独放置在一个列表中，这是因为每次请求都应该携带 System Messages
const systemMessages = [{
	role: "system",
	content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
}, ];

// 我们定义一个全局变量 messages，用于记录我们和 Kimi 大模型产生的历史对话消息
// 在 messages 中，既包含我们向 Kimi 大模型提出的问题（role=user），也包括 Kimi 大模型给我们的回复（role=assistant）
// messages 中的消息按时间顺序从小到大排列
let messages = [];

async function makeMessages(input, n = 20) {
	/**
	 * 使用 make_messages 控制每次请求的消息数量，使其保持在一个合理的范围内，例如默认值是 20。在构建消息列表
	 * 的过程中，我们会先添加 System Prompt，这是因为无论如何对消息进行截断，System Prompt 都是必不可少的
	 * 内容，再获取 messages —— 即历史记录中，最新的 n 条消息作为请求使用的消息，在大部分场景中，这样
	 * 能保证请求的消息所占用的 Tokens 数量不超过模型上下文窗口。
	 */
	// 首先，我们将用户最新的问题构造成一个 message（role=user），并添加到 messages 的尾部
	messages.push({
		role: "user",
		content: input,
	});

	// newMessages 是我们下一次请求使用的消息列表，现在让我们来构建它
	let newMessages = [];

	// 每次请求都需要携带 System Messages，因此我们需要先把 systemMessages 添加到消息列表中；
	// 注意，即使对消息进行截断，也应该注意保证 System Messages 仍然在 messages 列表中。
	newMessages = systemMessages.concat(newMessages);

	// 在这里，当历史消息超过 n 条时，我们仅保留最新的 n 条消息
	if (messages.length > n) {
		messages = messages.slice(-n);
	}

	newMessages = newMessages.concat(messages);
	return newMessages;
}

async function chat(input) {
	/**
	 * chat 函数支持多轮对话，每次调用 chat 函数与 Kimi 大模型对话时，Kimi 大模型都会”看到“此前已经
	 * 产生的历史对话消息，换句话说，Kimi 大模型拥有了记忆。
	 */

	// 携带 messages 与 Kimi 大模型对话
	const completion = await client.chat.completions.create({
		model: "moonshot-v1-8k",
		messages: await makeMessages(input),
		temperature: 0.3,
	});

	// 通过 API 我们获得了 Kimi 大模型给予我们的回复消息（role=assistant）
	const assistantMessage = completion.choices[0].message;

	// 为了让 Kimi 大模型拥有完整的记忆，我们必须将 Kimi 大模型返回给我们的消息也添加到 messages 中
	messages.push(assistantMessage);

	console.log(" assistantMessage.content" + assistantMessage.content)
	return assistantMessage.content;
}

exports.main = async (event, context) => {
	console.log('event : ', event);

	try {
		const response = await chat(event.input);
		// 返回数据给客户端
		return {
			content: response
		};
	} catch (error) {
		console.error('API调用失败', error);
		//根据不同错误信息返回给用户
		let errorMessage = '对不起，我无法处理你的请求。';
		if (error.message.includes('429')) {
			errorMessage += ' 请求太频繁，请稍后再试。';
		} else if (error.message.includes('401')) {
			errorMessage += '身份验证失败，请确认身份后重新尝试'
		} else {
			errorMessage += ' 请稍后重试。';
		}

		return {
			content: errorMessage,
			error: error.message
		};
	}
};