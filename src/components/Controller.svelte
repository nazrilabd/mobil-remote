<script>
    import { publishMessage } from '$lib/mqtt/mqtt';
    import { TOPICS } from '$lib/constants/topics';

    const sendCommand = (direction) => {
        publishMessage(TOPICS.CONTROL, direction);
    };
</script>

<div class="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-lg shadow-blue-900/10 flex justify-center items-center h-full">
    <div class="grid grid-cols-3 gap-3">
        <div></div>
        
        <!-- Forward -->
        <button 
            onmousedown={() => sendCommand('forward')} 
            ontouchstart={() => sendCommand('forward')}
            onmouseup={() => sendCommand('stop')}
            onmouseleave={() => sendCommand('stop')}
            ontouchend={() => sendCommand('stop')}
            class="w-16 h-16 bg-slate-700 hover:bg-blue-600 text-white rounded-xl shadow transition-colors active:scale-95 flex items-center justify-center text-2xl font-bold"
        >↑</button>
        
        <div></div>
        
        <!-- Left -->
        <button 
            onmousedown={() => sendCommand('left')} 
            ontouchstart={() => sendCommand('left')}
            onmouseup={() => sendCommand('stop')}
            onmouseleave={() => sendCommand('stop')}
            ontouchend={() => sendCommand('stop')}
            class="w-16 h-16 bg-slate-700 hover:bg-blue-600 text-white rounded-xl shadow transition-colors active:scale-95 flex items-center justify-center text-2xl font-bold"
        >←</button>
        
        <!-- Stop (Tetap manual) -->
        <button 
            onclick={() => sendCommand('stop')} 
            class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-colors active:scale-95 flex items-center justify-center text-sm font-bold tracking-wider"
        >STOP</button>
        
        <!-- Right -->
        <button 
            onmousedown={() => sendCommand('right')} 
            ontouchstart={() => sendCommand('right')}
            onmouseup={() => sendCommand('stop')}
            onmouseleave={() => sendCommand('stop')}
            ontouchend={() => sendCommand('stop')}
            class="w-16 h-16 bg-slate-700 hover:bg-blue-600 text-white rounded-xl shadow transition-colors active:scale-95 flex items-center justify-center text-2xl font-bold"
        >→</button>
        
        <div></div>
        
        <!-- Backward -->
        <button 
            onmousedown={() => sendCommand('backward')} 
            ontouchstart={() => sendCommand('backward')}
            onmouseup={() => sendCommand('stop')}
            onmouseleave={() => sendCommand('stop')}
            ontouchend={() => sendCommand('stop')}
            class="w-16 h-16 bg-slate-700 hover:bg-blue-600 text-white rounded-xl shadow transition-colors active:scale-95 flex items-center justify-center text-2xl font-bold"
        >↓</button>
        
        <div></div>
    </div>
</div>