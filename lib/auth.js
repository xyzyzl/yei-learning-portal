import React, { createContext, useContext, useEffect, useState } from 'react'

import Router from 'next/router'
import cookie from 'js-cookie'
import { createUser } from './db'
import { deleteUserData } from '@/lib/db'
import fetcher from '@/utils/fetcher'
import firebase from './firebase'
import router from 'next/router'
import useSWR from 'swr'

const authContext = createContext()

export function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export const useAuth = () => {
  return useContext(authContext)
}

function useProvideAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const handleUser = async (rawUser) => {
    if (rawUser) {
      // console.log(rawUser)
      const user = await formatUser(rawUser)
      const { token, ...userWithoutToken } = user

      createUser(user.uid, JSON.parse(JSON.stringify(userWithoutToken)))
      setUser(user)

      cookie.set('yei-training-portal-auth', 'true', {
        expires: 1,
      })

      setLoading(false)
      return user
    } else {
      setUser(false)
      cookie.remove('yei-training-portal-auth')

      setLoading(false)
      return false
    }
  }

  const createWithPassword = async (
    name,
    email,
    password,
    callback,
    redirect
  ) => {
    setLoading(true)
    const res = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        setAuthError('')
        handleUser(response.user)
      })
      .catch((err) => {
        console.log(err.message)
        setAuthError(err.message)
        callback()
      })

    const user = await firebase.auth().currentUser
    user
      ?.updateProfile({
        displayName: name,
      })
      .then(() => {
        handleUser(user)
        redirect()
      })
      .catch((err) => {
        console.log(err)

        setAuthError(err.message)
        callback()
      })
  }

  const signinWithPassword = async (email, password, callback, redirect) => {
    setLoading(true)
    const res = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setAuthError('')
        redirect()
      })
      .catch((err) => {
        console.log(email, typeof email, err)
        setAuthError(err.message)
        callback()
      })
  }

  const signinWithGoogle = (callback, redirect) => {
    setLoading(true)
    return firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((response) => {
        setAuthError('')
        handleUser(response.user)
        redirect()
        // if (redirect) {
        //   Router.push(redirect)
        // }
      })
      .catch((err) => {
        setAuthError(err.message)
        callback()
      })
  }

  const forgotPassword = async (email, callback) => {
    console.log(email)
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        console.log('email sent')
        callback()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const deleteAccount = async (userIds, userId, callback) => {
    return firebase
      .auth()
      .currentUser.delete()
      .then(() => {
        console.log('deleted user')
        deleteUserData(userIds, userId, callback)
      })
      .catch((err) => {
        console.log(err)
        setAuthError(err.message)
        // ...
      })
  }

  const updatePassword = async (newPassword, callback) => {
    const user = firebase.auth().currentUser
    return user
      .updatePassword(newPassword)
      .then(() => {
        console.log('password updated: ' + newPassword)
        callback()
      })
      .catch((err) => {
        // An error ocurred
        setAuthError(err.message)
        callback()
        console.log(err)
        // ...
      })
  }

  // const reauthGoogleUser = async (callback) => {
  //   firebase
  //     .auth()
  //     .signInWithPopup(new firebase.auth.GoogleAuthProvider())
  //     .then((result) => {
  //       let credential = result.credential
  //       firebase
  //         .auth()
  //         .currentUser.reauthenticateWithCredential(credential)
  //         .then(() => {
  //           console.log('good google reauth')
  //           callback()
  //         })
  //         .catch((error) => {
  //           console.log(error)
  //           // ...
  //         })
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  // }

  const reauthUser = async (cred, callback, setErr, endLoading) => {
    const user = firebase.auth().currentUser
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      cred
    )
    return await firebase
      .auth()
      .currentUser.reauthenticateWithCredential(credential)
      .then(() => {
        console.log('good reauth')
        callback()
        setErr(false)
      })
      .catch((error) => {
        console.log(error)
        setErr(true)
        endLoading()
        // ...
      })
  }

  const signout = () => {
    Router.push('/')

    return firebase
      .auth()
      .signOut()
      .then(() => handleUser(false))
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onIdTokenChanged(handleUser)

    return () => unsubscribe()
  }, [])

  return {
    user,
    loading,
    createWithPassword,
    signinWithPassword,
    signinWithGoogle,
    signout,
    deleteAccount,
    reauthUser,
    updatePassword,
    authError,
    forgotPassword,
  }
}

const formatUser = async (user) => {
  // console.log(user)
  const token = await user.getIdToken()
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    provider: user.providerData[0].providerId,
    photoUrl: user.photoURL,
    token,
  }
}
