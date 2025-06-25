import {CSSProperties, useEffect} from "react"

const UUID_EXAMPLE = '01234567-89AB-CDEF-0123-456789ABCDEF'
const UUID_MAX_LENGTH = UUID_EXAMPLE.length
const UUID_REGEX = /^(-?[\da-fA-F]){32}$/

export type UuidInputProps = {
    uuid: string
    setUuid: (uuid: string) => void
    setUuidIsReady: (bool: boolean) => void
    style?: CSSProperties
}

export function UuidInput({uuid, setUuid, setUuidIsReady, style = {}}: UuidInputProps) {
    const formattedUuid = formatted(uuid)

    useEffect(() => {
        if (uuid !== formattedUuid) {
            setUuid(formattedUuid)
        }
    }, [uuid, formattedUuid]);

    useEffect(() => {
        setUuidIsReady(UUID_REGEX.test(uuid))
    }, [formattedUuid]);

    return <input
        type='text'
        autoComplete='username'
        size={UUID_MAX_LENGTH}
        placeholder={UUID_EXAMPLE}
        value={formattedUuid}
        onChange={e => setUuid(e.target.value)}
        style={{
            width: `min(auto, ${UUID_MAX_LENGTH}em)`,
            background: 'none',
            resize: 'none',
            maxLines: 1,
            fontFamily: 'courier',
            ...style
        }}
    />
}

function formatted(uuid: string) {
    const up = uuid
        .split('') // split to characters
        .filter(c => /[\da-fA-F]/.test(c)) // leave only hex numbers
        .join('')
        .toUpperCase()

    const parts = [
        up.slice(0, 8),
        up.slice(8, 12),
        up.slice(12, 16),
        up.slice(16, 20),
        up.slice(20, 32)
    ]

    return parts.filter(part => part.length !== 0).join('-')
}
