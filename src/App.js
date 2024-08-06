import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTweets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://senti-backend.onrender.com/api/tweets', { username });
      setTweets(response.data);
    } catch (err) {
      setError('Failed to fetch tweets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTweets();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Twitter Sentiment Analysis</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Twitter username"
            required
          />
          <button type="submit">Fetch Tweets</button>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className="tweets">
          {tweets.map((tweet, index) => (
            <div key={index} className={`tweet ${tweet.sentiment}`}>
              <p>{tweet.text}</p>
              <span className="sentiment">{tweet.sentiment}</span>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
