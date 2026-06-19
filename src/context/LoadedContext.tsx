'use client'

import { createContext, useContext } from 'react'

export const LoadedContext = createContext(false)
export const useLoaded = () => useContext(LoadedContext)
