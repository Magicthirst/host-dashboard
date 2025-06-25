import {Api} from '../api/Api'
import {InitProps, LogoutError} from '../Host'
import {LoginContent} from "./LoginContent.tsx";

export type AuthScreenProps = {
    api: Api,
    defaultUuid: string | null,
    onLogon: (props: InitProps) => void,
    logoutError?: LogoutError,
    dismissLogoutError: () => void
}

export function AuthScreen(props: AuthScreenProps) {
    return <div style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        position: 'absolute'
    }}>
        <div style={{
            height: 'min-content',
            margin: 'auto'
        }}>
            {LoginContent(props)}
        </div>
    </div>
}
