<script lang="ts">
	import { onMount } from "svelte";
    /* @see https://github.com/mqttjs/MQTT.js/issues/1206 */
	import mqtt from "mqtt/dist/mqtt.min";
    import { MQTT_TOPIC } from "./consts";

    import type { MqttClient, IClientOptions } from "mqtt";

	const MQTT_HOST = "ws://b37.mqtt.one:8083/mqtt";
	const MQTT_QOS = 0;

	let mqttClient: MqttClient;
	export let powerValue = 0;
	export let username: string;
	export let password: string;

	function createMqttClient(): MqttClient {
		const clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);
		const options: IClientOptions = {
			keepalive: 60,
			clientId: clientId,
			protocolId: "MQTT",
			username,
			password,
			protocolVersion: 4,
			clean: true,
			reconnectPeriod: 1000,
			connectTimeout: 30 * 1000,
		};
		const client = mqtt.connect(MQTT_HOST, options);

		return client;
	}

	function handleMqttError(err: Error): void {
		console.log("Connection error: ", err);
		mqttClient.end();
	}

	function handleMqttConnect(): void {
		console.log("Client connected:" + mqttClient.options.clientId);
		mqttClient.subscribe(MQTT_TOPIC, { qos: MQTT_QOS });
	}

	function handleMqttReconnect(): void {
		console.log("Client reconnected:" + mqttClient.options.clientId);
		mqttClient.subscribe(MQTT_TOPIC, { qos: MQTT_QOS });
	}

	function handleMqttMessage(topic: string, message: string): void {
		if (topic === MQTT_TOPIC) {
			powerValue = Number(message.toString());
		}
	}

	function handleSliderInput(event: InputEvent): void {
		const slider = event.target as HTMLInputElement;
		const value = slider.value;
		powerValue = Number(value);
	}

	function handleSliderChange(event: InputEvent): void {
		const slider = event.target as HTMLInputElement;
		const value = slider.value;
		mqttClient.publish(MQTT_TOPIC, String(value));
        fetch("/api/power", { method: "POST",  body: JSON.stringify({  topic: MQTT_TOPIC, powerValue: value })});
	}

	onMount(() => {
		mqttClient = createMqttClient();

		mqttClient.on("error", handleMqttError);
		mqttClient.on("connect", handleMqttConnect);
		mqttClient.on("reconnect", handleMqttReconnect);
		mqttClient.on("message", handleMqttMessage);
	});
</script>

<div class="power">
	<h2 class="power__heading">Мощность:</h2>
	<div class="power__slider-container">
		<span class="power__value">{powerValue}%</span>
		<div class="power__slider-wrapper">
			<input
				class="power__slider"
				type="range"
				min="0"
				max="100"
				value={powerValue}
				on:input={handleSliderInput}
				on:change={handleSliderChange}
			/>
		</div>
	</div>
</div>

<style>
	.power {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		flex-direction: column;
	}

	.power__heading {
		font-size: 1.5rem;
	}

	.power__slider-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.power__value {
		font-size: 2.75rem;
		margin-right: 1rem;
	}

	.power__slider-wrapper {
		flex: 1;
	}

	.power__slider {
		width: 100%;
	}
</style>
