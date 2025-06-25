import {useState, useEffect, useCallback, createContext} from 'react'
import {Api, HostDto} from './api/Api'
import {setCookie} from "typescript-cookie"
import {useInterval} from "./common/Hooks";
import {AUTH_TOKEN_COOKIE} from "./consts.ts";

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const REFRESH_INTERVAL_MS = HOUR_MS

export class HostState {
    uuid: string
    onlyFriends: boolean
    allowNonames: boolean
    friends: string[]
    banlist: string[]

    constructor(
        uuid: string,
        onlyFriends: boolean,
        allowNonames: boolean,
        friends: string[],
        banlist: string[]
    ) {
        this.uuid = uuid
        this.onlyFriends = onlyFriends
        this.allowNonames = allowNonames
        this.friends = friends
        this.banlist = banlist
    }

    changed({
        friends = this.friends,
        banlist = this.banlist,
        onlyFriends = this.onlyFriends,
        allowNonames = this.allowNonames
    }): HostState {
        return new HostState(this.uuid, onlyFriends, allowNonames, friends, banlist)
    }

    static defaultWith(uuid: string): HostState {
        return new HostState(uuid, true, false, [], [])
    }

    static ofApi(host: HostDto): HostState {
        return new HostState(
            host.uuid.toUpperCase(),
            host.only_friends,
            host.allow_nonames,
            host.friends.map(uuid => uuid.toUpperCase()),
            host.banlist.map(uuid => uuid.toUpperCase())
        )
    }
}

export interface Host {
    state: HostState
    notFoundOther: boolean

    toggleOnlyFriends(): void
    toggleAllowNonames(): void
    befriend(new_friend_uuid: string): Promise<boolean>
    unfriend(former_friend_uuid: string): Promise<boolean>
    ban(banned: string): Promise<boolean>
    unban(banned: string): Promise<boolean>
    refresh(): void
}

export type InitProps = { hostUuid: string, initToken: string }

export const HostContext = createContext({} as Host)

export type LogoutError = 'Auth error' | '503 auth' | '503 hosts'

export function useHost(api: Api, initProps: InitProps, logoutError: (err: LogoutError) => void): Host {
    const {hostUuid} = initProps

    const [host, setHost] = useState(HostState.defaultWith(hostUuid))
    const [token, _setToken] = useState(initProps.initToken)
    const [notFoundOther, setNotFoundOther] = useState(false)

    const setToken = useCallback((newToken: string) => {
        setCookie(AUTH_TOKEN_COOKIE, newToken, {
            sameSite: 'strict',
            expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7))
        })
        _setToken(newToken)
    }, [token])

    const refresh = useCoroutineCallback(async () => {
        const maybeToken = await api.renew(token)
        if (maybeToken === 401 || maybeToken === 404) {
            logoutError('Auth error')
            return
        }
        setToken(maybeToken)

        const maybeHost = await api.getHost(hostUuid, token)
        switch (maybeHost) {
            case 401:
            case 404:
                logoutError('Auth error')
                return
            case '503 hosts':
                logoutError('503 hosts')
                return
            case '503 auth':
                logoutError('503 auth')
                return
        }
        console.log('USE HOST', 'maybeHost', maybeHost)
        console.log('USE HOST', 'HostState.ofApi(maybeHost)', HostState.ofApi(maybeHost))
        setHost(HostState.ofApi(maybeHost))
    }, [host, token])

    const toggleOnlyFriends = useCoroutineCallback(async () => {
        const onlyFriends = !host.onlyFriends
        const result = await api.setOnlyFriends(hostUuid, token, onlyFriends)
        switch (result) {
            case 401:
                logoutError('Auth error')
                return
            case '503 auth':
            case '503 hosts':
                logoutError(result)
                return
        }
        setHost(host.changed({onlyFriends}))
    }, [host, token])

    const toggleAllowNonames = useCoroutineCallback(async () => {
        const allowNonames = !host.allowNonames
        console.log('HOST', host, 'toggleAllowNonames', 'allowNonames:', host.allowNonames, '=>', allowNonames)
        const result = await api.setAllowNonames(hostUuid, token, allowNonames)
        switch (result) {
            case 401:
                logoutError('Auth error')
                return
            case '503 auth':
            case '503 hosts':
                logoutError(result)
                return
        }
        setHost(host.changed({allowNonames}))
    }, [host, token])

    const befriend = useCallback(async (friend: string) => {
        setNotFoundOther(false)
        const result = await api.befriend(hostUuid, token, friend)

        switch (result) {
            case 401:
                logoutError('Auth error')
                return false
            case 404:
                return false
            case '503 auth':
                logoutError('503 auth')
                return false
            case '503 hosts':
                logoutError('503 hosts')
                return false
        }
        const friends = [...new Set([...host.friends, friend])]
        setHost(host.changed({friends}))

        return true
    }, [host, token])

    const unfriend = useCallback(async (former_friend: string) => {
        setNotFoundOther(false)
        const result = await api.unfriend(hostUuid, token, former_friend)

        switch (result) {
            case 401:
                logoutError('Auth error')
                return false
            case 404:
                return false
            case '503 auth':
                logoutError('503 auth')
                return false
            case '503 hosts':
                logoutError('503 hosts')
                return false
        }
        const friends = host.friends.filter(v => v !== former_friend)
        setHost(host.changed({friends}))

        return true
    }, [host, token])

    const ban = useCallback(async (banned: string) => {
        setNotFoundOther(false)
        const result = await api.ban(hostUuid, token, banned)

        switch (result) {
            case 401:
                logoutError('Auth error')
                return false
            case 404:
                return false
            case '503 auth':
                logoutError('503 auth')
                return false
            case '503 hosts':
                logoutError('503 hosts')
                return false
        }
        const banlist = [...new Set([...host.banlist, banned])]
        setHost(host.changed({banlist}))

        return true
    }, [host, token])

    const unban = useCallback(async (banned: string) => {
        setNotFoundOther(false)
        const result = await api.unban(hostUuid, token, banned)

        switch (result) {
            case 401:
                logoutError('Auth error')
                return false
            case 404:
                return false
            case '503 auth':
                logoutError('503 auth')
                return false
            case '503 hosts':
                logoutError('503 hosts')
                return false
        }
        const banlist = host.banlist.filter(v => v !== banned)
        setHost(host.changed({banlist}))

        return true
    }, [host, token])

    useEffect(() => {
        setToken(initProps.initToken)
        refresh()
    }, [initProps]);

    useEffect(() => {
        console.log('HOST', host)
    }, [host]);

    useInterval(() => {refresh()}, REFRESH_INTERVAL_MS)

    return {
        state: host,
        notFoundOther,
        refresh,
        toggleOnlyFriends,
        toggleAllowNonames,
        befriend,
        unfriend,
        ban,
        unban
    }
}

function useCoroutineCallback<TArgs extends any[]>(func: ((...params: TArgs) => Promise<void>), dependencies: any[]) {
    return useCallback((...params: TArgs) => {func(...params)}, dependencies)
}
