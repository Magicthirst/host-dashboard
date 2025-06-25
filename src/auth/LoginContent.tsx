import {useContext, useEffect, useState} from "react"
import {CurrentPageContext} from "../Pages.ts"
import {UuidInput} from "../common/UuidInput.tsx"
import {setCookie} from "typescript-cookie"
import {AUTH_UUID_COOKIE} from "../consts.ts"
import {AuthScreenProps} from "./AuthScreen.tsx"
// @ts-ignore
import Identicon from 'react-hooks-identicons'
import {UuidIdenticon} from "../common/UuidIdenticon.tsx";
import {LogoutError} from "../Host.ts";

export function LoginContent({
    api,
    defaultUuid,
    onLogon,
    logoutError,
    dismissLogoutError
}: AuthScreenProps) {
    const {setPage} = useContext(CurrentPageContext)

    const [uuid, setUuid] = useState(defaultUuid || '')
    const [uuidIsReady, setUuidIsReady] = useState(false)
    const [error, setError] = useState(null as LogoutError | null)
    const [proceedRequestedLock, setProceedRequestedLock] = useState(false)

    const anyError = (error != null) || !uuidIsReady

    const login = (uuid: string) => api.login(uuid)
        .then((tokenOr404) => {
            setProceedRequestedLock(false)

            if (tokenOr404 === 404) {
                setError('Auth error')
                return
            }

            onLogon({initToken: tokenOr404, hostUuid: uuid})
            setPage('dashboard')
        })

    const onLogin = () => {
        if (proceedRequestedLock) {
            return
        }

        setProceedRequestedLock(true)
        login(uuid)
    }

    const onRegister = () => {
        if (proceedRequestedLock) {
            return
        }

        setProceedRequestedLock(true)
        api.register().then(dto => {
            setProceedRequestedLock(false)
            if (dto === '503 auth' || dto === '503 hosts') {
                setError(dto)
                return
            }
            login(dto.uuid)
        })
    }

    useEffect(() => {
        setCookie(AUTH_UUID_COOKIE, uuid, {sameSite: 'strict'})
        setProceedRequestedLock(false)
        if (error !== '503 auth' && error !== '503 hosts') {
            setError(null)
        }
    }, [uuid])

    return <>
        <button
            onClick={() => {
                dismissLogoutError()
            }}
            style={{
                color: '#9b3500',
                opacity: logoutError ? 1 : 0,
                transition: 'all ease-in .2s',
                visibility: logoutError ? 'visible' : 'collapse',
                textAlign: 'center',
            }}
        >
            Что-то пошло не так
        </button>

        <div>
            Введите ваш UUID
        </div>

        <UuidIdenticon uuid={uuid} size={80} margin={16}/>
        <UuidInput uuid={uuid} setUuid={setUuid} setUuidIsReady={setUuidIsReady}/>

        <div style={{height: '1rem'}}>{/*spacer*/}</div>

        <div style={{
            color: '#bb2255',
            opacity: error ? 1 : 0,
            transition: 'all ease-in .2s',
            visibility: error ? 'visible' : 'collapse',
            textAlign: 'center'
        }}>
            {
                error === 'Auth error' ? 'Такого аккаунта не существует' :
                error === '503 auth' ? 'Сервис аутентификации не отвечает' :
                error === '503 hosts' ? 'Сервис конфигурации не отвечает' :
                'No error'
            }
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            textAlign: 'center',
            verticalAlign: 'text-bottom'
        }}>
            <button
                onClick={onLogin}
                disabled={anyError || proceedRequestedLock}
                type='button'
            >
                Войти
            </button>
            <span style={{marginLeft: '2em', marginRight: '2em', alignSelf: 'center'}}>или</span>
            <button
                onClick={onRegister}
                disabled={proceedRequestedLock}
                type='button'
                style={{background: '#00000000'}}
            >
                Зарегистрироваться
            </button>
        </div>
    </>
}