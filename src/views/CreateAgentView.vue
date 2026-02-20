<template>
  <section
    class="flex h-screen flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm"
  >
    <header v-if="isDevelopment" class="mb-3 flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
          <span
            class="bg-brand-primary/20 text-brand-primary border-brand-primary/30 rounded-full border px-2 py-0.5 text-[10px]"
          >
            v1.0.1
          </span>
        </div>
        <p class="text-xs text-slate-400">
          {{ platformLabel }}：
          <span v-if="displayName">{{ displayName }}</span>
          <span v-else class="italic">检测中…</span>
        </p>
      </div>
      <button
        class="ml-3 rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
        @click="init"
      >
        重新连接
      </button>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="grid flex-1 place-items-center text-xs text-slate-400">
      <div class="flex flex-col items-center gap-2">
        <span
          class="border-t-brand-primary h-7 w-7 animate-spin rounded-full border-2 border-slate-600"
        />
        <span>{{ loadingText }}</span>
      </div>
    </div>

    <!-- 404 - User not found -->
    <NotFoundView v-else-if="isNotFound" />

    <!-- Error state -->
    <div v-else-if="error" class="grid flex-1 place-items-center text-xs text-red-400">
      <div class="flex flex-col items-center gap-2">
        <span>⚠ {{ error }}</span>
        <button
          class="bg-brand-primary hover:bg-brand-primary-dark rounded-full px-3 py-1 text-xs"
          @click="init"
        >
          重试
        </button>
      </div>
    </div>

    <!-- Iframe with kkcbot UI -->
    <div v-else class="relative min-h-0 flex-1">
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
        class="absolute inset-0 grid place-items-center rounded-lg bg-slate-900/80 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-2 text-xs text-slate-400">
          <span
            class="border-t-brand-primary h-7 w-7 animate-spin rounded-full border-2 border-slate-600"
          />
          <span>正在加载页面…</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlatformAuth } from '@/composables/usePlatformAuth';
import { fetchCreditSession } from '@/api/creditClient';
import NotFoundView from '@/components/NotFoundView.vue';

const route = useRoute();

const {
  platform,
  displayName,
  isReady,
  hasError,
  authError,
  fetchToken,
  telegramUser,
} = usePlatformAuth();

const loading = ref(true);
const error = ref<string | null>(null);
const token = ref<string | null>(null);
const url = ref<string | null>(null);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeLoading = ref(false);
const isNotFound = ref(false);

const platformLabel = computed(() =>
  platform.value === 'line' ? 'Line 用户' : 'Telegram 用户'
);
const loadingText = computed(() =>
  platform.value ? '正在连接到 kkcbot…' : '正在检测平台…'
);
const isDevelopment = computed(() => import.meta.env.DEV);

// Map action parameter to URL path
function getActionPath(action: string | null | undefined): string {
  const actionMap: Record<string, string> = {
    'agent-list': 'h5/agent-list',
    'create-agent': 'h5/create-agent',
    'create-member': 'h5/create-member',
    home: 'h5/home',
    'member-list': 'h5/member-list',
  };
  return actionMap[action || ''] || actionMap['member-list'];
}

function getPageTitle(action: string | null | undefined): string {
  const titleMap: Record<string, string> = {
    'agent-list': '修改配置',
    'create-agent': '新增代理',
    'create-member': '新增会员',
    home: '信用系统',
    'member-list': '下级列表',
  };
  return titleMap[action || ''] || titleMap['member-list'];
}

const pageTitle = computed(() => getPageTitle(route.query.action as string | undefined));

const iframeSrc = computed(() => {
  if (!token.value || !url.value) return 'about:blank';
  const action = route.query.action as string | undefined;
  const path = getActionPath(action);
  const frontendUrl = new URL(`${url.value!}/${path}`);
  frontendUrl.searchParams.set('token', token.value);
  return frontendUrl.toString();
});

watch(token, (newToken) => {
  if (newToken) iframeLoading.value = true;
});

function onIframeLoad() {
  iframeLoading.value = false;
}

function onIframeError() {
  iframeLoading.value = false;
  error.value = '无法加载页面，请检查网络连接';
}

async function init() {
  loading.value = true;
  error.value = null;
  isNotFound.value = false;

  // Wait for platform to be ready (Telegram or Line)
  if (!isReady.value) {
    error.value = authError.value || '请从 Telegram 或 Line 打开此应用';
    loading.value = false;
    return;
  }

  // Telegram-specific: require username
  if (platform.value === 'telegram' && !telegramUser.value?.username) {
    error.value = 'Telegram 用户名不可用，请确保您的 Telegram 账户已设置用户名';
    loading.value = false;
    return;
  }

  try {
    const sanctumToken = await fetchToken();
    if (!sanctumToken) {
      error.value = authError.value || '认证失败';
      return;
    }

    const res = await fetchCreditSession(sanctumToken);
    if (res.code === 404) {
      isNotFound.value = true;
      return;
    }

    token.value = res.data.token;
    url.value = res.data.url;
  } catch (e: unknown) {
    console.error(e);
    const err = e as { response?: { data?: { code?: number }; status?: number }; message?: string };
    if (err?.response?.data?.code === 404 || err?.response?.status === 404) {
      isNotFound.value = true;
      return;
    }
    error.value = err?.message ?? 'Unexpected error';
  } finally {
    loading.value = false;
  }
}

// Run init when platform becomes ready
watch(
  isReady,
  (ready) => {
    if (ready) init();
  },
  { immediate: true }
);

onMounted(() => {
  if (hasError.value) error.value = authError.value ?? null;
});
</script>
