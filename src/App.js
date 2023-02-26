import React, { useState, useRef, useEffect } from "react";
import { Peer } from "peerjs";

function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [File, setFile] = useState(null);
  const peerInstance = useRef(null);

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const peer = new Peer();
    peer.on("open", function (id) {
      setPeerId(id);
    });
    peerInstance.current = peer;
    peer.on("connection", (conn) => {
      conn.on("data", (data) => {
        if (data.filetype.includes("image")) {
          const bytes = new Uint8Array(data.file);
          const img = document.createElement("img");
          img.src = "data:image/png;base64," + encode(bytes);
          img.style.width = "100px";
          img.style.height = "100px";
          document.querySelector("div").prepend(img);
        }
      });
    });
    // return () => {
    //   peer.disconnect();
    // };
  }, []);

  const encode = (input) => {
    const keyStr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;

    while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output +=
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
    }
    return output;
  };

  const Send = (e) => {
    e.preventDefault();
    const conn = peerInstance.current.connect(remotePeerId);
    conn.on("open", () => {
      const blob = new Blob([File], { type: File.type });
      conn.send({
        file: blob,
        filename: File.name,
        filetype: File.type,
      });
    });
  };
  return (
    <div>
      <h1>Peer ID: {peerId}</h1>
      <form onSubmit={Send}>
        <input
          type="text"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
        />
        <input type="file" onChange={onChange} accept="image/*" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
