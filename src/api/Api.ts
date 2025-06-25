/* eslint-disable no-undef */ // because ts

type Microservice = 'auth' | 'hosts'

export interface HostDto {
    uuid: string
    only_friends: boolean
    allow_nonames: boolean
    friends: string[]
    banlist: string[]
}

class ApiImplError extends Error {
    constructor(statusCode: number) {
        super(`Client-side error, developer should investigate, unexpected status code=${statusCode}`)
        this.name = 'ApiImplError'
    }
}

export interface Api {
    register(): Promise<HostDto | '503 auth' | '503 hosts'>

    login(host_uuid: string): Promise<string | 404 | '503 auth'>

    renew(token: string): Promise<string | 401 | 404 | '503 auth'>

    getHost(host_uuid: string, token: string): Promise<HostDto | 401 | 404 | '503 auth' | '503 hosts'>

    setOnlyFriends(host_uuid: string, token: string, onlyFriends: boolean): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>

    setAllowNonames(host_uuid: string, token: string, allowNonames: boolean): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>

    befriend(host_uuid: string, token: string, friend_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>

    unfriend(host_uuid: string, token: string, former_friend_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>

    ban(host_uuid: string, token: string, banned_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>

    unban(host_uuid: string, token: string, banned_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'>
}

function code404(code: number): 404 {
    switch (code) {
        case 404:
            return code
        default:
            throw new ApiImplError(code)
    }
}

function code401or404(status: number): 401 | 404 {
    // noinspection FallThroughInSwitchStatementJS
    switch (status) {
        case 401:
        case 404:
            return status
        default:
            throw new ApiImplError(status)
    }
}

async function code503(response: Response): Promise<'503 auth' | '503 hosts' | null> {
    if (response.status !== 503) {
        return null
    }

    const not_working_service: Microservice = await response.text() as Microservice
    switch (not_working_service) {
        case 'auth':
            return '503 auth'
        case 'hosts':
            return '503 hosts'
        default:
            throw new TypeError()
    }
}

export class ApiImpl implements Api {
    _address: string

    constructor(address: string) {
        this._address = address
    }

    async register(): Promise<HostDto | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts`, {method: 'POST'})
        if (response.ok) {
            return await response.json()
        }
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        throw new Error()
    }

    async login(host_uuid: string): Promise<string | 404 | '503 auth'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/access_token`)
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        if (!response.ok) {
            return code404(response.status)
        }
        const tokenHolder: { token: string } = await response.json()
        return tokenHolder.token
    }

    async renew(token: string): Promise<string | 401 | 404 | '503 auth'> {
        const response = await fetch(`${this._address}/hosts/access_token/renew`, {
            headers: {'Authorization': `Bearer ${token}`}
        })
        if (!response.ok) {
            return code401or404(response.status)
        }
        const tokenHolder: { token: string } = await response.json()
        return tokenHolder.token
    }

    async getHost(host_uuid: string, token: string): Promise<HostDto | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}`, {
            headers: {'Authorization': `Bearer ${token}`}
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log(response)
        return response.ok ? await response.json() : code401or404(response.status)
    }

    async setOnlyFriends(host_uuid: string, token: string, only_friends: boolean): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/only_friends`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({only_friends})
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        return response.ok ? 0 : code401or404(response.status)
    }

    async setAllowNonames(host_uuid: string, token: string, allow_nonames: boolean): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        console.log('API', 'setAllowNonames', allow_nonames)
        const response = await fetch(`${this._address}/hosts/${host_uuid}/allow_nonames`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({allow_nonames})
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log('API', 'setAllowNonames', 'status', response.status)
        return response.ok ? 0 : code401or404(response.status)
    }

    async befriend(host_uuid: string, token: string, friend_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/friends?friend=${friend_uuid}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`}
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log(response)
        return response.ok ? 0 : code401or404(response.status)
    }

    async unfriend(host_uuid: string, token: string, former_friend_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/friends/${former_friend_uuid}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log(response)
        return response.ok ? 0 : code401or404(response.status)
    }

    async ban(host_uuid: string, token: string, banned_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/banlist?banned=${banned_uuid}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`}
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log(response)
        return response.ok ? 0 : code401or404(response.status)
    }

    async unban(host_uuid: string, token: string, banned_uuid: string): Promise<0 | 401 | 404 | '503 auth' | '503 hosts'> {
        const response = await fetch(`${this._address}/hosts/${host_uuid}/banlist/${banned_uuid}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        })
        const not_working_service = await code503(response)
        if (not_working_service) {
            return not_working_service
        }
        console.log(response)
        return response.ok ? 0 : code401or404(response.status)
    }
}
