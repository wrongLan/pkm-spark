import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (question: string, topK: number) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, isLoading, placeholder = "Ask a question about your knowledge base..." }: ChatInputProps) {
  const [question, setQuestion] = useState('');
  const [topK, setTopK] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !disabled && !isLoading) {
      onSend(question.trim(), topK);
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background">
      <div className="flex-1 flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1"
        />
        <Select value={topK.toString()} onValueChange={(value) => setTopK(parseInt(value))}>
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="8">8</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        disabled={!question.trim() || disabled || isLoading}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}