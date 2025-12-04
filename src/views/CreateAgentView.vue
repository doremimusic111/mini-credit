<template>
  <section
    class="h-screen flex flex-col rounded-xl border border-slate-800
           bg-slate-900/70 backdrop-blur-sm p-4"
  >
    <header v-if="isDevelopment" class="mb-3 flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
          <span class="px-2 py-0.5 text-[10px] rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            v1.0.1
          </span>
        </div>
        <p class="text-xs text-slate-400">
          Telegram 用户：<span v-if="username">@{{ username }}</span>
          <span v-else class="italic">检测中…</span>
        </p>
      </div>
      <button
        class="px-3 py-1 text-xs rounded-full border border-slate-700 hover:bg-slate-800 ml-3"
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
    <div v-else class="relative flex-1 min-h-0">
      <iframe
        ref="iframeRef"
        class="h-full w-full rounded-lg border border-slate-800"
        :src="iframeSrc"
        frameborder="0"
        allow="clipboard-read; clipboard-write; fullscreen"
        @load="onIframeLoad"
        @error="onIframeError"
      />
      <!-- Loading overlay for iframe -->
      <div
        v-if="iframeLoading"
        class="absolute inset-0 grid place-items-center bg-slate-900/80 backdrop-blur-sm rounded-lg"
      >
        <div class="flex flex-col items-center gap-2 text-xs text-slate-400">
          <span class="h-7 w-7 border-2 border-slate-600 border-t-brand-primary rounded-full animate-spin" />
          <span>正在加载页面…</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTelegramWebApp } from '@/composables/useTelegramWebApp';
import { fetchMiniCreditToken } from '@/api/creditClient';

const route = useRoute();

const { user, initData } = useTelegramWebApp();

const loading = ref(true);
const error = ref<string | null>(null);
const token = ref<string | null>(null);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeLoading = ref(false);

const username = computed(() => user.value?.username ?? null);
const isDevelopment = computed(() => import.meta.env.DEV);

// Map action parameter to URL path
function getActionPath(action: string | null | undefined): string {
  const actionMap: Record<string, string> = {
    'member-list': 'h5/member-list',
    'create-agent': 'h5/create-agent',
    'create-member': 'h5/create-member',
    'home': 'h5/home',
  };

  return actionMap[action || ''] || actionMap['member-list']; // Default to member-list
}

// Map action parameter to page title
function getPageTitle(action: string | null | undefined): string {
  const titleMap: Record<string, string> = {
    'member-list': '下级列表',
    'create-agent': '新增代理',
    'create-member': '新增会员',
    'home': '信用系统',
  };

  return titleMap[action || ''] || titleMap['member-list']; // Default to member-list
}

const pageTitle = computed(() => {
  const action = route.query.action as string | undefined;
  return getPageTitle(action);
});

const iframeSrc = computed(() => {
  if (!token.value) return 'about:blank';
  
  // Extract action from query parameters
  const action = route.query.action as string | undefined;
  const path = getActionPath(action);
  
  const backendUrl = import.meta.env.VITE_CDT_BACKEND_URL || 'https://admin-13.cdt515.com';
  const url = new URL(`${backendUrl}/${path}`);
  url.searchParams.set('token', token.value);
  const finalUrl = url.toString();
  
  return finalUrl;
});

// Watch for token changes to show loading spinner
watch(token, (newToken) => {
  if (newToken) {
    iframeLoading.value = true;
  }
});

function onIframeLoad() {
  console.log('[Iframe] Loaded successfully');
  iframeLoading.value = false;
  if (iframeRef.value) {
    try {
      // Try to access iframe content (may fail due to CORS)
      const iframeUrl = iframeRef.value.contentWindow?.location.href;
      console.log('[Iframe] Current iframe URL:', iframeUrl);
    } catch (e) {
      // Expected if CORS prevents access
      console.log('[Iframe] Cannot access iframe content (CORS), but iframe loaded');
    }
  }
}

function onIframeError() {
  console.error('[Iframe] Failed to load iframe');
  iframeLoading.value = false;
  error.value = '无法加载页面，请检查网络连接';
}

async function init() {
  loading.value = true;
  error.value = null;

  // Validate user data
  if (!user.value?.id || !initData.value) {
    error.value = 'Telegram WebApp user/initData not available';
    loading.value = false;
    return;
  }

  // Check if username is available
  if (!user.value.username) {
    error.value = 'Telegram 用户名不可用，请确保您的 Telegram 账户已设置用户名';
    loading.value = false;
    return;
  }

  try {
    const res = await fetchMiniCreditToken(user.value.id.toString());
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