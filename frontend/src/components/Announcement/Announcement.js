import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import './announcement.css';

function AnnouncementMessage(props) {
  const [cookies] = useCookies(['userName']);
  const { user } = props;
  const [man, setMan] = useState(null);
  function getChatName(a, b) {
    if (a > b) {
      return `${a}+${b}`;
    }
    return `${b}+${a}`;
  }
  useEffect(() => {
    if (user) {
      setMan(user);
      setTimeout(setMan, 10000, null);
    }
  }, [user]);

  return (
    <>
      {man && (
        <div className="mainContainer">
          <div className="message-container">
            <div className="nameAndDate">
              <img className="image" src={user.url} alt={user.friend} />
              <div>{man.name}</div>
            </div>
            {/* <small>{user.date}</small> */}
          </div>
          <Link
            to={{
              pathname: '/chat',
              state: {
                chats: getChatName(cookies.userName, user.friend),
                name: user.name,
                urlFriend: user.url,
                friend: user.friend,
                url: '',
              },
            }}
          >
            {' '}
            Go chat
          </Link>
          <img className="exitbar" src="./imgs/stop.png" alt="close" />
        </div>
      )}
    </>
  );
}
export default AnnouncementMessage;
