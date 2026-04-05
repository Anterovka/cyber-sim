import type { Scenario } from './types';

export const scenarios: Scenario[] = [



  {
    id: 'office-phishing',
    title: 'Подозрительное письмо от «IT-отдела»',
    description:
      'Вам пришло письмо от корпоративной IT-службы с просьбой срочно сменить пароль. Проверьте, не фишинг ли это.',
    location: 'office',
    difficulty: 2,
    attackType: 'phishing',
    narrative: [
      'Вы открываете рабочую почту утром и видите письмо от «IT Support <support@company-IT-help.com>».',
      'Тема: «СРОЧНО: Требуется обновление пароля до 18:00». В письме — логотип компании и кнопка «Сменить пароль».',
    ],
    cweReference: 'CWE-640: Weak Password Recovery Mechanism',
    owaspReference: 'A01:2021 – Broken Access Control',
    steps: [
      {
        id: 'step-1',
        narrative:
          'Откройте письмо и проверьте отправителя. Обратите внимание на домен и заголовки безопасности.',
        attackContext:
          'Это фишинг! Домен отправителя company-IT-help.com не совпадает с вашим корпоративным company.ru. SPF и DKIM не прошли проверку.',
        actions: [
          { id: 'a1', text: 'Нажать на ссылку «Сменить пароль» в письме', hint: 'Не переходите по ссылкам из подозрительных писем' },
          { id: 'a2', text: 'Проверить SPF/DKIM заголовки письма', hint: 'Правильный выбор — проверьте подлинность' },
          { id: 'a3', text: 'Переслать письмо коллегам', hint: 'Можно, но лучше проверить самостоятельно' },
          { id: 'a4', text: 'Удалить письмо', hint: 'Безопасно, но можно сообщить в IT' },
        ],
        correctActionId: 'a2',
        consequenceOnFail:
          'Вы перешли по ссылке и ввели пароль. Злоумышленники получили доступ к вашей учётной записи и скачали конфиденциальные документы.',
        consequenceOnSuccess:
          'Отлично! SPF: FAIL, DKIM: FAIL — письмо поддельное. Вы сообщили в IT-отдел и предотвратили атаку.',
        simulatorData: {
          emails: [
            {
              id: 'email-1',
              from: 'IT Support',
              fromEmail: 'support@company-IT-help.com',
              subject: 'СРОЧНО: Требуется обновление пароля до 18:00',
              body: 'Уважаемый сотрудник,\n\nВ целях безопасности просим вас обновить пароль корпоративной учётной записи до 18:00 сегодня.\n\nНажмите кнопку ниже для смены пароля:\nhttps://company-IT-help.com/reset-password\n\nС уважением,\nIT-отдел',
              date: '09:15',
              isRead: false,
              isStarred: false,
              isPhishing: true,
              spfResult: 'fail',
              dkimResult: 'fail',
              linkUrl: 'https://company-IT-help.com/reset-password',
              linkText: 'Сменить пароль →',
            },
            {
              id: 'email-2',
              from: 'HR Department',
              fromEmail: 'hr@company.ru',
              subject: 'Расписание корпоратива',
              body: 'Коллеги, направляем расписание новогоднего корпоратива.',
              date: 'Вчера',
              isRead: true,
              isStarred: false,
            },
          ],
          selectedEmailId: 'email-1',
        },
      },
    ],
  },
  {
    id: 'office-brute-force',
    title: 'Подбор пароля к корпоративному аккаунту',
    description:
      'Вы получили уведомление о нескольких неудачных попытках входа. Ваши действия?',
    location: 'office',
    difficulty: 3,
    attackType: 'brute_force',
    narrative: [
      'Ваш телефон показывает push-уведомление: «Неудачная попытка входа в корпоративный портал. IP: 185.xx.xx.xx (Нидерланды)».',
      'Через 5 минут — ещё одно уведомление. И ещё одно. Кто-то подбирает ваш пароль.',
    ],
    cweReference: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
    owaspReference: 'A07:2021 – Identification and Authentication Failures',
    steps: [
      {
        id: 'step-1',
        narrative:
          'Вы видите 5 неудачных попыток входа за 10 минут. Пароль пока не подобран, но атака продолжается. У вас есть двухфакторная аутентификация, но она не включена.',
        attackContext:
          'Brute-force атака — злоумышленник использует словарь популярных паролей. Если ваш пароль простой (123456, password), его подберут за минуты.',
        actions: [
          { id: 'a1', text: 'Срочно сменить пароль на сложный и включить 2FA', hint: 'Правильный выбор — комплексная защита' },
          { id: 'a2', text: 'Подождать — может, это системный сбой', hint: 'Опасно — атака продолжается' },
          { id: 'a3', text: 'Написать в IT-отдел и ждать ответа', hint: 'Правильно, но нужно действовать быстрее' },
          { id: 'a4', text: 'Заблокировать IP-адрес вручную', hint: 'Хорошо, но IP можно сменить' },
        ],
        correctActionId: 'a1',
        consequenceOnFail:
          'Вы проигнорировали уведомления. Через час пароль был подобран. Злоумышленник получил доступ к корпоративной почте и отправил фишинговые письма вашим коллегам.',
        consequenceOnSuccess:
          'Вы сменили пароль на 16-символьный с спецсимволами и включили 2FA через приложение-аутентификатор. Атака заблокирована.',
      },
    ],
  },




  {
    id: 'home-social-engineering',
    title: 'Звонок из «службы безопасности банка»',
    description:
      'Вам звонит человек, представляющийся сотрудником банка. Он знает ваши последние операции и просит подтвердить данные.',
    location: 'home',
    difficulty: 5,
    attackType: 'social_engineering',
    narrative: [
      'Вам звонит неизвестный: «Здравствуйте, Алексей! Это служба безопасности Альфа-Банка. Мы заметили подозрительную операцию по вашей карте *4523 на сумму 15 000₽».',
      'Собеседник называет ваши ФИО, последние 4 цифры карты и дату последней покупки в Ozon. Он просит «подтвердить», что это были не вы, и назвать код из SMS.',
    ],
    cweReference: 'CWE-288: Authentication Bypass Using an Alternate Path',
    owaspReference: 'A07:2021 – Identification and Authentication Failures',
    steps: [
      {
        id: 'step-1',
        narrative:
          'Вам пишетет «Алексей С.» — ваш коллега. Он просит срочно перевести деньги на счёт клиента.',
        attackContext:
          'Это социальная инженерия через мессенджер! Злоумышленник создал фейковый аккаунт с фото и именем вашего коллеги.',
        actions: [
          { id: 'a1', text: 'Перевести деньги — коллега же просит', hint: 'НИКОГДА не переводите без верификации' },
          { id: 'a2', text: 'Позвонить коллеге по известному номеру', hint: 'Правильный выбор — верификация через другой канал' },
          { id: 'a3', text: 'Попросить кодовое слово', hint: 'Хорошо, но могли узнать' },
          { id: 'a4', text: 'Сообщить в СБ компании', hint: 'Правильно, но сначала верифицируйте' },
        ],
        correctActionId: 'a2',
        consequenceOnFail:
          'Вы перевели 250 000₽ мошенникам. «Коллега» был фейковым аккаунтом.',
        consequenceOnSuccess:
          'Вы позвонили коллеге — он не писал вам. Это мошенник. Вы сообщили в СБ.',
        simulatorData: {
          contacts: [
            { id: 'c1', name: 'Алексей С.', avatar: 'АС', lastMessage: 'Срочно нужно перевести клиенту!', unread: 3, online: true, isFake: true },
            { id: 'c2', name: 'HR Отдел', avatar: 'HR', lastMessage: 'Расписание корпоратива', unread: 0, online: false },
            { id: 'c3', name: 'Иван Петрович', avatar: 'ИП', lastMessage: 'Встреча в 15:00', unread: 1, online: true },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'Алексей С.', text: 'Привет! Срочное дело!', timestamp: '14:30', isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'Алексей С.', text: 'Клиент ждёт оплату, 250к на ООО Ромашка', timestamp: '14:31', isFake: true, isUrgent: true },
            { id: 'm3', senderId: 'c1', senderName: 'Алексей С.', text: 'Реквизиты: ИНН 7700123456, р/с 40702810...', timestamp: '14:32', isFake: true },
            { id: 'm4', senderId: 'c1', senderName: 'Алексей С.', text: 'Это очень срочно, сделай прямо сейчас! 🔥', timestamp: '14:33', isFake: true, isUrgent: true },
          ],
          selectedContactId: 'c1',
        },
      },
    ],
  },
  {
    id: 'home-skimming',
    title: 'Поддельный сайт оплаты ЖКХ',
    description:
      'Вы хотите оплатить коммунальные услуги онлайн. Нашли сайт через поисковик — он выглядит как настоящий.',
    location: 'home',
    difficulty: 4,
    attackType: 'skimming',
    narrative: [
      'Вы ввели в Яндексе «оплата ЖКХ онлайн» и перешли на первый сайт в выдаче. Сайт выглядит как официальный портал «Госуслуги.Оплата».',
      'Вам нужно ввести номер лицевого счёта, сумму и данные карты для оплаты. Сайт просит CVV-код и срок действия карты.',
    ],
    cweReference: 'CWE-319: Cleartext Transmission of Sensitive Information',
    owaspReference: 'A02:2021 – Cryptographic Failures',
    steps: [
      {
        id: 'step-1',
        narrative:
          'Сайт выглядит профессионально: логотип, форма оплаты, даже есть «SSL-сертификат». Но URL: gosuslugi-oplata.com (не gosuslugi.ru). В адресной строке нет значка замка.',
        attackContext:
          'Это скимминг/фишинговый сайт! Домен gosuslugi-oplata.com — поддельный. Настоящий портал — gosuslugi.ru. Отсутствие HTTPS (замка) означает, что данные карты передаются в открытом виде.',
        actions: [
          { id: 'a1', text: 'Ввести данные карты — сайт же выглядит официально', hint: 'Внешний вид не гарантирует безопасность' },
          { id: 'a2', text: 'Проверить URL и наличие HTTPS, уйти с сайта', hint: 'Правильный выбор — проверьте домен и шифрование' },
          { id: 'a3', text: 'Ввести тестовую карту с нулевым балансом', hint: 'Опасно — данные всё равно украдут' },
          { id: 'a4', text: 'Оплатить через официальное приложение банка', hint: 'Тоже хороший вариант' },
        ],
        correctActionId: 'a2',
        consequenceOnFail:
          'Вы ввели данные карты. Через неделю с вашего счёта списали 47 000₽. Данные карты попали к мошенникам через поддельный сайт.',
        consequenceOnSuccess:
          'Вы заметили, что URL отличается от официального и нет HTTPS. Вы закрыли сайт и оплатили через официальное приложение банка. Данные карты в безопасности.',
      },
    ],
  },




  {
    id: 'public-wifi-mitm',
    title: 'Атака «Человек посередине» в кафе',
    description:
      'Вы подключились к бесплатному Wi-Fi в кафе и зашли в онлайн-банк. Злоумышленник перехватывает трафик.',
    location: 'public_wifi',
    difficulty: 6,
    attackType: 'man_in_the_middle',
    narrative: [
      'Вы сидите в кофейне и подключаетесь к сети «CoffeeHouse_Free_WiFi». Пароля нет — сеть открытая.',
      'Вы заходите в онлайн-банк через браузер. Всё работает, но вы не знаете, что злоумышленник в той же сети перехватывает ваш трафик через ARP-spoofing.',
    ],
    cweReference: 'CWE-295: Improper Certificate Validation',
    owaspReference: 'A02:2021 – Cryptographic Failures',
    steps: [
      {
        id: 'step-1',
        narrative:
          'Браузер показывает предупреждение: «Соединение не защищено». Вы в открытой Wi-Fi сети.',
        attackContext:
          'MITM-атака! Злоумышленник перехватывает трафик в открытой сети.',
        actions: [
          { id: 'a1', text: 'Игнорировать и продолжить', hint: 'Опасно!' },
          { id: 'a2', text: 'Закрыть браузер и отключиться от Wi-Fi', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Проверить сертификат', hint: 'Лучше не рисковать' },
          { id: 'a4', text: 'Включить VPN', hint: 'Проверьте подключение' },
        ],
        correctActionId: 'a2',
        consequenceOnFail:
          'Злоумышленник перехватил сессию банка. Потеря: 83 000₽.',
        consequenceOnSuccess:
          'Вы отключились от открытой сети и перешли на 4G. Соединение защищено.',
        simulatorData: {
          settings: [
            { id: 'wifi', icon: '📶', title: 'Wi-Fi', description: 'CoffeeHouse_Free_WiFi (открытая)', type: 'toggle' as const, value: true, isDangerous: true, warning: 'Открытая сеть — трафик не шифруется!' },
            { id: 'bluetooth', icon: '🔵', title: 'Bluetooth', description: 'Видно всем', type: 'toggle' as const, value: true, isDangerous: true },
            { id: 'location', icon: '📍', title: 'Геолокация', description: 'Включена для всех приложений', type: 'toggle' as const, value: true },
            { id: 'vpn', icon: '🔒', title: 'VPN', description: 'Не подключён', type: 'toggle' as const, value: false, isDangerous: true },
            { id: 'autofill', icon: '📝', title: 'Автозаполнение', description: 'Пароли и карты', type: 'toggle' as const, value: true },
          ],
          connectedWifi: { name: 'CoffeeHouse_Free_WiFi', isSecure: false },
        },
      },
    ],
  },
  {
    id: 'public-wifi-deepfake',
    title: 'Дипфейк-звонок от «руководителя»',
    description:
      'Вам звонит ваш «руководитель» по видеосвязи и просит срочно перевести деньги на счёт контрагента. Но это дипфейк.',
    location: 'public_wifi',
    difficulty: 8,
    attackType: 'deepfake',
    narrative: [
      'Вы работаете удалённо. Вам звонит в Telegram человек с аватаркой и голосом вашего руководителя Ивана Петровича.',
      'Видеозвонок: лицо и голос похожи, но есть лёгкие артефакты. «Коллега, срочно нужно оплатить счёт для нового клиента. Переведи 250 000₽ на счёт ООО «Ромашка». Реквизиты скину в чат. Это срочно, клиент ждёт».',
    ],
    cweReference: 'CWE-345: Insufficient Verification of Data Authenticity',
    owaspReference: 'A01:2021 – Broken Access Control',
    steps: [
      {
        id: 'step-1',
        narrative:
          '«Иван Петрович» торопит. Видео почти настоящее, но губы не синхронизированы. Реквизиты в чате: 250 000₽.',
        attackContext:
          'Это дипфейк! AI клонировал голос и лицо. Рассинхронизация губ — признак подделки.',
        actions: [
          { id: 'a1', text: 'Перевести деньги — руководитель просит', hint: 'НИКОГДА без верификации' },
          { id: 'a2', text: 'Перезвонить по известному номеру', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Попросить кодовое слово', hint: 'Могли узнать' },
          { id: 'a4', text: 'Сообщить в СБ', hint: 'Сначала верифицируйте' },
        ],
        correctActionId: 'a2',
        consequenceOnFail:
          'Вы перевели 250 000₽ мошенникам. «Иван Петрович» был дипфейком.',
        consequenceOnSuccess:
          'Вы перезвонили — он не звонил. Дипфейк раскрыт. СБ предупреждена.',
        simulatorData: {
          contacts: [
            { id: 'c1', name: 'Иван Петрович', avatar: 'ИП', lastMessage: 'Переведи 250к срочно!', unread: 4, online: true, isFake: true },
            { id: 'c2', name: 'Бухгалтерия', avatar: 'БГ', lastMessage: 'Отчёт готов', unread: 0, online: false },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'Иван Петрович', text: 'Коллега, есть срочное дело', timestamp: '11:00', isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'Иван Петрович', text: 'Новый клиент ждёт оплату 250к', timestamp: '11:01', isFake: true },
            { id: 'm3', senderId: 'c1', senderName: 'Иван Петрович', text: 'ООО Ромашка, ИНН 7700999888', timestamp: '11:02', isFake: true, hasLink: true, linkUrl: 'https://fake-bank.ru/pay' },
            { id: 'm4', senderId: 'c1', senderName: 'Иван Петрович', text: 'СРОЧНО! Клиент ждёт! 🔥🔥🔥', timestamp: '11:03', isFake: true, isUrgent: true },
          ],
          selectedContactId: 'c1',
        },
      },
    ],
  },






  {
    id: 'smishing-delivery',
    title: 'SMS от «СДЭК» — посылка задержана',
    description: 'Вам пришло SMS о задержке посылки со ссылкой для отслеживания.',
    location: 'home',
    difficulty: 3,
    attackType: 'phishing',
    narrative: [
      'Вам приходит SMS: «СДЭК: Ваша посылка #48291 задержана. Подтвердите данные для доставки: https://cdek-track.ru/confirm»',
      'Сообщение выглядит как настоящее — логотип СДЭК, номер посылки, срочность.',
    ],
    cweReference: 'CWE-640: Weak Password Recovery Mechanism',
    owaspReference: 'A01:2021 – Broken Access Control',
    steps: [
      {
        id: 'step-1',
        narrative: 'SMS содержит ссылку на cdek-track.ru (не cdek.ru). Вас просят «подтвердить данные».',
        attackContext: 'Это сминг (SMS-фишинг)! Домен cdek-track.ru — поддельный. Настоящий сайт — cdek.ru.',
        actions: [
          { id: 'a1', text: 'Перейти по ссылке и подтвердить данные', hint: 'Не переходите по ссылкам из SMS' },
          { id: 'a2', text: 'Открыть официальное приложение СДЭК', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Позвонить в СДЭК по номеру с сайта', hint: 'Тоже хороший вариант' },
          { id: 'a4', text: 'Удалить SMS', hint: 'Безопасно, но можно проверить' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Вы перешли по ссылке и ввели данные карты. Списано 12 000₽.',
        consequenceOnSuccess: 'Вы открыли приложение СДЭК — никаких посылок на ваше имя нет. Это фишинг.',
        simulatorData: {
          contacts: [
            { id: 'c1', name: 'СДЭК', avatar: 'СД', lastMessage: 'Посылка #48291 задержана', unread: 1, online: false, isFake: true },
            { id: 'c2', name: 'Мама', avatar: 'М', lastMessage: 'Когда приедешь?', unread: 0, online: false },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'СДЭК', text: 'Ваша посылка #48291 задержана на складе.', timestamp: '10:15', isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'СДЭК', text: 'Для подтверждения доставки перейдите: cdek-track.ru/confirm', timestamp: '10:15', isFake: true, hasLink: true, linkUrl: 'https://cdek-track.ru/confirm' },
            { id: 'm3', senderId: 'c1', senderName: 'СДЭК', text: '⚠️ Срок подтверждения: 24 часа!', timestamp: '10:16', isFake: true, isUrgent: true },
          ],
          selectedContactId: 'c1',
        },
      },
    ],
  },


  {
    id: 'cloud-breach',
    title: 'Утечка паролей из облачного хранилища',
    description: 'Вы получили email о том, что ваш пароль найден в утечке данных.',
    location: 'office',
    difficulty: 4,
    attackType: 'brute_force',
    narrative: [
      'Менеджер паролей показывает уведомление: «Ваш пароль от work-cloud@company.ru найден в утечке Have I Been Pwned».',
      'Этот же пароль вы используете для почты и соцсетей.',
    ],
    cweReference: 'CWE-521: Weak Password Requirements',
    owaspReference: 'A07:2021 – Identification and Authentication Failures',
    steps: [
      {
        id: 'step-1',
        narrative: 'Один пароль для всех сервисов. Утечка подтверждена — 2.3 млн записей.',
        attackContext: 'Если один сервис взломан, все ваши аккаунты под угрозой. Нужен уникальный пароль для каждого сервиса.',
        actions: [
          { id: 'a1', text: 'Сменить пароль везде и включить 2FA', hint: 'Правильный выбор' },
          { id: 'a2', text: 'Сменить пароль только в облаке', hint: 'Недостаточно — другие сервисы под угрозой' },
          { id: 'a3', text: 'Проигнорировать — это же не взлом', hint: 'Опасно — пароль в открытом доступе' },
          { id: 'a4', text: 'Написать в IT', hint: 'Правильно, но действуйте быстрее' },
        ],
        correctActionId: 'a1',
        consequenceOnFail: 'Через неделю взломали почту и облако. Утекли документы компании.',
        consequenceOnSuccess: 'Вы сменили пароли везде и включили 2FA. Все аккаунты защищены.',
      },
    ],
  },


  {
    id: 'tech-support-scam',
    title: 'Звонок из «техподдержки Microsoft»',
    description: 'Вам звонят и говорят, что на вашем компьютере обнаружены вирусы.',
    location: 'home',
    difficulty: 4,
    attackType: 'social_engineering',
    narrative: [
      'Вам звонит человек: «Здравствуйте, это техподдержка Microsoft. Мы обнаружили критические уязвимости на вашем компьютере».',
      'Он предлагает удалённо «почистить» компьютер через AnyDesk или TeamViewer.',
    ],
    cweReference: 'CWE-288: Authentication Bypass Using an Alternate Path',
    owaspReference: 'A07:2021 – Identification and Authentication Failures',
    steps: [
      {
        id: 'step-1',
        narrative: '«Специалист» торопит: «Если не принять меры сейчас, компьютер будет заблокирован». Просит установить AnyDesk.',
        attackContext: 'Microsoft никогдано звонит пользователям. AnyDesk даст полный контроль над вашим ПК.',
        actions: [
          { id: 'a1', text: 'Установить AnyDesk и дать доступ', hint: 'НИКОГДА не давайте удалённый доступ незнакомцам' },
          { id: 'a2', text: 'Положить трубку — Microsoft не звонит', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Попросить номер для обратного звонка', hint: 'Могут дать фейковый' },
          { id: 'a4', text: 'Проверить компьютер антивирусом самостоятельно', hint: 'Хорошо, но сначала положите трубку' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Вы дали доступ. Мошенник установил шифровальщик и требует выкуп 50 000₽.',
        consequenceOnSuccess: 'Вы положили трубку. Microsoft никогда не звонит пользователям. Это мошенники.',
        simulatorData: {
          contacts: [
            { id: 'c1', name: 'Microsoft Support', avatar: 'MS', lastMessage: 'Критические уязвимости!', unread: 2, online: true, isFake: true },
            { id: 'c2', name: 'Антивирус', avatar: 'AV', lastMessage: 'Угроз не обнаружено', unread: 0, online: false },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'Microsoft Support', text: '⚠️ Обнаружены критические уязвимости на вашем ПК', timestamp: '16:00', isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'Microsoft Support', text: 'Установите AnyDesk для удалённой помощи: anydesk.com/download', timestamp: '16:01', isFake: true, hasLink: true, linkUrl: 'https://anydesk.com/download' },
            { id: 'm3', senderId: 'c1', senderName: 'Microsoft Support', text: 'СРОЧНО! Иначе компьютер будет заблокирован!', timestamp: '16:02', isFake: true, isUrgent: true },
          ],
          selectedContactId: 'c1',
        },
      },
    ],
  },


  {
    id: 'atm-skimming',
    title: 'Подозрительный банкомат',
    description: 'Вы заметили накладку на картоприёмнике банкомата.',
    location: 'home',
    difficulty: 3,
    attackType: 'skimming',
    narrative: [
      'Вы подходите к банкомату и замечаете, что картоприёмник выглядит немного иначе — чуть толще обычного.',
      'Рядом с клавиатурой — маленькая камера, замаскированная под элемент дизайна.',
    ],
    cweReference: 'CWE-200: Information Exposure',
    owaspReference: 'A02:2021 – Cryptographic Failures',
    steps: [
      {
        id: 'step-1',
        narrative: 'Накладка на картоприёмнике + скрытая камера. Это скиммер.',
        attackContext: 'Скиммер считывает данные карты, камера фиксирует PIN. Мошенники получат полный доступ к счёту.',
        actions: [
          { id: 'a1', text: 'Вставить карту — может, это просто дизайн', hint: 'Опасно — это скиммер' },
          { id: 'a2', text: 'Не использовать банкомат, сообщить в банк', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Попробовать снять накладку', hint: 'Может быть опасно' },
          { id: 'a4', text: 'Снять деньги в другом банкомате', hint: 'Тоже хороший вариант' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Вы вставили карту. Скиммер скопировал данные, камера сняла PIN. Через день сняли 80 000₽.',
        consequenceOnSuccess: 'Вы не стали использовать банкомат и сообщили в банк. Данные карты в безопасности.',
      },
    ],
  },


  {
    id: 'public-pc',
    title: 'Вход в почту с публичного компьютера',
    description: 'Вы зашли в личную почту с компьютера в интернет-кафе.',
    location: 'public_wifi',
    difficulty: 5,
    attackType: 'man_in_the_middle',
    narrative: [
      'Вы сели за компьютер в интернет-кафе и зашли в свою почту. Предыдущий пользователь мог оставить кейлоггер.',
      'Вы забыли выйти из аккаунта, когда отошли.',
    ],
    cweReference: 'CWE-384: Session Fixation',
    owaspReference: 'A01:2021 – Broken Access Control',
    steps: [
      {
        id: 'step-1',
        narrative: 'Вы отошли на 5 минут, не выйдя из почты. На компьютере может быть кейлоггер.',
        attackContext: 'Публичные компьютеры — рассадник кейлоггеров и сохранённых сессий.',
        actions: [
          { id: 'a1', text: 'Ничего — я всего на 5 минут', hint: 'Опасно — сессия открыта' },
          { id: 'a2', text: 'Срочно выйти из аккаунта и сменить пароль', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Проверить компьютер на вирусы', hint: 'Хорошо, но сначала выйдите' },
          { id: 'a4', text: 'Закрыть браузер', hint: 'Недостаточно — сессия может сохраниться' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Кейлоггер записал пароль. Через день почту взломали и отправили спам контактам.',
        consequenceOnSuccess: 'Вы вышли из аккаунта и сменили пароль. Сессия завершена, данные в безопасности.',
      },
    ],
  },


  {
    id: 'deepfake-relative',
    title: 'Голосовое от «дочери» — нужна помощь',
    description: 'Вам пришло голосовое сообщение с голосом дочери, которая просит денег.',
    location: 'home',
    difficulty: 7,
    attackType: 'deepfake',
    narrative: [
      'Вам приходит голосовое сообщение в WhatsApp. Голос очень похож на голос вашей дочери: «Мам, я попала в ДТП, срочно нужно 50 000₽ на лечение. Вот номер карты...»',
      'Голос звучит встревоженно, есть фоновый шум — как будто больница.',
    ],
    cweReference: 'CWE-345: Insufficient Verification of Data Authenticity',
    owaspReference: 'A01:2021 – Broken Access Control',
    steps: [
      {
        id: 'step-1',
        narrative: 'Голос очень похож, но дочь звонит редко. Сообщение пришло в 23:47.',
        attackContext: 'AI клонировал голос из коротких записей в соцсетях. Настоящая дочь дома спит.',
        actions: [
          { id: 'a1', text: 'Перевести деньги — голос же её!', hint: 'НИКОГДА без верификации' },
          { id: 'a2', text: 'Позвонить дочери на телефон', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Написать ей в другой мессенджер', hint: 'Тоже хороший вариант' },
          { id: 'a4', text: 'Попросить назвать кодовое слово', hint: 'Хорошо, но могли узнать' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Вы перевели 50 000₽. Дочь дома — это был дипфейк.',
        consequenceOnSuccess: 'Вы позвонили — дочь дома, спит. Голосовое было дипфейком.',
        simulatorData: {
          contacts: [
            { id: 'c1', name: 'Дочь ❤️', avatar: 'Д', lastMessage: 'Мам, срочно нужно 50к!', unread: 3, online: false, isFake: true },
            { id: 'c2', name: 'Муж', avatar: 'М', lastMessage: 'Дома буду к 23:00', unread: 0, online: false },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'Дочь ❤️', text: 'Мам, я попала в ДТП 😭', timestamp: '23:47', isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'Дочь ❤️', text: 'Срочно нужно 50 000₽ на лечение', timestamp: '23:47', isFake: true, isUrgent: true },
            { id: 'm3', senderId: 'c1', senderName: 'Дочь ❤️', text: 'Карта: 2200 7000 1234 5678', timestamp: '23:48', isFake: true },
          ],
          selectedContactId: 'c1',
        },
      },
    ],
  },


  {
    id: 'malware-invoice',
    title: 'Счёт на оплату с вложением',
    description: 'Вам пришло письмо со счётом и Excel-файлом во вложении.',
    location: 'office',
    difficulty: 5,
    attackType: 'malware',
    narrative: [
      'Вам пришло письмо от «Бухгалтерия <billing@company-invoice.ru>» с темой «Счёт №4521 на оплату».',
      'Во вложении файл «Счёт_4521.xls» с макросом. Письмо просит «открыть и оплатить до конца дня».',
    ],
    cweReference: 'CWE-94: Improper Control of Generation of Code',
    owaspReference: 'A08:2021 – Software and Data Integrity Failures',
    steps: [
      {
        id: 'step-1',
        narrative: 'Excel-файл просит «включить макросы» для просмотра. Отправитель — billing@company-invoice.ru (не ваш домен).',
        attackContext: 'Макросы в Excel — это код. Вредоносный макрос установит шифровальщик на ваш ПК.',
        actions: [
          { id: 'a1', text: 'Открыть файл и включить макросы', hint: 'НИКОГДА не включайте макросы из писем' },
          { id: 'a2', text: 'Удалить письмо и сообщить в IT', hint: 'Правильный выбор' },
          { id: 'a3', text: 'Проверить файл антивирусом', hint: 'Может не обнаружить новый вирус' },
          { id: 'a4', text: 'Открыть в песочнице', hint: 'Хорошо, но лучше не рисковать' },
        ],
        correctActionId: 'a2',
        consequenceOnFail: 'Вы включили макросы. Шифровальщик зашифровал все файлы на ПК и сервере. Выкуп: 200 000₽.',
        consequenceOnSuccess: 'Вы удалили письмо и сообщили в IT. Это был троян с макросом.',
        simulatorData: {
          emails: [
            {
              id: 'email-1',
              from: 'Бухгалтерия',
              fromEmail: 'billing@company-invoice.ru',
              subject: 'Счёт №4521 на оплату',
              body: 'Добрый день!\n\nНаправляем счёт №4521 на оплату услуг.\n\nПросим оплатить до конца рабочего дня.\n\nВо вложении файл счёта.',
              date: '17:30',
              isRead: false,
              isStarred: false,
              isPhishing: true,
              spfResult: 'fail',
              dkimResult: 'fail',
              hasAttachment: true,
            },
            {
              id: 'email-2',
              from: 'Коллега',
              fromEmail: 'kollega@company.ru',
              subject: 'Встреча завтра',
              body: 'Привет! Встречаемся завтра в 10:00.',
              date: '16:00',
              isRead: true,
              isStarred: false,
            },
          ],
          selectedEmailId: 'email-1',
        },
      },
    ],
  },
];

export function getScenariosByLocation(location: Scenario['location']): Scenario[] {
  return scenarios.filter((s) => s.location === location);
}

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getScenariosByDifficulty(min: number, max: number): Scenario[] {
  return scenarios.filter((s) => s.difficulty >= min && s.difficulty <= max);
}

export const scenarioLocations: Record<Scenario['location'], { name: string; description: string; icon: string }> = {
  office: {
    name: 'Офис',
    description: 'Корпоративная среда: почта, мессенджеры, внутренние системы',
    icon: 'Briefcase',
  },
  home: {
    name: 'Дом',
    description: 'Домашняя среда: онлайн-банк, соцсети, покупки онлайн',
    icon: 'Home',
  },
  public_wifi: {
    name: 'Общественный Wi-Fi',
    description: 'Публичные сети: кафе, аэропорты, коворкинги',
    icon: 'Wifi',
  },
};
