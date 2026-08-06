import { useEffect, useState } from 'react'
import { ConfigProvider, Layout, theme as antdTheme } from 'antd'
import faIR from 'antd/locale/fa_IR'
import enUS from 'antd/locale/en_US'
import { Routes, Route } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import SettingsDrawer from './components/SettingsDrawer'
import InstallPromptModal from './components/InstallPromptModal'
import Home from './pages/Home'
import About from './pages/About'
import useInstallPrompt from './hooks/useInstallPrompt'
import useLanguage from './hooks/useLanguage'
import useThemeMode from './hooks/useThemeMode'
import { PRIMARY_COLOR } from './theme'

const { Content } = Layout

export default function App() {
  const { lang, t, dir } = useLanguage()
  const { isDark, mode } = useThemeMode()

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
    document.documentElement.dataset.theme = mode
    document.title = t('appName')
  }, [dir, lang, mode, t])

  // One-time cleanup: an earlier version stored a user-selected accent
  // color. The color palette was removed in favor of a single fixed brand
  // color, so drop any stale value left over from that version.
  useEffect(() => {
    try {
      localStorage.removeItem('app_primary_color')
    } catch {
      // ignore
    }
  }, [])

  return (
    <ConfigProvider
      direction={dir}
      locale={lang === 'fa' ? faIR : enUS}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLOR,
          borderRadius: 10,
          fontFamily:
            lang === 'fa'
              ? "'Vazirmatn', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              : "'Inter', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif"
        }
      }}
    >
      <AppShell />
    </ConfigProvider>
  )
}

function AppShell() {
  const { token } = antdTheme.useToken()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsVersion, setSettingsVersion] = useState(0)
  const [installing, setInstalling] = useState(false)

  const { canInstall, showModal, alreadyInstalled, promptInstall, dismissForNow } = useInstallPrompt()

  useEffect(() => {
    document.body.style.background = token.colorBgLayout
  }, [token.colorBgLayout])

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
  }

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <AppHeader
        onOpenSettings={() => setSettingsOpen(true)}
        canInstall={canInstall}
        alreadyInstalled={alreadyInstalled}
        installing={installing}
        onInstallClick={handleInstall}
      />
      <Content>
        <Routes>
          <Route path="/" element={<Home settingsVersion={settingsVersion} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Content>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => setSettingsVersion((v) => v + 1)}
        canInstall={canInstall}
        alreadyInstalled={alreadyInstalled}
        installing={installing}
        onInstallClick={handleInstall}
      />

      <InstallPromptModal
        open={showModal}
        installing={installing}
        onInstall={handleInstall}
        onLater={dismissForNow}
      />
    </Layout>
  )
}
