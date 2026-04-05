'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {ArrowLeftIcon, ExternalLinkIcon, LockClosedIcon, BookmarkIcon, ExclamationTriangleIcon, FileTextIcon, GlobeIcon, EnvelopeClosedIcon, MobileIcon} from '@radix-ui/react-icons';
import { useThemeMode } from '../../lib/ThemeModeContext';

const resources = [
  {
    category: 'Базы уязвимостей',
    icon: <LockClosedIcon width={20} height={20} />,
    items: [
      {
        title: 'CWE — Common Weakness Enumeration',
        description: 'Международный каталог уязвимостей ПО. Используется для описания последствий ошибок в сценариях.',
        url: 'https://cwe.mitre.org/',
        tags: ['Уязвимости', 'Стандарт'],
      },
      {
        title: 'CVE — Common Vulnerabilities and Exposures',
        description: 'Каталог известных уязвимостей. Каждая CVE имеет уникальное описание и оценку критичности.',
        url: 'https://cve.mitre.org/',
        tags: ['Уязвимости', 'База данных'],
      },
      {
        title: 'NVD — National Vulnerability Database',
        description: 'Национальная база уязвимостей NIST с оценками CVSS и ссылками на CWE/CVE.',
        url: 'https://nvd.nist.gov/',
        tags: ['Уязвимости', 'CVSS'],
      },
    ],
  },
  {
    category: 'Фишинг и социальная инженерия',
    icon: <EnvelopeClosedIcon width={20} height={20} />,
    items: [
      {
        title: 'APWG — Anti-Phishing Working Group',
        description: 'Международная организация по борьбе с фишингом. Публикует ежеквартальные отчёты о фишинговых атаках.',
        url: 'https://apwg.org/',
        tags: ['Фишинг', 'Отчёты'],
      },
      {
        title: 'APWG Phishing Activity Trends',
        description: 'Ежеквартальные отчёты о фишинговой активности с реальными примерами атак.',
        url: 'https://apwg.org/trendsreports/',
        tags: ['Фишинг', 'Статистика'],
      },
      {
        title: 'Google Safe Browsing',
        description: 'Сервис Google для проверки сайтов на фишинг и вредоносное ПО.',
        url: 'https://safebrowsing.google.com/',
        tags: ['Фишинг', 'Проверка сайтов'],
      },
    ],
  },
  {
    category: 'Топ угроз OWASP',
    icon: <ExclamationTriangleIcon width={20} height={20} />,
    items: [
      {
        title: 'OWASP Top 10:2021',
        description: '10 самых критических рисков безопасности веб-приложений. Используется для объяснения уязвимостей в сценариях.',
        url: 'https://owasp.org/www-project-top-ten/',
        tags: ['OWASP', 'Топ-10'],
      },
      {
        title: 'OWASP Web Application Security Testing Guide',
        description: 'Руководство по тестированию безопасности веб-приложений.',
        url: 'https://owasp.org/www-project-web-security-testing-guide/',
        tags: ['OWASP', 'Тестирование'],
      },
      {
        title: 'OWASP Cheat Sheet Series',
        description: 'Шпаргалки по защите от различных типов атак.',
        url: 'https://cheatsheetseries.owasp.org/',
        tags: ['OWASP', 'Защита'],
      },
    ],
  },
  {
    category: 'Гайды по защите',
    icon: <LockClosedIcon width={20} height={20} />,
    items: [
      {
        title: 'Минцифры РФ — Рекомендации по защите',
        description: 'Официальные рекомендации Министерства цифрового развития по информационной безопасности.',
        url: 'https://digital.gov.ru/ru/activity/infosecurity/',
        tags: ['Минцифры', 'Россия'],
      },
      {
        title: 'Минцифры — Памятка по кибергигиене',
        description: 'Базовые правила цифровой гигиены для пользователей.',
        url: 'https://digital.gov.ru/ru/events/47088/',
        tags: ['Минцифры', 'Кибергигиена'],
      },
      {
        title: 'Лаборатория Касперского — Для пользователей',
        description: 'Раздел с рекомендациями по защите от вирусов, фишинга и мошенничества.',
        url: 'https://www.kaspersky.ru/resource-center/threats',
        tags: ['Касперский', 'Защита'],
      },
      {
        title: 'Касперский — Энциклопедия угроз',
        description: 'Подробные описания вирусов, троянов, фишинговых схем и способов защиты.',
        url: 'https://encyclopedia.kaspersky.com/',
        tags: ['Касперский', 'Энциклопедия'],
      },
      {
        title: 'Касперский — Социальная инженерия',
        description: 'Как распознать и защититься от манипуляций по телефону и email.',
        url: 'https://www.kaspersky.ru/resource-center/preemptive-safety/social-engineering',
        tags: ['Касперский', 'Соц. инженерия'],
      },
    ],
  },
  {
    category: 'Дополнительные ресурсы',
    icon: <BookmarkIcon width={20} height={20} />,
    items: [
      {
        title: 'Have I Been Pwned',
        description: 'Проверьте, не утекли ли ваши данные в результате взломов.',
        url: 'https://haveibeenpwned.com/',
        tags: ['Утечки', 'Проверка'],
      },
      {
        title: 'VirusTotal',
        description: 'Онлайн-сканер файлов и ссылок на наличие вредоносного ПО.',
        url: 'https://www.virustotal.com/',
        tags: ['Антивирус', 'Проверка'],
      },
      {
        title: 'PhishTank',
        description: 'Сообщество по отслеживанию фишинговых сайтов.',
        url: 'https://phishtank.org/',
        tags: ['Фишинг', 'Сообщество'],
      },
    ],
  },
];

export default function ResourcesPage() {
  const router = useRouter();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowLeftIcon width={18} height={18} />} onClick={() => router.push('/profile')} sx={{ mb: 3, borderRadius: 1.5 }}>
        Назад в профиль
      </Button>

      {}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Образовательные ресурсы</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Реальные базы уязвимостей, фишинговых сценариев и гайды по защите
        </Typography>
      </Box>

      {}
      {resources.map((category) => (
        <Box key={category.category} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ color: 'success.main' }}>{category.icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{category.category}</Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {category.items.map((item) => (
              <Card key={item.title} sx={{ borderRadius: 1.5, height: '100%' }}>
                <CardActionArea
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, pr: 1 }}>{item.title}</Typography>
                      <ExternalLinkIcon width={16} height={16} color={isDark ? '#9E9E9E' : '#757575'} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {item.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: isDark ? '#333' : '#F5F5F5' }} />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      ))}

      {}
      <Paper sx={{ p: 3, borderRadius: 2, mt: 4, bgcolor: isDark ? 'rgba(46,125,50,0.1)' : '#E8F5E9' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
          Как это используется в CyberSim
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[
            { source: 'CWE', usage: 'Каждый сценарий ссылается на конкретную уязвимость (CWE-640, CWE-307 и др.)' },
            { source: 'OWASP Top 10', usage: 'Категории угроз в результатах сценариев (A01:2021, A07:2021 и др.)' },
            { source: 'APWG', usage: 'Реалистичные фишинговые сценарии на основе реальных отчётов' },
            { source: 'Минцифры РФ', usage: 'Рекомендации по кибергигиене в подсказках' },
            { source: 'Касперский', usage: 'Описания угроз и способов защиты в результатах сценариев' },
          ].map((item) => (
            <Box key={item.source} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Chip label={item.source} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'success.main', color: 'white', fontWeight: 600, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.usage}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
