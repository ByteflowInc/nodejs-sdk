export interface SendMessageResponse {
	sentWithRoute?: string;
	error?: string | Record<string, unknown>[];
}

export interface RegisterNumberResponse {
	data?: string;
	error?: string | Record<string, unknown>[];
}

export interface LookupPhoneNumber {
	// Basic mode
	is_voip: boolean;
	current_carrier_name: string;
	current_carrier_ocn: string;
	country: {
		name: string;
		dial_code: string;
		emoji: string;
		code: string;
	};
	// Advanced Mode
	original_ocn?: string;
	original_carrier_name?: string;
	ported?: boolean;
	is_landline?: boolean;
	is_mobile?: boolean;
	current_imsi?: string;
	current_mcc?: string;
	current_mnc?: string;
}

export interface SendMessageParams {
	messageContent: string;
	destinationNumber: string;
}

export interface SendMessageWithMediaParams {
	messageContent: string;
	destinationNumber: string;
	mediaPath: string;
}

export interface LookupPhoneNumberParams {
	phoneNumber: string;
	advancedMode?: boolean;
}

export interface RegisterNumberParams {
	phoneNumber: string;
}
