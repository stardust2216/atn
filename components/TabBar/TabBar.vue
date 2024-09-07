<template>
  <view class="tab-bar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index" 
      :class="['tab-bar-item', { active: currentTab === index }]" 
      @click="switchTab(index)"
    >
      <image :src="currentTab === index ? item.selectedIcon : item.icon" class="icon"></image>
      <text class="text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 0, // 当前选中的 tab 索引
      tabList: [
        {
          text: "首页",
          icon: "/static/icons/index.png",
          selectedIcon: "/static/icons/index1.png",
          pagePath: "/pages/index/index"
        },
        {
          text: "交易",
          icon: "/static/icons/currency.png",
          selectedIcon: "/static/icons/currency1.png",
          pagePath: "/pages/transaction/transaction"
        },
        {
          text: "智能识图",
          icon: "/static/icons/identification.png",
          selectedIcon: "/static/icons/identification1.png",
          pagePath: "/pages/identification/identification"
        },
        {
          text: "AI 问答",
          icon: "/static/icons/ai.png",
          selectedIcon: "/static/icons/ai1.png",
          pagePath: "/pages/artificial_intelligence/artificial_intelligence"
        },
        {
          text: "个人中心",
          icon: "/static/icons/user.png",
          selectedIcon: "/static/icons/user1.png",
          pagePath: "/pages/user/user"
        }
      ]
    };
  },
  methods: {
    switchTab(index) {
      this.currentTab = index; // 更新当前选中 tab 的索引
      uni.navigateTo({ // 使用 uni-app 的导航功能切换页面
        url: this.tabList[index].pagePath
      });
    }
  }
};
</script>

<style>
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #E0EFD4;
  border-top: 1px solid #d1e7c5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

.tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6B8E23;
  transition: all 0.3s ease;
}

.tab-bar-item.active {
  color: #4CAF50;
  transform: scale(1.1);
}

.icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
  transition: all 0.3s ease;
}

.text {
  font-size: 12px;
  font-weight: bold;
  transition: color 0.3s ease;
}
</style>