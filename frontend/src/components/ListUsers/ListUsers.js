import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { connect } from 'react-redux';
import axios from 'axios';
import { storage, database } from '../../firebase';
import Map from './Map';
import ModalWindow from '../Modal/Modal';
import AnnouncementMessage from '../Announcement/Announcement';
import './listUsers.css';
import Navbar from '../navbar/Navbar';
import '../snow/snow.css';
import Loader from '../loader/Loader';
import Loader2 from '../loader/loader2';

/**
 * Компонент List - отрисовывает список пользователей в заданном радиусе
 * @param {*} props
 */

const ListUsers = () => {
  const [cookies] = useCookies(['userName']);
  const [radius, setRadius] = useState(null);
  const [list, setList] = useState({
    success: false,
    err: '',
  });

  const [isColorBtn, setColorBtn] = useState('findMe');
  const [isShowLoader, setIsShowLoader] = useState(false);
  const [isShowMap, setShowMap] = useState(false);
  const [user, setUser] = useState('');

  const [url, setUrl] = useState('');

  const [loader, setLoader] = useState();
  const pushRoom = database.ref().child(`${cookies.userName}`);
  useEffect(() => {
    const loader = Math.floor(Math.random() * 10);
    setLoader(loader);
  }, []);

  useEffect(() => {
    const handleNewMessages = async (snap) => {
      if (snap.val()) {
        Object.entries(snap.val()).map((el) => {
          const [, obj] = el;
          obj && setUser(obj);
        });
        pushRoom.remove();
      }
    };
    pushRoom.on('value', handleNewMessages);
    return () => {
      pushRoom.off('value', handleNewMessages);
    };
  });
  /**
   * Обрабатывает переключатель - со списка на карту и обратно
   */

  const ChangeOnMap = () => {
    setShowMap(!isShowMap);
  };
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongituse] = useState(null);

  /**
   * Делает запрос на сервер:
   * @param {String} id - пользователя в бд
   * @param {Number} latitude - широта в радинах
   * @param {Number} longitude - долгота в радианах
   * @param {Number} radius - радиус поиска
   */

  const requestListUsers = (id, latitude, longitude, radius) => {
    axios
      .post('/list/users', {
        id,
        latitude,
        longitude,
        radius,
      })
      .then(async (response) => {
        if (response.data.success) {
          // Задаем hooks
          setIsShowLoader(false);

          const promisesArr = response.data.list.map(async (user) => {
            const pic = await storage
              .ref(`images/${user.person}`)
              .getDownloadURL()
              .catch((e) => console.log(e));
            user.url = pic;
            return user;
          });

          Promise.all(promisesArr).then((result) => {
            setList({
              success: true,
              list: result,
            });
            result.map((el) => {
              if (el.person === cookies.userName) {
                setUrl(el.url);
              }
            });
          });

          // Задаем hooks
        } else {
          // Задаем hooks
          setList({
            success: false,
            err: response.data.err,
          });
        }
      })
      .catch(() => {
        setList({
          success: false,
          err: 'Runtime error',
        });
      });
  };

  /**
   * Определяет координаты пользователя, используя Google map function
   */
  const geoFindLocation = () => {
    setIsShowLoader(true);
    setColorBtn('whiteBorder');
    const success = (position) => {
      // Задаем в hooks координаты
      setLatitude(position.coords.latitude);
      setLongituse(position.coords.longitude);

      // Делает запрос на сервер
      requestListUsers(
        cookies.userName,
        position.coords.latitude,
        position.coords.longitude,
        radius || 200,
      );
    };
    // Обрабатываем ошибки getCurrentPosition
    const error = () => {
      // Задаем hooks
      setList({
        success: false,
        err: 'Unable to retrieve your location',
      });
    };

    if (!navigator.geolocation) {
      // Задаем hooks
      setList({
        success: false,
        err: 'Geolocation is not supported by your browser',
      });
    } else {
      /**
       * @param {function} success - определяет координаты пользователя
       * @param {function} error - возвращает ошибку обработки координат
       */

      navigator.geolocation.getCurrentPosition(success, error);
    }
  };

  return (
    <div className="back">
      <div className="full-wh">
        <div className="bg-animation">
          <div id="stars" />
          <div id="stars2" />
          <div id="stars3" />
          <div id="stars4" />
        </div>
      </div>
      <div
        className="main-container"
        style={{
          width: '100%',
        }}
      >
        <Navbar />
        <div className="input-form-userlist">
          <input
            className="inputFind"
            onChange={(event) => {
              setRadius(event.target.value);
            }}
            type="range"
            style={{
              minWidth: '300px',
              display: 'block',
              width: '30%',
              height: '50px',
              margin: '0 auto',
              border: 'none',
              paddingBottom: '0',
              borderBottom: 'solid #FFF 2px',
              borderRadius: '0',
              boxShadow: 'none',
              marginBottom: '20px',
            }}
            min="200"
            max="10000"
            step="200"
            value={radius}
          />
          <label className="label">
            {radius !== null ? (
              <div>
                {' '}
                Chosen radius: &nbsp;
                {' '}
                {radius}
                &nbsp; meters
                {' '}
              </div>
            ) : (
              <div style={{ margin: ' auto 0' }}>Choose the radius</div>
            )}
            &nbsp;
          </label>
          <button
            id="find-me"
            className={isColorBtn}
            onClick={() => geoFindLocation()}
            style={{
              display: 'block',
              color: '#FFF',
              backgroundColor: 'transparent',
              position: 'relative',
              margin: '0 auto',
              width: '25rem',
              textShadow: 'none',
            }}
          >
            FIND ME SOMEONE
          </button>
        </div>
        {list.success ? (
          <div className="toggleBox" style={{ margin: '0 auto' }}>
            <input type="checkbox" name="toggle" className="sw" id="toggle-2" />
            <label htmlFor="toggle-2" onClick={ChangeOnMap}>
              <span>Use a map</span>
            </label>
          </div>
        ) : (
          list.err
        )}
        {isShowLoader ? (
          <div>{loader > 5 ? <Loader /> : <Loader2 />}</div>
        ) : (
          <div>
            {isShowMap ? (
              <Map
                latitude={latitude}
                longitude={longitude}
                list={list}
                style={{
                  marginTop: '10%',
                  alignSelf: 'center',
                  width: '100%',
                  justifyContent: 'center',
                }}
                radius={radius}
              />
            ) : (
              <ul
                style={{
                  display: 'flex',
                  listStyle: 'none',
                  padding: '0',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                }}
              >
                {list.success
                  ? list.list.map((obj) => (
                    <div className="map">
                      <ModalWindow obj={obj} url={url} key={obj._id} />
                    </div>
                  ))
                  : list.err}
              </ul>
            )}
          </div>
        )}
      </div>
      <AnnouncementMessage user={user} />
    </div>
  );
};

const mapStateToProps = (state) => ({
  ...state,
});

export default connect(mapStateToProps)(ListUsers);
