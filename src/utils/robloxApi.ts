import axios from 'axios';

const STARLITY_STUDIOS_GROUP_ID = 323678018;

export interface RobloxUserInfo {
    id: number;
    name: string;
    displayName: string;
    created: string;
    isBanned: boolean;
    description: string;
}

export interface RobloxThumbnailInfo {
    state: string;
    imageUrl: string;
}

export interface RobloxGroupRole {
    group: {
        id: number;
        name: string;
        memberCount: number;
    };
    role: {
        id: number;
        name: string;
        rank: number;
    };
}

export const fetchRobloxUser = async (userId: string | number): Promise<RobloxUserInfo | null> => {
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchRobloxThumbnail = async (userId: string | number): Promise<string | null> => {
    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0].imageUrl;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const checkStarlityMembership = async (userId: string | number): Promise<RobloxGroupRole | null> => {
    try {
        const response = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
        if (response.data && response.data.data) {
            const groupData = response.data.data.find((g: RobloxGroupRole) => g.group.id === STARLITY_STUDIOS_GROUP_ID);
            return groupData || null;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export interface RobloxServerInfo {
    id: string;
    maxPlayers: number;
    playing: number;
    ping: number;
    fps: number;
}

export const fetchGameServers = async (placeId: string | number): Promise<RobloxServerInfo[]> => {
    try {
        const response = await axios.get(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=100`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        return [];
    }
};

export const publishAnnouncement = async (universeId: string | number, message: string): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        const response = await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${universeId}/topics/DiscordAnnouncements`,
            { message },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.status === 200;
    } catch (error) {
        console.error('[Roblox API Publish Error]', error);
        return false;
    }
};

export const publishPrivateAnnouncement = async (universeId: string | number, userId: string | number, message: string, isServerWide: boolean): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        const payload = JSON.stringify({
            userId: userId.toString(),
            message: message,
            isServerWide: isServerWide
        });

        const response = await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${universeId}/topics/PrivateAnnouncement`,
            { message: payload },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.status === 200;
    } catch (error: any) {
        console.error('[Roblox API Private Publish Error]', error.response?.data || error.message || error);
        return false;
    }
};

export const publishDebugRequest = async (universeId: string | number, userId: string | number): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        // We send the userId as the message payload
        const response = await axios.post(
            `https://apis.roblox.com/messaging-service/v1/universes/${universeId}/topics/ServerDebug`,
            { message: userId.toString() },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.status === 200;
    } catch (error: any) {
        console.error('[Roblox API Debug Publish Error]', error.response?.data || error.message || error);
        return false;
    }
};

export const banUserInDatastore = async (universeId: string | number, userId: string | number, reason: string, durationHours: number): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        const bannedAt = Math.floor(Date.now() / 1000);
        const expiresAt = bannedAt + Math.floor(durationHours * 3600);

        const payload = {
            bannedAt,
            expiresAt,
            reason
        };
        const payloadString = JSON.stringify(payload);
        const md5Hash = require('crypto').createHash('md5').update(payloadString).digest('base64');

        const response = await axios.post(
            `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry?datastoreName=AdminBans_v1&entryKey=ban_${userId}`,
            payloadString,
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'content-md5': md5Hash
                }
            }
        );

        return response.status === 200;
    } catch (error: any) {
        console.error('[Roblox API Datastore Error]', error.response?.data || error.message || error);
        return false;
    }
};

export const unbanUserInDatastore = async (universeId: string | number, userId: string | number): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        const response = await axios.delete(
            `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry?datastoreName=AdminBans_v1&entryKey=ban_${userId}`,
            {
                headers: {
                    'x-api-key': apiKey
                }
            }
        );

        return response.status === 200 || response.status === 204;
    } catch (error: any) {
        console.error('[Roblox API Datastore Delete Error]', error.response?.data || error.message || error);
        return false;
    }
};

export const fetchDatastoreEntry = async (universeId: string | number, datastoreName: string, entryKey: string): Promise<any | null> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return null;
        }

        const response = await axios.get(
            `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry?datastoreName=${datastoreName}&entryKey=${entryKey}`,
            {
                headers: {
                    'x-api-key': apiKey
                }
            }
        );

        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null; // Entry doesn't exist
        }
        console.error('[Roblox API Fetch Datastore Error]', error.response?.data || error.message || error);
        return null;
    }
};

export const updateDatastoreEntry = async (universeId: string | number, datastoreName: string, entryKey: string, payload: any): Promise<boolean> => {
    try {
        const apiKey = process.env.ROBLOX_API_KEY;
        if (!apiKey || apiKey === 'paste_your_open_cloud_api_key_here') {
            console.error('[Roblox API] Missing or invalid ROBLOX_API_KEY in .env');
            return false;
        }

        const payloadString = JSON.stringify(payload);
        const md5Hash = require('crypto').createHash('md5').update(payloadString).digest('base64');

        const response = await axios.post(
            `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry?datastoreName=${datastoreName}&entryKey=${entryKey}`,
            payloadString,
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'content-md5': md5Hash
                }
            }
        );

        return response.status === 200;
    } catch (error: any) {
        console.error('[Roblox API Update Datastore Error]', error.response?.data || error.message || error);
        return false;
    }
};

