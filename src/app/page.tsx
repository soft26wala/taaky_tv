"use client";

import { Button } from "@/components/ui/button";
import  socket  from "@/lib/socket";
import { MessageSquare, Phone, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import socket from "../utils/socket";


export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
   const [isStarted, setIsStarted] = useState(false);

  // 🔹 On Mount
  useEffect(() => {
    socket.on("chat", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (isTyping: boolean) => {
      setTyping(isTyping);
    });

    // WebRTC
    socket.on("video-offer", async (offer) => {
      if (!pcRef.current) createPeerConnection();

      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current?.createAnswer();
      await pcRef.current?.setLocalDescription(answer!);
      socket.emit("video-answer", answer);
    });

    socket.on("video-answer", async (answer) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await pcRef.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE error", err);
      }
    });

    return () => {
      socket.off("chat");
      socket.off("typing");
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("ice-candidate");
    };
  }, []);

  // 🔹 Peer Connection create
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", e.candidate);
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      } 
    };

    pcRef.current = pc;
  };

  // 🔹 Start Video
  const startVideo = async () => {
     setIsStarted(true);
    if (!pcRef.current) createPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, stream);
    });

    const offer = await pcRef.current?.createOffer();
    await pcRef.current?.setLocalDescription(offer!);
    socket.emit("video-offer", offer);
  };


    const stopVideo = () => {
    setIsStarted(false);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)

    // 🔴 TODO: Add stop logic
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }


    
    const serversms = "Server: User has stopped the video call. ";
    // Send message to server
    socket.emit("chat", serversms);
    setMessages((prev) => [...prev, `Server: ${serversms}`]);
    setMessages([]); 
    setTyping(false); // Stop typing indicator'
    skipUser();
  };

  // 🔹 Send message
  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chat", input);
      setMessages((prev) => [...prev, `You: ${input}`]);
      setInput("");
      setTyping(false); // Stop typing indicator
    }
  };


  const skipUser = () => {
  // 1. Peer connection बंद करो
  if (pcRef.current) {
    pcRef.current.close();
    pcRef.current = null;
  }

  // 2. Local stream बंद करो
  if (localVideoRef.current?.srcObject) {
    const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
    tracks.forEach((track) => track.stop());
    localVideoRef.current.srcObject = null;
  }

  if (remoteVideoRef.current?.srcObject) {
    const tracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks();
    tracks.forEach((track) => track.stop());
    remoteVideoRef.current.srcObject = null;
  }

  // 3. Backend को बोला → नया user find कर
  socket.emit("skip");
   setMessages([]);
  // 4. Auto startVideo फिर से call कर सकते हो
  startVideo();
};


// ✅ function: current call cleanup
  const endCurrentCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };


useEffect(() => {
  socket.on("skip", () => {
    console.log("Partner skipped, auto skipping...");

    // apna UI reset kar do
    endCurrentCall();

    // fir new stranger ke liye wait karna
    createPeerConnection();
  });

  return () => {
    socket.off("skip");
  };
}, []);


  return (
    <main className="flex h-screen bg-background text-foreground flex-col xl:flex-row">
      {/* 🔹 Video Section (Left) */}
      <div className="flex-1 flex xl:flex-col xl:items-center justify-center bg-black relative h-3/4 xl:h-full">
        <div className="grid xl:grid-cols-2  gap-2 w-full h-full xl:p-2 grid-row-2 " >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full xl:h-full object-cover rounded-xl bg-gray-800 h-3/3"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full xl:h-full object-cover rounded-xl bg-gray-800 h-3/3"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 flex gap-4">
          {!isStarted ? (
            <Button
              onClick={startVideo}
              size="lg"
              className="rounded-full px-6 py-3 text-lg font-bold shadow-lg bg-green-600 hover:bg-green-700"
            >
              <Phone className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <Button
              onClick={stopVideo}
              size="lg"
              variant="destructive"
              className="rounded-full px-6 py-3 text-lg font-bold shadow-lg bg-red-500 hover:bg-red-600"
            >
              <Phone className="mr-2 h-5 w-5" /> Stop
            </Button>
          )}


          <Button
  onClick={skipUser}
  size="lg"
  className="rounded-full px-6 py-3 text-lg font-bold shadow-lg bg-yellow-600 hover:bg-yellow-700"
>
  Skip
</Button>
        </div>
      </div>

      {/* 🔹 Chat Section (Right) */}
      <div className="xl:border-l flex flex-col bg-white dark:bg-zinc-900 h-1/4 xl:h-full w-[90%] xl:w-[300px] 2xl:w-[400px]">
        <div className="flex items-center gap-2 px-4 py-3 xl:border-b font-bold text-lg">
          <MessageSquare className="h-5 w-5" /> Chat
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.startsWith("You:")
                  ? "bg-blue-600 text-white self-end ml-auto"
                  : "bg-gray-200 dark:bg-zinc-800"
              }`}
            >
              {msg}
            </div>
          ))}
          {typing && (
            <div className="italic text-gray-500">Stranger is typing...</div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setTyping(e.target.value.length > 0);
            }}
            placeholder="Type a message..."
          />
          <Button onClick={sendMessage} className="px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}