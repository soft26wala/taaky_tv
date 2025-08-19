"use client";
import { useEffect, useRef } from "react";
import  socket  from "@/lib/socket";
import SkipButton from "./SkipButton";

export default function VideoChat() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      peerRef.current = new RTCPeerConnection();

      stream.getTracks().forEach(track => peerRef.current!.addTrack(track, stream));

      peerRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      socket.on("match", async (partnerId) => {
        const offer = await peerRef.current!.createOffer();
        await peerRef.current!.setLocalDescription(offer);
        socket.emit("offer", { sdp: offer, to: partnerId });
      });

      socket.on("offer", async ({ sdp, from }) => {
        await peerRef.current!.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerRef.current!.createAnswer();
        await peerRef.current!.setLocalDescription(answer);
        socket.emit("answer", { sdp: answer, to: from });
      });

      socket.on("answer", async ({ sdp }) => {
        await peerRef.current!.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on("ice-candidate", ({ candidate }) => {
        peerRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
      });

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate });
        }
      };
    };

    startVideo();
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline muted />
      <video ref={remoteVideoRef} autoPlay playsInline />
      <SkipButton />
    </div>
  );
}
