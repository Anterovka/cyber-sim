import type { QuizScenario, ScenarioLocation, AttackType } from './quizTypes';

export const quizScenarios: QuizScenario[] = [



  {
    id: 'office-phishing',
    title: 'Подозрительное письмо от «IT-отдела»',
    description: 'Вам пришло письмо от корпоративной IT-службы с просьбой срочно сменить пароль.',
    location: 'office',
    difficulty: 2,
    attackType: 'phishing',
    intro: 'Вы открываете рабочую почту утром и видите письмо от «IT Support <support@company-IT-help.com>». Тема: «СРОЧНО: Требуется обновление пароля до 18:00».',
    cweReference: 'CWE-640',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Вы видите письмо с логотипом компании. Отправитель: support@company-IT-help.com. Ваш корпоративный домен — company.ru.',
        question: 'Что вы сделаете в первую очередь?',
        options: [
          { id: 'a1', text: 'Нажму кнопку «Сменить пароль» в письме', isCorrect: false, explanation: 'Нельзя переходить по ссылкам из подозрительных писем!' },
          { id: 'a2', text: 'Проверю домен отправителя и SPF/DKIM заголовки', isCorrect: true },
          { id: 'a3', text: 'Перешлю письмо коллегам для проверки', isCorrect: false, explanation: 'Так вы можете подвергнуть коллег риску!' },
          { id: 'a4', text: 'Удалю письмо не читая', isCorrect: false, explanation: 'Безопасно, но лучше проверить — вдруг это реальное письмо от IT?' },
        ],
        hint: 'Обратите внимание на домен отправителя: company-IT-help.com vs company.ru. Проверьте SPF и DKIM заголовки.',
        consequence: 'Вы перешли по ссылке и ввели пароль. Злоумышленники получили доступ к вашей учётной записи и скачали конфиденциальные документы.',
        simulatorData: {
          type: 'mail',
          emails: [
            {
              id: 'email-1', from: 'IT Support', fromEmail: 'support@company-IT-help.com',
              subject: 'СРОЧНО: Требуется обновление пароля до 18:00',
              body: 'Уважаемый сотрудник,\n\nВ целях безопасности просим вас обновить пароль корпоративной учётной записи до 18:00 сегодня.\n\nНажмите кнопку ниже для смены пароля:\nhttps://company-IT-help.com/reset-password\n\nС уважением,\nIT-отдел',
              date: '09:15', isRead: false, isStarred: false, isPhishing: true,
              spfResult: 'fail', dkimResult: 'fail',
              linkUrl: 'https://company-IT-help.com/reset-password', linkText: 'Сменить пароль →',
            },
            {
              id: 'email-2', from: 'HR Department', fromEmail: 'hr@company.ru',
              subject: 'Расписание корпоратива', body: 'Коллеги, направляем расписание.',
              date: 'Вчера', isRead: true, isStarred: false,
            },
          ],
          selectedId: 'email-1',
        },
      },
      {
        id: 'step-2',
        context: 'Вы проверили заголовки: SPF = FAIL, DKIM = FAIL. Письмо не прошло аутентификацию.',
        question: 'Как вы поступите теперь?',
        options: [
          { id: 'a1', text: 'Проигнорирую — может, это просто сбой', isCorrect: false, explanation: 'SPF и DKIM FAIL — это серьёзный признак фишинга!' },
          { id: 'a2', text: 'Сообщу в IT-отдел через официальный канал и удалю письмо', isCorrect: true },
          { id: 'a3', text: 'Попробую перейти по ссылке в приватном режиме', isCorrect: false, explanation: 'Это всё равно опасно — ссылка ведёт на фишинговый сайт!' },
        ],
        hint: 'SPF и DKIM FAIL означают, что письмо поддельное. Сообщите в IT через официальный канал (не через ответ на это письмо!).',
        consequence: 'Вы проигнорировали предупреждение. Через час вашу учётную запись взломали и отправили фишинговые письма всем коллегам.',
      },
    ],
  },




  {
    id: 'office-brute-force',
    title: 'Подбор пароля к корпоративному аккаунту',
    description: 'Вы получили уведомление о нескольких неудачных попытках входа.',
    location: 'office',
    difficulty: 3,
    attackType: 'brute_force',
    intro: 'Ваш телефон показывает push-уведомление: «Неудачная попытка входа в корпоративный портал. IP: 185.xx.xx.xx (Нидерланды)». Через 5 минут — ещё одно. И ещё.',
    cweReference: 'CWE-307',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: '5 неудачных попыток за 10 минут. Пароль пока не подобран. Двухфакторная аутентификация не включена.',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Подожду — может, это системный сбой', isCorrect: false, explanation: 'Атака продолжается! Каждая минута на счету.' },
          { id: 'a2', text: 'Срочно сменю пароль на сложный и включу 2FA', isCorrect: true },
          { id: 'a3', text: 'Напишу в IT-отдел и буду ждать ответа', isCorrect: false, explanation: 'Правильно сообщить в IT, но нужно действовать быстрее — смените пароль прямо сейчас!' },
          { id: 'a4', text: 'Заблокирую IP-адрес вручную', isCorrect: false, explanation: 'IP можно легко сменить. Это не решит проблему.' },
        ],
        hint: 'Ваш пароль может быть простым. Срочно смените его на 16+ символов со спецсимволами и включите 2FA через приложение-аутентификатор.',
        consequence: 'Вы проигнорировали уведомления. Через час пароль был подобран. Злоумышленник вошёл в вашу почту и отправил фишинговые письма коллегам.',
        simulatorData: {
          type: 'otp_generator',
          otpAccounts: [
            { id: 'otp-1', name: 'user@company.ru', service: 'Корп. портал', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, icon: '🏢', isVerified: true, isSuspicious: false },
            { id: 'otp-2', name: 'user@company.ru', service: 'Почта', secret: 'GEZDGNBVGY3TQOJQ', algorithm: 'SHA1', digits: 6, period: 30, icon: '📧', isVerified: true, isSuspicious: false },
          ],
        },
      },
    ],
  },




  {
    id: 'home-social-engineering',
    title: 'Звонок из «службы безопасности банка»',
    description: 'Вам звонит человек, представляющийся сотрудником банка.',
    location: 'home',
    difficulty: 5,
    attackType: 'social_engineering',
    intro: 'Вам звонит неизвестный: «Здравствуйте! Это служба безопасности Альфа-Банка. Мы заметили подозрительную операцию по вашей карте *4523 на сумму 15 000₽». Он знает ваши ФИО и последние операции.',
    cweReference: 'CWE-288',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Собеседник торопит: «Нам нужно подтвердить операцию в течение 5 минут, иначе счёт будет заблокирован». Он просит код из SMS.',
        question: 'Что вы ответите?',
        options: [
          { id: 'a1', text: 'Назову код из SMS — он же знает мои данные', isCorrect: false, explanation: 'НИКОГДА не сообщайте коды из SMS! Это одноразовый пароль для перевода.' },
          { id: 'a2', text: 'Положу трубку и позвоню в банк по номеру с карты', isCorrect: true },
          { id: 'a3', text: 'Спрошу ФИО оператора и положу трубку', isCorrect: false, explanation: 'Хорошо, но лучше сразу перезвонить в банк по официальному номеру.' },
          { id: 'a4', text: 'Попрошу прислать запрос на email', isCorrect: false, explanation: 'Банк никогда не просит коды из SMS по email.' },
        ],
        hint: 'Настоящий банк НИКОГДА не просит код из SMS. Положите трубку и перезвоните в банк по номеру на обратной стороне карты.',
        consequence: 'Вы назвали код из SMS. Злоумышленник подтвердил перевод 15 000₽ на свой счёт. Банк не вернёт деньги — вы добровольно передали код.',
        simulatorData: {
          type: 'mobile_banking',
          accounts: [
            { id: 'acc-1', name: 'Карта *4523', type: 'card', balance: 47500, currency: '₽', last4: '4523', icon: '💳' },
          ],
          transactions: [
            { id: 'tx-1', type: 'expense', amount: 1250, currency: '₽', category: 'Продукты', merchant: 'Пятёрочка', date: 'Сегодня, 14:30', isSuspicious: false, status: 'completed' },
            { id: 'tx-2', type: 'expense', amount: 15000, currency: '₽', category: 'Перевод', merchant: 'Перевод (в обработке)', date: 'Сегодня, 15:47', isSuspicious: true, status: 'pending' },
          ],
        },
      },
    ],
  },




  {
    id: 'home-skimming',
    title: 'Поддельный сайт оплаты ЖКХ',
    description: 'Вы хотите оплатить коммунальные услуги онлайн.',
    location: 'home',
    difficulty: 4,
    attackType: 'skimming',
    intro: 'Вы ввели в Яндексе «оплата ЖКХ онлайн» и перешли на первый сайт. Он выглядит как «Госуслуги.Оплата». Вас просят ввести данные карты.',
    cweReference: 'CWE-319',
    owaspReference: 'A02:2021',
    steps: [
      {
        id: 'step-1',
        context: 'URL: gosuslugi-oplata.com (не gosuslugi.ru). В адресной строке нет значка замка (нет HTTPS).',
        question: 'Что вы заметите и как поступите?',
        options: [
          { id: 'a1', text: 'Введу данные карты — сайт выглядит официально', isCorrect: false, explanation: 'Внешний вид не гарантирует безопасность! Домен поддельный и нет HTTPS.' },
          { id: 'a2', text: 'Замечу поддельный домен и отсутствие HTTPS, уйду с сайта', isCorrect: true },
          { id: 'a3', text: 'Введу тестовую карту с нулевым балансом', isCorrect: false, explanation: 'Опасно — данные всё равно могут украсть.' },
          { id: 'a4', text: 'Оплачу через официальное приложение банка', isCorrect: false, explanation: 'Хороший вариант, но сначала проверьте домен текущего сайта.' },
        ],
        hint: 'Настоящий портал — gosuslugi.ru. Отсутствие HTTPS (замка) означает, что данные карты передаются в открытом виде.',
        consequence: 'Вы ввели данные карты. Через неделю списали 47 000₽. Данные попали к мошенникам через поддельный сайт.',
        simulatorData: {
          type: 'browser',
          tabs: [
            {
              id: 'tab-1',
              url: 'http://gosuslugi-oplata.com',
              title: 'Госуслуги — Оплата ЖКХ',
              isSecure: false,
              certificateInfo: { issuer: 'Unknown CA', validFrom: '01.03.2024', validTo: '01.03.2025', isValid: false },
              isPhishing: true,
              content: {
                type: 'login_form',
                title: 'Госуслуги',
                body: 'Оплата коммунальных услуг\n\nВведите данные банковской карты для оплаты услуг ЖКХ через портал Государственных услуг.',
                logo: '🏛️',
                headerColor: '#0D47A1',
                headerText: 'Госуслуги',
                hasForm: true,
                formFields: [
                  { label: 'Номер карты', type: 'text', placeholder: '0000 0000 0000 0000' },
                  { label: 'Срок действия', type: 'text', placeholder: 'ММ / ГГ' },
                  { label: 'CVV/CVC', type: 'password', placeholder: '•••' },
                  { label: 'ФИО владельца', type: 'text', placeholder: 'IVAN IVANOV' },
                ],
                warnings: ['⚠️ Соединение не защищено (HTTP)', '⚠️ Домен не совпадает с gosuslugi.ru', '⚠️ Сертификат от неизвестного издателя'],
              },
            },
          ],
          history: [
            { url: 'https://yandex.ru/search?q=оплата+ЖКХ', title: 'Поиск: оплата ЖКХ', timestamp: '10:00', isSuspicious: false },
            { url: 'http://gosuslugi-oplata.com', title: 'Госуслуги — Оплата ЖКХ', timestamp: '10:02', isSuspicious: true },
          ],
        },
      },
    ],
  },




  {
    id: 'public-wifi-mitm',
    title: 'Атака «Человек посередине» в кафе',
    description: 'Вы подключились к бесплатному Wi-Fi в кафе.',
    location: 'public_wifi',
    difficulty: 6,
    attackType: 'man_in_the_middle',
    intro: 'Вы подключились к «CoffeeHouse_Free_WiFi». Пароля нет — сеть открытая. Вы зашли в онлайн-банк.',
    cweReference: 'CWE-295',
    owaspReference: 'A02:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Браузер показывает предупреждение: «Соединение не защищено». SSL-сертификат может быть подменён.',
        question: 'Как вы поступите?',
        options: [
          { id: 'a1', text: 'Игнорирую предупреждение и продолжу', isCorrect: false, explanation: 'Это может быть MITM-атака! Злоумышленник перехватывает трафик.' },
          { id: 'a2', text: 'Закрою браузер и отключусь от Wi-Fi', isCorrect: true },
          { id: 'a3', text: 'Проверю сертификат сайта', isCorrect: false, explanation: 'Хорошо, но в открытой сети лучше не рисковать.' },
          { id: 'a4', text: 'Включу VPN и продолжу', isCorrect: false, explanation: 'VPN помогает, но убедитесь что он подключился ПЕРЕД тем как заходить в банк.' },
        ],
        hint: 'В открытой Wi-Fi сети злоумышленник может перехватывать весь трафик. Отключитесь и используйте мобильный интернет (4G).',
        consequence: 'Вы проигнорировали предупреждение. Злоумышленник перехватил сессию банка. Потеря: 83 000₽.',
        simulatorData: {
          type: 'browser',
          tabs: [
            {
              id: 'tab-1',
              url: 'http://online.bank.ru',
              title: 'банк Онлайн',
              isSecure: false,
              certificateInfo: { issuer: 'CoffeeHouse CA', validFrom: '01.04.2024', validTo: '01.04.2025', isValid: false },
              isPhishing: true,
              content: {
                type: 'login_form',
                title: 'банк Онлайн',
                body: 'Вход в систему банк Онлайн.\n\nЛогин и пароль для входа.',
                logo: '🏦',
                headerColor: '#21A038',
                headerText: 'банк Онлайн',
                hasForm: true,
                formFields: [
                  { label: 'Логин', type: 'text', placeholder: 'Введите логин' },
                  { label: 'Пароль', type: 'password', placeholder: 'Введите пароль' },
                ],
                warnings: ['⚠️ Соединение не защищено', '⚠️ Сертификат от «CoffeeHouse CA» — не является доверенным'],
              },
            },
          ],
          history: [
            { url: 'CoffeeHouse_Free_WiFi', title: 'Подключение к Wi-Fi', timestamp: '11:00', isSuspicious: false },
            { url: 'http://online.bank.ru', title: 'банк Онлайн', timestamp: '11:05', isSuspicious: true },
          ],
        },
      },
    ],
  },




  {
    id: 'public-wifi-deepfake',
    title: 'Дипфейк-звонок от «руководителя»',
    description: 'Вам звонит «руководитель» по видеосвязи и просит перевести деньги.',
    location: 'public_wifi',
    difficulty: 8,
    attackType: 'deepfake',
    intro: 'Вам звонит в Telegram человек с аватаркой и голосом вашего руководителя Ивана Петровича. «Коллега, срочно переведи 250 000₽ на счёт ООО «Ромашка». Реквизиты скину в чат».',
    cweReference: 'CWE-345',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Видео выглядит почти как настоящее, но губы немного не синхронизированы с речью. «Иван Петрович» торопит.',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Переведу деньги — руководитель же просит', isCorrect: false, explanation: 'НИКОГДА не переводите деньги без верификации через другой канал!' },
          { id: 'a2', text: 'Перезвоню руководителю по известному номеру телефона', isCorrect: true },
          { id: 'a3', text: 'Попрошу назвать кодовое слово', isCorrect: false, explanation: 'Хорошо, но кодовое слово могли узнать из утечки.' },
          { id: 'a4', text: 'Сообщу в службу безопасности компании', isCorrect: false, explanation: 'Правильно, но сначала верифицируйте запрос через другой канал.' },
        ],
        hint: 'Дипфейк! Рассинхронизация губ — признак подделки. Перезвоните руководителю по ОБЫЧНОМУ номеру телефона (не через мессенджер!).',
        consequence: 'Вы перевели 250 000₽ мошенникам. «Иван Петрович» был дипфейком. Компания потеряла деньги.',
        simulatorData: {
          type: 'mobile_banking',
          accounts: [
            { id: 'acc-1', name: 'Рабочая карта', type: 'card', balance: 520000, currency: '₽', last4: '8901', icon: '💳' },
          ],
          transactions: [
            { id: 'tx-1', type: 'expense', amount: 3500, currency: '₽', category: 'Рестораны', merchant: 'Кофемания', date: 'Вчера, 13:00', isSuspicious: false, status: 'completed' },
          ],
        },
      },
    ],
  },




  {
    id: 'mobile-banking-fraud',
    title: 'Подозрительные операции в мобильном банке',
    description: 'Вы открыли мобильный банк и обнаружили неизвестные транзакции.',
    location: 'home',
    difficulty: 5,
    attackType: 'skimming',
    intro: 'Вы проверяете баланс в мобильном банке и видите несколько операций, которые не совершали. Перевод 5 000₽ неизвестному лицу и снятие 15 000₽ в банкомате в 3:47 утра.',
    cweReference: 'CWE-307',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Вы видите в истории: «Перевод Иван И. — 5 000₽» и «Снятие банкомат — 15 000₽, 3:47 AM». Вы не совершали эти операции.',
        question: 'Что вы сделаете в первую очередь?',
        options: [
          { id: 'a1', text: 'Заблокирую карту в приложении', isCorrect: true },
          { id: 'a2', text: 'Подожду до утра — может, это сбой', isCorrect: false, explanation: 'Мошенники могут продолжить снимать деньги!' },
          { id: 'a3', text: 'Позвоню другу — пусть подскажет', isCorrect: false, explanation: 'Нужно действовать немедленно, а не советоваться.' },
          { id: 'a4', text: 'Сменю пароль от приложения', isCorrect: false, explanation: 'Хорошо, но сначала заблокируйте карту!' },
        ],
        hint: 'Сначала заблокируйте карту в приложении, чтобы остановить дальнейшие операции.',
        consequence: 'Вы подождали до утра. За ночь мошенники сняли ещё 30 000₽ с вашего счёта.',
        simulatorData: {
          type: 'mobile_banking',
          accounts: [
            { id: 'acc-1', name: 'Основная карта', type: 'card', balance: 45000, currency: '₽', last4: '4523', icon: '💳' },
            { id: 'acc-2', name: 'Накопительный', type: 'account', balance: 120000, currency: '₽', last4: '7891', icon: '🏦' },
          ],
          transactions: [
            { id: 'tx-1', type: 'expense', amount: 1250, currency: '₽', category: 'Продукты', merchant: 'Пятёрочка', date: 'Сегодня, 14:30', isSuspicious: false, status: 'completed' },
            { id: 'tx-2', type: 'expense', amount: 5000, currency: '₽', category: 'Перевод', merchant: 'Перевод Иван И.', date: 'Сегодня, 03:47', isSuspicious: true, status: 'completed' },
            { id: 'tx-3', type: 'expense', amount: 890, currency: '₽', category: 'Развлечения', merchant: 'Steam', date: 'Вчера, 20:15', isSuspicious: false, status: 'completed' },
            { id: 'tx-4', type: 'expense', amount: 15000, currency: '₽', category: 'Снятие', merchant: 'Банкомат Тинькофф', date: 'Сегодня, 03:47', isSuspicious: true, status: 'completed' },
            { id: 'tx-5', type: 'expense', amount: 399, currency: '₽', category: 'Подписки', merchant: 'Netflix', date: 'Вчера, 10:00', isSuspicious: false, status: 'completed' },
          ],
        },
      },
      {
        id: 'step-2',
        context: 'Вы заблокировали карту. Банк подтвердил, что операции были мошенническими.',
        question: 'Какие действия нужно предпринять дальше?',
        options: [
          { id: 'a1', text: 'Напишу заявление в полицию и запрошу возврат средств', isCorrect: true },
          { id: 'a2', text: 'Забуду — банк всё равно не вернёт', isCorrect: false, explanation: 'Банк обязан рассмотреть заявление о мошенничестве!' },
          { id: 'a3', text: 'Сменю пароль и PIN-код карты', isCorrect: false, explanation: 'Хорошо, но нужно также написать заявление!' },
        ],
        hint: 'Напишите заявление в полицию и запросите возврат средств через банк. Смените все пароли.',
        consequence: 'Вы не написали заявление. Банк отказал в возврате — без заявления невозможно расследование.',
      },
    ],
  },




  {
    id: 'browser-phishing',
    title: 'Фишинговый сайт онлайн-банка',
    description: 'Вы перешли на сайт банка через публичный Wi-Fi.',
    location: 'public_wifi',
    difficulty: 7,
    attackType: 'man_in_the_middle',
    intro: 'Вы в кафе, подключились к «CoffeeHouse_Free_WiFi». Ввели в поиске «банк онлайн» и перешли на первый сайт. Он выглядит как настоящий, но браузер показывает предупреждение.',
    cweReference: 'CWE-295',
    owaspReference: 'A02:2021',
    steps: [
      {
        id: 'step-1',
        context: 'URL: https://bank-online.cc (не bank.ru). Браузер показывает: «Соединение не защищено». Сертификат от «Unknown CA».',
        question: 'Что вы заметите и как поступите?',
        options: [
          { id: 'a1', text: 'Введу логин и пароль — сайт выглядит как настоящий', isCorrect: false, explanation: 'Домен поддельный и сертификат неизвестный! Это фишинг!' },
          { id: 'a2', text: 'Замечу поддельный домен, закрою сайт и отключусь от Wi-Fi', isCorrect: true },
          { id: 'a3', text: 'Проверю сертификат — если он есть, значит безопасно', isCorrect: false, explanation: 'Сертификат от «Unknown CA» — это не настоящий сертификат!' },
          { id: 'a4', text: 'Включу VPN и продолжу', isCorrect: false, explanation: 'VPN не поможет, если сайт сам по себе фишинговый!' },
        ],
        hint: 'Настоящий сайт — bank.ru. Домен bank-online.cc — поддельный. Предупреждение браузера + неизвестный сертификат = MITM-атака.',
        consequence: 'Вы ввели логин и пароль. Злоумышленник перехватил данные и получил доступ к вашему счёту.',
        simulatorData: {
          type: 'browser',
          tabs: [
            {
              id: 'tab-1',
              url: 'http://bank-online.cc/login',
              title: 'банк Онлайн',
              isSecure: false,
              certificateInfo: { issuer: 'Unknown CA', validFrom: '01.01.2024', validTo: '01.01.2025', isValid: false },
              isPhishing: true,
              content: {
                type: 'login_form',
                title: 'банк Онлайн — Вход',
                body: 'Добро пожаловать в систему банк Онлайн.\n\nДля входа введите ваш логин и пароль.',
                hasForm: true,
                formFields: [
                  { label: 'Логин', type: 'text', placeholder: 'Введите логин' },
                  { label: 'Пароль', type: 'password', placeholder: 'Введите пароль' },
                ],
                warnings: ['Соединение не защищено', 'Сертификат не является доверенным'],
              },
            },
          ],
          history: [
            { url: 'https://google.com/search?q=банк+онлайн', title: 'Поиск: банк онлайн', timestamp: '10:15', isSuspicious: false },
            { url: 'http://bank-online.cc', title: 'банк Онлайн', timestamp: '10:16', isSuspicious: true },
          ],
        },
      },
      {
        id: 'step-2',
        context: 'Вы закрыли сайт и отключились от Wi-Fi. Теперь нужно убедиться, что данные не украдены.',
        question: 'Что нужно сделать после обнаружения фишингового сайта?',
        options: [
          { id: 'a1', text: 'Сменить пароль от банка с другого устройства (мобильный интернет)', isCorrect: true },
          { id: 'a2', text: 'Ничего — я же не вводил данные', isCorrect: false, explanation: 'Даже если вы не вводили данные, лучше сменить пароль для безопасности.' },
          { id: 'a3', text: 'Пожаловаться на сайт через Google Safe Browsing', isCorrect: false, explanation: 'Хорошо, но сначала смените пароль!' },
        ],
        hint: 'Смените пароль с другого устройства (через мобильный интернет). Сообщите банку о фишинговом сайте.',
        consequence: 'Вы не сменили пароль. Злоумышленник мог сохранить cookies и получить доступ позже.',
      },
    ],
  },




  {
    id: 'social-media-phishing',
    title: 'Фишинговые посты в соцсети',
    description: 'Вы листаете ленту и видите подозрительные публикации с призами.',
    location: 'home',
    difficulty: 4,
    attackType: 'phishing',
    intro: 'Вы открываете соцсеть и видите пост: «🎉 ВЫ ВЫИГРАЛИ iPhone 15! Перейдите по ссылке и заполните форму для получения приза!». Также друг прислал сообщение: «Привет! Голосуй за меня, перейди по ссылке».',
    cweReference: 'CWE-640',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Пост «Вы выиграли iPhone!» от непроверенного аккаунта. Друг прислал ссылку «Голосуй за меня». Вы не участвовали в розыгрышах.',
        question: 'Как вы поступите с этими публикациями?',
        options: [
          { id: 'a1', text: 'Перейду по ссылке розыгрыша — вдруг правда!', isCorrect: false, explanation: 'Вы не участвовали в розыгрыше. Это 100% фишинг!' },
          { id: 'a2', text: 'Проигнорирую розыгрыш, а у друга уточню — это ли он писал', isCorrect: true },
          { id: 'a3', text: 'Перейду по ссылке друга — он же не обманет', isCorrect: false, explanation: 'Аккаунт друга мог быть взломан! Уточните через другой канал.' },
          { id: 'a4', text: 'Пожалуюсь на пост с розыгрышем', isCorrect: false, explanation: 'Хорошо, но также нужно проверить сообщение от друга!' },
        ],
        hint: 'Бесплатный сыр только в мышеловке. Аккаунт друга мог быть взломан — уточните через звонок.',
        consequence: 'Вы перешли по ссылке и ввели данные. Аккаунт взломан, данные карты украдены.',
        simulatorData: {
          type: 'social_media',
          posts: [
            {
              id: 'post-1',
              author: { id: 'u1', name: 'Розыгрычи Призов', avatar: '🎁', isVerified: false, isFake: true },
              content: '🎉 ПОЗДРАВЛЯЕМ!\n\nВы стали победителем розыгрыша iPhone 15 Pro!\n\nДля получения приза заполните форму и оплатите доставку (299₽).\n\n⏰ Осталось 2 часа!',
              link: { url: 'https://prize-claim-win.ru/iphone', title: 'Получить iPhone 15 Pro', description: 'Бесплатный розыгрыш Apple iPhone', isSuspicious: true },
              timestamp: '2 часа назад',
              likes: 1247,
              comments: 89,
              shares: 342,
              isSponsored: false,
              isPhishing: true,
              warnings: ['Аккаунт не верифицирован', 'Подозрительная ссылка', 'Слишком хорошее предложение'],
            },
            {
              id: 'post-2',
              author: { id: 'u2', name: 'Алексей Петров', avatar: '👤', isVerified: false, mutualFriends: 12 },
              content: 'Отличная статья про кибербезопасность! Рекомендую всем.',
              link: { url: 'https://habr.com/cybersecurity', title: 'Кибербезопасность в 2024', description: 'Habr — лучшие статьи', isSuspicious: false },
              timestamp: '5 часов назад',
              likes: 23,
              comments: 4,
              shares: 2,
              isPhishing: false,
            },
          ],
          stories: [
            {
              id: 'story-1',
              author: { name: 'Мария К.', avatar: '👩', isFake: true },
              content: 'Голосуй за меня! Перейди по ссылке 👇',
              hasLink: true,
              linkUrl: 'https://vote-contest.ru/maria',
              isSuspicious: true,
              viewed: false,
            },
          ],
          messages: [
            {
              id: 'msg-1',
              sender: { name: 'Дмитрий С.', avatar: '👤', isFake: true },
              text: 'Привет! Срочно перейди по ссылке и проголосуй за меня! Осталось 30 минут!',
              timestamp: '10 мин назад',
              hasLink: true,
              linkUrl: 'https://vote-now.ru/dmitry',
              isSuspicious: true,
            },
          ],
        },
      },
      {
        id: 'step-2',
        context: 'Вы написали другу Дмитрию в WhatsApp — он ответил, что его аккаунт взломали.',
        question: 'Что нужно сделать, когда аккаунт друга взломали?',
        options: [
          { id: 'a1', text: 'Пожаловаться на аккаунт друга в поддержку соцсети', isCorrect: true },
          { id: 'a2', text: 'Перейти по ссылке — вдруг это не взлом', isCorrect: false, explanation: 'Друг подтвердил, что его взломали. Не переходите!' },
          { id: 'a3', text: 'Ничего — это не моя проблема', isCorrect: false, explanation: 'Другие люди могут пострадать. Пожалуйтесь!' },
        ],
        hint: 'Пожалуйтесь на взломанный аккаунт. Предупредите общих друзей.',
        consequence: 'Вы не пожаловались. Ещё 15 человек перешли по ссылке и потеряли данные.',
      },
    ],
  },




  {
    id: 'file-explorer-malware',
    title: 'Вредоносные файлы в папке «Загрузки»',
    description: 'Вы проверяете папку «Загрузки» и находите подозрительные файлы.',
    location: 'office',
    difficulty: 3,
    attackType: 'malware',
    intro: 'Вы решили почистить папку «Загрузки» на рабочем компьютере и обнаружили несколько файлов, которые не помните. Среди них — setup.exe, update.bat и crack.scr.',
    cweReference: 'CWE-94',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'В папке «Загрузки»: invoice.pdf, setup.exe, document.docx, update.bat, photo.jpg, crack.scr, readme.txt. Вы не скачивали setup.exe, update.bat и crack.scr.',
        question: 'Какие файлы являются подозрительными?',
        options: [
          { id: 'a1', text: 'setup.exe, update.bat, crack.scr — исполняемые файлы', isCorrect: true },
          { id: 'a2', text: 'invoice.pdf — PDF может содержать вирусы', isCorrect: false, explanation: 'PDF теоретически может содержать вредоносный код, но EXE/BAT/SCR гораздо опаснее.' },
          { id: 'a3', text: 'Все файлы подозрительны — удалю всё', isCorrect: false, explanation: 'photo.jpg и readme.txt скорее всего безопасны.' },
          { id: 'a4', text: 'Только crack.scr — скринсейверы опасны', isCorrect: false, explanation: 'EXE и BAT файлы не менее опасны!' },
        ],
        hint: 'EXE, BAT и SCR файлы могут выполнять произвольный код. Если вы не помните, что скачивали их — это угроза.',
        consequence: 'Вы запустили setup.exe. На компьютер установлен кейлоггер и троян.',
        simulatorData: {
          type: 'file_explorer',
          fileSystem: [
            { id: 'f1', name: 'Документы', type: 'folder', children: [
              { id: 'f1a', name: 'Отчёт.docx', type: 'file', extension: 'docx', size: '1.2 МБ', modified: '31.03.2024', isSuspicious: false },
              { id: 'f1b', name: 'Договор.pdf', type: 'file', extension: 'pdf', size: '245 КБ', modified: '02.04.2024', isSuspicious: false },
            ]},
            { id: 'f2', name: 'Изображения', type: 'folder', children: [
              { id: 'f2a', name: 'photo.jpg', type: 'file', extension: 'jpg', size: '3.8 МБ', modified: '28.03.2024', isSuspicious: false },
            ]},
            { id: 'f3', name: 'setup.exe', type: 'file', extension: 'exe', size: '12.4 МБ', modified: '01.04.2024', isSuspicious: true, threatLevel: 'high', threatDescription: 'Исполняемый файл из неизвестного источника. Может содержать троян.', hash: 'a3f2b8c1d4e5...' },
            { id: 'f4', name: 'update.bat', type: 'file', extension: 'bat', size: '2 КБ', modified: '01.04.2024', isSuspicious: true, threatLevel: 'critical', threatDescription: 'Пакетный файл! Может выполнять системные команды и загружать malware.', hash: 'e7d8c9b0a1f2...' },
            { id: 'f5', name: 'crack.scr', type: 'file', extension: 'scr', size: '8.1 МБ', modified: '01.04.2024', isSuspicious: true, threatLevel: 'critical', threatDescription: 'SCR-файл — это EXE! Название «crack» указывает на вредоносное ПО.', hash: 'b4c5d6e7f8a9...' },
            { id: 'f6', name: 'readme.txt', type: 'file', extension: 'txt', size: '1 КБ', modified: '25.03.2024', isSuspicious: false },
          ],
        },
      },
      {
        id: 'step-2',
        context: 'Вы обнаружили 3 подозрительных файла: setup.exe, update.bat, crack.scr.',
        question: 'Как правильно поступить с этими файлами?',
        options: [
          { id: 'a1', text: 'Удалю все подозрительные файлы и сообщу в IT-отдел', isCorrect: true },
          { id: 'a2', text: 'Запущу антивирус — пусть проверит', isCorrect: false, explanation: 'Хорошо, но также нужно сообщить в IT-отдел!' },
          { id: 'a3', text: 'Открою crack.scr — интересно что внутри', isCorrect: false, explanation: 'НИКОГДА не открывайте подозрительные исполняемые файлы!' },
        ],
        hint: 'Удалите файлы и сообщите в IT-отдел. Не запускайте их!',
        consequence: 'Вы открыли crack.scr. На компьютер установлен ransomware — все файлы зашифрованы.',
      },
    ],
  },




  {
    id: 'otp-generator-suspicious',
    title: 'Подозрительные аккаунты в аутентификаторе',
    description: 'Вы открыли приложение-аутентификатор и нашли аккаунты, которые не добавляли.',
    location: 'home',
    difficulty: 6,
    attackType: 'brute_force',
    intro: 'Вы открыли Google Authenticator и увидели 5 аккаунтов. Два из них — «Unknown Service (x7k2m)» и «Crypto Exchange (trader123)» — вы не добавляли. Остальные: Google, GitHub, банк — ваши.',
    cweReference: 'CWE-307',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: 'В аутентификаторе: Google (your@email.com), GitHub (username), Unknown Service (x7k2m), банк (phone+7...), Crypto Exchange (trader123). Вы не регистрировались на «Crypto Exchange» и не знаете «Unknown Service».',
        question: 'Что означают эти подозрительные аккаунты?',
        options: [
          { id: 'a1', text: 'Кто-то получил доступ к моему аутентификатору и добавил свои аккаунты', isCorrect: true },
          { id: 'a2', text: 'Это нормальные аккаунты — может, я забыл', isCorrect: false, explanation: 'Вы точно не регистрировались на «Crypto Exchange» и не знаете «Unknown Service»!' },
          { id: 'a3', text: 'Удалю только Unknown Service — Crypto Exchange оставлю', isCorrect: false, explanation: 'Оба аккаунта подозрительны — удалите оба!' },
          { id: 'a4', text: 'Это вирус — нужно удалить приложение', isCorrect: false, explanation: 'Скорее всего, кто-то получил доступ к вашему устройству.' },
        ],
        hint: 'Если в аутентификаторе появились аккаунты, которые вы не добавляли — кто-то получил доступ к вашему устройству.',
        consequence: 'Вы проигнорировали. Злоумышленник использует 2FA-коды для входа в свои аккаунты.',
        simulatorData: {
          type: 'otp_generator',
          otpAccounts: [
            { id: 'otp-1', name: 'your@email.com', service: 'Google', secret: 'JBSWY3DPEHPK3PXP', algorithm: 'SHA1', digits: 6, period: 30, icon: 'G', isVerified: true, isSuspicious: false },
            { id: 'otp-2', name: 'username', service: 'GitHub', secret: 'GEZDGNBVGY3TQOJQ', algorithm: 'SHA1', digits: 6, period: 30, icon: 'H', isVerified: true, isSuspicious: false },
            { id: 'otp-3', name: 'x7k2m', service: 'Unknown Service', secret: 'MFRGGZDFMY2TQNZR', algorithm: 'SHA1', digits: 6, period: 30, icon: '?', isVerified: false, isSuspicious: true },
            { id: 'otp-4', name: 'phone+7...', service: 'банк', secret: 'ONSWG4TFOQ3DGNBV', algorithm: 'SHA256', digits: 6, period: 30, icon: 'С', isVerified: true, isSuspicious: false },
            { id: 'otp-5', name: 'trader123', service: 'Crypto Exchange', secret: 'OBZXE5TFOQ3DGNBV', algorithm: 'SHA1', digits: 6, period: 30, icon: '₿', isVerified: false, isSuspicious: true },
          ],
        },
      },
      {
        id: 'step-2',
        context: 'Вы удалили подозрительные аккаунты. Нужно убедиться, что устройство не скомпрометировано.',
        question: 'Что нужно сделать после обнаружения чужих аккаунтов?',
        options: [
          { id: 'a1', text: 'Проверить устройство на вирусы, сменить все пароли, проверить активные сессии', isCorrect: true },
          { id: 'a2', text: 'Просто удалить аккаунты — всё в порядке', isCorrect: false, explanation: 'Если кто-то добавил аккаунты — устройство скомпрометировано!' },
          { id: 'a3', text: 'Удалить приложение аутентификатор и установить заново', isCorrect: false, explanation: 'Это не решит проблему — нужно проверить устройство на вирусы!' },
        ],
        hint: 'Проверьте устройство на вирусы. Смените все пароли. Проверьте активные сессии во всех аккаунтах.',
        consequence: 'Вы только удалили аккаунты. Злоумышленник оставил бэкдор и получил доступ снова.',
      },
    ],
  },




  {
    id: 'cyber-defense-game',
    title: '🎮 CyberDefense: Защита от RAT',
    description: 'Защити компьютерную систему от волн хакерских атак!',
    location: 'office',
    difficulty: 7,
    attackType: 'malware',
    intro: 'Ты — системный администратор. На твою сеть нападают хакеры с RAT (Remote Access Trojan), фишингом, ransomware и другими угрозами. Расставь средства защиты и выдержи 5 волн атак!',
    cweReference: 'CWE-94',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Первая волна атак начинается! RAT-трояны и фишинговые боты движутся к твоей сети.',
        question: 'Какие средства защиты ты установишь в первую очередь?',
        options: [
          { id: 'a1', text: 'Файрвол — блокирует входящие подключения', isCorrect: true },
          { id: 'a2', text: 'Антивирус — обнаруживает и удаляет угрозы', isCorrect: true },
          { id: 'a3', text: 'Ничего — подожду и посмотрю', isCorrect: false, explanation: 'Без защиты хакеры проникнут в систему за секунды!' },
          { id: 'a4', text: 'Только бэкап — он самый прочный', isCorrect: false, explanation: 'Бэкап не атакует! Нужны средства активного противодействия.' },
        ],
        hint: 'Файрвол и антивирус — лучшие средства для первой линии обороны. Файрвол блокирует, антивирус уничтожает.',
        consequence: 'Без защиты хакеры проникли в систему. Все данные украдены, файлы зашифрованы.',
        simulatorData: {
          type: 'cyber_defense',
        },
      },
      {
        id: 'step-2',
        context: 'Ты отбил первые волны. Теперь идут более серьёзные угрозы: ransomware и трояны.',
        question: 'Что нужно сделать после успешной защиты?',
        options: [
          { id: 'a1', text: 'Продолжать обновлять защиту и следить за новыми угрозами', isCorrect: true },
          { id: 'a2', text: 'Расслабиться — атака отбита', isCorrect: false, explanation: 'Хакеры не сдаются! Они вернутся с новыми инструментами.' },
          { id: 'a3', text: 'Отключить интернет — так безопаснее', isCorrect: false, explanation: 'Это не решение — бизнес не сможет работать без сети.' },
        ],
        hint: 'Кибербезопасность — непрерывный процесс. Обновляй защиту, мониторь логи, обучай сотрудников.',
        consequence: 'Ты расслабился. Хакеры использовали zero-day уязвимость и проникли в систему.',
      },
    ],
  },




  {
    id: 'smishing-delivery',
    title: '📱 SMS от «СДЭК»: посылка ожидает получения',
    description: 'Вам пришло SMS о посылке с подозрительной ссылкой.',
    location: 'home',
    difficulty: 4,
    attackType: 'phishing',
    intro: 'Вам приходит SMS: «СДЭК: Ваша посылка #4521 ожидает получения. Оплатите доставку 149₽: http://cdek-delivery.cc/pay». Вы не заказывали ничего.',
    cweReference: 'CWE-640',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'SMS от неизвестного номера +7-9XX-XXX-XX-XX. Ссылка ведёт на cdek-delivery.cc (не cdek.ru).',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Перейду по ссылке — вдруг это правда посылка', isCorrect: false, explanation: 'Вы не заказывали ничего! Это фишинговая ссылка.' },
          { id: 'a2', text: 'Проигнорирую SMS и удалю его', isCorrect: true },
          { id: 'a3', text: 'Позвоню в СДЭК по официальному номеру для проверки', isCorrect: true },
          { id: 'a4', text: 'Перешлю SMS другу — пусть проверит', isCorrect: false, explanation: 'Друг тоже может перейти по ссылке!' },
        ],
        hint: 'Вы не заказывали ничего. Домен cdek-delivery.cc — поддельный. Настоящий — cdek.ru.',
        consequence: 'Вы перешли по ссылке и ввели данные карты. Мошенники списали 15 000₽.',
        simulatorData: {
          type: 'phone',
          messages: [
            {
              id: 'sms-1', sender: 'СДЭК', senderNumber: '+7-9XX-XXX-XX-XX',
              text: 'СДЭК: Ваша посылка #4521 ожидает получения. Оплатите доставку 149₽: http://cdek-delivery.cc/pay',
              time: '14:30', isRead: false, isPhishing: true,
              linkUrl: 'http://cdek-delivery.cc/pay', linkText: 'Оплатить доставку →',
            },
            {
              id: 'sms-2', sender: 'Банк', senderNumber: '900',
              text: 'Ваш баланс: 47 500₽. Последняя операция: Пятёрочка 1 250₽.',
              time: '12:00', isRead: true, isPhishing: false,
            },
          ],
          selectedId: 'sms-1',
        },
      },
      {
        id: 'step-2',
        context: 'Вы проверили — в личном кабинете СДЭК нет посылок на ваше имя.',
        question: 'Что нужно сделать дополнительно?',
        options: [
          { id: 'a1', text: 'Заблокировать номер и сообщить о фишинге', isCorrect: true },
          { id: 'a2', text: 'Ничего — я же не перешёл по ссылке', isCorrect: false, explanation: 'Лучше заблокировать номер, чтобы не пришло больше SMS.' },
        ],
        hint: 'Заблокируйте номер и сообщите о фишинге в СДЭК через официальный сайт.',
        consequence: 'Вы не заблокировали номер. Пришло ещё 5 фишинговых SMS.',
      },
    ],
  },




  {
    id: 'vishing-bank-call',
    title: '📞 Звонок из «службы безопасности»',
    description: 'Вам звонит неизвестный и представляется сотрудником банка.',
    location: 'home',
    difficulty: 6,
    attackType: 'social_engineering',
    intro: 'Вам звонят: «Здравствуйте, это служба безопасности банка. Мы зафиксировали подозрительную операцию на 85 000₽. Для отмены назовите код из SMS».',
    cweReference: 'CWE-288',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Звонящий знает ваше ФИО и последние 4 цифры карты. Он торопит: «Код действует 2 минуты!»',
        question: 'Что вы ответите?',
        options: [
          { id: 'a1', text: 'Назову код — он же знает мои данные', isCorrect: false, explanation: 'НИКОГДА не сообщайте коды из SMS!' },
          { id: 'a2', text: 'Положу трубку и перезвоню в банк по номеру с карты', isCorrect: true },
          { id: 'a3', text: 'Спрошу ФИО сотрудника и номер отделения', isCorrect: false, explanation: 'Мошенники могут назвать любые данные.' },
        ],
        hint: 'Настоящий банк НИКОГДА не просит коды из SMS. Положите трубку и перезвоните по номеру с карты.',
        consequence: 'Вы назвали код. Мошенник подтвердил перевод 85 000₽ на свой счёт.',
        simulatorData: {
          type: 'call',
          messages: [
            { id: 'call-1', senderName: 'Неизвестный', senderId: '+7-495-XXX-XX-XX', text: 'Здравствуйте, это служба безопасности банка. Мы зафиксировали операцию на 85 000₽.' },
            { id: 'call-2', senderName: 'Неизвестный', senderId: '+7-495-XXX-XX-XX', text: 'Для отмены назовите код из SMS. Он действует 2 минуты!' },
            { id: 'call-3', senderName: 'Неизвестный', senderId: '+7-495-XXX-XX-XX', text: 'Не кладите трубку! Иначе счёт будет заблокирован!' },
          ],
        },
      },
    ],
  },




  {
    id: 'messenger-phishing',
    title: '💬 «Друг» просит перевести деньги в мессенджере',
    description: 'Вам пишет друг в мессенджере с необычной просьбой.',
    location: 'public_wifi',
    difficulty: 5,
    attackType: 'phishing',
    intro: 'В Telegram пишет «друг»: «Привет! Срочно нужно 5000₽, карта не работает. Переведи на этот номер, завтра верну». Но стиль сообщений необычный.',
    cweReference: 'CWE-640',
    owaspReference: 'A01:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Сообщения от «друга» но с ошибками, торопит, просит перевести на неизвестный номер.',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Переведу — друг же просит', isCorrect: false, explanation: 'Аккаунт друга мог быть взломан!' },
          { id: 'a2', text: 'Позвоню другу по телефону для проверки', isCorrect: true },
          { id: 'a3', text: 'Спрошу кодовое слово', isCorrect: false, explanation: 'Хорошо, но лучше позвонить.' },
        ],
        hint: 'Аккаунт друга мог быть взломан. Позвоните ему по телефону для проверки.',
        consequence: 'Вы перевели деньги. Аккаунт друга был взломан, деньги ушли мошеннику.',
        simulatorData: {
          type: 'messenger',
          contacts: [
            { id: 'c1', name: 'Алексей', avatar: '👤', lastMessage: 'Завтра точно верну!', unread: 3, online: true, isFake: true },
            { id: 'c2', name: 'Мама', avatar: '👩', lastMessage: 'Когда приедешь?', unread: 0, online: false },
            { id: 'c3', name: 'Работа', avatar: '💼', lastMessage: 'Отчёт готов?', unread: 1, online: true },
          ],
          messages: [
            { id: 'm1', senderId: 'c1', senderName: 'Алексей', text: 'Привет! Срочно нужно 5000₽', timestamp: '14:30', isOwn: false, hasLink: false, isFake: true },
            { id: 'm2', senderId: 'c1', senderName: 'Алексей', text: 'Карта не работает, переведи на +7-9XX-XXX-XX-XX', timestamp: '14:31', isOwn: false, hasLink: false, isFake: true },
            { id: 'm3', senderId: 'c1', senderName: 'Алексей', text: 'Завтра точно верну!', timestamp: '14:31', isOwn: false, hasLink: false, isFake: true },
            { id: 'm4', senderId: 'c2', senderName: 'Мама', text: 'Когда приедешь?', timestamp: '12:00', isOwn: false },
            { id: 'm5', senderId: 'c3', senderName: 'Работа', text: 'Отчёт готов?', timestamp: '10:00', isOwn: false },
          ],
          selectedId: 'c1',
        },
      },
    ],
  },




  {
    id: 'atm-skimming',
    title: '🏧 Подозрительный банкомат',
    description: 'Вы хотите снять наличные, но банкомат выглядит подозрительно.',
    location: 'home',
    difficulty: 4,
    attackType: 'skimming',
    intro: 'Вы подходите к банкомату в торговом центре. Картоприёмник выглядит толще обычного, а рядом с клавиатурой — подозрительный объект.',
    cweReference: 'CWE-319',
    owaspReference: 'A02:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Картоприёмник толще обычного. Рядом с клавиатурой — маленький объект (возможно камера).',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Вставлю карту — может, это конструкция банкомата', isCorrect: false, explanation: 'Это скиммер! Данные карты будут украдены.' },
          { id: 'a2', text: 'Не буду использовать этот банкомат и сообщу в банк', isCorrect: true },
          { id: 'a3', text: 'Попробую другой банкомат в этом же ТЦ', isCorrect: false, explanation: 'Лучше найти банкомат в отделении банка.' },
        ],
        hint: 'Скиммер — накладка на картоприёмник. Камера — для записи PIN. Не используйте этот банкомат!',
        consequence: 'Вы вставили карту. Скиммер скопировал данные, камера записала PIN. Через неделю списали 50 000₽.',
        simulatorData: {
          type: 'atm',
        },
      },
    ],
  },




  {
    id: 'public-pc-session',
    title: '🖥️ Забыл выйти из почты на публичном ПК',
    description: 'Вы зашли в почту с публичного компьютера и отошли.',
    location: 'office',
    difficulty: 5,
    attackType: 'phishing',
    intro: 'Вы зашли в рабочую почту с компьютера в библиотеке и отошли на 5 минут, не выйдя из аккаунта.',
    cweReference: 'CWE-384',
    owaspReference: 'A07:2021',
    steps: [
      {
        id: 'step-1',
        context: 'Вы вернулись к компьютеру. Почта всё ещё открыта. Кто-то мог получить доступ.',
        question: 'Что вы сделаете?',
        options: [
          { id: 'a1', text: 'Срочно выйду из аккаунта и сменю пароль', isCorrect: true },
          { id: 'a2', text: 'Ничего — я же всего на 5 минут отошёл', isCorrect: false, explanation: 'За 5 минут можно украсть все данные!' },
          { id: 'a3', text: 'Просто закрою браузер', isCorrect: false, explanation: 'Нужно именно ВЫЙТИ из аккаунта (Logout)!' },
        ],
        hint: 'Срочно выйдите из аккаунта и смените пароль. Проверьте последние действия в аккаунте.',
        consequence: 'Вы не вышли из аккаунта. Злоумышленник получил доступ к почте и украл конфиденциальные данные.',
        simulatorData: {
          type: 'public_pc',
        },
      },
    ],
  },
];

export function getQuizScenarioById(id: string): QuizScenario | undefined {
  return quizScenarios.find((s) => s.id === id);
}

export const quizScenarioLocations: Record<ScenarioLocation, { name: string; description: string; icon: string }> = {
  office: { name: 'Офис', description: 'Корпоративная среда: почта, мессенджеры, внутренние системы', icon: 'Briefcase' },
  home: { name: 'Дом', description: 'Домашняя среда: онлайн-банк, соцсети, покупки онлайн', icon: 'Home' },
  public_wifi: { name: 'Общественный Wi-Fi', description: 'Публичные сети: кафе, аэропорты, коворкинги', icon: 'Wifi' },
};

export const quizAttackTypeLabels: Record<AttackType, string> = {
  phishing: 'Фишинг',
  skimming: 'Скимминг',
  brute_force: 'Подбор пароля',
  social_engineering: 'Социальная инженерия',
  deepfake: 'Дипфейк',
  malware: 'Вредоносное ПО',
  man_in_the_middle: 'Человек посередине',
};
