<template>
  <view class="chat-page">
    <!-- Chat Content Area -->
    <scroll-view class="chat-container" :scroll-y="true" :scroll-into-view="scrollIntoView">
      <view v-for="(message, index) in messages" :key="index" :id="'msg-' + index"
            :class="[message.role === 'user' ? 'user-message' : 'ai-message']">
        <view class="message-info">
          <image :src="message.avatar" class="avatar" />
          <view class="message-bubble">
            <!-- <text class="message-username">{{ message.username }}</text> -->
            <text class="message-content">
              <span v-for="(char, charIndex) in message.content" :key="charIndex" :id="'msg-' + index + '-' + charIndex">{{ char }}</span>
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>

  <!-- 输入区 -->
  <view class="input-container">
    <textarea v-model="userInput" placeholder="请输入你的问题" class="input-box" auto-height="true"></textarea>
    <button @click="sendMessage" :disabled="isSending" class="send-button">
    </button>
  </view>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';

const messages = reactive([]);
const userInput = ref('');
const isSending = ref(false);
const scrollIntoView = ref(''); // 新增变量，用于控制滚动

const sendMessage = async () => {
  if (userInput.value.trim() === '') return;

  // 添加用户消息
  addMessage('user', userInput.value, '/static/icons/avatar.png', '用户');

  // 清空输入框并锁定发送按钮
  const userMessage = userInput.value;
  userInput.value = '';
  isSending.value = true;

  // 添加“正在回复中...”的占位符
  const loadingMessage = {
    role: 'assistant',
    content: '正在生成回复中...',
    avatar: '/static/icons/robot.png',
    username: 'Kimi'
  };
  messages.push(loadingMessage);

  try {
    // 调用阿里云函数
    const result = await uniCloud.callFunction({
      name: 'AIChatService',
      data: {
        input: userMessage
      }
    });

    // 获取AI回复文本
    const assistantResponse = result.result.content;

    // 清除占位符消息
    loadingMessage.content = "";

    // 逐字显示助手的回复
    displayAssistantMessage(assistantResponse, loadingMessage);
	
	scrollToBottom()

  } catch (error) {
    console.error('调用云函数失败', error);
    loadingMessage.content = '对不起，无法处理你的请求。请稍后重试。';
  } finally{
	  scrollToBottom()
  }
};

// 逐字显示助手回复内容
const displayAssistantMessage = (fullContent, message) => {
    let index = 0;
    const interval = setInterval(() => {
        if (index < fullContent.length) {
            message.content += fullContent[index++];
            messages.splice(messages.length - 1, 1, { ...message });
            nextTick(() => {
                scrollIntoView.value = 'msg-' + (messages.length - 1) + '-' + index; // 设置滚动目标为当前显示的最后一个字的ID
            });
        } else {
            clearInterval(interval);
			nextTick(() => {
			  scrollIntoView.value = 'msg-' + (messages.length - 1); // 设置滚动目标为最后一条消息的ID
			});
			isSending.value = false;
            
        }
    }, 30);
};

const addMessage = (role, content, avatar, username) => {
  messages.push({ role, content, avatar, username });
  scrollToBottom(); // 每次添加消息后滚动到底部
};

// 更新scrollIntoView以滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    scrollIntoView.value = 'msg-' + (messages.length - 1); // 设置滚动目标为最后一条消息的ID
  });
};
</script>

<style scoped>
	.chat-page {
		display: flex;
		flex-direction: column;
		height: 70vh;
		overflow: hidden;
	}

	.chat-container {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
	}

	.input-container {
		display: flex;
		align-items: center;
		padding: 5px;
		background-color: #ffffff;
		border-top: 1px solid #ddd;
		height: 250rpx;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		/* 添加阴影效果 */
		border-radius: 8px;
		/* 添加圆角效果 */
		margin-left: 10rpx;
		margin-right: 10rpx;
		margin-bottom: 40rpx;
	}

	.input-box {
		flex: 1;
		padding: 20rpx;
		border: 1px solid #ddd;
		border-radius: 20rpx;
		margin-right: 10rpx;
		margin-left: 10rpx;
		overflow-y: auto;
		/* 确保允许垂直滚动 */
		max-height: 150rpx;
		/* 设置最大高度 */
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		/* 添加阴影效果 */
	}

	.send-button {
		background-image: url('/static/icons/send.png');
		background-size: contain;
		/* 确保图标按比例缩放 */
		background-position: center;
		background-repeat: no-repeat;
		background-size: 40rpx;
		/* 防止图标重复 */
		border: none;
		width: 70rpx;
		/* 调整按钮宽度 */
		height: 70rpx;
		/* 调整按钮高度 */
		padding: 8rpx 16rpx;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 10rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
		/* 添加阴影效果 */
	}

	.send-button:disabled {
		background-image: url('/static/icons/send1.png');
		/* 禁用时的图标 */
		cursor: not-allowed;
		opacity: 0.5;
		/* 可选：降低不透明度 */
	}

	.message-info {
		display: flex;
		align-items: flex-start;
		margin-bottom: 10px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 20px;
	}

	.user-message {
		justify-content: flex-end;
		flex-direction: row-reverse;
	}

	.user-message .message-info {
		flex-direction: row-reverse;
	}

	.user-message .message-bubble {
		background-color: #dcf8c6;
		border-radius: 10px;
		padding: 8px;
		max-width: 65%;
		margin-right: 25rpx;
		word-wrap: break-word;
		word-break: break-all;
	}

	.ai-message {
		justify-content: flex-start;
	}

	.ai-message .message-info {
		flex-direction: row;
	}

	.ai-message .message-bubble {
		background-color: #ffffff;
		border-radius: 10px;
		padding: 8px;
		max-width: 65%;
		border: 1px solid #ddd;
		word-wrap: break-word;
		word-break: break-all;
	}

	.message-bubble {
		display: flex;
		flex-direction: column;
		padding: 10px;
	}

	.message-username {
		font-weight: bold;
		margin-bottom: 5px;
	}

	.message-content {
		font-size: 14px;
	}
</style>