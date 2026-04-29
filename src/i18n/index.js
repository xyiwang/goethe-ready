import zh from './zh.js'
import en from './en.js'

const catalog = {
  zh,
  en,
}

/**
 * @param {'zh' | 'en'} [locale='zh']
 */
export function getMessages(locale = 'zh') {
  const key = locale === 'en' ? 'en' : 'zh'
  return catalog[key]
}

export { zh, en }

/** 默认语言包：中文 */
export default zh
