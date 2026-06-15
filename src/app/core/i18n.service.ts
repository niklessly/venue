import { Injectable, effect, signal } from '@angular/core';
import { Recurrence, Room, SortBy } from '../models';

export type Language = 'ru' | 'en';

const STORAGE_KEY = 'venue-language';

const RU = {
  active: 'активные',
  activeBookings: 'активные бронирования',
  activeSchedule: 'расписание зала',
  adminPanel: 'управление залами',
  all: 'все',
  apiConnected: 'Mock API подключен.',
  apiFallback: 'Mock API не запущен. Используются демо-данные.',
  apiInitial: 'Демо-данные активны, пока mock API не ответит.',
  availableOnly: 'только свободные',
  availableRooms: 'залы',
  authDescription: 'Выберите подходящее время, зал и оборудование без стресса.',
  authSlogan: 'Бронируйте быстро и без путаницы',
  backToRooms: 'к залам',
  bookThisRoom: 'забронировать зал',
  bookings: 'бронирования',
  bookingTitle: 'название встречи',
  bookingTitlePlaceholder: 'синхронизация команды',
  cancelBooking: 'отменить',
  cancelled: 'отменённые',
  capacity: 'вместимость',
  chooseRoom: 'выберите зал',
  close: 'закрыть',
  createBooking: 'создать бронь',
  createRoom: 'создать зал',
  currentUser: 'пользователь',
  dashboard: 'залы',
  date: 'дата',
  delete: 'удалить',
  deleteRoom: 'удалить зал',
  description: 'описание',
  edit: 'изменить',
  editBooking: 'изменить бронь',
  editRoom: 'изменить зал',
  email: 'email',
  emailInvalid: 'Введите корректный email.',
  emailRequired: 'Введите email.',
  end: 'конец',
  enterDashboard: 'войти',
  equipment: 'оборудование',
  equipmentComma: 'оборудование через запятую',
  equipmentPlaceholder: 'проектор или доска',
  freeRoom: 'свободный зал',
  inRoom: 'в',
  language: 'язык',
  location: 'локация',
  login: 'вход',
  logout: 'выйти',
  manualStatus: 'ручной статус',
  meetingRooms: 'переговорные',
  myBookings: 'мои бронирования',
  name: 'имя',
  nameRequired: 'Введите имя.',
  nameTooShort: 'Имя должно быть не короче 2 символов.',
  newRoom: 'новый зал',
  noActiveBookings: 'активных броней для этого зала нет.',
  noBookings: 'для выбранного фильтра бронирований нет.',
  noCompanyRooms: 'Для этой компании пока нет залов.',
  noRooms: 'под эти фильтры сейчас нет залов.',
  noRoomsShort: 'нет залов',
  noUpcomingBookings: 'ближайших броней нет.',
  occurrences: 'повторов',
  openRoom: 'открыть зал',
  pageNotFound: 'страница не найдена',
  pageNotFoundText: 'Такого экрана нет в рабочей области бронирования.',
  participants: 'участники',
  password: 'пароль',
  passwordRequired: 'Введите пароль.',
  popularRoom: 'популярный зал',
  repeat: 'повтор',
  requiredEquipment: 'нужное оборудование',
  resetFilters: 'сбросить фильтры',
  room: 'зал',
  roomCatalog: 'каталог залов',
  roomDetails: 'детали зала',
  roomUsage: 'загрузка залов',
  roomsFound: 'залов найдено',
  saveChanges: 'сохранить изменения',
  saveRoom: 'сохранить зал',
  schedule: 'расписание',
  seats: 'мест',
  selectAndBook: 'подробнее и бронь',
  sort: 'сортировка',
  startTime: 'начало',
  statistics: 'статистика',
  status: 'статус',
  syncFailed: 'Синхронизация с mock API не прошла. Локальные изменения сохранены в памяти.',
  time: 'время',
  today: 'сегодня',
  upcomingNotifications: 'ближайшие брони',
  upcomingRooms: 'задействованные залы',
  utilization: 'загрузка',
  welcomeBack: 'добро пожаловать',
} as const;

type TranslationKey = keyof typeof RU;

