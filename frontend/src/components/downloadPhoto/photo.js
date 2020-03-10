import React, {useState} from 'react'
import { storage } from '../../firebase';
import { useCookies } from "react-cookie";

function Photo() {
  const [cookies, setCookie] = useCookies(["userName"]);

    const [image, setImage] = useState(null);
    const [url, setUrl] = useState('');
    
    const handleChange = e => {
      if (e.target.files[0]) {
        const image = e.target.files[0];
        setImage(image)
      }
    }
    const handleUpload = () => {
      const uploadTask = storage.ref(`images/${cookies.userName}`).put(image);
      uploadTask.on('state_changed',
        (snapshot) => {
          // progrss function ....
          // const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          // this.setState({ progress });
          console.log(snapshot)
        },
        (error) => {
          // error function ....
          console.log(error);
        },
        () => {
          // complete function ....
          storage.ref('images').child(cookies.userName).getDownloadURL().then(url => {
            setUrl(url)
            console.log(url);
          })
        });
    }
  
  return (
    <div>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <input type="file" onChange={handleChange} />
        <button onClick={handleUpload}>Upload</button>
        <br />
        <img src={url || 'http://via.placeholder.com/400x300'} alt="Uploaded images" height="300" width="400" />
      </div>
    </div>
  )
}

export default Photo