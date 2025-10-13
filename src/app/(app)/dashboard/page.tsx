"use client";

import React, { useCallback, useEffect, useState } from "react";
import {MessageCard} from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/Schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  // Mark component as mounted (fixes hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Accept Messages Setting
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response?.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data?.message || "Failed to fetch setting"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>("/api/get-messages");

      // Update state
      setMessages(response.data.messages || []);

      // Show toast based on messages length
      if ((response.data.messages || []).length === 0) {
        toast.info("No messages yet");
      } else {
        toast.success("Showing latest messages");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data?.message || "Failed to load messages"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize when session is ready
  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAcceptMessage();
    }
  }, [session, fetchAcceptMessage, fetchMessages]);

  // Generate profile link only after client mount
  useEffect(() => {
    if (typeof window !== "undefined" && session?.user?.username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${session.user.username}`);
    }
  }, [session]);

  // Toggle Accept Messages
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update setting"
      );
    }
  };

  // Delete message from UI
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  // Copy profile URL
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied to clipboard!");
  };

  // Avoid rendering on SSR (fix hydration error)
  if (!isMounted) return null;

  if (!session || !session.user) {
    return <div className="text-center mt-10 text-lg">Please Login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl shadow-md">
      <h1 className="text-4xl font-bold mb-6">User Dashboard</h1>

      {/* Profile URL Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <Input value={profileUrl} disabled className="mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Switch */}
      <div className="mb-4 flex items-center">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-sm">
          Accept Messages: <strong>{acceptMessages ? "On" : "Off"}</strong>
        </span>
      </div>

      <Separator className="my-4" />

      {/* Refresh Button */}
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages();
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Messages */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id ?? index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            No messages to display.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