const EN: Record<TranslationKey, string> = {
  active: 'active',
  activeBookings: 'active bookings',
  activeSchedule: 'active schedule',
  adminPanel: 'room management',
  all: 'all',
  apiConnected: 'Mock API connected.',
  apiFallback: 'Mock API is offline. Local demo data is used.',
  apiInitial: 'Local demo data is active until mock API responds.',
  availableOnly: 'available only',
  availableRooms: 'rooms',
  authDescription: 'Choose the right time, room and equipment without stress.',
  authSlogan: 'Book rooms quickly and clearly',
  backToRooms: 'back to rooms',
  bookThisRoom: 'book this room',
  bookings: 'bookings',
  bookingTitle: 'meeting title',
  bookingTitlePlaceholder: 'team sync',
  cancelBooking: 'cancel',
  cancelled: 'cancelled',
  capacity: 'capacity',
  chooseRoom: 'choose room',
  close: 'close',
  createBooking: 'create booking',
  createRoom: 'create room',
  currentUser: 'user',
  dashboard: 'rooms',
  date: 'date',
  delete: 'delete',
  deleteRoom: 'delete room',
  description: 'description',
  edit: 'edit',
  editBooking: 'edit booking',
  editRoom: 'edit room',
  email: 'email',
  emailInvalid: 'Enter a valid email.',
  emailRequired: 'Enter your email.',
  end: 'end',
  enterDashboard: 'enter dashboard',
  equipment: 'equipment',
  equipmentComma: 'equipment, comma separated',
  equipmentPlaceholder: 'projector or whiteboard',
  freeRoom: 'free room',
  inRoom: 'in',
  language: 'language',
  location: 'location',
  login: 'login',
  logout: 'logout',
  manualStatus: 'manual status',
  meetingRooms: 'meeting rooms',
  myBookings: 'my bookings',
  name: 'name',
  nameRequired: 'Enter your name.',
  nameTooShort: 'Name must be at least 2 characters.',
  newRoom: 'new room',
  noActiveBookings: 'no active bookings for this room.',
  noBookings: 'you do not have any bookings for this filter.',
  noCompanyRooms: 'No rooms have been added for this company yet.',
  noRooms: 'no rooms match these filters right now.',
  noRoomsShort: 'no rooms',
  noUpcomingBookings: 'no upcoming bookings.',
  occurrences: 'occurrences',
  openRoom: 'open room',
  pageNotFound: 'page not found',
  pageNotFoundText: 'The requested screen is not part of the booking workspace.',
  participants: 'participants',
  password: 'password',
  passwordRequired: 'Enter your password.',
  popularRoom: 'popular room',
  repeat: 'repeat',
  requiredEquipment: 'required equipment',
  resetFilters: 'reset filters',
  room: 'room',
  roomCatalog: 'room catalog',
  roomDetails: 'room details',
  roomUsage: 'room usage',
  roomsFound: 'rooms found',
  saveChanges: 'save changes',
  saveRoom: 'save room',
  schedule: 'schedule',
  seats: 'seats',
  selectAndBook: 'details and booking',
  sort: 'sort',
  startTime: 'start',
  statistics: 'statistics',
  status: 'status',
  syncFailed: 'Mock API sync failed. Local changes are kept in memory.',
  time: 'time',
  today: 'today',
  upcomingNotifications: 'upcoming bookings',
  upcomingRooms: 'upcoming rooms',
  utilization: 'utilization',
  welcomeBack: 'welcome back',
};

const DICTIONARY: Record<Language, Record<TranslationKey, string>> = {
  ru: RU,
  en: EN,
};

const EQUIPMENT_RU: Record<string, string> = {
  projector: 'проектор',
  wifi: 'Wi-Fi',
  'video conference': 'видеосвязь',
  whiteboard: 'доска',
};

const LOCATION_RU: Record<string, string> = {
  'floor 1': '1 этаж',
  'floor 2, east wing': '2 этаж, восточное крыло',
  'floor 2, north wing': '2 этаж, северное крыло',
  'floor 3, west wing': '3 этаж, западное крыло',
  'floor 3, south wing': '3 этаж, южное крыло',
  'floor 4, partner office': '4 этаж, офис второй компании',
  'floor 5': '5 этаж',
};

const DESCRIPTION_RU: Record<string, string> = {
  'Compact room for short meetings and quick decisions.':
    'Компактный зал для коротких встреч и быстрых решений.',
  'Good for team reviews and hybrid meetings.': 'Удобен для командных ревью и гибридных встреч.',
  'A slightly larger room for planning sessions.': 'Зал побольше для планирования и обсуждений.',
  'Largest room in the office for workshops.': 'Самый большой зал для воркшопов и презентаций.',
  'Room for another company, used to verify data separation.':
    'Зал второй компании для проверки разделения данных.',
  'quiet room for focused work': 'тихий зал для сфокусированной работы',
};

