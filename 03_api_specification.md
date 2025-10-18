# API Спецификация мобильного приложения ЖК River Park

## Базовая информация

- **Base URL**: `https://api.riverpark62.app/v1`
- **Аутентификация**: Bearer JWT Token
- **Content-Type**: `application/json`
- **Кодировка**: UTF-8

## Аутентификация и регистрация

### POST `/auth/register`
Регистрация нового пользователя

**Request Body:**
```json
{
  "phone": "+79001234567",
  "first_name": "Иван",
  "last_name": "Иванов",
  "middle_name": "Иванович",
  "account_number": "12345678"
}
```

**Response 201:**
```json
{
  "message": "Код подтверждения отправлен на номер +79001234567",
  "verification_required": true
}
```

### POST `/auth/verify`
Подтверждение номера телефона

**Request Body:**
```json
{
  "phone": "+79001234567",
  "code": "123456"
}
```

**Response 200:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+79001234567",
    "first_name": "Иван",
    "last_name": "Иванов",
    "is_verified": true
  }
}
```

### POST `/auth/login`
Вход в систему

**Request Body:**
```json
{
  "phone": "+79001234567",
  "password": "password123"
}
```

### POST `/auth/refresh`
Обновление токена

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### POST `/auth/logout`
Выход из системы

**Headers:** `Authorization: Bearer <token>`

## Управление пользователем

### GET `/user/profile`
Получение профиля пользователя

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+79001234567",
  "email": "ivan@example.com",
  "first_name": "Иван",
  "last_name": "Иванов",
  "middle_name": "Иванович",
  "apartments": [
    {
      "id": "apartment-uuid",
      "account_number": "12345678",
      "building_number": "1",
      "apartment_number": "45",
      "area": 60.31,
      "rooms_count": 2,
      "apartment_type": "2br",
      "is_primary": true,
      "role": "owner"
    }
  ],
  "created_at": "2025-01-15T10:30:00Z"
}
```

