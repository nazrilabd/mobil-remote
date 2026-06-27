<script>
    import { onMount } from 'svelte';

    let inputUrl = $state("");
    let activeUrl = $state("");
    let hasError = $state(false);

    onMount(() => {
        const savedUrl = localStorage.getItem('cameraUrl');
        if (savedUrl) {
            inputUrl = savedUrl;
            activeUrl = savedUrl;
        }
    });

    function applyUrl() {
        activeUrl = inputUrl;
        hasError = false;
        localStorage.setItem('cameraUrl', inputUrl);
    }
</script>

<!-- Menggunakan fixed inset-0 agar memenuhi layar HP -->
<div class="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
    
    {#if activeUrl && !hasError}
        <!-- Stream Full Screen -->
        <img 
            src="{activeUrl}/video" 
            alt="Live Stream"
            class="w-full h-full object-cover"
            onerror={() => hasError = true}
        />
    {:else}
        <!-- Form Input Saat Pertama Kali/Error -->
        <div class="bg-slate-900/90 p-8 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm flex flex-col gap-4 z-50">
            <h3 class="text-white font-bold text-lg text-center">Setup Camera</h3>
            <input 
                type="text" 
                bind:value={inputUrl}
                placeholder="https://ngrok-url..."
                class="bg-black border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
                onclick={applyUrl}
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
                Connect Stream
            </button>
            {#if hasError}
                <p class="text-red-400 text-xs text-center">Koneksi gagal. Cek URL Anda!</p>
            {/if}
        </div>
    {/if}

</div>