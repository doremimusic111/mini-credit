<template>
  <div class="flex-1 grid place-items-center text-slate-400">
    <div class="flex flex-col items-center gap-6 px-4">
      <!-- 404 text -->
      <div class="text-8xl font-bold text-slate-400 mb-2">404</div>
      
      <!-- 404 image -->
      <img src="@/assets/404.png" alt="404" class="max-w-lg w-full h-auto" />
      
      <!-- Message -->
      <div class="flex flex-col items-center gap-2 text-center">
        <span class="text-lg font-semibold text-slate-300">账号不存在</span>
        <span class="text-sm text-slate-500 max-w-xs">
          您的 Telegram 账号尚未注册，请联系管理员
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Not Found component
</script>

