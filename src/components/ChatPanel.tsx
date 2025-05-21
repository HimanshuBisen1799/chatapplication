import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  selectMessages,
  toggleChat,
  selectIsChatOpen,
  selectIsConnected,
  selectChatPartner,
} from '../features/chat/chatSlice';
import {
  useSendMessageMutation,
  useConnectToChatMutation,
  useDisconnectFromChatMutation,
  useGetChatHistoryQuery,
} from '../features/chat/chatApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Define prop types
interface ChatPanelProps {
  chatId: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ chatId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messages = useAppSelector(selectMessages);
  const isOpen = useAppSelector(selectIsChatOpen);
  const isConnected = useAppSelector(selectIsConnected);
  const chatPartner = useAppSelector(selectChatPartner);
  const dispatch = useAppDispatch();

  const [sendMessage, { isLoading: isSending, isError: sendError }] =
    useSendMessageMutation();
  const [connect, { isLoading: isConnecting }] = useConnectToChatMutation();
  const [disconnect] = useDisconnectFromChatMutation();
  const { isLoading: isLoadingHistory, isError: historyError } =
    useGetChatHistoryQuery(chatId, { skip: !isOpen });

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Connect to chat and fetch history when panel is opened
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      connect({ chatId })
        .unwrap()
        .catch((error) => {
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to chat server. Please try again.',
            variant: 'destructive',
          });
        });
    }
  }, [isOpen, isConnected, isConnecting, connect, chatId]);

  // Disconnect when component unmounts
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle errors from chat history
  useEffect(() => {
    if (historyError) {
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  }, [historyError]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (!isConnected) {
      toast({
        title: 'Not connected',
        description: 'You are not connected to the chat server',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage({ chatId, content: newMessage.trim() }).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleReconnect = () => {
    connect({ chatId })
      .unwrap()
      .catch((error) => {
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to chat server. Please try again.',
          variant: 'destructive',
        });
      });
  };

  return (
    <>
      {/* Chat Button with pulse animation */}
      <Button
        className={cn(
          'fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0 z-10 transition-all duration-300 hover:scale-105',
          !isOpen && messages.length > 0 && 'animate-pulse'
        )}
        onClick={() => dispatch(toggleChat())}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </Button>

      {/* Chat Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full bg-background border-l shadow-xl z-50 transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0 w-full sm:w-96 md:w-[400px]' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">
                {chatPartner.name || 'Chat'}
              </h2>
              {isConnected ? (
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 ml-2" />
              ) : (
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 ml-2" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleChat())}
              className="hover:bg-background/80 rounded-full h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Connection status */}
          {!isConnected && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-sm">Disconnected from chat server</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Reconnect'}
              </Button>
            </div>
          )}

          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-medium">Loading chat history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mt-2">Send a message to start chatting</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex w-max max-w-[85%] animate-fade-in rounded-2xl p-4',
                      msg.sentByMe
                        ? 'ml-auto bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                  >
                    <div>
                      <p className="text-xs text-muted-foreground/80">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>
          </ScrollArea>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={isConnected ? 'Type a message...' : 'Connect to start chatting'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-full"
                disabled={!isConnected || isSending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || !isConnected || isSending}
                className="rounded-full h-10 w-10 transition-all duration-200 hover:scale-105"
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </div>
      </aside>

      {/* Overlay when chat is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden animate-fade-in"
          onClick={() => dispatch(toggleChat())}
        />
      )}
    </>
  );
};

export default ChatPanel;