"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "me" | "them";
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const myMessage: Message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: "me",
      };
      setMessages((prev) => [...prev, myMessage]);
      setNewMessage("");
    }
  };
 
  return (
    <Card className="w-full h-full flex flex-col bg-card shadow-lg rounded-xl">
      <CardHeader className="border-b flex-shrink-0">
        <CardTitle className="text-lg">Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] break-words shadow-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-card-foreground rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t flex-shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-ring"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
