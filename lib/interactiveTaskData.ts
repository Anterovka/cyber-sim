import type { InteractiveTask } from '../lib/interactiveTaskTypes';
import { cweData, owaspData, apwgData, minsifryData, kasperskyData } from '../lib/externalData';

export const interactiveTasks: Record<string, InteractiveTask[]> = {



  'office-phishing': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: 'Вы открыли письмо от «IT Support <support@company-IT-help.com>» с темой «СРОЧНО: Требуется обновление пароля».',
      instruction: 'Найди все подозрительные элементы в этом письме.',
      hint: `Обрати внимание на домен отправителя (company-IT-help.com vs company.ru). ${minsifryData.tips[2]} ${kasperskyData.tips[1]}`,
      consequence: `Ты пропустил подозрительные элементы. ${cweData['CWE-640'].description}`,
      data: {
        type: 'findOnScreen',
        screenDescription: 'Письмо в почте: отправитель «IT Support <support@company-IT-help.com>», тема «СРОЧНО: Требуется обновление пароля до 18:00», текст «Нажмите кнопку ниже для смены пароля», ссылка https://company-IT-help.com/reset-password',
        elements: [
          { id: 'el-1', label: 'Домен отправителя', description: 'support@company-IT-help.com', isTarget: true, explanation: 'Домен company-IT-help.com не совпадает с корпоративным company.ru!' },
          { id: 'el-2', label: 'Срочность в теме', description: '«СРОЧНО: до 18:00»', isTarget: true, explanation: 'Срочность — типичный приём фишинга, чтобы ты не думал.' },
          { id: 'el-3', label: 'Ссылка для смены пароля', description: 'https://company-IT-help.com/reset-password', isTarget: true, explanation: 'Ссылка ведёт на поддельный сайт, а не на корпоративный портал.' },
          { id: 'el-4', label: 'Логотип компании', description: 'В шапке письма', isTarget: false, explanation: 'Логотип легко подделать — это не признак подлинности.' },
          { id: 'el-5', label: 'Подпись «IT-отдел»', description: 'В конце письма', isTarget: false, explanation: 'Подпись тоже легко подделать.' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3'],
        minFound: 2,
      },
    },
    {
      id: 'task-2',
      type: 'multiSelect',
      context: `Ты проверил заголовки письма: SPF = FAIL, DKIM = FAIL. ${owaspData['A01:2021'].description}`,
      instruction: 'Выбери все правильные утверждения о SPF и DKIM.',
      hint: `${cweData['CWE-640'].description} ${kasperskyData.tips[1]}`,
      consequence: `Неправильное понимание SPF/DKIM может привести к тому, что ты пропустишь фишинговое письмо. ${owaspData['A01:2021'].description}`,
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'SPF FAIL означает, что серверу не разрешено отправлять письма от этого домена', isCorrect: true },
          { id: 'o2', text: 'DKIM FAIL означает, что письмо было изменено или подделано', isCorrect: true },
          { id: 'o3', text: 'SPF и DKIM — это одно и то же', isCorrect: false, explanation: 'SPF проверяет сервер, DKIM — целостность и подпись письма.' },
          { id: 'o4', text: 'Если SPF и DKIM FAIL — письмо скорее всего фишинговое', isCorrect: true },
          { id: 'o5', text: 'SPF защищает от подделки содержимого письма', isCorrect: false, explanation: 'SPF проверяет только сервер-отправитель. От подделки содержимого защищает DKIM.' },
          { id: 'o6', text: 'DMARC объединяет проверки SPF и DKIM', isCorrect: true },
        ],
        correctOptionIds: ['o1', 'o2', 'o4', 'o6'],
        minCorrect: 3,
      },
    },
  ],




  'office-brute-force': [
    {
      id: 'task-1',
      type: 'matchPairs',
      context: `Ты получил 5 уведомлений о неудачных попытках входа. ${cweData['CWE-307'].description} ${cweData['CWE-521'].description}`,
      instruction: 'Соедини каждую угрозу с правильным методом защиты.',
      hint: `${minsifryData.tips[0]} ${minsifryData.tips[1]} ${kasperskyData.tips[0]}`,
      consequence: `Без правильной защиты злоумышленник подберёт пароль. ${owaspData['A07:2021'].description}`,
      data: {
        type: 'matchPairs',
        leftItems: [
          { id: 'l1', text: 'Слабый пароль (123456)' },
          { id: 'l2', text: 'Нет двухфакторной аутентификации' },
          { id: 'l3', text: 'Один пароль для всех сервисов' },
        ],
        rightItems: [
          { id: 'r1', text: 'Включить 2FA через приложение-аутентификатор' },
          { id: 'r2', text: 'Использовать менеджер паролей для уникальных паролей' },
          { id: 'r3', text: 'Сменить на 16+ символов со спецсимволами' },
        ],
        correctPairs: { l1: 'r3', l2: 'r1', l3: 'r2' },
      },
    },
  ],




  'home-social-engineering': [
    {
      id: 'task-1',
      type: 'multiSelect',
      context: `Тебе звонит «сотрудник банка» и просит код из SMS. ${cweData['CWE-288'].description} ${apwgData.stats}`,
      instruction: 'Выбери все правильные действия в этой ситуации.',
      hint: `${minsifryData.tips[6]} ${kasperskyData.tips[5]} Настоящий банк НИКОГДА не просит коды из SMS.`,
      consequence: `Сообщив код из SMS, ты подтвердил перевод денег мошенникам. ${owaspData['A07:2021'].description}`,
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Положить трубку', isCorrect: true },
          { id: 'o2', text: 'Назвать код из SMS для «подтверждения»', isCorrect: false, explanation: 'НИКОГДА не сообщай коды из SMS!' },
          { id: 'o3', text: 'Перезвонить в банк по номеру с обратной стороны карты', isCorrect: true },
          { id: 'o4', text: 'Сообщить мошеннику свои ФИО для «проверки»', isCorrect: false, explanation: 'Не давай никаких данных неизвестному звонящему.' },
          { id: 'o5', text: 'Записать номер звонящего и сообщить в полицию', isCorrect: true },
          { id: 'o6', text: 'Установить AnyDesk для «проверки безопасности»', isCorrect: false, explanation: 'Никогда не устанавливай программы по просьбе звонящего!' },
        ],
        correctOptionIds: ['o1', 'o3', 'o5'],
        minCorrect: 2,
      },
    },
  ],




  'home-skimming': [
    {
      id: 'task-1',
      type: 'textInput',
      context: `Ты нашёл сайт для оплаты ЖКХ: gosuslugi-oplata.com. ${cweData['CWE-319'].description} ${cweData['CWE-200'].description}`,
      instruction: 'Введи правильный URL сайта Госуслуг.',
      hint: `${minsifryData.tips[3]} ${kasperskyData.tips[4]} Настоящий сайт — gosuslugi.ru с HTTPS.`,
      consequence: `Ты ввёл данные карты на поддельном сайте. ${owaspData['A02:2021'].description}`,
      data: {
        type: 'textInput',
        placeholder: 'Введи URL сайта Госуслуг...',
        correctAnswers: ['gosuslugi.ru', 'https://gosuslugi.ru', 'www.gosuslugi.ru'],
        exampleAnswer: 'gosuslugi.ru',
        inputType: 'url',
      },
    },
    {
      id: 'task-2',
      type: 'multiSelect',
      context: `Какие признаки указывают на то, что сайт поддельный? ${apwgData.trends[1]}`,
      instruction: 'Выбери все признаки фишингового сайта.',
      hint: `${minsifryData.tips[3]} ${kasperskyData.tips[4]} ${owaspData['A02:2021'].description}`,
      consequence: `Ты не заметил признаки поддельного сайта и ввёл данные карты. ${cweData['CWE-319'].description}`,
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Домен gosuslugi-oplata.com вместо gosuslugi.ru', isCorrect: true },
          { id: 'o2', text: 'Отсутствие HTTPS (нет замка в адресной строке)', isCorrect: true },
          { id: 'o3', text: 'Красивый дизайн с логотипом', isCorrect: false, explanation: 'Дизайн легко подделать — это не признак подлинности.' },
          { id: 'o4', text: 'Сайт найден в Яндексе на первом месте', isCorrect: false, explanation: 'Фишинговые сайты могут быть в поисковой выдаче.' },
          { id: 'o5', text: 'Просят CVV-код карты', isCorrect: true },
        ],
        correctOptionIds: ['o1', 'o2', 'o5'],
        minCorrect: 2,
      },
    },
  ],






  'public-wifi-mitm': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: `Ты в кафе и подключился к Wi-Fi «CoffeeHouse_Free_WiFi». Сеть открытая, без пароля. ${cweData['CWE-295'].description}`,
      instruction: 'Найди все признаки небезопасного подключения.',
      hint: `${minsifryData.tips[4]} ${kasperskyData.tips[3]} Открытая сеть без пароля = трафик не шифруется.`,
      consequence: `Ты не заметил признаков опасности. Злоумышленник в той же сети перехватывает весь трафик. ${cweData['CWE-295'].description}`,
      data: {
        type: 'findOnScreen',
        screenDescription: 'Настройки телефона: Wi-Fi подключён к «CoffeeHouse_Free_WiFi» (без пароля, без замка). VPN: выключен. Bluetooth: включён и виден всем. Геолокация: включена для всех приложений.',
        elements: [
          { id: 'el-1', label: 'Открытая Wi-Fi сеть', description: 'CoffeeHouse_Free_WiFi — без пароля, без шифрования', isTarget: true, explanation: 'Открытые сети не шифруют трафик — любой в той же сети может перехватывать данные.' },
          { id: 'el-2', label: 'VPN выключен', description: 'Виртуальная частная сеть не активна', isTarget: true, explanation: 'Без VPN весь трафик идёт в открытом виде через роутер кафе.' },
          { id: 'el-3', label: 'Bluetooth виден всем', description: 'Режим видимости: «Все устройства»', isTarget: true, explanation: 'Видимый Bluetooth позволяет злоумышленнику подключиться к устройству.' },
          { id: 'el-4', label: 'Геолокация для всех', description: 'Доступ к местоположению для всех приложений', isTarget: false, explanation: 'Это не напрямую связано с MITM, но тоже риск приватности.' },
          { id: 'el-5', label: 'Нет значка замка у Wi-Fi', description: 'Рядом с названием сети нет иконки замка', isTarget: true, explanation: 'Отсутствие замка означает что соединение не зашифровано (WPA2/WPA3).' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3', 'el-5'],
        minFound: 3,
      },
    },
    {
      id: 'task-2',
      type: 'orderSteps',
      context: `Ты понял что сеть небезопасна. ${cweData['CWE-384'].description} ${owaspData['A02:2021'].description}`,
      instruction: 'Расставь шаги безопасного подключения в правильном порядке.',
      hint: `${minsifryData.tips[4]} ${kasperskyData.tips[3]} Сначала защити соединение, потом заходи в банк.`,
      consequence: `Неправильный порядок = данные карты будут перехвачены. ${cweData['CWE-319'].description}`,
      data: {
        type: 'orderSteps',
        correctOrder: ['step-3', 'step-1', 'step-4', 'step-2'],
        shuffledSteps: [
          { id: 'step-1', text: 'Подключить VPN и проверить что он активен' },
          { id: 'step-2', text: 'Выйти из онлайн-банка и завершить сессию' },
          { id: 'step-3', text: 'Отключиться от открытого Wi-Fi или включить VPN' },
          { id: 'step-4', text: 'Зайти в онлайн-банк через защищённое соединение' },
        ],
      },
    },
  ],




  'public-wifi-deepfake': [
    {
      id: 'task-1',
      type: 'multiSelect',
      context: `«Иван Петрович» звонит по видеосвязи и просит перевести 250 000₽. ${cweData['CWE-345'].description} ${apwgData.trends[2]}`,
      instruction: 'Выбери все признаки того, что это может быть дипфейк.',
      hint: `${minsifryData.tips[2]} ${kasperskyData.tips[5]} Рассинхронизация губ — главный признак дипфейка.`,
      consequence: `Ты перевёл деньги фейковому «руководителю». ${owaspData['A01:2021'].description}`,
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Губы не синхронизированы с речью', isCorrect: true },
          { id: 'o2', text: 'Неестественные движения головы', isCorrect: true },
          { id: 'o3', text: 'Руководитель звонит с незнакомого номера', isCorrect: true },
          { id: 'o4', text: 'Руководитель носит галстук', isCorrect: false, explanation: 'Это нормально — не признак дипфейка.' },
          { id: 'o5', text: 'Очень срочный запрос на перевод денег', isCorrect: true },
          { id: 'o6', text: 'Фоновый шум как в офисе', isCorrect: false, explanation: 'Фоновый шум может быть и у реального звонка.' },
        ],
        correctOptionIds: ['o1', 'o2', 'o3', 'o5'],
        minCorrect: 3,
      },
    },
  ],




  'malware-invoice': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: `Тебе пришло письмо со счётом и Excel-файлом. ${cweData['CWE-94'].description} ${owaspData['A08:2021'].description}`,
      instruction: 'Найди все подозрительные элементы в этом письме.',
      hint: `${minsifryData.tips[2]} ${kasperskyData.tips[2]} Никогда не включай макросы из непроверенных источников.`,
      consequence: `Ты открыл файл и включил макросы. ${cweData['CWE-94'].description}`,
      data: {
        type: 'findOnScreen',
        screenDescription: 'Письмо от «Бухгалтерия <billing@company-invoice.ru>», тема «Счёт №4521 на оплату», вложение «Счёт_4521.xls», текст «Откройте файл и включите макросы для просмотра»',
        elements: [
          { id: 'el-1', label: 'Домен отправителя', description: 'billing@company-invoice.ru', isTarget: true, explanation: 'Домен не совпадает с корпоративным!' },
          { id: 'el-2', label: 'Excel-файл во вложении', description: 'Счёт_4521.xls', isTarget: true, explanation: 'Excel-файлы могут содержать вредоносные макросы.' },
          { id: 'el-3', label: 'Просьба включить макросы', description: '«Включите макросы для просмотра»', isTarget: true, explanation: 'НИКОГДА не включай макросы из писем!' },
          { id: 'el-4', label: 'Тема письма', description: '«Счёт №4521 на оплату»', isTarget: false, explanation: 'Тема выглядит нормально, но это не гарантирует безопасность.' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3'],
        minFound: 2,
      },
    },
  ],




  'mobile-banking-fraud': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: 'Ты открыл мобильный банк и увидел несколько операций за последний час.',
      instruction: 'Найди все подозрительные транзакции в истории операций.',
      hint: 'Обрати внимание на необычные суммы, неизвестных мерчантов и операции в странное время.',
      consequence: 'Ты пропустил подозрительные операции. Мошенники успели списать деньги с твоего счёта.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'Мобильный банк: баланс 45 000₽, последние операции: Покупка Пятёрочка -1250₽, Перевод Иван И. -5000₽, Оплата Steam -890₽, Снятие банкомат -15000₽, Подписка Netflix -399₽',
        elements: [
          { id: 'el-1', label: 'Перевод Иван И.', description: '-5000₽, неизвестный получатель', isTarget: true, explanation: 'Ты не знаешь этого человека — возможно, мошеннический перевод!' },
          { id: 'el-2', label: 'Снятие банкомат', description: '-15000₽, 3:47 AM', isTarget: true, explanation: 'Снятие в 3:47 утра — подозрительное время и большая сумма!' },
          { id: 'el-3', label: 'Покупка Пятёрочка', description: '-1250₽, обычный магазин', isTarget: false, explanation: 'Обычная покупка в продуктовом магазине.' },
          { id: 'el-4', label: 'Оплата Steam', description: '-890₽, игровая платформа', isTarget: false, explanation: 'Возможно, твоя собственная покупка.' },
          { id: 'el-5', label: 'Подписка Netflix', description: '-399₽, ежемесячная подписка', isTarget: false, explanation: 'Регулярная подписка, которую ты оформил.' },
        ],
        targetElementIds: ['el-1', 'el-2'],
        minFound: 1,
      },
    },
    {
      id: 'task-2',
      type: 'orderSteps',
      context: 'Ты обнаружил подозрительные операции в мобильном банке.',
      instruction: 'Расставь шаги по защите счёта в правильном порядке.',
      hint: 'Сначала заблокируй карту, затем позвони в банк, потом смени пароль.',
      consequence: 'Неправильный порядок действий может привести к потере денег.',
      data: {
        type: 'orderSteps',
        correctOrder: ['step-1', 'step-2', 'step-3', 'step-4'],
        shuffledSteps: [
          { id: 'step-1', text: 'Заблокировать карту в приложении' },
          { id: 'step-2', text: 'Позвонить в банк по номеру с карты' },
          { id: 'step-3', text: 'Написать заявление в полицию' },
          { id: 'step-4', text: 'Сменить пароль от онлайн-банка' },
        ],
      },
    },
  ],




  'browser-phishing': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: 'Ты зашёл на сайт онлайн-банка через публичный Wi-Fi. Браузер показывает предупреждение.',
      instruction: 'Найди все признаки того, что соединение может быть небезопасным.',
      hint: 'Проверь HTTPS, сертификат сайта и URL адрес.',
      consequence: 'Ты проигнорировал предупреждения. Злоумышленник перехватил данные для входа.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'Браузер: URL https://bank-online.cc, предупреждение «Соединение не защищено», сертификат от «Unknown CA», форма входа с полями Логин и Пароль',
        elements: [
          { id: 'el-1', label: 'Поддельный домен', description: 'bank-online.cc вместо bank.ru', isTarget: true, explanation: 'Домен не совпадает с официальным bank.ru!' },
          { id: 'el-2', label: 'Предупреждение браузера', description: '«Соединение не защищено»', isTarget: true, explanation: 'Браузер предупреждает о проблемах с сертификатом!' },
          { id: 'el-3', label: 'Неизвестный сертификат', description: 'От «Unknown CA»', isTarget: true, explanation: 'Сертификат от неизвестного издателя — признак MITM!' },
          { id: 'el-4', label: 'Форма входа', description: 'Поля Логин и Пароль', isTarget: false, explanation: 'Форма сама по себе не признак фишинга, но опасна на поддельном сайте.' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3'],
        minFound: 2,
      },
    },
    {
      id: 'task-2',
      type: 'textInput',
      context: 'Ты заметил, что сайт банка использует поддельный сертификат.',
      instruction: 'Напиши, что нужно сделать в первую очередь при обнаружении поддельного сертификата.',
      hint: 'Немедленно закрой сайт и отключись от небезопасной сети.',
      consequence: 'Ты остался на сайте и ввёл данные. Злоумышленник получил доступ к счёту.',
      data: {
        type: 'textInput',
        placeholder: 'Закрою сайт и...',
        correctAnswers: ['отключусь от wi-fi', 'закрою браузер', 'отключусь от сети', 'сменю сеть', 'перейду на мобильный интернет'],
        exampleAnswer: 'Закрою сайт и отключусь от Wi-Fi',
        inputType: 'text',
      },
    },
  ],




  'social-media-phishing': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: 'Ты листаешь ленту соцсети и видишь несколько постов с призами и ссылками.',
      instruction: 'Найди все подозрительные посты, которые могут быть фишингом.',
      hint: 'Обрати внимание на непроверенные аккаунты, слишком хорошие предложения и подозрительные ссылки.',
      consequence: 'Ты перешёл по фишинговой ссылке и ввёл данные. Аккаунт взломан.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'Лента соцсети: пост «Вы выиграли iPhone!» от непроверенного аккаунта, пост друга с ссылкой на статью, пост «Голосуй за меня!» с подозрительной ссылкой, рекламный пост от известного бренда',
        elements: [
          { id: 'el-1', label: 'Пост «Вы выиграли iPhone!»', description: 'От непроверенного аккаунта, требует перейти по ссылке', isTarget: true, explanation: 'Слишком хорошее предложение от неизвестного аккаунта — классический фишинг!' },
          { id: 'el-2', label: 'Пост «Голосуй за меня!»', description: 'Ссылка ведёт на подозрительный сайт', isTarget: true, explanation: 'Подозрительная ссылка, возможно фишинговая!' },
          { id: 'el-3', label: 'Пост друга со статьёй', description: 'Обычная ссылка на новостной сайт', isTarget: false, explanation: 'Пост от друга и обычная ссылка.' },
          { id: 'el-4', label: 'Рекламный пост бренда', description: 'От проверенного бренда', isTarget: false, explanation: 'Официальная реклама известного бренда.' },
        ],
        targetElementIds: ['el-1', 'el-2'],
        minFound: 1,
      },
    },
    {
      id: 'task-2',
      type: 'multiSelect',
      context: 'Ты получил сообщение в соцсети от «друга» с просьбой перейти по ссылке и «проголосовать».',
      instruction: 'Выбери все признаки, которые указывают на возможный взлом аккаунта друга.',
      hint: 'Обрати внимание на стиль общения, необычные просьбы и подозрительные ссылки.',
      consequence: 'Ты перешёл по ссылке и ввёл данные. Аккаунт взломан, данные украдены.',
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Сообщение написано в необычном стиле', isCorrect: true },
          { id: 'o2', text: 'Друг просит срочно перейти по ссылке', isCorrect: true },
          { id: 'o3', text: 'Ссылка ведёт на неизвестный сайт', isCorrect: true },
          { id: 'o4', text: 'Друг обычно так не пишет', isCorrect: true },
          { id: 'o5', text: 'Сообщение отправлено днём', isCorrect: false, explanation: 'Время отправки не является признаком взлома.' },
          { id: 'o6', text: 'У друга новый аватар', isCorrect: false, explanation: 'Смена аватара сама по себе не признак взлома.' },
        ],
        correctOptionIds: ['o1', 'o2', 'o3', 'o4'],
        minCorrect: 3,
      },
    },
  ],




  'file-explorer-malware': [
    {
      id: 'task-2',
      type: 'findOnScreen',
      context: 'Ты открыл проводник и увидел несколько файлов в папке «Загрузки».',
      instruction: 'Найди все подозрительные файлы, которые могут быть вредоносными.',
      hint: 'Обрати внимание на .exe, .bat, .scr файлы и файлы с подозрительными именами.',
      consequence: 'Ты запустил вредоносный файл. Компьютер заражён.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'Папка Загрузки: invoice.pdf, setup.exe, document.docx, update.bat, photo.jpg, crack.scr, readme.txt',
        elements: [
          { id: 'el-1', label: 'setup.exe', description: 'Исполняемый файл', isTarget: true, explanation: 'EXE-файлы могут содержать вредоносный код!' },
          { id: 'el-2', label: 'update.bat', description: 'Пакетный файл', isTarget: true, explanation: 'BAT-файлы могут выполнять опасные команды!' },
          { id: 'el-3', label: 'crack.scr', description: 'Скринсейвер/исполняемый', isTarget: true, explanation: 'SCR-файлы — это EXE-файлы, часто используются для malware!' },
          { id: 'el-4', label: 'invoice.pdf', description: 'PDF документ', isTarget: false, explanation: 'PDF обычно безопасен, но может содержать вредоносные скрипты.' },
          { id: 'el-5', label: 'document.docx', description: 'Word документ', isTarget: false, explanation: 'DOCX может содержать макросы, но сам по себе безопасен.' },
          { id: 'el-6', label: 'photo.jpg', description: 'Изображение', isTarget: false, explanation: 'JPG файлы обычно безопасны.' },
          { id: 'el-7', label: 'readme.txt', description: 'Текстовый файл', isTarget: false, explanation: 'TXT файлы безопасны.' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3'],
        minFound: 2,
      },
    },
  ],




  'otp-generator-suspicious': [
    {
      id: 'task-2',
      type: 'findOnScreen',
      context: 'Ты открыл приложение-аутентификатор и увидел несколько аккаунтов.',
      instruction: 'Найди все подозрительные аккаунты, которые ты не добавлял.',
      hint: 'Обрати внимание на незнакомые сервисы и аккаунты с подозрительными именами.',
      consequence: 'Ты пропустил подозрительный аккаунт. Злоумышленник получил доступ к твоему 2FA.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'Аутентификатор: Google (your@email.com), GitHub (username), Unknown Service (x7k2m), банк (phone+7...), Crypto Exchange (trader123)',
        elements: [
          { id: 'el-1', label: 'Unknown Service (x7k2m)', description: 'Неизвестный сервис с кодовым именем', isTarget: true, explanation: 'Ты не добавлял этот сервис — возможно, злоумышленник добавил его!' },
          { id: 'el-2', label: 'Crypto Exchange (trader123)', description: 'Биржа криптовалют, которую ты не используешь', isTarget: true, explanation: 'Если ты не регистрировался на бирже — это подозрительно!' },
          { id: 'el-3', label: 'Google (your@email.com)', description: 'Твой основной аккаунт', isTarget: false, explanation: 'Это твой собственный аккаунт Google.' },
          { id: 'el-4', label: 'GitHub (username)', description: 'Твой аккаунт разработчика', isTarget: false, explanation: 'Это твой собственный аккаунт GitHub.' },
          { id: 'el-5', label: 'банк (phone+7...)', description: 'Твой банк, привязанный к телефону', isTarget: false, explanation: 'Это твой собственный банковский аккаунт.' },
        ],
        targetElementIds: ['el-1', 'el-2'],
        minFound: 1,
      },
    },
  ],




  'cyber-defense-game': [
    {
      id: 'task-1',
      type: 'multiSelect',
      context: 'Ты играешь в CyberDefense. Первая волна атак начинается! RAT-трояны и фишинговые боты движутся к твоей сети.',
      instruction: 'Выбери все правильные средства защиты для первой линии обороны.',
      hint: 'Файрвол блокирует входящие подключения, антивирус обнаруживает угрозы. Бэкап не атакует!',
      consequence: 'Без защиты хакеры проникли в систему. Все данные украдены, файлы зашифрованы.',
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: '🛡️ Файрвол — блокирует входящие подключения', isCorrect: true },
          { id: 'o2', text: '🔍 Антивирус — обнаруживает и удаляет угрозы', isCorrect: true },
          { id: 'o3', text: 'Ничего — подожду и посмотрю', isCorrect: false, explanation: 'Без защиты хакеры проникнут в систему за секунды!' },
          { id: 'o4', text: '💾 Только бэкап — он самый прочный', isCorrect: false, explanation: 'Бэкап не атакует! Нужны средства активного противодействия.' },
          { id: 'o5', text: '🔑 2FA — двухфакторная аутентификация', isCorrect: true },
        ],
        correctOptionIds: ['o1', 'o2', 'o5'],
        minCorrect: 2,
      },
    },
    {
      id: 'task-2',
      type: 'orderSteps',
      context: 'Ты отбил первые волны. Теперь нужно усилить защиту.',
      instruction: 'Расставь шаги по усилению безопасности в правильном порядке.',
      hint: 'Сначала обнови систему, затем установи антивирус, потом настрой файрвол.',
      consequence: 'Неправильный порядок действий оставил уязвимости в системе.',
      data: {
        type: 'orderSteps',
        correctOrder: ['step-1', 'step-2', 'step-3'],
        shuffledSteps: [
          { id: 'step-1', text: 'Обновить ОС и все программы' },
          { id: 'step-2', text: 'Установить и настроить антивирус' },
          { id: 'step-3', text: 'Настроить правила файрвола' },
        ],
      },
    },
  ],




  'smishing-delivery': [
    {
      id: 'task-1',
      type: 'findOnScreen',
      context: 'Ты получил SMS о посылке, которую не заказывал. Ссылка ведёт на подозрительный сайт.',
      instruction: 'Найди все подозрительные элементы в SMS.',
      hint: 'Обрати внимание на номер отправителя, домен ссылки и срочность.',
      consequence: 'Ты перешёл по ссылке и ввёл данные карты. Мошенники списали деньги.',
      data: {
        type: 'findOnScreen',
        screenDescription: 'SMS от +7-9XX-XXX-XX-XX: «СДЭК: посылка #4521, оплатите доставку 149₽: http://cdek-delivery.cc/pay»',
        elements: [
          { id: 'el-1', label: 'Номер отправителя', description: '+7-9XX-XXX-XX-XX (не официальный)', isTarget: true, explanation: 'СДЭК пишет с коротких номеров, не с мобильных!' },
          { id: 'el-2', label: 'Поддельный домен', description: 'cdek-delivery.cc вместо cdek.ru', isTarget: true, explanation: 'Настоящий сайт — cdek.ru!' },
          { id: 'el-3', label: 'Срочность оплаты', description: 'Требуют оплатить доставку', isTarget: true, explanation: 'СДЭК не просит оплату по SMS!' },
          { id: 'el-4', label: 'Номер посылки', description: '#4521', isTarget: false, explanation: 'Номер может быть случайным.' },
        ],
        targetElementIds: ['el-1', 'el-2', 'el-3'],
        minFound: 2,
      },
    },
  ],




  'messenger-phishing': [
    {
      id: 'task-1',
      type: 'multiSelect',
      context: 'Друг просит срочно перевести деньги. Но стиль сообщений необычный.',
      instruction: 'Выбери все признаки взлома аккаунта друга.',
      hint: 'Обрати внимание на ошибки, срочность и необычную просьбу.',
      consequence: 'Аккаунт друга был взломан. Деньги ушли мошеннику.',
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Необычный стиль сообщений (ошибки)', isCorrect: true },
          { id: 'o2', text: 'Срочность и давление', isCorrect: true },
          { id: 'o3', text: 'Просьба перевести на неизвестный номер', isCorrect: true },
          { id: 'o4', text: 'Друг обычно так не пишет', isCorrect: true },
          { id: 'o5', text: 'Сообщение отправлено днём', isCorrect: false, explanation: 'Время не является признаком взлома.' },
        ],
        correctOptionIds: ['o1', 'o2', 'o3', 'o4'],
        minCorrect: 3,
      },
    },
  ],




  'atm-skimming': [
    {
      id: 'task-1',
      type: 'orderSteps',
      context: 'Ты обнаружил подозрительные элементы на банкомате.',
      instruction: 'Расставь шаги по защите в правильном порядке.',
      hint: 'Сначала не используй банкомат, потом сообщи в банк.',
      consequence: 'Ты использовал банкомат со скиммером. Данные карты украдены.',
      data: {
        type: 'orderSteps',
        correctOrder: ['step-1', 'step-2', 'step-3'],
        shuffledSteps: [
          { id: 'step-1', text: 'Не использовать этот банкомат' },
          { id: 'step-2', text: 'Сообщить в банк о подозрительном устройстве' },
          { id: 'step-3', text: 'Найти банкомат в отделении банка' },
        ],
      },
    },
  ],




  'public-pc-session': [
    {
      id: 'task-1',
      type: 'textInput',
      context: 'Ты вернулся к публичному компьютеру. Почта всё ещё открыта.',
      instruction: 'Напиши, что нужно сделать в первую очередь.',
      hint: 'Нужно немедленно выйти из аккаунта.',
      consequence: 'Ты не вышел из аккаунта. Злоумышленник украл данные.',
      data: {
        type: 'textInput',
        placeholder: 'Срочно...',
        correctAnswers: ['выйду из аккаунта', 'выйти из аккаунта', 'logout', 'сменю пароль', 'выйти и сменить пароль'],
        exampleAnswer: 'Срочно выйду из аккаунта и сменю пароль',
        inputType: 'text',
      },
    },
  ],




  'vishing-bank-call': [
    {
      id: 'task-1',
      type: 'multiSelect',
      context: 'Звонящий из «банка» знает твои данные и торопит.',
      instruction: 'Выбери все признаки мошеннического звонка.',
      hint: 'Настоящий банк НИКОГДА не просит коды из SMS.',
      consequence: 'Ты назвал код. Мошенник подтвердил перевод.',
      data: {
        type: 'multiSelect',
        options: [
          { id: 'o1', text: 'Просит код из SMS', isCorrect: true },
          { id: 'o2', text: 'Торопит и давит', isCorrect: true },
          { id: 'o3', text: 'Угрожает блокировкой счёта', isCorrect: true },
          { id: 'o4', text: 'Знает ФИО и данные карты', isCorrect: false, explanation: 'Данные могли быть из утечки. Это не признак честности.' },
          { id: 'o5', text: 'Звонит с неизвестного номера', isCorrect: true },
        ],
        correctOptionIds: ['o1', 'o2', 'o3', 'o5'],
        minCorrect: 3,
      },
    },
  ],
};

export function getTasksForScenario(scenarioId: string): InteractiveTask[] {
  return interactiveTasks[scenarioId] || [];
}
