import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, X } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '@/lib/types';
import { chatAsk, localCompose, search } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ChatPanelProps {
  selectedItems: string[];
  currentQuery?: string;
  appliedTags: {
    tagsAny: string[];
    tagsAll: string[];
    mode: 'any' | 'all';
  };
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function ChatPanel({ selectedItems, currentQuery, appliedTags, isOpen, onToggle, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(true);

  // Load conversation from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pkm-chat-conversation');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setMessages(data.messages || []);
        setConversationId(data.conversationId || null);
      } catch (e) {
        console.warn('Failed to load chat conversation:', e);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    localStorage.setItem('pkm-chat-conversation', JSON.stringify({
      messages,
      conversationId
    }));
  }, [messages, conversationId]);

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('pkm-chat-conversation');
  };

  const handleSend = async (question: string, topK: number) => {
    if (selectedOnly && selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select one or more items first, or switch to 'All results' mode.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare request parameters
      const params = {
        question,
        top_k: topK,
        tagsAny: appliedTags.mode === 'any' ? appliedTags.tagsAny : undefined,
        tagsAll: appliedTags.mode === 'all' ? appliedTags.tagsAll : undefined,
        ids: selectedOnly ? selectedItems : undefined,
        conversation_id: conversationId
      };

      try {
        // Try AI chat first
        const response = await chatAsk(params);
        setIsAiMode(true);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.answer,
          citations: response.citations
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }
      } catch (error: any) {
        if (error.message === 'NOT_AVAILABLE') {
          // Fall back to local compose
          setIsAiMode(false);
          
          // Search for relevant results
          const searchParams: any = { q: question, limit: topK };
          if (appliedTags.mode === 'any' && appliedTags.tagsAny.length) {
            searchParams.tagsAny = appliedTags.tagsAny;
          }
          if (appliedTags.mode === 'all' && appliedTags.tagsAll.length) {
            searchParams.tagsAll = appliedTags.tagsAll;
          }
          
          const searchResponse = await search(searchParams.q, searchParams.limit, searchParams.tagsAny, searchParams.tagsAll);
          let results = searchResponse.results;
          
          // Filter by selected items if needed
          if (selectedOnly && selectedItems.length > 0) {
            results = results.filter(result => selectedItems.includes(result.id));
          }
          
          const composeResponse = await localCompose(question, results);
          
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: `${composeResponse.answer}\n\n*Using simple local compose (no AI server).*`,
            citations: composeResponse.citations
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to get response. Check backend /chat/v1/ask or CORS.",
        variant: "destructive"
      });
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (messageIndex: number) => {
    if (messageIndex > 0 && messages[messageIndex - 1]?.role === 'user') {
      const userMessage = messages[messageIndex - 1];
      // Remove the failed response and retry
      setMessages(prev => prev.slice(0, messageIndex));
      handleSend(userMessage.content, 5);
    }
  };

  if (!isOpen) return null;

  const hasSelectedItems = selectedItems.length > 0;
  const inputDisabled = selectedOnly && !hasSelectedItems;

  return (
    <div className={`flex flex-col h-full bg-background border-l ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold">Chat</span>
          <Badge variant={isAiMode ? "default" : "secondary"} className="text-xs">
            {isAiMode ? "AI Chat" : "Local Compose"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scope Controls */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="selected-only"
            checked={selectedOnly}
            onCheckedChange={setSelectedOnly}
          />
          <Label htmlFor="selected-only" className="text-sm">
            Selected only ({selectedItems.length} items)
          </Label>
        </div>
        
        {selectedOnly && !hasSelectedItems && (
          <p className="text-sm text-muted-foreground">
            Select one or more items first to use this mode.
          </p>
        )}
        
        {appliedTags.tagsAny.length > 0 || appliedTags.tagsAll.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Active filters will be applied to chat queries.
          </p>
        ) : null}
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        onRetry={handleRetry}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={inputDisabled}
        isLoading={isLoading}
        placeholder={inputDisabled ? "Select items first..." : "Ask a question about your knowledge base..."}
      />
    </div>
  );
}