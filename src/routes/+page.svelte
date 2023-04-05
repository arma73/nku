<script lang="ts">
    import Mqttjs from "./MQTT.svelte";

	import type { PageData } from './$types';

	export let data: PageData;
</script>
    
<Mqttjs powerValue={data.value}></Mqttjs>