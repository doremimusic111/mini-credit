<template>
  <section
    class="h-[80vh] flex flex-col rounded-xl border border-slate-800
           bg-slate-900/70 backdrop-blur-sm p-4"
  >
    <header class="mb-3 flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold">创建代理</h1>
        <p class="text-xs text-slate-400">
          Telegram 用户：<span v-if="username">@{{ username }}</span>
          <span v-else class="italic">检测中…</span>
        </p>
      </div>
      <button
        class="px-3 py-1 text-xs rounded-full border border-slate-700 hover:bg-slate-800"
        @click="init"
      >
        重新连接
      </button>
    </header>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex-1 grid place-items-center text-xs text-slate-400"
    >
      <div class="flex flex-col items-center gap-2">
        <span class="h-7 w-7 border-2 border-slate-600 border-t-brand-primary rounded-full animate-spin" />
        <span>正在连接到 kkcbot…</span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex-1 grid place-items-center text-xs text-red-400"
    >
      <div class="flex flex-col items-center gap-2">
        <span>⚠ {{ error }}</span>
        <button
          class="px-3 py-1 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-xs"
          @click="init"
        >
          重试
        </button>
      </div>
    </div>

    <!-- Iframe with kkcbot UI -->
    <iframe
      v-else
      class="flex-1 rounded-lg border border-slate-800"
      :src="iframeSrc"
      frameborder="0"
      allow="clipboard-read; clipboard-write; fullscreen"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTelegramWebApp } from '@/composables/useTelegramWebApp';
import { fetchMiniCreditToken } from '@/api/creditClient';

const { user, initData } = useTelegramWebApp();

const loading = ref(true);
const error = ref<string | null>(null);
const token = ref<string | null>(null);

const username = computed(() => user.value?.username ?? null);

const iframeSrc = computed(() => {
  if (!token.value) return 'about:blank';
  const backendUrl = import.meta.env.VITE_CDT_BACKEND_URL || 'https://admin-13.cdt515.com';
  const url = new URL(`${backendUrl}/h5/create-agent`);
  url.searchParams.set('token', token.value);
  return url.toString();
});

async function init() {
  console.log({user: user.value})
  loading.value = true;
  error.value = null;

  try {
    if (!user.value?.id || !initData.value) {
      throw new Error('Telegram WebApp user/initData not available');
    }

    const res = await fetchMiniCreditToken({
      account: user.value.id,
    });

    token.value = res.data.token;
  } catch (e: any) {
    console.error(e);
    error.value = e?.message ?? 'Unexpected error';
  } finally {
    loading.value = false;
  }
}

onMounted(init);
</script>