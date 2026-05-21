import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  DropdownSingle,
  FormField,
  Icon,
  Input,
  SearchInput,
  Segmented,
  Tabs,
} from '@jf/design-system'
import './App.scss'

type AppView = 'publish' | 'reminders' | 'status'
type ReminderTab = 'email' | 'recipients' | 'schedule' | 'stop'
type InviteStatus = 'pending' | 'opened' | 'submitted'
type ReminderState = 'active' | 'paused' | 'stopped'
type StatusFilter = 'all' | InviteStatus
type ReminderFilter = 'all' | ReminderState
type RepeatFrequency = 'daily' | 'weekly' | 'monthly'
type ReminderScope = 'all' | 'selected' | 'individual'
type ReminderAudience = 'not-submitted' | 'pending' | 'opened'
type LegacyPage = 'publish' | 'email' | 'reminder'

interface SelectOption {
  value: string
  label: string
}

interface SharedUser {
  id: string
  initials: string
  email: string
  role: string
  status: InviteStatus
  reminderState: ReminderState
  nextReminder?: string
  sentCount: number
  lastActivity: string
}

interface RecipientRecord extends SharedUser {
  invitedAt: string
  openedAt?: string
  submittedAt?: string
  delivery: 'Delivered' | 'Bounced'
  group: string
}

interface ParsedInviteRow {
  rowNumber: number
  email: string
  name?: string
  role?: string
  valid: boolean
  reason?: string
}

interface ReviewedInviteRow extends ParsedInviteRow {
  duplicate: boolean
}

const sharedUsers: SharedUser[] = [
  {
    id: 'hakan',
    initials: 'HS',
    email: 'hakansivritepe+cadeyuser@jotform.com',
    role: 'Submit & View',
    status: 'pending',
    reminderState: 'active',
    nextReminder: 'Fri 9:00 AM',
    sentCount: 0,
    lastActivity: 'Invitation sent today',
  },
  {
    id: 'alex',
    initials: 'AV',
    email: 'alex.viewer@company.com',
    role: 'Submit Only',
    status: 'opened',
    reminderState: 'active',
    nextReminder: 'Tomorrow 9:00 AM',
    sentCount: 2,
    lastActivity: 'Opened personal link',
  },
  {
    id: 'mira',
    initials: 'MD',
    email: 'mira.director@company.com',
    role: 'Submit & Edit',
    status: 'submitted',
    reminderState: 'stopped',
    sentCount: 1,
    lastActivity: 'Submitted today',
  },
]

const teams = ['Marketing', 'Sales Ops', 'People Team', 'Finance', 'Partner Network']
const firstNames = ['Aylin', 'Can', 'Derya', 'Emre', 'Selin', 'Mert', 'Elif', 'Deniz', 'Mina', 'Kerem', 'Lara', 'Onur']
const lastNames = ['Acar', 'Yilmaz', 'Kaya', 'Demir', 'Celik', 'Sahin', 'Arslan', 'Eren', 'Kaplan', 'Polat']

const initialRecipientUsers: RecipientRecord[] = [
  ...sharedUsers.map((user, index) => ({
    ...user,
    invitedAt: index === 0 ? 'May 19, 2026' : index === 1 ? 'May 18, 2026' : 'May 16, 2026',
    openedAt: user.status === 'opened' || user.status === 'submitted' ? 'May 18, 2026' : undefined,
    submittedAt: user.status === 'submitted' ? 'May 19, 2026' : undefined,
    delivery: 'Delivered' as const,
    group: teams[index],
  })),
  ...Array.from({ length: 125 }, (_, index) => {
    const position = index + 1
    const status: InviteStatus = position % 7 === 0 ? 'submitted' : position % 3 === 0 ? 'opened' : 'pending'
    const reminderState: ReminderState = status === 'submitted' ? 'stopped' : position % 11 === 0 ? 'paused' : 'active'
    const firstName = firstNames[index % firstNames.length]
    const lastName = lastNames[index % lastNames.length]
    const initials = `${firstName[0]}${lastName[0]}`

    return {
      id: `recipient-${String(position).padStart(3, '0')}`,
      initials,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${position}@company.com`,
      role: position % 5 === 0 ? 'Submit & Edit' : position % 2 === 0 ? 'Submit & View' : 'Submit Only',
      status,
      reminderState,
      nextReminder: reminderState === 'active' ? (position % 2 === 0 ? 'Tomorrow 9:00 AM' : 'Fri 9:00 AM') : undefined,
      sentCount: status === 'pending' ? position % 4 : status === 'opened' ? 2 + (position % 3) : 1 + (position % 2),
      lastActivity:
        status === 'submitted'
          ? 'Submitted from personal link'
          : status === 'opened'
            ? 'Opened personal link'
            : 'Invitation pending',
      invitedAt: `May ${String(10 + (position % 10)).padStart(2, '0')}, 2026`,
      openedAt: status === 'opened' || status === 'submitted' ? `May ${String(12 + (position % 7)).padStart(2, '0')}, 2026` : undefined,
      submittedAt: status === 'submitted' ? `May ${String(14 + (position % 5)).padStart(2, '0')}, 2026` : undefined,
      delivery: (position % 29 === 0 ? 'Bounced' : 'Delivered') as RecipientRecord['delivery'],
      group: teams[position % teams.length],
    }
  }),
]

const emailTabs = [
  { value: 'email', label: 'EMAIL' },
  { value: 'recipients', label: 'RECIPIENTS' },
  { value: 'schedule', label: 'SCHEDULE' },
  { value: 'stop', label: 'STOP RULES' },
]

const productionDemoUrl = 'https://hsivritepe.github.io/jotform-invite-reminders-demo/?present=1'

const navItems: Array<{
  title: string
  subtitle: string
  icon?: string
  glyph?: string
  category?: string
  active?: boolean
}> = [
  { title: 'Quick Share', subtitle: 'Direct form link and social share', icon: 'link-diagonal', category: 'general' },
  { title: 'Embed', subtitle: 'Various web page embed options', glyph: '</>' },
  { title: 'Platforms', subtitle: 'Third-party publish options', icon: 'layers-filled', category: 'layout' },
  { title: 'Assign Form', subtitle: 'Assign your forms to others', icon: 'users-filled', category: 'users', active: true },
  { title: 'Email', subtitle: 'Reminders and instant sharing', icon: 'envelope-closed-filled', category: 'communication' },
  { title: 'Prefill', subtitle: 'Pre-populate your forms', icon: 'bars-progress-filled', category: 'general' },
  { title: 'AI Agents', subtitle: 'Turn your forms into conversations.', icon: 'stars-filled', category: 'general' },
  { title: 'PDF', subtitle: 'Download fillable PDF', icon: 'document-pdf-filled', category: 'documents' },
]

const reminderActivity = [
  { label: 'Invitation email sent', detail: 'Personal invite link generated for each recipient' },
  { label: 'Reminder rule enabled', detail: 'Weekdays at 9:00 AM, starting 1 day after invite' },
  { label: 'Reminder 1 sent', detail: 'Skipped Mira because she submitted' },
]

const sendDateOptionsByRepeat: Record<RepeatFrequency, SelectOption[]> = {
  daily: [
    { value: 'weekdays', label: 'Weekdays (Monday-Friday)' },
    { value: 'weekends', label: 'Weekends (Saturday-Sunday)' },
    { value: 'every-day', label: 'Every day (Monday-Sunday)' },
  ],
  weekly: [
    { value: 'monday', label: 'Every Monday' },
    { value: 'tuesday', label: 'Every Tuesday' },
    { value: 'wednesday', label: 'Every Wednesday' },
    { value: 'thursday', label: 'Every Thursday' },
    { value: 'friday', label: 'Every Friday' },
    { value: 'saturday', label: 'Every Saturday' },
    { value: 'sunday', label: 'Every Sunday' },
  ],
  monthly: [
    { value: 'first-workday', label: 'First work day of the month' },
    { value: 'first-monday', label: 'First Monday of the month' },
    { value: 'last-friday', label: 'Last Friday of the month' },
    { value: 'first-day', label: 'First day of the month' },
    { value: 'select-day', label: 'Select a day of the month' },
  ],
}

const monthDayOptions = Array.from({ length: 31 }, (_, index) => {
  const value = String(index + 1)

  return { value, label: value }
})

const sendTimeOptions: SelectOption[] = Array.from({ length: 24 }, (_, hour) => {
  const hour12 = hour % 12 || 12
  const period = hour < 12 ? 'AM' : 'PM'

  return {
    value: `${String(hour).padStart(2, '0')}:00`,
    label: `${hour12}:00 ${period}`,
  }
})

const fallbackTimeZones = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const normalizeOffset = (offset: string) => {
  if (offset === 'GMT') {
    return 'GMT+00:00'
  }

  const match = offset.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/)

  if (!match) {
    return offset
  }

  const [, sign, hour, minute = '00'] = match

  return `GMT${sign}${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

const getTimeZoneOffset = (timeZone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    })
    const offset = formatter.formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value

    return normalizeOffset(offset || 'GMT+00:00')
  } catch {
    return 'GMT+00:00'
  }
}

const getOffsetMinutes = (offset: string) => {
  const match = offset.match(/^GMT([+-])(\d{2}):(\d{2})$/)

  if (!match) {
    return 0
  }

  const [, sign, hour, minute] = match
  const total = Number(hour) * 60 + Number(minute)

  return sign === '-' ? -total : total
}

const formatTimeZoneName = (timeZone: string) => {
  if (timeZone === 'UTC') {
    return 'UTC'
  }

  const city = timeZone.split('/').pop() || timeZone

  return city.replace(/_/g, ' ')
}

const getSupportedTimeZones = () => {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[]
  }

  return intlWithSupportedValues.supportedValuesOf?.('timeZone') || fallbackTimeZones
}

const timeZoneOptions: SelectOption[] = getSupportedTimeZones()
  .map((timeZone) => {
    const offset = getTimeZoneOffset(timeZone)

    return {
      value: timeZone,
      label: `${formatTimeZoneName(timeZone)} (${offset})`,
      offsetMinutes: getOffsetMinutes(offset),
    }
  })
  .sort((first, second) => first.offsetMinutes - second.offsetMinutes || first.label.localeCompare(second.label))
  .map(({ value, label }) => ({ value, label }))

const getDefaultTimeZone = () => {
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return timeZoneOptions.some((option) => option.value === localTimeZone)
    ? localTimeZone
    : 'America/Los_Angeles'
}

const repeatLabels: Record<RepeatFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

const maxReminderOptions: SelectOption[] = Array.from({ length: 10 }, (_, index) => {
  const value = String(index + 1)

  return { value, label: `${value} reminder${value === '1' ? '' : 's'}` }
})

const formatDateDisplay = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return 'custom end date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

const bulkRoleOptions = [
  { value: 'Submit Only', label: 'Submit Only' },
  { value: 'Submit & View', label: 'Submit & View' },
  { value: 'Submit & Edit', label: 'Submit & Edit' },
]

const acceptedInviteRoles = new Set(bulkRoleOptions.map((option) => option.value))
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const importedDateLabel = 'May 20, 2026'

const normalizeInviteRole = (value?: string) => {
  const role = value?.trim()

  if (!role) {
    return undefined
  }

  const exactMatch = bulkRoleOptions.find((option) => option.value.toLowerCase() === role.toLowerCase())

  if (exactMatch) {
    return exactMatch.value
  }

  const compactRole = role.toLowerCase().replace(/[^a-z0-9]/g, '')
  const aliases: Record<string, string> = {
    submit: 'Submit Only',
    submitonly: 'Submit Only',
    onlysubmit: 'Submit Only',
    submitview: 'Submit & View',
    submitandview: 'Submit & View',
    submitviewlater: 'Submit & View',
    submitviewonly: 'Submit & View',
    submitedit: 'Submit & Edit',
    submitandedit: 'Submit & Edit',
    submiteditlater: 'Submit & Edit',
  }

  return aliases[compactRole]
}

const parseCsvText = (text: string) => {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && nextChar === '"' && inQuotes) {
      field += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field.trim())
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }
      row.push(field.trim())
      if (row.some((value) => value.length > 0)) {
        rows.push(row)
      }
      row = []
      field = ''
      continue
    }

    field += char
  }

  row.push(field.trim())
  if (row.some((value) => value.length > 0)) {
    rows.push(row)
  }

  return rows
}

