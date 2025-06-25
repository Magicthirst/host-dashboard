import {Api, HostDto} from '../api/Api'

const TOKEN = 'key'
const HOST: HostDto = {
    uuid: '01234567-89AB-CDEF-0123-456789ABCDEF',
    only_friends: true,
    allow_nonames: false,
    friends: [],
    banlist: []
}

const otherExistingHosts = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444'
]

export class FakeApiImpl implements Api {
    async register() {
        return HOST
    }

    async login(host_uuid: string): Promise<string | 404> {
        return host_uuid === HOST.uuid ? TOKEN : 404
    }

    async renew(_: string): Promise<string | 401 | 404> {
        return TOKEN
    }

    async getHost(_1: string, _2: string): Promise<HostDto | 401 | 404> {
        return HOST
    }

    async setOnlyFriends(_1: string, _2: string, onlyFriends: boolean): Promise<0 | 401 | 404> {
        HOST.only_friends = onlyFriends
        return 0
    }

    async setAllowNonames(_1: string, _2: string, allowNonames: boolean): Promise<0 | 401 | 404> {
        HOST.allow_nonames = allowNonames
        return 0
    }

    async befriend(_1: string, _2: string, friend_uuid: string): Promise<0 | 401 | '404 this' | '404 other'> {
        if (otherExistingHosts.filter(h => h === friend_uuid).length === 0) {
            return '404 other'
        }
        if (HOST.friends.filter(f => f === friend_uuid).length === 0) {
            HOST.friends.push(friend_uuid)
        }
        return 0
    }

    async unfriend(_1: string, _2: string, former_friend_uuid: string): Promise<0 | 401 | '404 this' | '404 other'> {
        if (otherExistingHosts.filter(h => h === former_friend_uuid).length === 0) {
            return '404 other'
        }
        if (HOST.friends.filter(f => f === former_friend_uuid).length === 0) {
            return '404 other'
        }
        HOST.friends = HOST.friends.filter(v => v !== former_friend_uuid)
        return 0
    }

    async ban(_1: string, _2: string, banned_uuid: string): Promise<0 | 401 | '404 this' | '404 other'> {
        if (otherExistingHosts.filter(h => h === banned_uuid).length === 0) {
            return '404 other'
        }
        if (HOST.banlist.filter(f => f === banned_uuid).length === 0) {
            HOST.banlist.push(banned_uuid)
        }
        return 0
    }

    async unban(_1: string, _2: string, banned_uuid: string): Promise<0 | 401 | '404 this' | '404 other'> {
        if (otherExistingHosts.filter(h => h === banned_uuid).length === 0) {
            return '404 other'
        }
        if (HOST.banlist.filter(f => f === banned_uuid).length === 0) {
            return '404 other'
        }
        HOST.friends = HOST.friends.filter(v => v !== banned_uuid)
        return 0
    }

    async welcomes(_1: string, _2: string): Promise<boolean | '404 this' | '404 other'> {
        throw Error('TODO')
    }
}
