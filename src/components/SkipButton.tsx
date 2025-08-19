"use client";
import socket from "@/lib/socket";

export default function SkipButton() {
  return (
    <button onClick={() => socket.emit("skip")}>
      Skip
    </button>
  );
}