const columnIndexFromRef = (cellRef: string) => {
  const letters = cellRef.match(/[A-Z]+/i)?.[0]?.toUpperCase() || 'A'

  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1
}

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const rowsToInviteRows = (rows: string[][]) => {
  if (rows.length === 0) {
    return []
  }

  const headers = rows[0].map(normalizeHeader)
  const findColumn = (candidates: string[]) => headers.findIndex((header) => candidates.includes(header))
  const emailIndex = findColumn(['email', 'emailaddress', 'recipientemail', 'useremail', 'to'])
  const nameIndex = findColumn(['name', 'fullname', 'recipientname'])
  const roleIndex = findColumn(['role', 'permission', 'permissions', 'access'])
  const resolvedEmailIndex = emailIndex >= 0 ? emailIndex : 0

  return rows.slice(1).map((row, index) => {
    const email = (row[resolvedEmailIndex] || '').trim()
    const rawRole = roleIndex >= 0 ? row[roleIndex]?.trim() : undefined
    const role = normalizeInviteRole(rawRole)
    const validRole = !rawRole || Boolean(role)

    return {
      rowNumber: index + 2,
      email,
      name: nameIndex >= 0 ? row[nameIndex]?.trim() : undefined,
      role: role || rawRole,
      valid: emailPattern.test(email) && validRole,
      reason: !emailPattern.test(email)
        ? 'Invalid email'
        : validRole
          ? undefined
          : 'Unknown role',
    }
  })
}

const decodeXml = (buffer: ArrayBuffer) => new TextDecoder().decode(buffer)

const readZipEntries = async (buffer: ArrayBuffer) => {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const entries = new Map<string, ArrayBuffer>()
  let eocdOffset = -1
  const minOffset = Math.max(0, bytes.length - 0xffff - 22)

  for (let offset = bytes.length - 22; offset >= minOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset
      break
    }
  }

  if (eocdOffset < 0) {
    throw new Error('File is not a valid XLSX archive.')
  }

  const entryCount = view.getUint16(eocdOffset + 10, true)
  let directoryOffset = view.getUint32(eocdOffset + 16, true)

  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    if (view.getUint32(directoryOffset, true) !== 0x02014b50) {
      throw new Error('XLSX archive directory is not readable.')
    }

    const method = view.getUint16(directoryOffset + 10, true)
    const compressedSize = view.getUint32(directoryOffset + 20, true)
    const fileNameLength = view.getUint16(directoryOffset + 28, true)
    const extraLength = view.getUint16(directoryOffset + 30, true)
    const commentLength = view.getUint16(directoryOffset + 32, true)
    const localHeaderOffset = view.getUint32(directoryOffset + 42, true)
    const fileName = new TextDecoder().decode(bytes.slice(directoryOffset + 46, directoryOffset + 46 + fileNameLength))

    if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
      throw new Error('XLSX archive entry is not readable.')
    }

    const localNameLength = view.getUint16(localHeaderOffset + 26, true)
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true)
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength
    const compressedData = bytes.slice(dataStart, dataStart + compressedSize)

    if (method === 0) {
      entries.set(fileName, compressedData.buffer.slice(compressedData.byteOffset, compressedData.byteOffset + compressedData.byteLength))
    } else if (method === 8) {
      const stream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      entries.set(fileName, await new Response(stream).arrayBuffer())
    }

    directoryOffset += 46 + fileNameLength + extraLength + commentLength
  }

  return entries
}

const getXlsxCellText = (cell: Element, sharedStrings: string[]) => {
  const type = cell.getAttribute('t')

  if (type === 'inlineStr') {
    return cell.querySelector('is')?.textContent?.trim() || ''
  }

  const value = cell.querySelector('v')?.textContent?.trim() || ''

  return type === 's' ? sharedStrings[Number(value)] || '' : value
}

const parseXlsxBuffer = async (buffer: ArrayBuffer) => {
  const entries = await readZipEntries(buffer)
  const parser = new DOMParser()
  const sharedStringsXml = entries.get('xl/sharedStrings.xml')
  const sharedStrings = sharedStringsXml
    ? Array.from(parser.parseFromString(decodeXml(sharedStringsXml), 'application/xml').querySelectorAll('si'))
      .map((item) => item.textContent?.trim() || '')
    : []
  const worksheetEntry = [...entries.keys()].find((key) => key.startsWith('xl/worksheets/sheet') && key.endsWith('.xml'))

  if (!worksheetEntry) {
    throw new Error('No worksheet found in the XLSX file.')
  }

  const sheetXml = entries.get(worksheetEntry)

  if (!sheetXml) {
    return []
  }

  return Array.from(parser.parseFromString(decodeXml(sheetXml), 'application/xml').querySelectorAll('sheetData row'))
    .map((row) => {
      const values: string[] = []
      Array.from(row.querySelectorAll('c')).forEach((cell) => {
        const ref = cell.getAttribute('r') || 'A1'
        values[columnIndexFromRef(ref)] = getXlsxCellText(cell, sharedStrings)
      })

      return values.map((value) => value || '')
    })
    .filter((row) => row.some((value) => value.length > 0))
}

const parseInviteFile = async (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return rowsToInviteRows(parseCsvText(await file.text()))
  }

  if (extension === 'xlsx') {
    return rowsToInviteRows(await parseXlsxBuffer(await file.arrayBuffer()))
  }

  throw new Error('Use a CSV or XLSX file.')
}

const initialsFromInvite = (row: ReviewedInviteRow) => {
  const source = row.name || row.email.split('@')[0]
  const parts = source.split(/[.\s_-]+/).filter(Boolean)

  return `${parts[0]?.[0] || 'U'}${parts[1]?.[0] || parts[0]?.[1] || 'I'}`.toUpperCase()
}

const createBulkRecipient = (row: ReviewedInviteRow, role: string, index: number): RecipientRecord => ({
  id: `bulk-${Date.now()}-${index}`,
  initials: initialsFromInvite(row),
  email: row.email,
  role: row.role && acceptedInviteRoles.has(row.role) ? row.role : role,
  status: 'pending',
  reminderState: 'active',
  nextReminder: 'Tomorrow 9:00 AM',
  sentCount: 0,
  lastActivity: 'Bulk invitation sent',
  invitedAt: importedDateLabel,
  delivery: 'Delivered',
  group: 'Bulk Import',
})

const inviteStatusMeta = {
  pending: { label: 'Pending', status: 'warning' as const },
  opened: { label: 'Opened link', status: 'information' as const },
  submitted: { label: 'Submitted', status: 'success' as const },
}

const reminderStateMeta = {
  active: { label: 'Reminder on', status: 'information' as const },
  paused: { label: 'Paused', status: 'warning' as const },
  stopped: { label: 'Stopped', status: 'success' as const },
}

