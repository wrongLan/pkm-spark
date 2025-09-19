import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';
import { Citations } from './Citations';
import { ChatMessage } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onRetry?: (messageIndex: number) => void;
}

export function MessageList({ messages, isLoading, onRetry }: MessageListProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Message copied to clipboard",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-8">
          <p>Start a conversation by asking a question about your knowledge base.</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[80%] ${
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          } rounded-lg p-3`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.role === 'assistant' && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(message.content)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(index)}
                    className="h-6 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            
            {message.citations && <Citations citations={message.citations} />}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}