
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'rb_device_id';

export const getDeviceId = (): string => {
    if (typeof window === 'undefined') return ''; // Server side

    // 1. Try to get from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // 2. If not found, create new one
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);

        // Also set as cookie for potential server reading? 
        // For now, client-side passing is explicit and enough for our API flow.
        document.cookie = `${DEVICE_ID_KEY}=${deviceId}; path=/; max-age=31536000; SameSite=Strict`;
    }

    return deviceId;
};
