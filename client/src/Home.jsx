import { useState } from 'react';

export default function Home() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);
      
      for (let file of files) {
        formData.append('attachments', file);
      }

      const response = await fetch('/api/user/send-mail', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setStatus(data.message);
      
      if (response.ok) {
        setTo('');
        setSubject('');
        setText('');
        setFiles([]);
      }
    } catch (error) {
      setStatus('Failed to send email');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Send Email</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message"
            required
            className="w-full p-2 border rounded h-32"
          />
        </div>
        <div>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Send Email
        </button>
      </form>
      {status && (
        <p className="mt-4 text-center text-sm">
          {status}
        </p>
      )}
    </div>
  );
}