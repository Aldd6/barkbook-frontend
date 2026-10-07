import { createContext } from 'react'

export const AUTH_STATUS = Object.freeze({
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
})

const AuthContext = createContext(null)

export default AuthContext
