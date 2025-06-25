import {CSSProperties, ReactElement, ReactNode, useContext, useEffect, useState} from 'react';

import {UuidInput} from '../common/UuidInput.tsx'
// @ts-ignore
import Identicon from 'react-hooks-identicons'
import {UuidIdenticon} from "../common/UuidIdenticon.tsx";
import {HostContext} from "../Host.ts";

type OthersListProps = {
    title: ReactNode | string,
    list: string[],
    add: (uuid: string) => Promise<boolean>,
    remove: (uuid: string) => Promise<boolean>,
    addIcon?: () => ReactElement,
    removeIcon?: () => ReactElement,
    style?: CSSProperties
}

export function OthersList({
    title,
    list,
    add,
    remove,
    style = undefined,
    addIcon = undefined,
    removeIcon = undefined
}: OthersListProps) {
    return <table style={style}>
        <thead>
            <tr>
                <td/>
                <th>
                    {title}
                </th>
                <td/>
            </tr>
        </thead>
        <tbody style={{verticalAlign: 'top'}}>
            {list.map((uuid, i) =>
                <Row uuid={uuid} requestRemove={remove} key={i} removeIcon={removeIcon}/>
            )}
        </tbody>
        <tfoot>
            <AdderRow requestAdd={add} addIcon={addIcon}/>
        </tfoot>
    </table>
}

function Row({uuid, requestRemove, removeIcon}: {
    uuid: string,
    requestRemove: (uuid: string) => Promise<boolean>,
    removeIcon?: () => ReactElement
}) {
    const [error, setError] = useState(false)

    const remove = () => {
        requestRemove(uuid).then((isOk) => setError(!isOk))
    }

    return <tr style={{verticalAlign: 'middle'}}>
        <td><UuidIdenticon uuid={uuid} size={20}/></td>
        <td style={{fontFamily: 'courier', fontSize: '11px'}}>{uuid}</td>
        <td>
            <button
                onClick={remove}
                style={{
                    aspectRatio: '1 / 1',
                    height: '2em',
                    width: 'auto',
                    padding: 0,
                    background: '#00000000',
                    ...(error ? {color: '#bb2255'} : null)
                }}
            >
                {removeIcon && removeIcon() || '–'}
            </button>
        </td>
    </tr>
}

function AdderRow({requestAdd, addIcon}: {
    requestAdd: (uuid: string) => Promise<boolean>,
    addIcon?: () => ReactElement
}) {
    const host = useContext(HostContext)

    const [uuid, setUuid] = useState('')

    const [notExistsError, setNotExistsError] = useState(false)
    const [uuidIsReady, setUuidIsReady] = useState(false)

    const otherAndHostUuidAreSame = host.state.uuid === uuid

    useEffect(() => {
        setNotExistsError(false)
    }, [uuid]);

    const add = () => {
        requestAdd(uuid).then(isOk => {
            console.log('ADDER ROW', 'requestAdd', 'isOk', isOk)
            if (isOk) {
                setUuid('')
            }
            setNotExistsError(!isOk)
        })
    }

    return <tr>
        <td><UuidIdenticon uuid={uuid} size={20}/></td>
        <th style={{display: 'grid'}}>
            <UuidInput uuid={uuid} setUuid={setUuid} setUuidIsReady={setUuidIsReady}/>
            <div style={{
                color: '#bb2255',
                opacity: notExistsError ? 1 : 0,
                transition: 'all ease-in .2s',
                visibility: notExistsError ? 'visible' : 'hidden',
                textAlign: 'center',
                fontSize: '0.8em'
            }}>
                This uuid was not found
            </div>
            <div style={{
                color: '#bb2255',
                opacity: otherAndHostUuidAreSame ? 1 : 0,
                transition: 'all ease-in .2s',
                visibility: otherAndHostUuidAreSame ? 'visible' : 'hidden',
                textAlign: 'center',
                fontSize: '0.8em'
            }}>
                No talking with yourself here
            </div>
        </th>
        <td>
            <button
                onClick={add}
                disabled={!uuidIsReady || otherAndHostUuidAreSame}
                style={{
                    aspectRatio: '1 / 1',
                    height: '2em',
                    width: 'auto',
                    padding: 0,
                    background: '#00000000'
                }}
            >
                {addIcon && addIcon() || '+'}
            </button>
        </td>
    </tr>
}
