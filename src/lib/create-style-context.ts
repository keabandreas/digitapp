// src/lib/create-style-context.ts
'use client'

import { createContext, useContext } from 'react'

export const createStyleContext = (recipe: any) => {
  const StyleContext = createContext<string | null>(null)

  const withProvider = <T,>(Component: T, part: string) => {
    const Comp = Component as any
    return (props: any) => {
      const className = recipe({ ...props, className: props.className })
      const finalClassName = className?.[part] || className

      return (
        <StyleContext.Provider value={className}>
          <Comp {...props} className={finalClassName} />
        </StyleContext.Provider>
      )
    }
  }

  const withContext = <T,>(Component: T, part: string) => {
    const Comp = Component as any
    return (props: any) => {
      const className = useContext(StyleContext)
      const finalClassName = className?.[part] || className

      return <Comp {...props} className={finalClassName} />
    }
  }

  return {
    withProvider,
    withContext,
  }
}
