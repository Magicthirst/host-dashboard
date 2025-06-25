// @ts-ignore
import Identicon from 'react-hooks-identicons'
import {useMemo} from "react";

export function UuidIdenticon({uuid, size, margin = 0}: { uuid: string, size: number, margin?: number }) {
    const {foreground, background} = useMemo(() => uuidToColorString(uuid), [uuid])
    return <div style={{margin}}>
        <Identicon
            string={uuid}
            size={size}
            fg={foreground}
            bg={background}
        />
    </div>
}

function uuidToColorString(uuid: string) {
    const noDelimiters = uuid.replace('-', '')
    return {
        foreground: '#' + noDelimiters.slice(0, 6).padEnd(6, '0'),
        background: '#' + noDelimiters.slice(6, 12).padEnd(6, 'F')
    }
}