### PUT `/user/profile`
Обновление профиля

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "first_name": "Иван",
  "last_name": "Петров"
}
```

## Квартиры

### GET `/apartments/{apartment_id}`
Информация о квартире

**Response 200:**
```json
{
  "id": "apartment-uuid",
  "account_number": "12345678",
  "building_number": "1",
  "apartment_number": "45",
  "area": 60.31,
  "rooms_count": 2,
  "apartment_type": "2br",
  "address": "г. Рязань, Михайловское шоссе, корпус 1, кв. 45",
  "residents": [
    {
      "user_id": "user-uuid",
      "first_name": "Иван",
      "last_name": "Иванов",
      "role": "owner",
      "is_primary": true
    }
  ]
}
```

## Счета и платежи

### GET `/apartments/{apartment_id}/bills`
Список счетов квартиры

**Query Parameters:**
- `limit` (int, default: 20): Количество записей
- `offset` (int, default: 0): Смещение
- `status` (string): Фильтр по статусу (pending, paid, overdue)
- `period_from` (string): Период от (YYYY-MM)
- `period_to` (string): Период до (YYYY-MM)

**Response 200:**
```json
{
  "items": [
    {
      "id": "bill-uuid",
      "period": "2025-01",
      "total_amount": 15420.50,
      "paid_amount": 15420.50,
      "status": "paid",
      "due_date": "2025-02-10",
      "services_breakdown": {
        "management": 2500.00,
        "water_cold": 850.30,
        "water_hot": 1200.45,
        "heating": 8500.00,
        "electricity": 1800.25,
        "garbage": 569.50
      },
      "created_at": "2025-01-25T09:00:00Z"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

### GET `/bills/{bill_id}`
Детальная информация о счете

**Response 200:**
```json
{
  "id": "bill-uuid",
  "apartment_id": "apartment-uuid",
  "period": "2025-01",
  "total_amount": 15420.50,
  "paid_amount": 0,
  "status": "pending",
  "due_date": "2025-02-10",
  "services_breakdown": {
    "management": {
      "amount": 2500.00,
      "rate": 41.44,
      "unit": "м²",
      "quantity": 60.31
    },
    "water_cold": {
      "amount": 850.30,
      "rate": 35.67,
      "unit": "м³",
      "quantity": 23.84
    }
  },
  "payments": [
    {
      "id": "payment-uuid",
      "amount": 15420.50,
      "payment_method": "card",
      "status": "success",
      "created_at": "2025-02-01T14:30:00Z"
    }
  ]
}
```

### POST `/bills/{bill_id}/pay`
Инициация платежа

**Request Body:**
```json
{
  "amount": 15420.50,
  "payment_method": "card",
  "return_url": "riverpark://payment/success"
}
```

**Response 200:**
```json
{
  "payment_id": "payment-uuid",
  "payment_url": "https://yookassa.ru/checkout/...",
  "status": "pending"
}
```

### GET `/payments/{payment_id}/status`
Статус платежа

**Response 200:**
```json
{
  "id": "payment-uuid",
  "status": "success",
  "amount": 15420.50,
  "payment_method": "card",
  "transaction_id": "2425063b-000f-5000-9000-1de9a6411234",
  "processed_at": "2025-02-01T14:32:15Z"
}
```

## Показания счетчиков

### GET `/apartments/{apartment_id}/meter-readings`
Показания счетчиков

**Query Parameters:**
- `period` (string): Период (YYYY-MM)
- `meter_type` (string): Тип счетчика

**Response 200:**
```json
{
  "items": [
    {
      "id": "reading-uuid",
      "meter_type": "water_cold",
      "current_reading": 1245.567,
      "previous_reading": 1221.727,
      "difference": 23.84,
      "period": "2025-01",
      "reading_date": "2025-01-30",
      "is_verified": true,
      "created_at": "2025-01-30T15:30:00Z"
    },
    {
      "id": "reading-uuid-2",
      "meter_type": "water_hot",
      "current_reading": 896.234,
      "previous_reading": 878.456,
      "difference": 17.778,
      "period": "2025-01",
      "reading_date": "2025-01-30",
      "is_verified": true,
      "created_at": "2025-01-30T15:32:00Z"
    }
  ]
}
```

### POST `/apartments/{apartment_id}/meter-readings`
Передача показаний

**Request Body:**
```json
{
  "readings": [
    {
      "meter_type": "water_cold",
      "current_reading": 1268.145
    },
    {
      "meter_type": "water_hot",
      "current_reading": 913.567
    }
  ],
  "reading_date": "2025-02-28"
}
```

## Заявки

### GET `/apartments/{apartment_id}/tickets`
Список заявок

**Query Parameters:**
- `status` (string): Фильтр по статусу
- `category` (string): Фильтр по категории
- `limit` (int, default: 20)
- `offset` (int, default: 0)

**Response 200:**
```json
{
  "items": [
    {
      "id": "ticket-uuid",
      "title": "Протечка крана в ванной",
      "category": "plumbing",
      "priority": "medium",
      "status": "in_progress",
      "created_at": "2025-02-05T10:15:00Z",
      "updated_at": "2025-02-06T14:30:00Z",
      "assigned_to": {
        "id": "staff-uuid",
        "first_name": "Петр",
        "last_name": "Сидоров",
        "specialization": "plumber",
        "phone": "+79001234567"
      }
    }
  ],
  "total": 5
}
```

### POST `/apartments/{apartment_id}/tickets`
Создание заявки

**Request Body:**
```json
{
  "title": "Протечка крана в ванной",
  "description": "Подтекает кран холодной воды в ванной комнате",
  "category": "plumbing",
  "priority": "medium"
}
```

### GET `/tickets/{ticket_id}`
Детальная информация о заявке

**Response 200:**
```json
{
  "id": "ticket-uuid",
  "apartment": {
    "id": "apartment-uuid",
    "building_number": "1",
    "apartment_number": "45"
  },
  "title": "Протечка крана в ванной",
  "description": "Подтекает кран холодной воды в ванной комнате",
  "category": "plumbing",
  "priority": "medium",
  "status": "in_progress",
  "created_at": "2025-02-05T10:15:00Z",
  "updated_at": "2025-02-06T14:30:00Z",
  "assigned_to": {
    "id": "staff-uuid",
    "first_name": "Петр",
    "last_name": "Сидоров",
    "specialization": "plumber",
    "phone": "+79001234567"
  },
  "attachments": [
    {
      "id": "attachment-uuid",
      "file_name": "leak_photo.jpg",
      "file_url": "https://storage.riverpark62.app/attachments/...",
      "file_type": "image/jpeg",
      "created_at": "2025-02-05T10:16:00Z"
    }
  ],
  "comments": [
    {
      "id": "comment-uuid",
      "comment": "Заявка принята, сантехник приедет завтра утром",
      "created_at": "2025-02-05T14:20:00Z",
      "author": {
        "first_name": "Анна",
        "last_name": "Петрова",
        "role": "manager"
      }
    }
  ]
}
```

### POST `/tickets/{ticket_id}/attachments`
Загрузка файлов к заявке

**Content-Type**: `multipart/form-data`

**Form Data:**
- `file`: File (image/jpeg, image/png, application/pdf)

### POST `/tickets/{ticket_id}/comments`
Добавление комментария

**Request Body:**
```json
{
  "comment": "Спасибо, буду ждать сантехника"
}
```

## Новости и объявления

### GET `/news`
Список новостей

**Query Parameters:**
- `category` (string): Фильтр по категории
- `limit` (int, default: 20)
- `offset` (int, default: 0)

**Response 200:**
```json
{
  "items": [
    {
      "id": "news-uuid",
      "title": "Общее собрание собственников",
      "content": "Уважаемые жители! 15 февраля состоится общее собрание...",
      "category": "announcement",
      "published_at": "2025-02-01T09:00:00Z",
      "attachments": [
        {
          "id": "attachment-uuid",
          "file_name": "agenda.pdf",
          "file_url": "https://storage.riverpark62.app/news/..."
        }
      ]
    }
  ],
  "total": 25
}
```

## Уведомления

### GET `/notifications`
Список уведомлений

**Query Parameters:**
- `is_read` (boolean): Фильтр по прочитанности
- `limit` (int, default: 20)
- `offset` (int, default: 0)

**Response 200:**
```json
{
  "items": [
    {
      "id": "notification-uuid",
      "type": "push",
      "title": "Новый счет за январь",
      "message": "Выставлен счет за январь на сумму 15 420,50 ₽",
      "is_read": false,
      "created_at": "2025-02-01T08:00:00Z",
      "data": {
        "bill_id": "bill-uuid",
        "action": "view_bill"
      }
    }
  ],
  "unread_count": 3
}
```

### PUT `/notifications/{notification_id}/read`
Отметить как прочитанное

### PUT `/notifications/read-all`
Отметить все как прочитанные

## Автоплатежи

### GET `/auto-payments`
Список настроенных автоплатежей

### POST `/auto-payments`
Настройка автоплатежа

**Request Body:**
```json
{
  "apartment_id": "apartment-uuid",
  "payment_method": "card",
  "card_id": "card-uuid",
  "is_active": true
}
```

## Коды ошибок

- **400 Bad Request**: Некорректные данные запроса
- **401 Unauthorized**: Требуется аутентификация
- **403 Forbidden**: Недостаточно прав доступа
- **404 Not Found**: Ресурс не найден
- **409 Conflict**: Конфликт данных (например, дублирование)
- **422 Unprocessable Entity**: Ошибки валидации
- **429 Too Many Requests**: Превышен лимит запросов
- **500 Internal Server Error**: Внутренняя ошибка сервера

## Формат ошибок

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации данных",
    "details": [
      {
        "field": "phone",
        "message": "Неверный формат номера телефона"
      }
    ]
  }
}
```