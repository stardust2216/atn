<template>
	<view class="profile-page">
		<image :src="user.avatar" class="avatar" />
		<text class="username">{{ user.userName }}</text>
		<text class="info">性别: {{ user.gender }}</text>
		<text class="info">年龄: {{ user.age }}</text>
		<text class="info">电话: {{ user.phone }}</text>
		<!-- 会话记录展示 -->
		<view class="chat-history">
			<text class="chat-title">会话记录：</text>
			<scroll-view class="chat-records">
				<view v-for="(record, index) in user.chatRecords" :key="index" class="chat-record">
					<text>{{ record.content }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, onActivated } from 'vue';

	const user = ref({});

	const loadUserData = async () => {
		// 调用云函数获取用户数据
		const result = await uniCloud.callFunction({
			name: 'getUser',
			data: {
				// 传递用户ID
				_id: "66d9adb72139290eedb86207"
			}
		});

		// 设置用户数据
		//注意，返回的数据中，result.result.data[0]才能得到用户数据
		user.value = result.result.data[0];
		console.log(result);
		console.log(result.result);
		console.log(result.result.data);
		console.log(user);
		console.log(user.value);
	};

	onMounted(() => {
		loadUserData();
	});

	onActivated(() => {
		loadUserData();
	});
</script>

<style scoped>
	.profile-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
	}

	.avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin-bottom: 10px;
	}

	.username {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.info {
		font-size: 16px;
		margin-bottom: 5px;
	}

	.chat-history {
		margin-top: 20px;
		width: 100%;
	}

	.chat-title {
		font-size: 18px;
		font-weight: bold;
	}

	.chat-records {
		max-height: 200px;
		overflow-y: auto;
	}

	.chat-record {
		padding: 5px;
		border-bottom: 1px solid #ddd;
	}
</style>