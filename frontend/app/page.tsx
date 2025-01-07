import React from 'react';
import ChatWidget from './_chat-widget/ChatWidget';

const Dashboard = () => {
  return (
    <div className="overflow-auto flex w-full h-screen justify-center items-center">
      <ChatWidget />
    </div>
  );
};

export default Dashboard;