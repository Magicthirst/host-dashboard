import { useContext } from 'react'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { RiHeartAddFill } from 'react-icons/ri'
import { FaBan, FaHeartBroken } from 'react-icons/fa'
import { ImUnlocked } from 'react-icons/im'
import { GiLockedHeart } from 'react-icons/gi'
import { LiaDoorOpenSolid } from 'react-icons/lia'
import { GrLogout } from "react-icons/gr"
// @ts-ignore
import Identicon from 'react-hooks-identicons'

import {HostContext, InitProps, LogoutError, useHost} from '../Host'
import { Api } from '../api/Api'
import { CurrentPageContext } from '../Pages'
import { OthersList } from './OthersList'
import { UuidIdenticon } from "../common/UuidIdenticon.tsx";

export function DashboardScreen({api, initProps, onLogoutBecauseOfError}: {
    api: Api,
    initProps: InitProps,
    onLogoutBecauseOfError: (err: LogoutError) => void
}) {
    const {setPage} = useContext(CurrentPageContext)

    const host = useHost(api, initProps, onLogoutBecauseOfError)
    const {allowNonames, banlist, friends, onlyFriends, uuid} = host.state

    const exit = () => {setPage('auth')}

    return <HostContext.Provider value={host}>
        <div style={{
            display: 'grid',
            width: '100%',
            height: '100%',
            justifyItems: 'center',
            verticalAlign: 'middle'
        }}>
            <div style={{
                width: 'fit-content',
                height: 'fit-content',
                display: 'grid',
                justifyItems: 'center',
                overflowY: 'scroll',
                columnGap: '16px'
            }}>
                <UuidIdenticon uuid={uuid} size={80} margin={16}/>
                <span style={{
                    margin: '16px',
                    width: '100%',
                    textWrap: 'wrap',
                    wordBreak: 'break-all',
                    color: '#ffdd00',
                    background: 'inherit',
                    fontWeight: 'bold',
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                }}>
                    {uuid}
                </span>

                <table>
                    <tbody>
                        <tr>
                            <td style={{textAlign: 'left', paddingRight: '8px'}}>Разрешить вход только друзьям</td>
                            <td>
                                <Toggle
                                    checked={onlyFriends}
                                    onChange={(_) => host.toggleOnlyFriends()}
                                    style={{
                                        padding: 0
                                    }}
                                    icons={{
                                        checked: <GiLockedHeart color='#ffffff' size='15' style={{marginTop: -2}}/>,
                                        unchecked: <LiaDoorOpenSolid color='#ffffff' size='15' strokeWidth='0.4' style={{marginTop: -2, marginLeft: -2}}/>
                                    }}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign: 'left', paddingRight: '8px'}}>Разрешить вход анонимным</td>
                            <td>
                                <Toggle
                                    checked={allowNonames}
                                    onChange={(_) => host.toggleAllowNonames()}
                                    icons={{
                                        checked: <LiaDoorOpenSolid color='#ffffff' size='15' strokeWidth='0.4' style={{marginTop: -2, marginRight: -2}}/>,
                                        unchecked: <p style={{fontSize: 13, fontFamily: 'courier', marginTop: 5, marginLeft: -2, color: '#ffffff'}}>ID</p>
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{
                    width: 'fit-content',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    verticalAlign: 'top',
                    justifyContent: 'center'
                }}>
                    <div>
                        <OthersList
                            title='Друзья'
                            list={friends}
                            add={host.befriend}
                            remove={host.unfriend}
                            style={{margin: '16px'}}
                            addIcon={() => <RiHeartAddFill style={{paddingTop: '4px'}}/>}
                            removeIcon={() => <FaHeartBroken style={{paddingTop: '4px'}}/>}
                        />
                    </div>
                    <div>
                        <OthersList
                            title='Заблокированные'
                            list={banlist}
                            add={host.ban}
                            remove={host.unban}
                            style={{margin: '16px'}}
                            addIcon={() => <FaBan style={{paddingTop: '4px'}}/>}
                            removeIcon={() => <ImUnlocked style={{paddingTop: '4px'}}/>}
                        />
                    </div>
                </div>

                <button onClick={exit} style={{
                    position: 'fixed',
                    bottom: '2em',
                    right: '2em'
                }}>
                    <span style={{verticalAlign: 'middle', paddingRight: '8px'}}>Выход</span>
                    <GrLogout title='Exit' style={{verticalAlign: 'middle'}}/>
                </button>
            </div>
        </div>
    </HostContext.Provider>
}
