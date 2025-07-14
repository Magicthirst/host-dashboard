import {ReactElement, useEffect, useState} from 'react'
import {getCookie} from "typescript-cookie"
import './App.css'
import {InitProps, LogoutError} from "./Host.ts"
import {CurrentPageContext, Page, pageOf} from "./Pages"
import {AuthScreen} from "./auth"
import {DashboardScreen} from "./dashboard"
import {AUTH_TOKEN_COOKIE, AUTH_UUID_COOKIE} from "./consts.ts";
import {ApiImpl} from "./api/Api.ts";

const api = new ApiImpl(import.meta.env.VITE_API_URL)

function App() {
    const [page, setPage] = useState<Page>(pageOf(location.hash.slice(1)) ?? 'dashboard')

    const [logoutError, setLogoutError] = useState(undefined as LogoutError | undefined)

    const [props, setProps] = useState(() => retrieveInitProps())
    const initProps = props !== undefined && props.initToken !== undefined && props as InitProps || null

    if (page !== 'auth' && initProps === null) {
        setPage('auth')
    }

    useEffect(() => {
        location.hash = `#${page}`
    }, [page]);

    let screen: ReactElement
    if (page === 'dashboard' && initProps) {
        screen = <DashboardScreen
            api={api}
            initProps={initProps}
            onLogoutBecauseOfError={err => setLogoutError(err)}
        />
    }
    else {
        screen = <AuthScreen
            api={api}
            logoutError={logoutError}
            dismissLogoutError={() => setLogoutError(undefined)}
            onLogon={props => setProps(props)}
            defaultUuid={props && props.hostUuid || null}
        />
    }

    return <CurrentPageContext.Provider value={{page, setPage}}>
        {screen}
    </CurrentPageContext.Provider>
}

function retrieveInitProps(): {hostUuid: string, initToken: string | undefined} | undefined {
    const token = getCookie(AUTH_TOKEN_COOKIE)
    const uuid = getCookie(AUTH_UUID_COOKIE)

    if (uuid) {
        return {hostUuid: uuid, initToken: token}
    }
}

export default App