const TITLE_RU: Record<string, string> = {
  'Project kickoff': 'Старт проекта',
  'Design review': 'Дизайн-ревью',
  'Partner planning': 'Планирование второй компании',
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<Language>(this.readLanguage());

  constructor() {
    effect(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, this.language());
      }
    });
  }

  t(key: TranslationKey): string {
    return DICTIONARY[this.language()][key];
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  roomName(room: Pick<Room, 'name'> | string | null | undefined): string {
    const name = typeof room === 'string' ? room : (room?.name ?? '');
    const match = /^room\s+(\d+)$/i.exec(name);

    if (this.language() === 'ru' && match) {
      return `зал ${match[1]}`;
    }

    return name;
  }

  roomsFound(count: number): string {
    if (this.language() === 'en') {
      return `${count} ${count === 1 ? 'room' : 'rooms'} found`;
    }

    return `${count} ${this.plural(count, 'зал', 'зала', 'залов')} найдено`;
  }

  seats(count: number | null | undefined): string {
    const value = Number(count ?? 0);

    if (this.language() === 'en') {
      return `${value} ${value === 1 ? 'seat' : 'seats'}`;
    }

    return `${value} ${this.plural(value, 'место', 'места', 'мест')}`;
  }

  description(value = ''): string {
    return this.language() === 'ru' ? (DESCRIPTION_RU[value] ?? value) : value;
  }

  location(value = ''): string {
    return this.language() === 'ru' ? (LOCATION_RU[value] ?? value) : value;
  }

  equipment(value: string): string {
    return this.language() === 'ru' ? (EQUIPMENT_RU[value] ?? value) : value;
  }

  equipmentList(values: string[]): string {
    return values.map((item) => this.equipment(item)).join(', ');
  }

  status(value: 'free' | 'busy' | 'active' | 'cancelled'): string {
    if (this.language() === 'en') {
      return value;
    }

    return (
      {
        active: 'активна',
        busy: 'занят',
        cancelled: 'отменена',
        free: 'свободен',
      } satisfies Record<typeof value, string>
    )[value];
  }

  recurrence(value: Recurrence): string {
    if (this.language() === 'en') {
      return value;
    }

    return {
      daily: 'ежедневно',
      none: 'без повтора',
      weekly: 'еженедельно',
    }[value];
  }

  sort(value: SortBy): string {
    if (this.language() === 'en') {
      return {
        capacity: 'by capacity',
        name: 'by name',
        status: 'by status',
      }[value];
    }

    return {
      capacity: 'по вместимости',
      name: 'по названию',
      status: 'по статусу',
    }[value];
  }

  title(value = ''): string {
    return this.language() === 'ru' ? (TITLE_RU[value] ?? value) : value;
  }

  message(value = ''): string {
    if (this.language() === 'en') {
      return value;
    }

    if (value.startsWith('Room does not include: ')) {
      const equipment = value
        .replace('Room does not include: ', '')
        .replace('.', '')
        .split(', ')
        .map((item) => this.equipment(item))
        .join(', ');

      return `В зале нет: ${equipment}.`;
    }

    return (
      (
        {
          'Booking was not cancelled.': 'Бронь не отменена.',
          'Booking was not deleted.': 'Бронь не удалена.',
          'Booking was not found.': 'Бронь не найдена.',
          'Booking was not saved.': 'Бронь не сохранена.',
          'Cancel or move active bookings before deleting this room.':
            'Перед удалением отмените или перенесите активные брони.',
          'Choose today or a future date.': 'Выберите сегодняшнюю или будущую дату.',
          'Choose a valid room before booking.': 'Выберите существующий зал перед бронированием.',
          'Date, start time and end time are required.':
            'Дата, начало и конец встречи обязательны.',
          'End time must be later than start time.': 'Время окончания должно быть позже начала.',
          'Mock API connected.': this.t('apiConnected'),
          'Mock API is offline. Local demo data is used.': this.t('apiFallback'),
          'Mock API sync failed. Local changes are kept in memory.': this.t('syncFailed'),
          'Participants count must be at least 1.': 'Участников должно быть не меньше 1.',
          'Room capacity must be at least 1.': 'Вместимость зала должна быть не меньше 1.',
          'Room created.': 'Зал создан.',
          'Room deleted.': 'Зал удалён.',
          'Room location is required.': 'Укажите локацию зала.',
          'Room name is required.': 'Укажите название зала.',
          'Room or user is missing.': 'Не найден зал или пользователь.',
          'Room saved.': 'Зал сохранён.',
          'Room was not deleted.': 'Зал не удалён.',
          'Room was not found.': 'Зал не найден.',
          'Room was not saved.': 'Зал не сохранён.',
          'The room capacity is smaller than the selected group size.':
            'Вместимость зала меньше выбранного размера группы.',
          'This room already has an active booking in the selected time slot.':
            'На это время зал уже забронирован.',
          'User is missing.': 'Пользователь не найден.',
          'please fill all required fields': 'Заполните обязательные поля.',
          'Local demo data is active until mock API responds.': this.t('apiInitial'),
        } satisfies Record<string, string>
      )[value] ?? value
    );
  }

  private readLanguage(): Language {
    if (typeof window === 'undefined') {
      return 'ru';
    }

    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru';
  }

  private plural(count: number, one: string, few: string, many: string): string {
    const mod10 = Math.abs(count) % 10;
    const mod100 = Math.abs(count) % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return one;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return few;
    }

    return many;
  }
}
