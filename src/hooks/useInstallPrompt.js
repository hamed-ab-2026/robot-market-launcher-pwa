import { useEffect, useRef, useState } from 'react'
import {
  isInstallDismissedActive,
  isAppMarkedInstalled,
  markAppInstalled,
  setInstallDismissedFor7Days
} from '../utils/storage'

function isRunningStandalone() {
  const displayModeStandalone =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(display-mode: standalone)').matches

  // iOS Safari exposes this non-standard property when launched from the
  // home screen. It is not covered by the display-mode media query.
  const iosStandalone =
    typeof window !== 'undefined' && window.navigator && window.navigator.standalone === true

  return Boolean(displayModeStandalone || iosStandalone)
}

/**
 * Encapsulates the "should we show a custom install prompt" logic:
 * - Detects if the app is already installed/running standalone.
 * - Captures & holds the `beforeinstallprompt` event so we can trigger it later.
 * - Respects the 7-day "Later" snooze stored in LocalStorage.
 */
export default function useInstallPrompt() {
  const deferredPromptRef = useRef(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [alreadyInstalled, setAlreadyInstalled] = useState(false)

  useEffect(() => {
    const installed = isRunningStandalone() || isAppMarkedInstalled()
    setAlreadyInstalled(installed)

    if (installed) {
      // Already installed: do nothing further.
      return
    }

    const handleBeforeInstallPrompt = (event) => {
      // Stop the browser's default mini-infobar / automatic prompt.
      event.preventDefault()
      deferredPromptRef.current = event
      setCanInstall(true)

      if (!isInstallDismissedActive()) {
        setShowModal(true)
      }
    }

    const handleAppInstalled = () => {
      markAppInstalled()
      setAlreadyInstalled(true)
      setShowModal(false)
      deferredPromptRef.current = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    const deferredPrompt = deferredPromptRef.current
    if (!deferredPrompt) {
      setShowModal(false)
      return { outcome: 'unavailable' }
    }

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    deferredPromptRef.current = null
    setCanInstall(false)

    if (choice.outcome === 'accepted') {
      markAppInstalled()
      setAlreadyInstalled(true)
    }

    setShowModal(false)
    return choice
  }

  const dismissForNow = () => {
    setInstallDismissedFor7Days()
    setShowModal(false)
  }

  return {
    canInstall,
    showModal,
    alreadyInstalled,
    promptInstall,
    dismissForNow
  }
}