function App() {
  const [view, setView] = useState<AppView>('publish')
  const [sharedOpen, setSharedOpen] = useState(false)
  const [legacyMode, setLegacyMode] = useState(() => (
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('present') === '1'
  ))
  const [legacyPage, setLegacyPage] = useState<LegacyPage>('publish')
  const [presentationOpen, setPresentationOpen] = useState(() => (
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('present') === '1'
  ))
  const [presentationMode] = useState(() => (
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('present') === '1'
  ))
  const [presentationStep, setPresentationStep] = useState(0)
  const [activeTab, setActiveTab] = useState<ReminderTab>('email')
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [repeat, setRepeat] = useState<RepeatFrequency>('daily')
  const [sendDate, setSendDate] = useState('weekdays')
  const [monthDay, setMonthDay] = useState('15')
  const [sendTime, setSendTime] = useState('09:00')
  const [timeZone, setTimeZone] = useState(getDefaultTimeZone)
  const [audience, setAudience] = useState<ReminderAudience>('not-submitted')
  const [reminderScope, setReminderScope] = useState<ReminderScope>('all')
  const [individualRecipientId, setIndividualRecipientId] = useState('hakan')
  const [reminderSummary, setReminderSummary] = useState('All active invitees: Weekdays at 9:00 AM. Stops after each submission.')
  const [backupEndEnabled, setBackupEndEnabled] = useState(false)
  const [backupEndDate, setBackupEndDate] = useState('2026-06-30')
  const [maxRemindersEnabled, setMaxRemindersEnabled] = useState(true)
  const [maxReminderCount, setMaxReminderCount] = useState('5')
  const [stopOnBounce, setStopOnBounce] = useState(true)
  const [manualControlsEnabled, setManualControlsEnabled] = useState(true)
  const [savedRule, setSavedRule] = useState(true)
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false)
  const [recipientUsers, setRecipientUsers] = useState<RecipientRecord[]>(initialRecipientUsers)
  const [statusSearch, setStatusSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [reminderFilter, setReminderFilter] = useState<ReminderFilter>('all')
  const [statusPage, setStatusPage] = useState(1)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(['hakan', 'recipient-003'])

  useEffect(() => {
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0 })
    }
  }, [view])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPresentationOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const activeRecipients = useMemo(
    () => recipientUsers.filter((user) => user.status !== 'submitted'),
    [recipientUsers],
  )

  const selectedRecipientUsers = useMemo(
    () => recipientUsers.filter((user) => selectedRecipients.includes(user.id)),
    [recipientUsers, selectedRecipients],
  )

  const individualRecipient = recipientUsers.find((user) => user.id === individualRecipientId) || recipientUsers[0]

  const getScopedReminderUsers = (users: RecipientRecord[]) => {
    if (reminderScope === 'selected') {
      return users.filter((user) => selectedRecipients.includes(user.id))
    }

    if (reminderScope === 'individual') {
      return users.filter((user) => user.id === individualRecipientId)
    }

    return users
  }

  const matchesReminderAudience = (user: RecipientRecord) => {
    if (audience === 'pending') {
      return user.status === 'pending'
    }

    if (audience === 'opened') {
      return user.status === 'opened'
    }

    return user.status !== 'submitted'
  }

  const buildStopRuleSummary = () => {
    const rules = ['after each submission']

    if (backupEndEnabled) {
      rules.push(`on ${formatDateDisplay(backupEndDate)}`)
    }

    if (maxRemindersEnabled) {
      rules.push(`after ${maxReminderCount} reminder${maxReminderCount === '1' ? '' : 's'}`)
    }

    if (stopOnBounce) {
      rules.push('when an email bounces')
    }

    if (rules.length === 1) {
      return rules[0]
    }

    return `${rules.slice(0, -1).join(', ')}, or ${rules.at(-1)}`
  }

  const buildReminderSummary = () => {
    const dateLabel = sendDateOptionsByRepeat[repeat].find((option) => option.value === sendDate)?.label || 'Selected days'
    const timeLabel = sendTimeOptions.find((option) => option.value === sendTime)?.label || sendTime
    const targetLabel =
      reminderScope === 'selected'
        ? `${selectedRecipientUsers.length} selected invitees`
        : reminderScope === 'individual'
          ? individualRecipient?.email || '1 invitee'
          : 'All active invitees'

    return `${targetLabel}: ${repeatLabels[repeat]} ${dateLabel} at ${timeLabel}. Stops ${buildStopRuleSummary()}.`
  }

  const openReminderSettings = (
    tab: ReminderTab = 'email',
    scope?: ReminderScope,
    recipientId?: string,
  ) => {
    if (scope) {
      setReminderScope(scope)
    }

    if (recipientId) {
      setIndividualRecipientId(recipientId)
    }

    setActiveTab(tab)
    setRowMenu(null)
    setSharedOpen(false)
    setView('reminders')
  }

  const openRecipientStatus = () => {
    setRowMenu(null)
    setSharedOpen(false)
    setView('status')
  }

  const handleSaveReminder = () => {
    const savedDateLabel = sendDateOptionsByRepeat[repeat].find((option) => option.value === sendDate)?.label || 'Selected days'
    const savedTimeLabel = sendTimeOptions.find((option) => option.value === sendTime)?.label || sendTime
    const targetIds = new Set(
      getScopedReminderUsers(recipientUsers)
        .filter(matchesReminderAudience)
        .map((user) => user.id),
    )

    if (targetIds.size > 0) {
      setRecipientUsers((currentUsers) => currentUsers.map((user) => (
        targetIds.has(user.id)
          ? {
            ...user,
            reminderState: 'active',
            nextReminder: `${savedDateLabel} ${savedTimeLabel}`,
            lastActivity: reminderScope === 'individual' ? 'Individual reminder schedule updated' : 'Reminder schedule updated',
          }
          : user
      )))
    }

    setReminderSummary(buildReminderSummary())
    setSavedRule(true)
    setView('publish')
    setSharedOpen(true)
  }

  const returnToPublishStart = () => {
    setView('publish')
    setSharedOpen(false)
    setBulkInviteOpen(false)
    setRowMenu(null)

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  const handleBulkInvite = (rows: ReviewedInviteRow[], role: string) => {
    const newRecipients = rows.map((row, index) => createBulkRecipient(row, role, index))

    setRecipientUsers((currentUsers) => [...newRecipients, ...currentUsers])
    setSelectedRecipients((currentSelection) => [
      ...newRecipients.map((recipient) => recipient.id),
      ...currentSelection,
    ])
    setBulkInviteOpen(false)
    setSharedOpen(true)
  }

  return (
    <div className="jf-app" data-figma-capture="page">
      {legacyMode ? (
        <LegacyExperience
          page={legacyPage}
          setPage={setLegacyPage}
          onOpenPrototype={() => {
            setLegacyMode(false)
            setPresentationStep(2)
            setPresentationOpen(true)
          }}
        />
      ) : (
        <>
          <TopBar />
          <ProductTabs onOpenPublish={returnToPublishStart} />
          <div className="jf-app__body">
            <Sidebar onOpenAssignForm={returnToPublishStart} />
            {view === 'publish' ? (
              <PublishScreen
                savedRule={savedRule}
                reminderSummary={reminderSummary}
                sharedCount={recipientUsers.length}
                onOpenShared={() => setSharedOpen(true)}
                onOpenBulkInvite={() => setBulkInviteOpen(true)}
                onOpenReminder={() => openReminderSettings('schedule', 'all')}
                onOpenStatus={openRecipientStatus}
              />
            ) : view === 'reminders' ? (
              <ReminderSettings
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                repeat={repeat}
                setRepeat={setRepeat}
                sendDate={sendDate}
                setSendDate={setSendDate}
                monthDay={monthDay}
                setMonthDay={setMonthDay}
                sendTime={sendTime}
                setSendTime={setSendTime}
                timeZone={timeZone}
                setTimeZone={setTimeZone}
                audience={audience}
                setAudience={setAudience}
                reminderScope={reminderScope}
                setReminderScope={setReminderScope}
                individualRecipientId={individualRecipientId}
                setIndividualRecipientId={setIndividualRecipientId}
                users={recipientUsers}
                selectedUsers={selectedRecipientUsers}
                activeRecipients={activeRecipients.length}
                backupEndEnabled={backupEndEnabled}
                setBackupEndEnabled={setBackupEndEnabled}
                backupEndDate={backupEndDate}
                setBackupEndDate={setBackupEndDate}
                maxRemindersEnabled={maxRemindersEnabled}
                setMaxRemindersEnabled={setMaxRemindersEnabled}
                maxReminderCount={maxReminderCount}
                setMaxReminderCount={setMaxReminderCount}
                stopOnBounce={stopOnBounce}
                setStopOnBounce={setStopOnBounce}
                manualControlsEnabled={manualControlsEnabled}
                setManualControlsEnabled={setManualControlsEnabled}
                onBack={() => {
                  setView('publish')
                  setSharedOpen(true)
                }}
                onSave={handleSaveReminder}
              />
            ) : (
              <RecipientStatusPage
                users={recipientUsers}
                search={statusSearch}
                setSearch={setStatusSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                reminderFilter={reminderFilter}
                setReminderFilter={setReminderFilter}
                page={statusPage}
                setPage={setStatusPage}
                selectedRecipients={selectedRecipients}
                setSelectedRecipients={setSelectedRecipients}
                onBack={() => {
                  setView('publish')
                  setSharedOpen(true)
                }}
                onOpenReminder={openReminderSettings}
              />
            )}
          </div>

          {sharedOpen && view === 'publish' && (
            <SharedUsersModal
              users={recipientUsers}
              rowMenu={rowMenu}
              setRowMenu={setRowMenu}
              onClose={() => {
                setSharedOpen(false)
                setRowMenu(null)
              }}
              onOpenReminder={openReminderSettings}
              onOpenStatus={openRecipientStatus}
            />
          )}

          {bulkInviteOpen && view === 'publish' && (
            <BulkInviteModal
              existingUsers={recipientUsers}
              onClose={() => setBulkInviteOpen(false)}
              onInvite={handleBulkInvite}
            />
          )}
        </>
      )}

      {presentationOpen && (
        <PresentationNotes
          activeStep={presentationStep}
          setActiveStep={setPresentationStep}
          onClose={() => setPresentationOpen(false)}
          onOpenEmailPage={() => {
            setLegacyMode(true)
            setLegacyPage('email')
          }}
          onStartPrototype={() => setLegacyMode(false)}
        />
      )}

      {!presentationOpen && (
        <button
          className="presentation-launcher"
          type="button"
          onClick={() => setPresentationOpen(true)}
        >
          <Icon name="info-circle-filled" category="general" size={16} />
          Demo Notes
        </button>
      )}

      {presentationMode && <ProductionDemoBadge />}
    </div>
  )
}

function ProductionDemoBadge() {
  return (
    <aside className="production-demo-badge" aria-label="Production demo link">
      <strong>REMINDER EMAIL FOR INVITED FORM FILLERS</strong>
      <a href={productionDemoUrl} target="_blank" rel="noreferrer">
        hsivritepe.github.io/jotform-invite-reminders-demo/?present=1
      </a>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="jotform-logo">
          <span className="jotform-logo__mark" />
          Jotform
        </div>
        <button className="builder-switch" type="button">
          Form Builder
          <Icon name="chevron-down" category="arrows" size={14} />
        </button>
      </div>

      <div className="form-heading">
        <h1>First Enterprise Form</h1>
        <p>Last edited at Wed, Apr 22, 2026</p>
      </div>

      <div className="topbar__actions">
        <Button
          iconOnly
          variant="filled"
          colorScheme="secondary"
          shape="rounded"
          size="sm"
          aria-label="History"
          title="History"
          leftIcon={<Icon name="clock-arrow-rotate-right" category="time-date" size={16} />}
        />
        <Button
          variant="filled"
          colorScheme="secondary"
          shape="rounded"
          size="sm"
          leftIcon={<Icon name="users-plus-filled" category="users" size={16} />}
        >
          Add Collaborator
        </Button>
        <div className="user-avatar">HS</div>
      </div>
    </header>
  )
}

function LegacyExperience({
  page,
  setPage,
  onOpenPrototype,
}: {
  page: LegacyPage
  setPage: (page: LegacyPage) => void
  onOpenPrototype: () => void
}) {
  const [sharedOpen, setSharedOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)
  const [inviteExpanded, setInviteExpanded] = useState(false)
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)
  const [showSeedInvite, setShowSeedInvite] = useState(true)
  const [inviteDraft, setInviteDraft] = useState('')
  const legacySharedUsers = [
    {
      id: 'pending-primary',
      email: 'hakan@sivritepe.com',
      status: 'Pending',
      resend: true,
      submitted: false,
    },
    {
      id: 'pending-test',
      email: 'hakansivritepe+test@jotform.com',
      status: 'Pending',
      resend: true,
      submitted: false,
    },
    {
      id: 'submitted-admin',
      name: 'Hakan Sivritepe Admin',
      email: 'hakansivritepe@jotform.com',
      status: 'Joined on May 21, 2026',
      detail: 'Last submission on May 21, 2026',
      submitted: true,
    },
  ]

  return (
    <div className="legacy-experience">
      <header className="legacy-topbar">
        <div className="legacy-brand">
          <div className="legacy-logo">
            <span className="jotform-logo__mark" />
            Jotform
          </div>
          <button className="builder-switch" type="button">
            Form Builder
            <Icon name="chevron-down" category="arrows" size={14} />
          </button>
        </div>
        <div className="form-heading">
          <h1>Form 1</h1>
          <p>Last edited at Tue, May 19, 2026</p>
        </div>
        <div className="topbar__actions">
          <Button
            iconOnly
            variant="filled"
            colorScheme="secondary"
            shape="rounded"
            size="sm"
            aria-label="History"
            title="History"
            leftIcon={<Icon name="clock-arrow-rotate-right" category="time-date" size={16} />}
          />
          <Button
            variant="filled"
            colorScheme="secondary"
            shape="rounded"
            size="sm"
            leftIcon={<Icon name="users-plus-filled" category="users" size={16} />}
          >
            Add Collaborator
          </Button>
          <div className="user-avatar">HS</div>
        </div>
      </header>

      <nav className="product-tabs legacy-tabs" aria-label="Builder sections">
        <span className="product-tabs__spacer" aria-hidden="true" />
        <button type="button">Build</button>
        <button type="button">Settings</button>
        <button type="button" className="product-tabs__active">Publish</button>
        <div className="preview-toggle">
          <span>Preview Form</span>
          <span className="preview-toggle__track"><span /></span>
        </div>
      </nav>

      <div className="jf-app__body legacy-body">
        <Sidebar
          activeTitle={page === 'email' ? 'Email' : 'Assign Form'}
          onOpenAssignForm={() => setPage('publish')}
          onOpenEmail={() => setPage('email')}
        />
        {page === 'email' ? (
          <LegacyEmailPage onOpenReminder={() => setPage('reminder')} />
        ) : page === 'reminder' ? (
          <LegacyReminderEmailPage onBack={() => setPage('email')} />
        ) : (
        <main className="publish-page legacy-publish">
          <section className="direct-link-header">
            <div className="header-icon">
              <Icon name="link-diagonal" category="general" size={24} />
            </div>
            <div>
              <h2>Direct Link of Your Form</h2>
              <p>Your form is securely published and ready to use at this address</p>
            </div>
          </section>

          <section className="publish-card">
            <div className="section-row">
              <div className="section-title">
                <h3>Share with Link</h3>
                <Badge
                  size="sm"
                  status="success"
                  icon={<Icon name="lock-filled" category="security" size={12} />}
                >
                  Public Form
                </Badge>
              </div>
              <Button
                variant="transparent"
                colorScheme="primary"
                size="sm"
                leftIcon={<Icon name="gear-filled" category="general" size={16} />}
              >
                Settings
              </Button>
            </div>

            <div className="form-url">
              <Icon name="link-diagonal" category="general" size={18} />
              <span>https://demo.jotform.com/261055333446857</span>
              <Button
                iconOnly
                variant="transparent"
                colorScheme="secondary"
                size="sm"
                title="Edit link"
                aria-label="Edit link"
                leftIcon={<Icon name="pencil-to-square" category="general" size={16} />}
              />
            </div>

            <div className="button-stack">
              <Button variant="filled" colorScheme="constructive">Copy Link</Button>
              <Button>Open in New Tab</Button>
            </div>

            <div className="card-separator" />

            <div className="legacy-invite">
              <div className="section-row">
                <div className="section-title">
                  <h3>Invite by Email</h3>
                  <button
                    className="legacy-upload"
                    type="button"
                    aria-label="Bulk invite options"
                    onClick={() => setUploadMenuOpen((current) => !current)}
                  >
                    <Icon name="cloud-arrow-up" category="general" size={16} />
                  </button>
                  {uploadMenuOpen && (
                    <div className="legacy-upload-menu">
                      <button type="button">
                        <Icon name="document-csv-filled" category="documents" size={16} />
                        Upload CSV File
                      </button>
                      <button type="button">
                        <Icon name="arrow-down-to-line" category="arrows" size={16} />
                        Download Sample CSV
                      </button>
                    </div>
                  )}
                </div>
                <button className="shared-with legacy-shared-trigger" type="button" onClick={() => setSharedOpen(true)}>
                  Shared with <span className="legacy-mini-avatar"><Icon name="user-filled" category="users" size={16} /></span>
                </button>
              </div>
              <button className="invite-input legacy-invite-input" type="button" onClick={() => setInviteExpanded(true)}>
                <Icon name="envelope-closed-filled" category="communication" size={18} />
                <span>To:</span>
                <span>Enter email addresses to send invitation with permissions.</span>
              </button>

              {inviteExpanded && (
                <div className="legacy-invite-composer">
                  <label htmlFor="legacy-invite-email">To</label>
                  <div className="legacy-token-field">
                    {showSeedInvite && (
                      <span className="legacy-email-token">
                        hakansivritepe+test@jotform.com
                        <button type="button" aria-label="Remove email" onClick={() => setShowSeedInvite(false)}>
                          <Icon name="xmark" category="general" size={10} />
                        </button>
                      </span>
                    )}
                    <input
                      id="legacy-invite-email"
                      value={inviteDraft}
                      placeholder="Enter email addresses"
                      onChange={(event) => setInviteDraft(event.target.value)}
                    />
                  </div>
                  <div className="legacy-invite-actions">
                    <button type="button" onClick={() => setInviteExpanded(false)}>
                      Cancel
                    </button>
                    <Button size="sm" onClick={() => setSharedOpen(true)}>
                      Send Invitation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <SmallPublishCard
            title="Share Form"
            body="Share your form on Facebook, WhatsApp, X, LinkedIn or use QR code."
            action="View More"
            icon="share-nodes-filled"
          />
          <SmallPublishCard
            title="Create AI Agents"
            body="Turn your forms into AI-powered conversations. Let form fillers complete your form quickly and accurately with an AI Agents."
            action="Create AI Agent"
            icon="stars-filled"
          />
          <SmallPublishCard
            title="Create App"
            body="Create an app to store all of your forms in one place and easily share them with others. Start with this form!"
            action="Create App"
            icon="rocket-filled"
          />
        </main>
        )}
      </div>

      <button className="legacy-prototype-button" type="button" onClick={onOpenPrototype}>
        Open Prototype
        <Icon name="arrow-right" category="arrows" size={14} />
      </button>

      <div className="legacy-copilot">Ask Copilot</div>

      {sharedOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => setSharedOpen(false)}>
          <section
            className="shared-modal legacy-shared-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="shared-modal__header">
              <h2>Shared with 3 users</h2>
              <Button
                iconOnly
                variant="filled"
                colorScheme="secondary"
                shape="rounded"
                aria-label="Close shared users"
                title="Close"
                leftIcon={<Icon name="xmark" category="general" size={16} />}
                onClick={() => setSharedOpen(false)}
              />
            </header>

            <div className="shared-modal__toolbar">
              <label className="select-all">
                <span className="check-box" />
                Users
              </label>
              <Input
                size="sm"
                placeholder="Search"
                leftContent={<Icon name="magnifying-glass" category="general" size={16} />}
                aria-label="Search shared users"
              />
            </div>

            <div className="legacy-shared-list">
              {legacySharedUsers.map((user) => (
                <div className="legacy-shared-row" key={user.id}>
                  <span className="check-box" />
                  <span className={user.submitted ? 'legacy-green-avatar' : 'legacy-orange-avatar'}>
                    {user.submitted ? 'HS' : <Icon name="user-filled" category="users" size={18} />}
                  </span>
                  <span className="legacy-shared-person">
                    {user.name && <strong>{user.name}</strong>}
                    <span>{user.email}</span>
                  </span>
                  <span className={user.submitted ? 'legacy-submitted' : 'legacy-pending'}>
                    {user.status}
                    {user.detail && <small>{user.detail}</small>}
                    {user.resend && <button type="button">Resend Invitation</button>}
                  </span>
                  <button className="role-button" type="button">
                    Submit & View
                    <Icon name="chevron-down" category="arrows" size={12} />
                  </button>
                  <div className="row-actions">
                    <Button
                      iconOnly
                      variant="ghost"
                      colorScheme="secondary"
                      size="sm"
                      aria-label="User actions"
                      title="User actions"
                      leftIcon={<Icon name="ellipsis-vertical" category="general" size={16} />}
                      onClick={() => setActionsOpen((current) => (current === user.id ? null : user.id))}
                    />
                    {actionsOpen === user.id && (
                      <div className="row-menu legacy-row-menu">
                        <button type="button">
                          <Icon name="envelope-closed-filled" category="communication" size={16} />
                          Resend Invitation
                        </button>
                        <button type="button">
                          <Icon name="trash-filled" category="general" size={16} />
                          Revoke User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function LegacyEmailPage({ onOpenReminder }: { onOpenReminder: () => void }) {
  return (
    <main className="publish-page legacy-email-page">
      <section className="direct-link-header">
        <div className="legacy-email-header-icon">
          <Icon name="envelope-closed-filled" category="communication" size={24} />
        </div>
        <div>
          <h2>Email Form</h2>
          <p>Share your forms through email</p>
        </div>
      </section>

      <div className="legacy-email-list">
        <button className="legacy-email-option" type="button">
          <span className="legacy-email-option__icon">
            <Icon name="envelope-closed-filled" category="communication" size={24} />
          </span>
          <span>
            <strong>Share on Email</strong>
            <small>Share a direct link to your form via email.</small>
          </span>
          <Icon name="arrow-right" category="arrows" size={20} />
        </button>

        <button className="legacy-email-option" type="button" onClick={onOpenReminder}>
          <span className="legacy-email-option__icon">
            <Icon name="envelope-closed-bell-diagonal-filled" category="communication" size={24} />
          </span>
          <span>
            <strong>Schedule a Reminder Email</strong>
            <small>Send periodic emails to remind people to fill out your form.</small>
          </span>
          <Icon name="arrow-right" category="arrows" size={20} />
        </button>
      </div>
    </main>
  )
}

function LegacyReminderEmailPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'email' | 'recipients' | 'schedule'>('email')

  return (
    <main className="publish-page legacy-reminder-page">
      <section className="legacy-reminder-heading">
        <button className="legacy-back-button" type="button" aria-label="Back to email page" onClick={onBack}>
          <Icon name="arrow-left" category="arrows" size={26} />
        </button>
        <span className="legacy-reminder-heading__icon">
          <Icon name="envelope-closed-bell-diagonal-filled" category="communication" size={24} />
        </span>
        <div>
          <h2>
            Reminder Email 1
            <Icon name="pencil" category="editor" size={14} />
          </h2>
          <p>Schedule your reminder email</p>
        </div>
      </section>

      <section className="legacy-reminder-panel">
        <div className="legacy-reminder-tabs" role="tablist" aria-label="Reminder email settings">
          {[
            { value: 'email', label: 'EMAIL' },
            { value: 'recipients', label: 'RECIPIENTS' },
            { value: 'schedule', label: 'SCHEDULE' },
          ].map((tab) => (
            <button
              key={tab.value}
              className={activeTab === tab.value ? 'legacy-reminder-tab legacy-reminder-tab--active' : 'legacy-reminder-tab'}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value as 'email' | 'recipients' | 'schedule')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="legacy-reminder-body">
          {activeTab === 'email' && (
            <div className="legacy-reminder-email-tab">
              <label>
                Subject <span>*</span>
              </label>
              <div className="legacy-plain-input">Daily Reminder: Form 1</div>
              <div className="legacy-editor">
                <div className="legacy-editor-toolbar">
                  <span>16 px</span>
                  <strong>B</strong>
                  <em>I</em>
                  <Icon name="text-underline" category="editor" size={16} />
                  <Icon name="image" category="media" size={16} />
                </div>
                <div className="legacy-editor-canvas">
                  <h3>A form is waiting for you to fill out.</h3>
                  <p>Hi there,</p>
                  <p>Just a friendly reminder for you. Please click the button below to fill out the ‘Form 1’.</p>
                  <button type="button">View Form</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recipients' && (
            <div className="legacy-form-stack">
              <label>Sender Name</label>
              <div className="legacy-plain-input">Hakan Sivritepe Admin</div>
              <label>
                Reply-to Email <span>*</span>
              </label>
              <div className="legacy-plain-input">hakansivritepe@jotform.com</div>
              <label>
                To <span>*</span>
              </label>
              <div className="legacy-recipient-box">hakansivritepe@jotform.com</div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="legacy-form-stack">
              <label>Repeats</label>
              <div className="legacy-segments">
                <button className="legacy-segment legacy-segment--active" type="button">Daily</button>
                <button className="legacy-segment" type="button">Weekly</button>
                <button className="legacy-segment" type="button">Monthly</button>
              </div>
              <label>Send Date</label>
              <div className="legacy-plain-input">Monday - Friday</div>
              <div className="legacy-two-col">
                <div>
                  <label>Send Time</label>
                  <div className="legacy-plain-input">9:00 AM</div>
                </div>
                <div>
                  <label>Time Zone</label>
                  <div className="legacy-plain-input">Los Angeles (GMT-08:00)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="legacy-reminder-actions">
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </div>
    </main>
  )
}

const presentationSlides = [
  {
    eyebrow: 'Issue',
    title: 'Invites stop at pending',
    body: 'Pending state is for email link clicked, not for submission.',
    bullets: [
      'No clear screen for who still needs to submit.',
      'No reminder schedule tied to submission status.',
    ],
  },
  {
    eyebrow: 'Signal',
    title: 'Repeated customer request',
    body: 'Many client tickets ask for a way to remind invited recipients until they complete the form.',
    bullets: [
      'Especially painful for large invite lists.',
      'Clients wants automatic reminders to stop in different conditions.',
    ],
  },
  {
    eyebrow: 'Fix',
    title: 'Submission-aware reminders',
    body: 'The prototype adds reminders, tracking, bulk invite, and per-user settings inside the existing Publish flow.',
    bullets: [],
  },
]

function PresentationNotes({
  activeStep,
  setActiveStep,
  onClose,
  onOpenEmailPage,
  onStartPrototype,
}: {
  activeStep: number
  setActiveStep: (step: number) => void
  onClose: () => void
  onOpenEmailPage?: () => void
  onStartPrototype?: () => void
}) {
  const slide = presentationSlides[activeStep]
  const isLast = activeStep === presentationSlides.length - 1

  return (
    <aside className="presentation-notes" role="dialog" aria-label="Demo presentation notes" aria-modal="false">
      <header className="presentation-notes__header">
        <div>
          <span>Demo flow</span>
          <strong>{activeStep + 1} / {presentationSlides.length}</strong>
        </div>
        <Button
          iconOnly
          variant="filled"
          colorScheme="secondary"
          shape="rounded"
          size="sm"
          aria-label="Close demo notes"
          title="Close"
          leftIcon={<Icon name="xmark" category="general" size={14} />}
          onClick={onClose}
        />
      </header>

      <div className="presentation-notes__body">
        <span className="presentation-notes__eyebrow">{slide.eyebrow}</span>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
        {slide.bullets.length > 0 && (
          <ul>
            {slide.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        )}
        {activeStep === 1 && (
          <button className="presentation-notes__link" type="button" onClick={onOpenEmailPage}>
            <Icon name="arrow-right" category="arrows" size={14} />
            Email page
          </button>
        )}
      </div>

      <footer className="presentation-notes__footer">
        <div className="presentation-notes__dots" aria-label="Presentation slide selector">
          {presentationSlides.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              className={index === activeStep ? 'presentation-notes__dot presentation-notes__dot--active' : 'presentation-notes__dot'}
              aria-label={`Show ${item.eyebrow}`}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        <div className="presentation-notes__actions">
          <Button
            variant="filled"
            colorScheme="secondary"
            size="sm"
            disabled={activeStep === 0}
            leftIcon={<Icon name="arrow-left" category="arrows" size={14} />}
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          >
            Back
          </Button>
          <Button
            variant="filled"
            colorScheme="primary"
            size="sm"
            rightIcon={<Icon name={isLast ? 'xmark' : 'arrow-right'} category={isLast ? 'general' : 'arrows'} size={14} />}
            onClick={() => {
              if (isLast) {
                onStartPrototype?.()
                onClose()
                return
              }

              setActiveStep(activeStep + 1)
            }}
          >
            {isLast ? 'Demo page' : 'Next'}
          </Button>
        </div>
      </footer>
    </aside>
  )
}

function ProductTabs({ onOpenPublish }: { onOpenPublish: () => void }) {
  return (
    <nav className="product-tabs" aria-label="Builder sections">
      <span className="product-tabs__spacer" aria-hidden="true" />
      <button type="button">Build</button>
      <button type="button">Settings</button>
      <button type="button" className="product-tabs__active" onClick={onOpenPublish}>Publish</button>
      <div className="preview-toggle">
        <span>Preview Form</span>
        <span className="preview-toggle__track"><span /></span>
      </div>
    </nav>
  )
}

function Sidebar({
  activeTitle = 'Assign Form',
  onOpenAssignForm,
  onOpenEmail,
}: {
  activeTitle?: string
  onOpenAssignForm: () => void
  onOpenEmail?: () => void
}) {
  return (
    <aside className="sidebar" aria-label="Publish navigation">
      {navItems.map((item) => (
        <button
          className={`side-nav-item${item.title === activeTitle ? ' side-nav-item--active' : ''}`}
          key={item.title}
          type="button"
          onClick={
            item.title === 'Assign Form'
              ? onOpenAssignForm
              : item.title === 'Email'
                ? onOpenEmail
                : undefined
          }
        >
          {item.glyph ? (
            <span className="side-nav-glyph" aria-hidden="true">{item.glyph}</span>
          ) : (
            <Icon name={item.icon || 'circle-filled'} category={item.category || 'general'} size={22} />
          )}
          <span>
            <strong>{item.title}</strong>
            <small>{item.subtitle}</small>
          </span>
        </button>
      ))}
    </aside>
  )
}

function PublishScreen({
  savedRule,
  reminderSummary,
  sharedCount,
  onOpenShared,
  onOpenBulkInvite,
  onOpenReminder,
  onOpenStatus,
}: {
  savedRule: boolean
  reminderSummary: string
  sharedCount: number
  onOpenShared: () => void
  onOpenBulkInvite: () => void
  onOpenReminder: () => void
  onOpenStatus: () => void
}) {
  return (
    <main className="publish-page">
      <section className="direct-link-header">
        <div className="header-icon">
          <Icon name="link-diagonal" category="general" size={24} />
        </div>
        <div>
          <h2>Direct Link of Your Form</h2>
          <p>Your form is securely published and ready to use at this address</p>
        </div>
      </section>

      <section className="publish-card">
        <div className="section-row">
          <div className="section-title">
            <h3>Share with Link</h3>
            <Badge
              size="sm"
              status="success"
              icon={<Icon name="lock-filled" category="security" size={12} />}
            >
              Public Form
            </Badge>
          </div>
          <Button
            variant="transparent"
            colorScheme="primary"
            size="sm"
            leftIcon={<Icon name="gear-filled" category="general" size={16} />}
          >
            Settings
          </Button>
        </div>

        <div className="form-url">
          <Icon name="link-diagonal" category="general" size={18} />
          <span>https://ca.bugrahan.dev/260255849426060</span>
          <Button
            iconOnly
            variant="transparent"
            colorScheme="secondary"
            size="sm"
            title="Edit link"
            aria-label="Edit link"
            leftIcon={<Icon name="pencil-to-square" category="general" size={16} />}
          />
        </div>

        <div className="button-stack">
          <Button variant="filled" colorScheme="constructive">Copy Link</Button>
          <Button>Open in New Tab</Button>
        </div>

        <div className="card-separator" />

        <div
          className="invite-email"
          role="button"
          tabIndex={0}
          onClick={onOpenShared}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpenShared()
            }
          }}
        >
          <div className="section-row">
            <div className="section-title">
              <h3>Invite by Email</h3>
              <Button
                variant="transparent"
                colorScheme="primary"
                size="sm"
                leftIcon={<Icon name="document-csv-filled" category="documents" size={16} />}
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenBulkInvite()
                }}
              >
                Bulk Invite
              </Button>
            </div>
            <span className="shared-with">
              Shared with {sharedCount} users <span className="avatar-stack">HS</span>
            </span>
          </div>

          <div className="invite-input">
            <Icon name="envelope-closed-filled" category="communication" size={18} />
            <span>To:</span>
            <span>Enter email addresses to send invitation with permissions.</span>
          </div>

          {savedRule && (
            <div className="reminder-summary" onClick={(event) => event.stopPropagation()}>
              <div className="summary-icon">
                <Icon name="clock-arrow-rotate-right" category="time-date" size={20} />
              </div>
              <div>
                <strong>Submission reminders are on</strong>
                <span>{reminderSummary}</span>
              </div>
              <div className="reminder-summary__actions">
                <Button
                  variant="ghost"
                  colorScheme="primary"
                  size="sm"
                  leftIcon={<Icon name="users-filled" category="users" size={16} />}
                  onClick={onOpenStatus}
                >
                  Track Status
                </Button>
                <Button
                  variant="filled"
                  colorScheme="primary"
                  size="sm"
                  leftIcon={<Icon name="gear-filled" category="general" size={16} />}
                  onClick={onOpenReminder}
                >
                  Edit Reminders
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <SmallPublishCard
        title="Share as Template"
        body="Make your form reusable for yourself or your entire organization."
        action="Share as Template"
        icon="paper-filled"
      />
      <SmallPublishCard
        title="Share Form"
        body="Share your form on Facebook, WhatsApp, X, LinkedIn or use QR code."
        action="View More"
        icon="share-nodes-filled"
      />
      <SmallPublishCard
        title="Create AI Agents"
        body="Turn your forms into AI-powered conversations. Let form fillers complete your form quickly."
        action="Create Agent"
        icon="rocket-filled"
      />
    </main>
  )
}

function SmallPublishCard({
  title,
  body,
  action,
  icon,
}: {
  title: string
  body: string
  action: string
  icon: string
}) {
  return (
    <section className="small-publish-card">
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <Button
        variant="filled"
        colorScheme="secondary"
        leftIcon={<Icon name={icon} category={icon === 'paper-filled' ? 'forms-files' : 'general'} size={16} />}
      >
        {action}
      </Button>
    </section>
  )
}

function BulkInviteModal({
  existingUsers,
  onClose,
  onInvite,
}: {
  existingUsers: RecipientRecord[]
  onClose: () => void
  onInvite: (rows: ReviewedInviteRow[], role: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedInviteRow[]>([])
  const [role, setRole] = useState('Submit & View')
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'error'>('idle')
  const [error, setError] = useState('')
  const existingEmails = useMemo(
    () => new Set(existingUsers.map((user) => user.email.toLowerCase())),
    [existingUsers],
  )
  const reviewedRows = useMemo<ReviewedInviteRow[]>(
    () => {
      const importedEmails = new Set<string>()

      return rows.map((row) => {
        const email = row.email.toLowerCase()
        const duplicate = email.length > 0 && (existingEmails.has(email) || importedEmails.has(email))

        if (row.valid && emailPattern.test(email)) {
          importedEmails.add(email)
        }

        return {
          ...row,
          duplicate,
          valid: row.valid && !duplicate,
          reason: duplicate ? 'Already invited' : row.reason,
        }
      })
    },
    [rows, existingEmails],
  )
  const validRows = reviewedRows.filter((row) => row.valid)
  const invalidRows = reviewedRows.filter((row) => !row.valid)
  const previewRows = reviewedRows.slice(0, 6)

  const handleFile = async (file?: File) => {
    if (!file) {
      return
    }

    setFileName(file.name)
    setStatus('parsing')
    setError('')

    try {
      const parsedRows = await parseInviteFile(file)

      setRows(parsedRows)
      setStatus('ready')
    } catch (caughtError) {
      setRows([])
      setStatus('error')
      setError(caughtError instanceof Error ? caughtError.message : 'Could not read this file.')
    }
  }

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bulk-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Bulk invite recipients"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="shared-modal__header">
          <div>
            <h2>Bulk Invite Recipients</h2>
            <p>Import a CSV or XLSX file and send personal invitation links.</p>
          </div>
          <Button
            iconOnly
            variant="filled"
            colorScheme="secondary"
            shape="rounded"
            aria-label="Close bulk invite"
            title="Close"
            leftIcon={<Icon name="xmark" category="general" size={16} />}
            onClick={onClose}
          />
        </header>

        <div className="bulk-modal__body">
          <input
            ref={inputRef}
            className="bulk-file-input"
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <button
            className="bulk-dropzone"
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              handleFile(event.dataTransfer.files[0])
            }}
          >
            <span className="bulk-dropzone__icon">
              <Icon name="cloud-arrow-up" category="general" size={24} />
            </span>
            <strong>{fileName || 'Choose CSV or XLSX file'}</strong>
            <small>Columns: email, name, role</small>
          </button>

          <div className="bulk-import-grid">
            <article>
              <strong>{validRows.length}</strong>
              <span>Ready to invite</span>
            </article>
            <article>
              <strong>{invalidRows.length}</strong>
              <span>Skipped</span>
            </article>
            <article>
              <strong>{rows.length}</strong>
              <span>Total rows</span>
            </article>
          </div>

          <div className="bulk-options-row">
            <FormField title="Default Role" showDescription={false} showHelpText={false}>
              <DropdownSingle
                value={role}
                onChange={setRole}
                showLeadingIcon={false}
                options={bulkRoleOptions}
              />
            </FormField>
            <div className="bulk-options-note">
              <Icon name="info-circle-filled" category="general" size={16} />
              <span>Rows with a valid role column override the default.</span>
            </div>
          </div>

          {status === 'parsing' && (
            <div className="bulk-empty-state">
              <Icon name="loading" category="general" size={20} />
              Reading file...
            </div>
          )}

          {status === 'error' && (
            <div className="bulk-error">
              <Icon name="exclamation-triangle-filled" category="general" size={18} />
              <span>{error}</span>
            </div>
          )}

          {status === 'idle' && (
            <div className="bulk-empty-state">
              <span>email,name,role</span>
              <span>alex@company.com,Alex Viewer,Submit & View</span>
            </div>
          )}

          {status === 'ready' && (
            <div className="bulk-preview">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.email || 'empty'}`}>
                      <td>{row.rowNumber}</td>
                      <td>{row.email || '-'}</td>
                      <td>{row.name || '-'}</td>
                      <td>{row.role || role}</td>
                      <td>
                        <Badge size="sm" status={row.valid ? 'success' : 'warning'}>
                          {row.valid ? 'Ready' : row.reason}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reviewedRows.length > previewRows.length && (
                <span className="bulk-preview__more">+{reviewedRows.length - previewRows.length} more rows</span>
              )}
            </div>
          )}
        </div>

        <footer className="bulk-modal__footer">
          <Button
            variant="filled"
            colorScheme="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            colorScheme="primary"
            disabled={validRows.length === 0}
            leftIcon={<Icon name="paper-plane-filled" category="communication" size={16} />}
            onClick={() => onInvite(validRows, role)}
          >
            Send {validRows.length} Invites
          </Button>
        </footer>
      </section>
    </div>
  )
}

function SharedUsersModal({
  users,
  rowMenu,
  setRowMenu,
  onClose,
  onOpenReminder,
  onOpenStatus,
}: {
  users: RecipientRecord[]
  rowMenu: string | null
  setRowMenu: (id: string | null) => void
  onClose: () => void
  onOpenReminder: (tab?: ReminderTab, scope?: ReminderScope, recipientId?: string) => void
  onOpenStatus: () => void
}) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="shared-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="shared-modal__header">
          <div>
            <h2>Shared with {users.length} users</h2>
            <p>Showing recent invitees. Use status view for large recipient lists.</p>
          </div>
          <div className="shared-modal__header-actions">
            <Button
              variant="ghost"
              colorScheme="primary"
              size="sm"
              leftIcon={<Icon name="bars-filter" category="general" size={16} />}
              onClick={onOpenStatus}
            >
              View Full Status
            </Button>
            <Button
              iconOnly
              variant="filled"
              colorScheme="secondary"
              shape="rounded"
              aria-label="Close shared users"
              title="Close"
              leftIcon={<Icon name="xmark" category="general" size={16} />}
              onClick={onClose}
            />
          </div>
        </header>

        <div className="shared-modal__toolbar">
          <label className="select-all">
            <span className="check-box" />
            Users
          </label>
          <Input
            size="sm"
            placeholder="Search"
            leftContent={<Icon name="magnifying-glass" category="general" size={16} />}
            aria-label="Search shared users"
          />
        </div>

        <div className="shared-users-list">
          {users.slice(0, 5).map((user) => (
            <SharedUserRow
              key={user.id}
              user={user}
              menuOpen={rowMenu === user.id}
              onToggleMenu={() => setRowMenu(rowMenu === user.id ? null : user.id)}
              onOpenReminder={onOpenReminder}
              onOpenStatus={onOpenStatus}
            />
          ))}
        </div>

        <footer className="shared-modal__footer">
          <span>{users.filter((user) => user.status !== 'submitted').length} users still need to submit.</span>
          <Button
            variant="transparent"
            colorScheme="primary"
            size="sm"
            rightIcon={<Icon name="arrow-right" category="arrows" size={14} />}
            onClick={onOpenStatus}
          >
            Open tracking table
          </Button>
        </footer>
      </section>
    </div>
  )
}

function SharedUserRow({
  user,
  menuOpen,
  onToggleMenu,
  onOpenReminder,
  onOpenStatus,
}: {
  user: SharedUser
  menuOpen: boolean
  onToggleMenu: () => void
  onOpenReminder: (tab?: ReminderTab, scope?: ReminderScope, recipientId?: string) => void
  onOpenStatus: () => void
}) {
  const statusLabel = {
    pending: 'Pending',
    opened: 'Opened form',
    submitted: 'Submitted',
  }[user.status]

  const badgeStatus = user.reminderState === 'stopped' ? 'success' : user.reminderState === 'paused' ? 'neutral' : 'information'
  const badgeLabel = user.reminderState === 'stopped' ? 'Stopped' : user.reminderState === 'paused' ? 'Paused' : 'Reminder on'

  return (
    <div className="shared-user-row">
      <span className="check-box" />
      <span className="row-avatar">{user.initials}</span>
      <div className="row-email">
        <strong>{user.email}</strong>
        <span>{user.lastActivity}</span>
      </div>
      <div className="row-status">
        <strong>{statusLabel}</strong>
        {user.status === 'pending' && <button type="button">Resend Invitation</button>}
      </div>
      <button className="role-button" type="button">
        {user.role}
        <Icon name="angle-down" category="arrows" size={14} />
      </button>
      <div className="row-reminder">
        <Badge size="sm" status={badgeStatus}>{badgeLabel}</Badge>
        <span>{user.nextReminder ? `Next: ${user.nextReminder}` : `${user.sentCount} reminder sent`}</span>
      </div>
      <div className="row-actions">
        <Button
          iconOnly
          variant="transparent"
          colorScheme="secondary"
          size="sm"
          aria-label={`Open actions for ${user.email}`}
          title="Actions"
          leftIcon={<Icon name="ellipsis-vertical" category="general" size={18} />}
          onClick={onToggleMenu}
        />
        {menuOpen && (
          <div className="row-menu" role="menu">
            <button type="button" onClick={() => onOpenReminder('schedule', 'individual', user.id)}>
              <Icon name="clock-arrow-rotate-right" category="time-date" size={16} />
              Set reminders
            </button>
            <button type="button">
              <Icon name="paper-plane-filled" category="communication" size={16} />
              Remind now
            </button>
            <button type="button">
              <Icon name="pause-filled" category="media" size={16} />
              Pause reminders
            </button>
            <button type="button" onClick={onOpenStatus}>
              <Icon name="eye-filled" category="general" size={16} />
              View activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RecipientStatusPage({
  users,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  reminderFilter,
  setReminderFilter,
  page,
  setPage,
  selectedRecipients,
  setSelectedRecipients,
  onBack,
  onOpenReminder,
}: {
  users: RecipientRecord[]
  search: string
  setSearch: (value: string) => void
  statusFilter: StatusFilter
  setStatusFilter: (value: StatusFilter) => void
  reminderFilter: ReminderFilter
  setReminderFilter: (value: ReminderFilter) => void
  page: number
  setPage: (value: number) => void
  selectedRecipients: string[]
  setSelectedRecipients: (ids: string[]) => void
  onBack: () => void
  onOpenReminder: (tab?: ReminderTab, scope?: ReminderScope, recipientId?: string) => void
}) {
  const pageSize = 25
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch = query.length === 0
        || user.email.toLowerCase().includes(query)
        || user.group.toLowerCase().includes(query)
        || user.role.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesReminder = reminderFilter === 'all' || user.reminderState === reminderFilter

      return matchesSearch && matchesStatus && matchesReminder
    })
  }, [users, search, statusFilter, reminderFilter])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const visibleIds = visibleUsers.map((user) => user.id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedRecipients.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const firstVisible = filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const lastVisible = Math.min(currentPage * pageSize, filteredUsers.length)

  const submittedCount = users.filter((user) => user.status === 'submitted').length
  const openedCount = users.filter((user) => user.status === 'opened').length
  const pendingCount = users.filter((user) => user.status === 'pending').length
  const activeReminderCount = users.filter((user) => user.reminderState === 'active').length

  const toggleVisibleUsers = () => {
    if (allVisibleSelected) {
      setSelectedRecipients(selectedRecipients.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedRecipients(Array.from(new Set([...selectedRecipients, ...visibleIds])))
  }

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(
      selectedRecipients.includes(id)
        ? selectedRecipients.filter((selectedId) => selectedId !== id)
        : [...selectedRecipients, id],
    )
  }

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const updateStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }

  const updateReminderFilter = (value: ReminderFilter) => {
    setReminderFilter(value)
    setPage(1)
  }

  return (
    <main className="status-page">
      <div className="status-heading">
        <Button
          iconOnly
          variant="transparent"
          colorScheme="secondary"
          aria-label="Back to shared users"
          title="Back"
          leftIcon={<Icon name="arrow-left" category="arrows" size={26} />}
          onClick={onBack}
        />
        <span className="status-heading__icon">
          <Icon name="users-check-filled" category="users" size={24} />
        </span>
        <div>
          <h2>Submission Status</h2>
          <p>Track invited people by their personal link and stop reminders after submission.</p>
        </div>
        <div className="status-heading__actions">
          <Button
            variant="ghost"
            colorScheme="primary"
            size="sm"
            leftIcon={<Icon name="gear-filled" category="general" size={16} />}
            onClick={() => onOpenReminder('schedule', 'all')}
          >
            Edit Form Schedule
          </Button>
          <Button
            variant="filled"
            colorScheme="secondary"
            size="sm"
            leftIcon={<Icon name="document-csv-filled" category="documents" size={16} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <section className="status-metrics" aria-label="Submission summary">
        <MetricCard label="Invited" value={users.length} icon="users-filled" category="users" />
        <MetricCard label="Pending" value={pendingCount} icon="hourglass-half" category="time-date" />
        <MetricCard label="Opened link" value={openedCount} icon="eye-filled" category="general" />
        <MetricCard label="Submitted" value={submittedCount} icon="check-circle-filled" category="general" tone="success" />
        <MetricCard label="Active reminders" value={activeReminderCount} icon="bell-diagonal-ringing-filled" category="alerts-feedback" tone="info" />
      </section>

      <section className="status-panel">
        <div className="status-panel__toolbar">
          <SearchInput
            size="sm"
            placeholder="Search recipients"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            aria-label="Search invitation recipients"
          />
          <DropdownSingle
            value={statusFilter}
            onChange={(value) => updateStatusFilter(value as StatusFilter)}
            showLeadingIcon={false}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'opened', label: 'Opened link' },
              { value: 'submitted', label: 'Submitted' },
            ]}
          />
          <DropdownSingle
            value={reminderFilter}
            onChange={(value) => updateReminderFilter(value as ReminderFilter)}
            showLeadingIcon={false}
            options={[
              { value: 'all', label: 'All reminders' },
              { value: 'active', label: 'Reminder on' },
              { value: 'paused', label: 'Paused' },
              { value: 'stopped', label: 'Stopped' },
            ]}
          />
        </div>

        <div className="bulk-bar">
          <span>
            {selectedRecipients.length > 0
              ? `${selectedRecipients.length} selected`
              : `${filteredUsers.length} recipients match the current view`}
          </span>
          <div>
            <Button
              variant="transparent"
              colorScheme="primary"
              size="sm"
              onClick={() => onOpenReminder('schedule', selectedRecipients.length > 0 ? 'selected' : 'all')}
            >
              {selectedRecipients.length > 0 ? 'Schedule Selected' : 'Schedule All'}
            </Button>
            <Button variant="transparent" colorScheme="primary" size="sm">Remind Now</Button>
            <Button variant="transparent" colorScheme="secondary" size="sm">Pause</Button>
            <Button variant="transparent" colorScheme="secondary" size="sm">Change Role</Button>
          </div>
        </div>

        <div className="status-table-wrap">
          <table className="status-table">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    size="sm"
                    label=""
                    aria-label="Select visible recipients"
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && selectedVisibleCount > 0}
                    onChange={toggleVisibleUsers}
                  />
                </th>
                <th>User</th>
                <th>Status</th>
                <th>Reminder</th>
                <th>Invited</th>
                <th>Submission</th>
                <th>Group</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <RecipientStatusRow
                  key={user.id}
                  user={user}
                  selected={selectedRecipients.includes(user.id)}
                  onToggle={() => toggleRecipient(user.id)}
                  onOpenReminder={() => onOpenReminder('schedule', 'individual', user.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="status-pagination">
          <span>Showing {firstVisible}-{lastVisible} of {filteredUsers.length}</span>
          <div>
            <Button
              variant="filled"
              colorScheme="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {pageCount}</span>
            <Button
              variant="filled"
              colorScheme="secondary"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  label,
  value,
  icon,
  category,
  tone = 'neutral',
}: {
  label: string
  value: number
  icon: string
  category: string
  tone?: 'neutral' | 'success' | 'info'
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span>
        <Icon name={icon} category={category} size={20} />
      </span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  )
}

function RecipientStatusRow({
  user,
  selected,
  onToggle,
  onOpenReminder,
}: {
  user: RecipientRecord
  selected: boolean
  onToggle: () => void
  onOpenReminder: () => void
}) {
  const inviteMeta = inviteStatusMeta[user.status]
  const reminderMeta = reminderStateMeta[user.reminderState]

  return (
    <tr>
      <td>
        <Checkbox
          size="sm"
          label=""
          aria-label={`Select ${user.email}`}
          checked={selected}
          onChange={onToggle}
        />
      </td>
      <td>
        <div className="status-user-cell">
          <span className="row-avatar">{user.initials}</span>
          <div>
            <strong>{user.email}</strong>
            <small>{user.role}</small>
          </div>
        </div>
      </td>
      <td><Badge size="sm" status={inviteMeta.status}>{inviteMeta.label}</Badge></td>
      <td>
        <div className="status-reminder-cell">
          <Badge size="sm" status={reminderMeta.status}>{reminderMeta.label}</Badge>
          <small>{user.nextReminder || `${user.sentCount} sent`}</small>
        </div>
      </td>
      <td>{user.invitedAt}</td>
      <td>
        <span className={user.submittedAt ? 'submission-date' : 'submission-date submission-date--empty'}>
          {user.submittedAt || 'Not submitted'}
        </span>
      </td>
      <td>{user.group}</td>
      <td>
        <Button
          iconOnly
          variant="transparent"
          colorScheme="primary"
          size="sm"
          aria-label={`Set reminder schedule for ${user.email}`}
          title="Set individual schedule"
          leftIcon={<Icon name="clock-arrow-rotate-right" category="time-date" size={16} />}
          onClick={onOpenReminder}
        />
      </td>
    </tr>
  )
}

function ReminderSettings({
  activeTab,
  setActiveTab,
  repeat,
  setRepeat,
  sendDate,
  setSendDate,
  monthDay,
  setMonthDay,
  sendTime,
  setSendTime,
  timeZone,
  setTimeZone,
  audience,
  setAudience,
  reminderScope,
  setReminderScope,
  individualRecipientId,
  setIndividualRecipientId,
  users,
  selectedUsers,
  activeRecipients,
  backupEndEnabled,
  setBackupEndEnabled,
  backupEndDate,
  setBackupEndDate,
  maxRemindersEnabled,
  setMaxRemindersEnabled,
  maxReminderCount,
  setMaxReminderCount,
  stopOnBounce,
  setStopOnBounce,
  manualControlsEnabled,
  setManualControlsEnabled,
  onBack,
  onSave,
}: {
  activeTab: ReminderTab
  setActiveTab: (tab: ReminderTab) => void
  repeat: RepeatFrequency
  setRepeat: (value: RepeatFrequency) => void
  sendDate: string
  setSendDate: (value: string) => void
  monthDay: string
  setMonthDay: (value: string) => void
  sendTime: string
  setSendTime: (value: string) => void
  timeZone: string
  setTimeZone: (value: string) => void
  audience: ReminderAudience
  setAudience: (value: ReminderAudience) => void
  reminderScope: ReminderScope
  setReminderScope: (value: ReminderScope) => void
  individualRecipientId: string
  setIndividualRecipientId: (value: string) => void
  users: RecipientRecord[]
  selectedUsers: RecipientRecord[]
  activeRecipients: number
  backupEndEnabled: boolean
  setBackupEndEnabled: (value: boolean) => void
  backupEndDate: string
  setBackupEndDate: (value: string) => void
  maxRemindersEnabled: boolean
  setMaxRemindersEnabled: (value: boolean) => void
  maxReminderCount: string
  setMaxReminderCount: (value: string) => void
  stopOnBounce: boolean
  setStopOnBounce: (value: boolean) => void
  manualControlsEnabled: boolean
  setManualControlsEnabled: (value: boolean) => void
  onBack: () => void
  onSave: () => void
}) {
  return (
    <main className="reminder-page">
      <div className="reminder-heading">
        <Button
          iconOnly
          variant="transparent"
          colorScheme="secondary"
          aria-label="Back to shared users"
          title="Back"
          leftIcon={<Icon name="arrow-left" category="arrows" size={26} />}
          onClick={onBack}
        />
        <span className="reminder-heading__icon">
          <Icon name="envelope-closed-bell-diagonal-filled" category="communication" size={24} />
        </span>
        <div>
          <h2>
            Invite Reminder 1
            <Icon name="pencil" category="editor" size={14} />
          </h2>
          <p>Remind invited users until they submit this form</p>
        </div>
      </div>

      <section className="settings-panel">
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as ReminderTab)}
          items={emailTabs}
          className="reminder-tabs"
        />
        <div className="settings-body">
          {activeTab === 'email' && <EmailTab />}
          {activeTab === 'recipients' && (
            <RecipientsTab
              audience={audience}
              setAudience={setAudience}
              reminderScope={reminderScope}
              setReminderScope={setReminderScope}
              individualRecipientId={individualRecipientId}
              setIndividualRecipientId={setIndividualRecipientId}
              users={users}
              selectedUsers={selectedUsers}
              activeRecipients={activeRecipients}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab
              repeat={repeat}
              setRepeat={setRepeat}
              sendDate={sendDate}
              setSendDate={setSendDate}
              monthDay={monthDay}
              setMonthDay={setMonthDay}
              sendTime={sendTime}
              setSendTime={setSendTime}
              timeZone={timeZone}
              setTimeZone={setTimeZone}
              reminderScope={reminderScope}
              setReminderScope={setReminderScope}
              individualRecipientId={individualRecipientId}
              setIndividualRecipientId={setIndividualRecipientId}
              users={users}
              selectedUsers={selectedUsers}
              activeRecipients={activeRecipients}
            />
          )}
          {activeTab === 'stop' && (
            <StopRulesTab
              backupEndEnabled={backupEndEnabled}
              setBackupEndEnabled={setBackupEndEnabled}
              backupEndDate={backupEndDate}
              setBackupEndDate={setBackupEndDate}
              maxRemindersEnabled={maxRemindersEnabled}
              setMaxRemindersEnabled={setMaxRemindersEnabled}
              maxReminderCount={maxReminderCount}
              setMaxReminderCount={setMaxReminderCount}
              stopOnBounce={stopOnBounce}
              setStopOnBounce={setStopOnBounce}
              manualControlsEnabled={manualControlsEnabled}
              setManualControlsEnabled={setManualControlsEnabled}
            />
          )}
        </div>
      </section>

      <div className="settings-footer">
        <Button variant="filled" colorScheme="secondary" onClick={onBack}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </main>
  )
}

function EmailTab() {
  return (
    <div className="email-tab">
      <FormField
        title="Subject"
        required
        showDescription={false}
        showHelpText={false}
      >
        <Input defaultValue="Reminder: First Enterprise Form is waiting for you" />
      </FormField>

      <div className="message-composer" aria-label="Email composer preview">
        <div className="composer-toolbar">
          <button type="button">16 px</button>
          <button type="button" aria-label="Bold"><Icon name="bold" category="editor" size={18} /></button>
          <button type="button" aria-label="Italic"><Icon name="italic" category="editor" size={18} /></button>
          <button type="button" aria-label="Text color"><Icon name="form-title-filled" category="general" size={18} /></button>
          <button type="button" aria-label="Align text"><Icon name="align-text-left" category="editor" size={18} /></button>
          <button type="button" aria-label="Insert image"><Icon name="image-filled" category="media" size={18} /></button>
          <button type="button" aria-label="Expand editor" className="toolbar-push"><Icon name="expand" category="layout" size={18} /></button>
        </div>
        <div className="email-preview">
          <h3>A form is waiting for you to fill out.</h3>
          <p>Hi there,</p>
          <p>Please use your personal invitation link below to submit <strong>First Enterprise Form</strong>.</p>
          <button type="button">View Form</button>
        </div>
      </div>
    </div>
  )
}

function RecipientsTab({
  audience,
  setAudience,
  reminderScope,
  setReminderScope,
  individualRecipientId,
  setIndividualRecipientId,
  users,
  selectedUsers,
  activeRecipients,
}: {
  audience: ReminderAudience
  setAudience: (value: ReminderAudience) => void
  reminderScope: ReminderScope
  setReminderScope: (value: ReminderScope) => void
  individualRecipientId: string
  setIndividualRecipientId: (value: string) => void
  users: RecipientRecord[]
  selectedUsers: RecipientRecord[]
  activeRecipients: number
}) {
  const individualUser = users.find((user) => user.id === individualRecipientId) || users[0]
  const scopedUsers =
    reminderScope === 'selected'
      ? selectedUsers
      : reminderScope === 'individual' && individualUser
        ? [individualUser]
        : users
  const audienceOptions: Array<{
    value: ReminderAudience
    title: string
    body: string
    count: string
  }> = [
    {
      value: 'not-submitted',
      title: 'Not submitted yet',
      body: 'Includes pending and opened invitation links inside this target.',
      count: `${scopedUsers.filter((user) => user.status !== 'submitted').length} users`,
    },
    {
      value: 'pending',
      title: 'Pending invitations only',
      body: 'Only users who have not opened their personal invitation link yet.',
      count: `${scopedUsers.filter((user) => user.status === 'pending').length} users`,
    },
    {
      value: 'opened',
      title: 'Opened but not submitted',
      body: 'Only users who opened the link but have not completed the form.',
      count: `${scopedUsers.filter((user) => user.status === 'opened').length} users`,
    },
  ]

  return (
    <div className="recipients-tab">
      <InfoBanner
        title="Reminder schedules can be targeted"
        body="Use one form-wide schedule, change a selected group, or override an individual invitee. Stop rules still run per person after submission."
      />
      <ReminderScopeSelector
        title="Schedule Applies To"
        reminderScope={reminderScope}
        setReminderScope={setReminderScope}
        individualRecipientId={individualRecipientId}
        setIndividualRecipientId={setIndividualRecipientId}
        users={users}
        selectedUsers={selectedUsers}
        activeRecipients={activeRecipients}
      />

      <div className="recipients-section">
        <strong>Reminder Audience</strong>
        <div className="audience-options">
          {audienceOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`audience-option${audience === option.value ? ' audience-option--active' : ''}`}
              onClick={() => setAudience(option.value)}
            >
              <span className="radio-dot" />
              <span>
                <strong>{option.title}</strong>
                <small>{option.body}</small>
              </span>
              <Badge size="sm" status={audience === option.value ? 'information' : 'neutral'}>{option.count}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReminderScopeSelector({
  title,
  reminderScope,
  setReminderScope,
  individualRecipientId,
  setIndividualRecipientId,
  users,
  selectedUsers,
  activeRecipients,
}: {
  title: string
  reminderScope: ReminderScope
  setReminderScope: (value: ReminderScope) => void
  individualRecipientId: string
  setIndividualRecipientId: (value: string) => void
  users: RecipientRecord[]
  selectedUsers: RecipientRecord[]
  activeRecipients: number
}) {
  const individualUser = users.find((user) => user.id === individualRecipientId) || users[0]
  const targetOptions: Array<{
    value: ReminderScope
    title: string
    body: string
    count: string
  }> = [
    {
      value: 'all',
      title: 'All active invitees',
      body: 'Use this as the default reminder schedule for this form.',
      count: `${activeRecipients} active`,
    },
    {
      value: 'selected',
      title: 'Selected invitees',
      body: 'Apply this schedule only to the checked rows in the status table.',
      count: `${selectedUsers.length} selected`,
    },
    {
      value: 'individual',
      title: 'One invitee',
      body: 'Override the schedule for a single invited person.',
      count: individualUser ? '1 invitee' : 'Choose user',
    },
  ]

  return (
    <div className="recipients-section">
      <strong>{title}</strong>
      <div className="audience-options">
        {targetOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            className={`audience-option${reminderScope === option.value ? ' audience-option--active' : ''}`}
            onClick={() => setReminderScope(option.value)}
          >
            <span className="radio-dot" />
            <span>
              <strong>{option.title}</strong>
              <small>{option.body}</small>
            </span>
            <Badge size="sm" status={reminderScope === option.value ? 'information' : 'neutral'}>{option.count}</Badge>
          </button>
        ))}
      </div>

      {reminderScope === 'individual' && (
        <FormField title="Individual Invitee" showDescription={false} showHelpText={false}>
          <DropdownSingle
            value={individualUser?.id || individualRecipientId}
            onChange={setIndividualRecipientId}
            showLeadingIcon={false}
            options={users.map((user) => ({
              value: user.id,
              label: user.email,
            }))}
          />
        </FormField>
      )}
    </div>
  )
}

function ScheduleTab({
  repeat,
  setRepeat,
  sendDate,
  setSendDate,
  monthDay,
  setMonthDay,
  sendTime,
  setSendTime,
  timeZone,
  setTimeZone,
  reminderScope,
  setReminderScope,
  individualRecipientId,
  setIndividualRecipientId,
  users,
  selectedUsers,
  activeRecipients,
}: {
  repeat: RepeatFrequency
  setRepeat: (value: RepeatFrequency) => void
  sendDate: string
  setSendDate: (value: string) => void
  monthDay: string
  setMonthDay: (value: string) => void
  sendTime: string
  setSendTime: (value: string) => void
  timeZone: string
  setTimeZone: (value: string) => void
  reminderScope: ReminderScope
  setReminderScope: (value: ReminderScope) => void
  individualRecipientId: string
  setIndividualRecipientId: (value: string) => void
  users: RecipientRecord[]
  selectedUsers: RecipientRecord[]
  activeRecipients: number
}) {
  const sendDateOptions = sendDateOptionsByRepeat[repeat]
  const showMonthDay = repeat === 'monthly' && sendDate === 'select-day'

  const handleRepeatChange = (value: string) => {
    const nextRepeat = value as RepeatFrequency

    setRepeat(nextRepeat)
    setSendDate(sendDateOptionsByRepeat[nextRepeat][0].value)
  }

  return (
    <div className="schedule-tab">
      <ReminderScopeSelector
        title="Apply This Schedule To"
        reminderScope={reminderScope}
        setReminderScope={setReminderScope}
        individualRecipientId={individualRecipientId}
        setIndividualRecipientId={setIndividualRecipientId}
        users={users}
        selectedUsers={selectedUsers}
        activeRecipients={activeRecipients}
      />
      <InfoBanner
        title="Reminders stop per person after submission"
        body="Each invite link is tracked separately. Submitted users are skipped automatically."
      />
      <FormField title="Repeats" showDescription={false} showHelpText={false}>
        <Segmented
          value={repeat}
          onChange={handleRepeatChange}
          items={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
      </FormField>
      <div className="form-grid">
        <FormField
          title="Send Date"
          showDescription={false}
          showHelpText={false}
          className={showMonthDay ? undefined : 'form-grid__full'}
        >
          <DropdownSingle
            value={sendDate}
            onChange={setSendDate}
            showLeadingIcon={false}
            options={sendDateOptions}
          />
        </FormField>
        {showMonthDay && (
          <FormField title="Select a Day" showDescription={false} showHelpText={false}>
            <DropdownSingle
              value={monthDay}
              onChange={setMonthDay}
              showLeadingIcon={false}
              options={monthDayOptions}
            />
          </FormField>
        )}
        <FormField title="Send Time" showDescription={false} showHelpText={false}>
          <DropdownSingle
            value={sendTime}
            onChange={setSendTime}
            showLeadingIcon={false}
            options={sendTimeOptions}
          />
        </FormField>
        <FormField title="Time Zone" showDescription={false} showHelpText={false}>
          <DropdownSingle
            value={timeZone}
            onChange={setTimeZone}
            showLeadingIcon={false}
            options={timeZoneOptions}
          />
        </FormField>
      </div>
    </div>
  )
}

function StopRulesTab({
  backupEndEnabled,
  setBackupEndEnabled,
  backupEndDate,
  setBackupEndDate,
  maxRemindersEnabled,
  setMaxRemindersEnabled,
  maxReminderCount,
  setMaxReminderCount,
  stopOnBounce,
  setStopOnBounce,
  manualControlsEnabled,
  setManualControlsEnabled,
}: {
  backupEndEnabled: boolean
  setBackupEndEnabled: (value: boolean) => void
  backupEndDate: string
  setBackupEndDate: (value: string) => void
  maxRemindersEnabled: boolean
  setMaxRemindersEnabled: (value: boolean) => void
  maxReminderCount: string
  setMaxReminderCount: (value: string) => void
  stopOnBounce: boolean
  setStopOnBounce: (value: boolean) => void
  manualControlsEnabled: boolean
  setManualControlsEnabled: (value: boolean) => void
}) {
  const activeRuleCount = 1
    + (backupEndEnabled ? 1 : 0)
    + (maxRemindersEnabled ? 1 : 0)
    + (stopOnBounce ? 1 : 0)

  return (
    <div className="stop-tab">
      <StopRuleOption
        title="Stop when the invited user submits"
        body="The invitation link connects this recipient to their submission. Reminders stop only for that person."
        checked
        locked
        badge="Required"
      />
      <StopRuleOption
        title="Optional backup end date"
        body={backupEndEnabled
          ? `End remaining reminders on ${formatDateDisplay(backupEndDate)}.`
          : 'No deadline selected. Enable this if the form has a final due date.'}
        checked={backupEndEnabled}
        onToggle={() => setBackupEndEnabled(!backupEndEnabled)}
        badge={backupEndEnabled ? 'On' : 'Off'}
      >
        {backupEndEnabled && (
          <FormField title="Backup End Date" showDescription={false} showHelpText={false}>
            <input
              className="native-date-input"
              type="date"
              value={backupEndDate}
              onInput={(event) => setBackupEndDate(event.currentTarget.value)}
              onChange={(event) => setBackupEndDate(event.target.value)}
            />
          </FormField>
        )}
      </StopRuleOption>
      <StopRuleOption
        title="Maximum reminders"
        body={maxRemindersEnabled
          ? `Send at most ${maxReminderCount} reminder${maxReminderCount === '1' ? '' : 's'} per invited user.`
          : 'No maximum reminder cap is selected.'}
        checked={maxRemindersEnabled}
        onToggle={() => setMaxRemindersEnabled(!maxRemindersEnabled)}
        badge={maxRemindersEnabled ? 'On' : 'Off'}
      >
        {maxRemindersEnabled && (
          <FormField title="Maximum Reminders Per Invitee" showDescription={false} showHelpText={false}>
            <DropdownSingle
              value={maxReminderCount}
              onChange={setMaxReminderCount}
              showLeadingIcon={false}
              options={maxReminderOptions}
            />
          </FormField>
        )}
      </StopRuleOption>
      <StopRuleOption
        title="Stop if email delivery bounces"
        body="Pause reminders for recipients whose reminder email cannot be delivered."
        checked={stopOnBounce}
        onToggle={() => setStopOnBounce(!stopOnBounce)}
        badge={stopOnBounce ? 'On' : 'Off'}
      />
      <StopRuleOption
        title="Manual controls"
        body="Admins can pause, resume, or send a one-time reminder from the Shared With modal and status table."
        checked={manualControlsEnabled}
        onToggle={() => setManualControlsEnabled(!manualControlsEnabled)}
        badge={manualControlsEnabled ? 'On' : 'Off'}
      />
      <div className="stop-rule-summary">
        <strong>{activeRuleCount} automatic stop condition{activeRuleCount === 1 ? '' : 's'} active</strong>
        <span>
          {manualControlsEnabled
            ? 'Manual reminder actions are available for selected and individual invitees.'
            : 'Manual reminder actions are hidden; only automatic stop rules will apply.'}
        </span>
      </div>
      <section className="activity-card">
        <h3>Activity Preview</h3>
        {reminderActivity.map((item) => (
          <div className="activity-row" key={item.label}>
            <span />
            <div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function StopRuleOption({
  title,
  body,
  checked,
  locked = false,
  badge,
  onToggle,
  children,
}: {
  title: string
  body: string
  checked: boolean
  locked?: boolean
  badge: string
  onToggle?: () => void
  children?: ReactNode
}) {
  return (
    <article className={`stop-rule${checked ? ' stop-rule--active' : ''}${locked ? ' stop-rule--locked' : ''}`}>
      <button
        className="stop-rule__button"
        type="button"
        onClick={onToggle}
        disabled={locked}
        aria-pressed={checked}
      >
        <span className="stop-rule__check" aria-hidden="true" />
        <span>
          <strong>{title}</strong>
          <p>{body}</p>
        </span>
        <Badge size="sm" status={checked ? 'information' : 'neutral'}>{badge}</Badge>
      </button>
      {children && <div className="stop-rule__controls">{children}</div>}
    </article>
  )
}

function InfoBanner({ title, body }: { title: string; body: string }) {
  return (
    <div className="info-banner">
      <Icon name="check-circle-filled" category="general" size={18} />
      <div>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
    </div>
  )
}

export default App
