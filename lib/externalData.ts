

export const cweData: Record<string, { title: string; description: string; url: string }> = {
  'CWE-640': {
    title: 'Weak Password Recovery Mechanism',
    description: 'Слабый механизм восстановления пароля позволяет злоумышленникам получить несанкционированный доступ к учётным записям через фишинговые страницы подмены.',
    url: 'https://cwe.mitre.org/data/definitions/640.html',
  },
  'CWE-307': {
    title: 'Improper Restriction of Excessive Authentication Attempts',
    description: 'Отсутствие ограничения на количество попыток входа позволяет проводить brute-force атаки для подбора паролей.',
    url: 'https://cwe.mitre.org/data/definitions/307.html',
  },
  'CWE-288': {
    title: 'Authentication Bypass Using an Alternate Path',
    description: 'Социальная инженерия позволяет обойти аутентификацию, манипулируя пользователем для раскрытия учётных данных.',
    url: 'https://cwe.mitre.org/data/definitions/288.html',
  },
  'CWE-319': {
    title: 'Cleartext Transmission of Sensitive Information',
    description: 'Передача конфиденциальных данных (номера карт, пароли) без шифрования позволяет перехватить их через MITM-атаки.',
    url: 'https://cwe.mitre.org/data/definitions/319.html',
  },
  'CWE-295': {
    title: 'Improper Certificate Validation',
    description: 'Неправильная проверка SSL-сертификатов позволяет злоумышленникам подменять сертификаты и перехватывать зашифрованный трафик.',
    url: 'https://cwe.mitre.org/data/definitions/295.html',
  },
  'CWE-345': {
    title: 'Insufficient Verification of Data Authenticity',
    description: 'Недостаточная проверка подлинности данных позволяет использовать дипфейки и поддельные сообщения для мошенничества.',
    url: 'https://cwe.mitre.org/data/definitions/345.html',
  },
  'CWE-94': {
    title: 'Improper Control of Generation of Code',
    description: 'Неправильный контроль генерации кода позволяет выполнять вредоносные макросы в документах Office.',
    url: 'https://cwe.mitre.org/data/definitions/94.html',
  },
  'CWE-521': {
    title: 'Weak Password Requirements',
    description: 'Слабые требования к паролям (короткие, без спецсимволов) делают учётные записи уязвимыми к подбору.',
    url: 'https://cwe.mitre.org/data/definitions/521.html',
  },
  'CWE-200': {
    title: 'Information Exposure',
    description: 'Раскрытие информации через скимминг-устройства на банкоматах позволяет получить данные банковских карт.',
    url: 'https://cwe.mitre.org/data/definitions/200.html',
  },
  'CWE-384': {
    title: 'Session Fixation',
    description: 'Атака на фиксацию сессии позволяет злоумышленнику получить доступ к учётной записи через публичные компьютеры.',
    url: 'https://cwe.mitre.org/data/definitions/384.html',
  },
};

export const owaspData: Record<string, { title: string; description: string; url: string }> = {
  'A01:2021': {
    title: 'Broken Access Control',
    description: 'Нарушение контроля доступа позволяет злоумышленникам получать доступ к данным и функциям, которые им не должны быть доступны.',
    url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
  },
  'A02:2021': {
    title: 'Cryptographic Failures',
    description: 'Сбои в криптографии — передача данных без шифрования, слабые алгоритмы, неправильное управление ключами.',
    url: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
  },
  'A07:2021': {
    title: 'Identification and Authentication Failures',
    description: 'Слабые механизмы аутентификации позволяют подбирать пароли, обходить 2FA и использовать украденные учётные данные.',
    url: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
  },
  'A08:2021': {
    title: 'Software and Data Integrity Failures',
    description: 'Сбои целостности ПО и данных — выполнение непроверенного кода, макросов, обновление из ненадёжных источников.',
    url: 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
  },
};

export const apwgData = {
  stats: 'По данным APWG, в 2024 году зафиксировано более 1.5 млн фишинговых атак — рекордный уровень. 43% атак направлены на корпоративных пользователей.',
  trends: [
    'Рост фишинга через SMS (smishing) на 300% за год',
    'Использование AI для создания поддельных сайтов и писем',
    'Целевые атаки на сотрудников финансовых отделов',
    'Фишинг через мессенджеры (Telegram, WhatsApp)',
  ],
  url: 'https://apwg.org/trendsreports/',
};

export const minsifryData = {
  title: 'Рекомендации Минцифры РФ по кибергигиене',
  tips: [
    'Используйте уникальные пароли для каждого сервиса',
    'Включите двухфакторную аутентификацию везде, где возможно',
    'Не переходите по ссылкам из подозрительных писем и SMS',
    'Проверяйте URL сайта перед вводом данных карты',
    'Не подключайтесь к открытым Wi-Fi сетям для банковских операций',
    'Регулярно обновляйте ПО и антивирус',
    'Не сообщайте коды из SMS и данные карт по телефону',
  ],
  url: 'https://digital.gov.ru/ru/activity/infosecurity/',
};

export const kasperskyData = {
  title: 'Рекомендации Лаборатории Касперского',
  tips: [
    'Используйте менеджер паролей для хранения уникальных паролей',
    'Проверяйте SPF и DKIM заголовки в подозрительных письмах',
    'Не включайте макросы в документах из непроверенных источников',
    'Используйте VPN при подключении к публичным Wi-Fi',
    'Проверяйте SSL-сертификаты сайтов перед вводом данных',
    'Не устанавливайте программы по просьбе неизвестных звонящих',
    'Регулярно проверяйте компьютер антивирусом',
  ],
  url: 'https://www.kaspersky.ru/resource-center/threats',
};
