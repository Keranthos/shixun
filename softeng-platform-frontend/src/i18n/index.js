import { createI18n } from 'vue-i18n'
import zh from './locales/zh.json'
import en from './locales/en.json'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('softeng_locale') : ''
const locale = saved === 'en' ? 'en' : 'zh'

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'zh',
  messages: { zh, en }
})

export function setAppLocale (lang) {
  const l = lang === 'en' ? 'en' : 'zh'
  i18n.global.locale.value = l
  try {
    localStorage.setItem('softeng_locale', l)
  } catch (e) {
    void e
  }
}

export default i18n
