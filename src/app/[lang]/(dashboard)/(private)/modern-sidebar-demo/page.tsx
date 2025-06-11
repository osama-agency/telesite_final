// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

const ModernSidebarDemo = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                🎨 Современный сайдбар 2025
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Полностью переработанная навигация в соответствии с лучшими практиками UI/UX дизайна
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ✨ Ключевые особенности:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip label="Lucide React иконки" color="primary" variant="outlined" />
                <Chip label="Современная подсветка активного пункта" color="primary" variant="outlined" />
                <Chip label="Логическая группировка секций" color="primary" variant="outlined" />
                <Chip label="Пользовательский статус внизу" color="primary" variant="outlined" />
                <Chip label="Адаптивный дизайн" color="primary" variant="outlined" />
                <Chip label="Framer Motion анимации" color="primary" variant="outlined" />
                <Chip label="Glassmorphism эффекты" color="primary" variant="outlined" />
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🏗️ Архитектура компонентов:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: 'monospace' }}>
                  • <strong>SidebarSection</strong> - Логическая группировка пунктов меню
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: 'monospace' }}>
                  • <strong>SidebarItem</strong> - Современный пункт меню с Lucide иконками
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: 'monospace' }}>
                  • <strong>SidebarUserStatus</strong> - Блок пользователя со скрытыми действиями
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: 'monospace' }}>
                  • <strong>ModernSidebar</strong> - Основной контейнер с glassmorphism
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🎯 Разделы навигации:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Основное:</strong> Дашборд, Заказы, Товары, Закупки
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Финансы:</strong> Расходы
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Пользователь:</strong> Eldar (В сети) + скрытые действия в dropdown
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🛠️ Технические особенности:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Вертикальная линия слева (3px) для активного пункта
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Полупрозрачный фон активного элемента с border
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Tooltips в свернутом режиме с backdrop blur
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Плавные анимации появления/исчезновения текста
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Hover эффекты с масштабированием и сдвигом
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Адаптивное поведение для мобильных устройств
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Совет:</strong> Попробуйте свернуть/развернуть сайдбар используя кнопку в заголовке,
                наведите курсор на свернутые иконки для просмотра tooltips, и протестируйте адаптивность
                изменив размер окна браузера.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ModernSidebarDemo
