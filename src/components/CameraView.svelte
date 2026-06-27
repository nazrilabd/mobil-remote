<script>
    import { onMount } from 'svelte';

    let { inputUrl = $bindable(""), activeUrl = $bindable(""), hasError = $bindable(false) } = $props();

    // Deteksi apakah link adalah video MP4
    let isVideo = $derived(activeUrl.toLowerCase().endsWith('.mp4'));

    function applyUrl() {
        if (!inputUrl) return;
        activeUrl = inputUrl;
        hasError = false;
        localStorage.setItem('cameraUrl', inputUrl);
    }

    onMount(() => {
        const savedUrl = localStorage.getItem('cameraUrl');
        if (savedUrl) {
            inputUrl = savedUrl;
            activeUrl = savedUrl;
        }
    });
</script>

<div class="fixed inset-0 z-[100] flex items-start justify-center pt-4 bg-black/90 pointer-events-auto">
    
    {#if activeUrl && !hasError}
        <!-- Tampilkan Video jika link diakhiri .mp4, jika tidak pakai <img> untuk stream -->
        {#if isVideo}
            <video 
                src={activeUrl} 
                autoplay 
                loop 
                muted 
                playsinline
                class="w-full h-full object-cover"
                onerror={() => hasError = true}
            ></video> <!-- Perubahan di sini: Menggunakan tag penutup -->
        {:else}
            <img 
                src={activeUrl} 
                alt="Live Stream"
                class="w-full h-full object-cover"
                onerror={() => hasError = true}
            />
        {/if}

        <button 
            class="absolute top-4 right-4 bg-red-600/80 text-white px-4 py-2 rounded-lg text-sm z-[101]"
            onclick={() => { activeUrl = ""; }}
        >
            Reset URL
        </button>
    {:else}
        <!-- Form Input -->
        <div class="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl w-[90%] max-w-sm flex flex-col gap-4 z-[101]">
            <h3 class="text-white font-bold text-center text-sm">Setup Media/Stream</h3>
            
            <input 
                type="text" 
                bind:value={inputUrl}
                placeholder="https://... .mp4 atau IP Camera"
                class="bg-black border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none w-full text-base"
                style="pointer-events: auto !important;"
                onpointerdown={(e) => e.stopPropagation()}
                onclick={(e) => e.stopPropagation()}
            />
            
            <button 
                onclick={applyUrl}
                class="bg-blue-600 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform"
            >
                Connect
            </button>

            {#if hasError}
                <p class="text-red-400 text-xs text-center">Gagal memuat media. Cek URL!</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    input { touch-action: manipulation; }
</style>