import {createContext, Context} from 'react'

export type Page = 'auth' | 'dashboard'

export function pageOf(something: string): Page | undefined {
    if (something === 'auth' || something === 'dashboard') {
        return something
    }
    return undefined
}

type StatedPage = { page: Page, setPage: ((page: Page) => void) }
export const CurrentPageContext: Context<StatedPage> = createContext<StatedPage>({} as StatedPage)
