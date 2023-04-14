import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, Form, Button } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa"; // import paper airplane icon
import "./ChatBox.css";

function ChatBox() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/conversation", {
        prompt: userInput,
      });
      setMessages((messages) => [
        ...messages,
        { message: userInput, isUser: true },
      ]);
      if (res.data.trim()) {
        setMessages((messages) => [
          ...messages,
          { message: res.data, isUser: false },
        ]);
      } else {
        setMessages((messages) => [
          ...messages,
          {
            message:
              "Please try again, im too dumb to figure out what location you are asking about",
            isUser: false,
          },
        ]);
      }
      setUserInput("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="chat-card">
      <Card.Header className="chat-header">wBot</Card.Header>
      <Card.Body className="chat-body">
        <div className="messages-container" style={{ height: "400px" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.isUser ? "is-user" : ""}`}
            >
              <div className="chat-message__text">{msg.message}</div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="chat-form-container">
          <div className="chat-form-wrapper">
            <Form onSubmit={handleSubmit} className="chat-form">
              <Form.Control
                className="chat-input"
                type="text"
                placeholder="Type your message here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button
                className="chat-send"
                variant="primary"
                type="submit"
                disabled={!userInput}
              >
                <FaPaperPlane />
              </Button>
            </Form>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ChatBox;
