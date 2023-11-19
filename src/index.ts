import { readFileSync } from 'node:fs';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { nanoid } from 'nanoid';
import axiosRetry from 'axios-retry';
import type {
	SendMessageResponse,
	RegisterNumberResponse,
	LookupPhoneNumber,
	SendMessageWithMediaParams,
	LookupPhoneNumberParams,
	RegisterNumberParams,
	SendMessageParams,
} from './types';

export * from './types';

/**
 * ByteFlow API Wrapper
 *
 * @see {@link https://docs.byteflow.app/} for more information
 *
 * @example With JavaScript / CommonJS
 * ```js
 * const ByteFlow = require('byteflow');
 * const byteflow = new ByteFlow('API_KEY');
 * ```
 *
 * @example With TypeScript / ES6
 * ```ts
 * import ByteFlow from 'byteflow';
 * const byteflow = new ByteFlow('API_KEY');
 * ```
 *
 * @param API_KEY - Your ByteFlow API Key
 * @returns ByteFlow Instance
 *
 */
export class ByteFlow {
	private readonly BASE_URL = 'https://api.byteflow.app';
	private readonly API_KEY: string | undefined = undefined;
	private readonly client: AxiosInstance;
	constructor(API_KEY: string) {
		this.API_KEY = API_KEY;
		this.client = axios.create();

		axiosRetry(this.client, {
			retries: 3,
			retryDelay: (retryCount, error) => error.response?.headers['retry-after'] * 1000,
			retryCondition: (error) => {
				if (axiosRetry.isNetworkOrIdempotentRequestError(error)) return true;
				switch (error.response?.status) {
					case 420:
						return true;
					default:
						return false;
				}
			},
		});
	}

	/**
	 * Send a message to a number
	 * @param messageContent - The content of the message you want to send
	 * @param destinationNumber - The number you want to send the message to
	 * @returns A promise containing the response from the API - see {@link SendMessageResponse}
	 */

	public async sendMessage({ messageContent, destinationNumber }: SendMessageParams): Promise<SendMessageResponse> {
		if (this.API_KEY === undefined) throw new Error('API KEY IS NOT DEFINED');
		try {
			const res = await this.client.post<SendMessageResponse>(
				`${this.BASE_URL}/sendMessage`,
				{
					destination_number: destinationNumber,
					message_content: messageContent,
				},
				{
					headers: {
						api_key: this.API_KEY,
						'Retry-Id': nanoid(),
					},
					validateStatus: (status) => status < 500,
				}
			);

			return res.data;
		} catch (error) {
			console.error(error);
			throw new Error("Couldn't send message - see logs");
		}
	}

	/**
	 * Register a number
	 * @param phoneNumber - The number you want to register
	 * @returns A promise containing the response from the API - see {@link RegisterNumberResponse}
	 */

	public async registerNumber({ phoneNumber }: RegisterNumberParams): Promise<RegisterNumberResponse> {
		if (this.API_KEY === undefined) throw new Error('API KEY IS NOT DEFINED');
		try {
			const res = await this.client.post<RegisterNumberResponse>(
				`${this.BASE_URL}/registerNumber`,
				{
					phone_number: phoneNumber,
				},
				{
					headers: {
						api_key: this.API_KEY,
					},
					validateStatus: (status) => status < 500,
				}
			);
			return res.data;
		} catch (error) {
			console.error(error);
			throw new Error("Couldn't register number - see logs");
		}
	}

	/**
	 * Lookup a number
	 * @param phoneNumber - The number you want to lookup
	 * @param advancedMode - Whether you want to use advanced mode or not
	 * @returns A promise containing the response from the API - see {@link LookupPhoneNumber}
	 */

	public async lookupPhoneNumber({ phoneNumber, advancedMode }: LookupPhoneNumberParams): Promise<LookupPhoneNumber> {
		if (this.API_KEY === undefined) throw new Error('API KEY IS NOT DEFINED');
		try {
			const res = await this.client.get<LookupPhoneNumber>(
				`${this.BASE_URL}/lookupNumber?phone_number=${phoneNumber}${
					advancedMode === true ? '&advanced_mode=true' : ''
				}`,
				{
					headers: {
						api_key: this.API_KEY,
					},
					validateStatus: (status) => status < 500,
				}
			);
			return res.data;
		} catch (error) {
			console.error(error);
			throw new Error("Couldn't lookup number - see logs");
		}
	}

	/**
	 * Send a message with media
	 * @param messageContent - The content of the message you want to send
	 * @param destinationNumber - The number you want to send the message to
	 * @param mediaPath - The path to the media you want to send
	 * @returns A promise containing the response from the API - see {@link SendMessageResponse}
	 */

	public async sendMessageWithMedia({
		messageContent,
		destinationNumber,
		mediaPath,
	}: SendMessageWithMediaParams): Promise<SendMessageResponse> {
		try {
			const preSignedURLRequest = await this.client.post<{ uploadURL: string; getURL: string }>(
				`${this.BASE_URL}/uploadMedia`,
				{
					filename: mediaPath.substring(mediaPath.lastIndexOf('/') + 1),
				},
				{
					headers: {
						api_key: this.API_KEY,
					},
				}
			);
			const uploadURL: string = preSignedURLRequest.data.uploadURL;
			const getURL: string = preSignedURLRequest.data.getURL;
			const file = readFileSync(mediaPath);
			await this.client.put(uploadURL, file);
			const res = await this.sendMessage({
				messageContent: `${messageContent} ${getURL}`,
				destinationNumber,
			});
			return res;
		} catch (error) {
			console.error(error);
			throw new Error("Couldn't send message with media - see logs");
		}
	}
}
