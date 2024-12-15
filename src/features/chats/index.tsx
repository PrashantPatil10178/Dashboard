import React, { useState, useEffect, useRef, Fragment } from 'react'
import { format } from 'date-fns'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconMessages,
  IconPaperclip,
  IconPhone,
  IconPhotoPlus,
  IconPlus,
  IconSearch,
  IconSend,
  IconVideo,
} from '@tabler/icons-react'
import { api } from '@/services/AxiosInterceptor'
import { io, Socket } from 'socket.io-client'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import useUserData from '@/hooks/useUserdata'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface ChatGroup {
  id: number
  name: string
  type: string
  course?: {
    id: number
    title: string
  }
  members: {
    id: number
    name: string
  }[]
  lastMessage?: string
}

interface Message {
  id: number
  content: string
  senderId: number
  chatGroupId?: number
  receiverId?: number
  createdAt: string
  sender: {
    id: number
    name: string
  }
}

export default function ChatSystem() {
  const [search, setSearch] = useState('')
  const [groups, setGroups] = useState<ChatGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null)
  const [mobileSelectedGroup, setMobileSelectedGroup] =
    useState<ChatGroup | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { data: userData, isLoading: isLoadingUser } = useUserData()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userData) return

    const newSocket = io(`ws://localhost:4000`, {
      auth: {
        token: api.getAccessToken(),
      },
    })

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    newSocket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message)
      if (message.chatGroupId === selectedGroup?.id) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg.id === message.id
          )
          if (!messageExists) {
            return [...prevMessages, message]
          }
          return prevMessages
        })
        scrollToBottom()
      }

      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === message.chatGroupId) {
            return {
              ...group,
              lastMessage: message.content,
            }
          }
          return group
        })
      )
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [userData, selectedGroup])

  useEffect(() => {
    if (userData) {
      fetchGroups()
    }
  }, [userData])

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages()
      if (socket) {
        socket.emit('joinRoom', selectedGroup.id)
      }
    }
    return () => {
      if (socket && selectedGroup) {
        socket.emit('leaveRoom', selectedGroup.id)
      }
    }
  }, [selectedGroup, socket])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const fetchGroups = async () => {
    if (!userData) return
    setLoading(true)
    try {
      const response = await api.get<ChatGroup[]>(
        `/chat/groups?userId=${userData.id}`
      )
      setGroups(response)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chat groups',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedGroup) return
    setLoading(true)
    try {
      const response: any = await api.get(
        `/chat/groups/${selectedGroup.id}/messages?page=${page}&pageSize=20`
      )
      setMessages(response.messages)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedGroup || !socket || !userData) return

    const messageData = {
      content: inputMessage,
      senderId: userData.id,
      chatGroupId: selectedGroup.id,
      sender: {
        id: userData.id,
        name: userData.name,
      },
    }

    const tempMessage = {
      ...messageData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    setMessages((prevMessages) => [...prevMessages, tempMessage])
    setInputMessage('')
    scrollToBottom()

    socket.emit('sendMessage', messageData, (response: Message) => {
      if (response) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempMessage.id ? response : msg
          )
        )
        fetchMessages()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        })
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== tempMessage.id)
        )
      }
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const groupedMessages = messages.reduce(
    (acc: Record<string, Message[]>, message) => {
      const key = format(new Date(message.createdAt), 'd MMM, yyyy')
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(message)
      return acc
    },
    {}
  )

  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  if (isLoadingUser) {
    return (
      <div className='flex h-[calc(100vh-4rem)] items-center justify-center'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[250px]' />
          <Skeleton className='h-4 w-[200px]' />
        </div>
      </div>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side - Group List */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <IconMessages size={20} />
                </div>
                <Button size='icon' variant='ghost' className='rounded-lg'>
                  <IconEdit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>
              <div className='flex h-12 w-full items-center space-x-0 rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
                <IconSearch size={15} className='mr-2 stroke-slate-500' />
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className='-mx-3 h-full p-3'>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Fragment key={index}>
                        <div className='flex items-center space-x-4 p-2'>
                          <Skeleton className='h-12 w-12 rounded-full' />
                          <div className='space-y-2'>
                            <Skeleton className='h-4 w-[200px]' />
                            <Skeleton className='h-4 w-[150px]' />
                          </div>
                        </div>
                        <Separator className='my-1' />
                      </Fragment>
                    ))
                : groups.map((group) => (
                    <Fragment key={group.id}>
                      <button
                        type='button'
                        className={cn(
                          `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
                          selectedGroup?.id === group.id && 'sm:bg-muted'
                        )}
                        onClick={() => {
                          setSelectedGroup(group)
                          setMobileSelectedGroup(group)
                        }}
                      >
                        <div className='flex gap-2'>
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${group.name}`}
                            />
                            <AvatarFallback>
                              {group.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className='col-start-2 row-span-2 font-medium'>
                              {group.name}
                            </span>
                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                              {group.lastMessage || 'No messages yet'}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  ))}
            </ScrollArea>
          </div>

          {/* Right Side - Chat Area */}
          <div
            className={cn(
              'absolute inset-0 hidden left-full z-50 w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex',
              mobileSelectedGroup && 'left-0 flex'
            )}
          >
            {selectedGroup ? (
              <>
                {/* Chat Header */}
                <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='-ml-2 h-full sm:hidden'
                      onClick={() => setMobileSelectedGroup(null)}
                    >
                      <IconArrowLeft />
                    </Button>
                    <Avatar className='size-9 lg:size-11'>
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedGroup.name}`}
                      />
                      <AvatarFallback>
                        {selectedGroup.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                        {selectedGroup.name}
                      </span>
                      {selectedGroup.course && (
                        <span className='col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-ellipsis text-nowrap text-xs text-muted-foreground lg:max-w-none lg:text-sm'>
                          {selectedGroup.course.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    >
                      <IconVideo
                        size={22}
                        className='stroke-muted-foreground'
                      />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
                    >
                      <IconPhone
                        size={22}
                        className='stroke-muted-foreground'
                      />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
                    >
                      <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
                    </Button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0'>
                  <div className='flex size-full flex-1'>
                    <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                      <div className='chat-flex flex h-40 w-full flex-grow flex-col justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'>
                        {sortedDates.map((date) => (
                          <Fragment key={date}>
                            <div className='text-center text-xs'>{date}</div>
                            {groupedMessages[date].map((message) => (
                              <div
                                key={message.id}
                                className={cn(
                                  'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                                  message.senderId === userData?.id
                                    ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
                                    : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
                                )}
                              >
                                <div className='text-xs font-semibold mb-1'>
                                  {message.sender.name}
                                </div>
                                {message.content}
                                <span
                                  className={cn(
                                    'mt-1 block text-xs font-light italic text-muted-foreground',
                                    message.senderId === userData?.id &&
                                      'text-right'
                                  )}
                                >
                                  {format(
                                    new Date(message.createdAt),
                                    'h:mm a'
                                  )}
                                </span>
                              </div>
                            ))}
                          </Fragment>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className='flex w-full flex-none gap-2'
                  >
                    <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 lg:gap-4'>
                      <div className='space-x-1'>
                        <Button
                          size='icon'
                          type='button'
                          variant='ghost'
                          className='h-8 rounded-md'
                        >
                          <IconPlus
                            size={20}
                            className='stroke-muted-foreground'
                          />
                        </Button>
                        <Button
                          size='icon'
                          type='button'
                          variant='ghost'
                          className='hidden h-8 rounded-md lg:inline-flex'
                        >
                          <IconPhotoPlus
                            size={20}
                            className='stroke-muted-foreground'
                          />
                        </Button>
                        <Button
                          size='icon'
                          type='button'
                          variant='ghost'
                          className='hidden h-8 rounded-md lg:inline-flex'
                        >
                          <IconPaperclip
                            size={20}
                            className='stroke-muted-foreground'
                          />
                        </Button>
                      </div>
                      <Input
                        type='text'
                        placeholder='Type your messages...'
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className='flex-1'
                      />
                      <Button
                        type='submit'
                        variant='ghost'
                        size='icon'
                        className='hidden sm:inline-flex'
                      >
                        <IconSend size={20} />
                      </Button>
                    </div>
                    <Button type='submit' className='h-full sm:hidden'>
                      Send
                      <IconSend size={18} className='ml-2' />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className='flex flex-1 items-center justify-center'>
                <p className='text-muted-foreground'>
                  Select a chat to start messaging
                </p>
              </div>
            )}
          </div>
        </section>
      </Main>
    </>
  )
}
